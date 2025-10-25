// ...existing code...
require("dotenv").config();

const amqp = require("amqplib");
const {
  vehicleCreationEmail,
  userCreationEmail,
  userPasswordChangeEmail,
  vehicleUpdateEmail,
  vehicleDeleteEmail,
  userContactUsFormEmail,
  userForgotPasswordEmail,
  userBookingConfirmationEmail,
  userBookingStatusUpdateEmail,
} = require("../utils/mailTemplate.jsx");

let RABBITMQURL = process.env.RABBITMQURL;
const EXCHANGE = "emailExchange";
const BOOKINGEXCHANGE = "bookingemailExchange";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000; // 1s
const HEARTBEAT = 60;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

function normalizeAmqpUrl(raw) {
  if (!raw) return raw;
  try {
    raw = raw.replace(/^['"]|['"]$/g, "");
    const u = new URL(raw);
    if (u.username || u.password) {
      const user = decodeURIComponent(u.username || "");
      const pass = decodeURIComponent(u.password || "");
      u.username = encodeURIComponent(user);
      u.password = encodeURIComponent(pass);
    }
    return u.toString();
  } catch (e) {
    return raw;
  }
}

function maskUrl(raw) {
  try {
    const u = new URL(raw);
    if (u.password) u.password = "****";
    return u.toString();
  } catch (e) {
    return raw ? raw.replace(/:\/\/.*@/, "://****:****@") : raw;
  }
}

RABBITMQURL = normalizeAmqpUrl(RABBITMQURL);

let sharedConnection = null;
let starting = false;
let startAttempt = 0;

async function ensureConnection(attempt = 0) {
  if (sharedConnection) return sharedConnection;
  if (!RABBITMQURL) throw new Error("RABBITMQURL not set");

  try {
    console.info("Attempting RabbitMQ connect:", maskUrl(RABBITMQURL).startsWith("amqps") ? "(amqps) TLS" : "(amqp) plain", maskUrl(RABBITMQURL));
    sharedConnection = await amqp.connect(RABBITMQURL, { heartbeat: HEARTBEAT });

    sharedConnection.on("close", (err) => {
      console.error("🔁 RabbitMQ shared connection closed", err && err.message ? err.message : "");
      if (err && err.replyCode) console.error("  replyCode:", err.replyCode);
      if (err && err.replyText) console.error("  replyText:", err.replyText);
      sharedConnection = null;
      setTimeout(startAllConsumers, Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * Math.pow(2, startAttempt++)));
    });

    sharedConnection.on("error", (err) => {
      console.error("❌ RabbitMQ shared connection error", err && err.message ? err.message : "");
      if (err && err.replyCode) console.error("  replyCode:", err.replyCode);
      if (err && err.replyText) console.error("  replyText:", err.replyText);
      if (err && err.stack) console.error(err.stack);
    });

    console.log("✅ RabbitMQ shared connection established");
    startAttempt = 0;
    return sharedConnection;
  } catch (err) {
    const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * Math.pow(2, attempt));
    console.error(`❌ RabbitMQ connect failed (attempt ${attempt + 1}). Retrying in ${delay}ms:`, err && err.message ? err.message : err);
    if (err && err.replyCode) console.error("  replyCode:", err.replyCode);
    if (err && err.replyText) console.error("  replyText:", err.replyText);
    if (err && err.stack) console.error(err.stack);
    await new Promise((r) => setTimeout(r, delay));
    return ensureConnection(attempt + 1);
  }
}

