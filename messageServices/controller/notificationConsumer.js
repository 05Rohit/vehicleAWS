// ...existing code...
require("dotenv").config();
const amqp = require("amqplib");
const axios = require("axios");

const BACKEND_SERVICE_URL = process.env.BACKEND_SERVICE_URL;
const RABBITMQURL = process.env.RABBITMQURL; // do not append ?heartbeat
const HEARTBEAT = 60;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;
const MAX_RETRIES = 5;

let sharedConnection = null;
let connecting = false;

// create or reuse a single connection with exponential backoff
async function ensureConnection(attempt = 0) {
  if (sharedConnection) return sharedConnection;
  if (!RABBITMQURL) throw new Error("RABBITMQURL not set");

  if (connecting) {
    await new Promise((r) => setTimeout(r, 200));
    if (sharedConnection) return sharedConnection;
  }

  connecting = true;
  try {
    sharedConnection = await amqp.connect(RABBITMQURL, { heartbeat: HEARTBEAT });

    sharedConnection.on("close", (err) => {
      console.error("🔁 RabbitMQ connection closed", err && err.message ? err.message : "");
      sharedConnection = null;
    });

    sharedConnection.on("error", (err) => {
      console.error("❌ RabbitMQ connection error", err && err.message ? err.message : "");
      // leave sharedConnection null if closed; 'close' will also fire
    });

    console.log("✅ RabbitMQ connected (shared)");
    return sharedConnection;
  } catch (err) {
    const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * Math.pow(2, attempt));
    console.error(`❌ RabbitMQ connect failed (attempt ${attempt + 1}). Retrying in ${delay}ms:`, err && err.message ? err.message : err);
    await new Promise((r) => setTimeout(r, delay));
    return ensureConnection(attempt + 1);
  } finally {
    connecting = false;
  }
}

// main consumer. creates a channel per consumer instance (reusable connection)
async function notificationConsumer(rolename, io) {
  if (!rolename || !io) throw new Error("rolename and io must be provided");

  const exchange = "notifications_topic";
  const queueName = `notify_${rolename}`; // adjust if you need per-instance queues

  let channel = null;

  async function start() {
    try {
      const conn = await ensureConnection();
      channel = await conn.createChannel();

      await channel.assertExchange(exchange, "topic", { durable: true });
      await channel.assertQueue(queueName, {
        durable: true,
        arguments: { "x-dead-letter-exchange": "dlx_exchange" },
      });

      if (rolename === "admin") {
        await channel.bindQueue(queueName, exchange, "notify.admin");
      } else if (rolename === "user") {
        await channel.bindQueue(queueName, exchange, "notify.user.*");
      } else {
        await channel.bindQueue(queueName, exchange, "notify.#");
      }

      channel.consume(
        queueName,
        async (msg) => {
          if (!msg) return;

          let data;
          try {
            data = JSON.parse(msg.content.toString());
          } catch (parseErr) {
            console.error("Invalid JSON message, nack -> DLQ:", parseErr.message);
            try { channel.nack(msg, false, false); } catch (_) {}
            return;
          }

          try {
            if (data.rolename === "user" && data.userId) {
              io.to(data.userId).emit("new_notification", data);
            } else if (data.rolename === "admin") {
              io.to("admin").emit("new_notification", data);
            } else {
              // fallback broadcast to socket room matching role
              io.emit("new_notification", data);
            }

            await sendToBackend(data);
            channel.ack(msg);
          } catch (err) {
            console.error("Failed to process notification:", err && err.message ? err.message : err);
            try { channel.nack(msg, false, false); } catch (_) {}
          }
        },
        { noAck: false }
      );

      console.log(`🟢 notificationConsumer started for role=${rolename}, queue=${queueName}`);
    } catch (err) {
      console.error("❌ notificationConsumer error:", err && err.message ? err.message : err);
      // close channel if open
      try { if (channel) await channel.close(); } catch (_) {}
      channel = null;
      // try again with backoff
      setTimeout(start, 5000);
    }
  }

  // start consumer
  start();
}

// Helper to send notification to backend API with retry
async function sendToBackend(data, attempt = 1) {
  if (!BACKEND_SERVICE_URL) return;
  try {
    await axios.post(BACKEND_SERVICE_URL, {
      notificationId: data.notificationId,
      userId: data.userId,
      rolename: data.rolename,
      message: data.message,
      title: data.title,
      type: data.type,
    });
  } catch (err) {
    console.error(`❗ Backend attempt ${attempt} failed:`, err && err.message ? err.message : err);
    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      return sendToBackend(data, attempt + 1);
    } else {
      console.error("🚫 Max retries reached. Notification failed permanently.");
    }
  }
}

module.exports = { notificationConsumer };
// ...existing code...