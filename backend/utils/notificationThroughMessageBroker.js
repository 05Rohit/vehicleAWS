require("dotenv").config();
const amqp = require("amqplib");

let RABBITMQURL = process.env.RABBITMQURL;
const EXCHANGE = "notifications_topic";
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
let sharedChannel = null;
let connecting = false;

async function connectWithRetry(retries = 0) {
  if (sharedConnection) return sharedConnection;
  if (!RABBITMQURL) throw new Error("RABBITMQURL not set");

  if (connecting) {
    await new Promise((r) => setTimeout(r, 200));
    if (sharedConnection) return sharedConnection;
  }

  connecting = true;
  try {
    console.info("Connecting to RabbitMQ:", maskUrl(RABBITMQURL).startsWith("amqps") ? "(amqps) TLS" : "(amqp) plain", maskUrl(RABBITMQURL));
    sharedConnection = await amqp.connect(RABBITMQURL, { heartbeat: HEARTBEAT });

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
      // leave cleanup to close handler
    });

    return sharedConnection;
  } catch (err) {
    const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * Math.pow(2, Math.max(0, retries)));
    console.error(`❌ RabbitMQ connect failed (attempt ${retries + 1}). Retrying in ${delay}ms:`, err && err.message ? err.message : err);
    if (err && err.replyCode) console.error("  replyCode:", err.replyCode);
    if (err && err.replyText) console.error("  replyText:", err.replyText);
    if (err && err.stack) console.error(err.stack);
    await new Promise((r) => setTimeout(r, delay));
    connecting = false;
    return connectWithRetry(retries + 1);
  } finally {
    connecting = false;
  }
}

async function ensureChannel() {
  if (sharedChannel) return sharedChannel;
  const conn = await connectWithRetry();
  sharedChannel = await conn.createChannel();

  sharedChannel.on("error", (err) => {
    console.error("Channel error:", err && err.message ? err.message : "");
  });
  sharedChannel.on("close", () => {
    console.warn("Channel closed");
    sharedChannel = null;
  });

  await sharedChannel.assertExchange(EXCHANGE, "topic", { durable: true });
  return sharedChannel;
}

async function sendNotification(userId, rolename, message, title, type) {
  try {
    const channel = await ensureChannel();

    let routingKey = "notify.broadcast";
    if (rolename === "admin") routingKey = "notify.admin";
    else if (rolename === "user" && userId) routingKey = `notify.user.${userId}`;

    const notificationId = Math.random().toString(36).substring(2, 15);
    const payload = {
      notificationId,
      userId,
      rolename,
      message,
      title,
      type,
      timestamp: new Date().toISOString(),
    };

    const published = channel.publish(
      EXCHANGE,
      routingKey,
      Buffer.from(JSON.stringify(payload)),
      { persistent: true }
    );

    if (!published) {
      await new Promise((r) => setTimeout(r, 100));
    }
  } catch (error) {
    console.error("Error sending notification:", error && error.message ? error.message : error);
    if (error && error.replyCode) console.error("  replyCode:", error.replyCode);
    if (error && error.replyText) console.error("  replyText:", error.replyText);
    if (error && error.stack) console.error(error.stack);
    throw error;
  }
}

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

module.exports = { sendNotification, closeConnection };
