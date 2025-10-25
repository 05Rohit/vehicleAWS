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

const RABBITMQURL = process.env.RABBITMQURL;
const EXCHANGE = "emailExchange";
const BOOKINGEXCHANGE = "bookingemailExchange";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000; // 1s
const HEARTBEAT = 60;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

let sharedConnection = null;
let starting = false;
let startAttempt = 0;

async function ensureConnection(attempt = 0) {
  if (sharedConnection) return sharedConnection;
  if (!RABBITMQURL) throw new Error("RABBITMQURL not set");

  try {
    sharedConnection = await amqp.connect(RABBITMQURL, { heartbeat: HEARTBEAT });
    sharedConnection.on("close", (err) => {
      console.error("🔁 RabbitMQ shared connection closed", err && err.message ? err.message : "");
      sharedConnection = null;
      // try to restart consumers with backoff
      setTimeout(startAllConsumers, Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * Math.pow(2, startAttempt++)));
    });
    sharedConnection.on("error", (err) => {
      console.error("❌ RabbitMQ shared connection error", err && err.message ? err.message : "");
    });
    console.log("✅ RabbitMQ shared connection established");
    startAttempt = 0;
    return sharedConnection;
  } catch (err) {
    const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * Math.pow(2, attempt));
    console.error(`❌ RabbitMQ connect failed (attempt ${attempt + 1}). Retrying in ${delay}ms:`, err && err.message ? err.message : err);
    await new Promise((r) => setTimeout(r, delay));
    return ensureConnection(attempt + 1);
  }
}

async function startConsumer({ exchange, routingKey, queueName, dlqName, handler, exchangeType = "direct" }) {
  try {
    const conn = await ensureConnection();
    const ch = await conn.createChannel();

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
              // no DLQ configured, nack without requeue
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
    // clear shared connection so ensureConnection will attempt reconnect
    try { if (sharedConnection) await sharedConnection.close().catch(()=>{}); } catch(_) {}
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

  // start each consumer (creates channel per consumer)
  consumers.forEach((cfg) => startConsumer(cfg));

  starting = false;
}

// initialize
startAllConsumers();

module.exports = { startAllConsumers };
