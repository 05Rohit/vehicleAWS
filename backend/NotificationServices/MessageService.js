require("dotenv").config();
const amqp = require("amqplib");

let RABBITMQURL = process.env.RABBITMQURL; // allow normalization below
const HEARTBEAT = 60;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

function normalizeAmqpUrl(raw) {
  if (!raw) return raw;
  try {
    // strip surrounding quotes if present
    raw = raw.replace(/^['"]|['"]$/g, "");
    const u = new URL(raw);
    // encode credentials if present (handles special chars)
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
let sharedChannel = null;
let connecting = false;
let connectAttempts = 0;

async function createConnection() {
  if (sharedConnection) return sharedConnection;
  if (!RABBITMQURL) throw new Error("RABBITMQURL not set");

  if (connecting) {
    await new Promise((r) => setTimeout(r, 200));
    if (sharedConnection) return sharedConnection;
  }

  connecting = true;
  try {
    console.info("Attempting RabbitMQ connect:", maskUrl(RABBITMQURL).startsWith("amqps") ? "(amqps) TLS" : "(amqp) plain", maskUrl(RABBITMQURL));
    sharedConnection = await amqp.connect(RABBITMQURL, { heartbeat: HEARTBEAT });
    connectAttempts = 0;

    sharedConnection.on("close", (err) => {
      console.error("🔁 RabbitMQ connection closed", err && err.message ? err.message : "");
      sharedConnection = null;
      sharedChannel = null;
    });

    sharedConnection.on("error", (err) => {
      console.error("❌ RabbitMQ connection error", err && err.message ? err.message : "");
      if (err && err.replyCode) console.error("  replyCode:", err.replyCode);
      if (err && err.replyText) console.error("  replyText:", err.replyText);
      if (err && err.stack) console.error(err.stack);
      // Do not clear sharedConnection here — close handler will run if connection actually closes
    });

    return sharedConnection;
  } catch (err) {
    connectAttempts++;
    const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * Math.pow(2, Math.max(0, connectAttempts - 1)));
    console.error(`❌ RabbitMQ connect failed (attempt ${connectAttempts}). Retrying in ${delay}ms:`, err && err.message ? err.message : err);
    if (err && err.replyCode) console.error("  replyCode:", err.replyCode);
    if (err && err.replyText) console.error("  replyText:", err.replyText);
    if (err && err.stack) console.error(err.stack);
    await new Promise((r) => setTimeout(r, delay));
    return createConnection();
  } finally {
    connecting = false;
  }
}

async function ensureChannel(exchange, type = "direct") {
  if (sharedChannel) return sharedChannel;
  const conn = await createConnection();
  sharedChannel = await conn.createChannel();

  // channel error/close handlers for better diagnostics
  sharedChannel.on("error", (err) => {
    console.error("Channel error:", err && err.message ? err.message : "");
  });
  sharedChannel.on("close", () => {
    console.warn("Channel closed");
    sharedChannel = null;
  });

  await sharedChannel.assertExchange(exchange, type, { durable: true });
  return sharedChannel;
}

// Public function
const sendMailToQueue = async ({ subject, to, EXCHANGE, ROUTING_KEY, templateData }) => {
  if (!EXCHANGE || !ROUTING_KEY) throw new Error("EXCHANGE and ROUTING_KEY are required");

  try {
    const channel = await ensureChannel(EXCHANGE, "direct");

    const message = {
      producerId: "email-producer",
      type: "email",
      timestamp: new Date().toISOString(),
      payload: { subject, to, templateData },
    };

    const published = channel.publish(EXCHANGE, ROUTING_KEY, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    if (!published) {
      // backpressure: wait briefly then proceed
      await new Promise((r) => setTimeout(r, 100));
    }

    console.log(`📤 Message sent to ${EXCHANGE} -> ${ROUTING_KEY}`);
  } catch (error) {
    console.error("❌ Producer error:", error && error.message ? error.message : error);
    if (error && error.replyCode) console.error("  replyCode:", error.replyCode);
    if (error && error.replyText) console.error("  replyText:", error.replyText);
    if (error && error.stack) console.error(error.stack);
    throw error;
  }
};

async function closeConnection() {
  try {
    if (sharedChannel) {
      await sharedChannel.close().catch(() => {});
      sharedChannel = null;
    }
    if (sharedConnection) {
      await sharedConnection.close().catch(() => {});
      sharedConnection = null;
    }
  } catch (_) {}
}

process.on("exit", closeConnection);
process.on("SIGINT", () => closeConnection().then(() => process.exit(0)));
process.on("SIGTERM", () => closeConnection().then(() => process.exit(0)));

module.exports = { sendMailToQueue, closeConnection };