async function startConsumer({ exchange, routingKey, queueName, dlqName, handler, exchangeType = "direct" }) {
  try {
    const conn = await ensureConnection();
    const ch = await conn.createChannel();

    ch.on("error", (err) => console.error("Channel error:", err && err.message ? err.message : ""));
    ch.on("close", () => console.warn("Channel closed:", queueName));

    await ch.assertExchange(exchange, exchangeType, { durable: true });
    if (dlqName) await ch.assertQueue(dlqName, { durable: true });

    await ch.assertQueue(queueName, {
      durable: true,
      arguments: dlqName
        ? {
            "x-dead-letter-exchange": "",
            "x-dead-letter-routing-key": dlqName,
          }
        : undefined,
    });

    await ch.bindQueue(queueName, exchange, routingKey);

    ch.consume(
      queueName,
      async (msg) => {
        if (!msg) return;
        const headers = msg.properties.headers || {};
        const retryCount = Number(headers["x-retry-count"] || 0);

        try {
          const parsed = JSON.parse(msg.content.toString());
          const { payload } = parsed;
          await handler(payload);
          ch.ack(msg);
        } catch (err) {
          console.error(`Handler error for ${queueName}:`, err && err.message ? err.message : err);
          if (retryCount < MAX_RETRIES) {
            const delay = BASE_DELAY_MS * Math.pow(2, retryCount);
            setTimeout(() => {
              ch.sendToQueue(queueName, msg.content, {
                headers: { "x-retry-count": retryCount + 1 },
                persistent: true,
              });
            }, delay);
            ch.ack(msg);
          } else {
            if (dlqName) {
              ch.sendToQueue(dlqName, msg.content, { persistent: true });
              ch.ack(msg);
            } else {
              ch.nack(msg, false, false);
            }
          }
        }
      },
      { noAck: false }
    );

    console.log(`🟢 Consumer started: ${queueName} -> ${exchange}:${routingKey}`);
  } catch (err) {
    console.error(`❌ Failed to start consumer ${queueName}:`, err && err.message ? err.message : err);
    if (err && err.replyCode) console.error("  replyCode:", err.replyCode);
    if (err && err.replyText) console.error("  replyText:", err.replyText);
    try { if (sharedConnection) await sharedConnection.close().catch(() => {}); } catch (_) {}
    sharedConnection = null;
    setTimeout(() => startConsumer({ exchange, routingKey, queueName, dlqName, handler, exchangeType }), 5000);
  }
}

/* handlers that call mail templates - accept payload: { subject, to, templateData } */
const emailHandlerFactory = (fn) => async (payload) => {
  const { subject, to, templateData } = payload || {};
  await fn({ to, subject, templateData });
};

function startAllConsumers() {
  if (starting) return;
  starting = true;

  const consumers = [
    { exchange: EXCHANGE, routingKey: "task.newvehicleadded", queueName: "newvehicleadded", dlqName: "emailNewVehicleDLQ", handler: emailHandlerFactory(vehicleCreationEmail) },
    { exchange: EXCHANGE, routingKey: "task.vehicleUpdated", queueName: "vehicleUpdated", dlqName: "vehicleUpdatedDLQ", handler: emailHandlerFactory(vehicleUpdateEmail) },
    { exchange: EXCHANGE, routingKey: "task.vehicleDeleted", queueName: "vehicleDeleted", dlqName: "vehicleDeletedDLQ", handler: emailHandlerFactory(vehicleDeleteEmail) },
    { exchange: EXCHANGE, routingKey: "task.usercreated", queueName: "usercreated", dlqName: "usercreatedDLQ", handler: emailHandlerFactory(userCreationEmail) },
    { exchange: EXCHANGE, routingKey: "task.userPasswordChanged", queueName: "userPasswordChanged", dlqName: "userPasswordChangedDLQ", handler: emailHandlerFactory(userPasswordChangeEmail) },
    { exchange: EXCHANGE, routingKey: "task.forgotPassword", queueName: "forgotPassword", dlqName: "forgotPasswordDLQ", handler: emailHandlerFactory(userForgotPasswordEmail) },
    { exchange: EXCHANGE, routingKey: "task.contactus", queueName: "contactus", dlqName: "contactusDLQ", handler: emailHandlerFactory(userContactUsFormEmail) },

    // booking exchange consumers
    { exchange: BOOKINGEXCHANGE, routingKey: "bookingtask.userbookedvehicle", queueName: "userbookedvehicle", dlqName: "userbookedvehicleDLQ", handler: emailHandlerFactory(userBookingConfirmationEmail), exchangeType: "direct" },
    { exchange: BOOKINGEXCHANGE, routingKey: "bookingtask.userbookedvehiclestatusupdate", queueName: "userbookedvehiclestatusupdate", dlqName: "userbookedvehiclestatusupdateDLQ", handler: emailHandlerFactory(userBookingStatusUpdateEmail), exchangeType: "direct" },
  ];

  consumers.forEach((cfg) => startConsumer(cfg));

  starting = false;
}

// initialize
startAllConsumers();

async function closeSharedConnection() {
  try {
    if (sharedConnection) {
      await sharedConnection.close().catch(() => {});
      sharedConnection = null;
    }
  } catch (_) {}
}

process.on("exit", closeSharedConnection);
process.on("SIGINT", () => closeSharedConnection().then(() => process.exit(0)));
process.on("SIGTERM", () => closeSharedConnection().then(() => process.exit(0)));

module.exports = { startAllConsumers };
// ...existing code...
