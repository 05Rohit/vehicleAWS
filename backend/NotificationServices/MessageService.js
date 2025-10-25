require("dotenv").config();
const amqp = require("amqplib");

const RABBITMQURL = process.env.RABBITMQURL; // do NOT append ?heartbeat=60 here
const HEARTBEAT = 60;
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 30000;

let sharedConnection = null;
let sharedChannel = null;
let connecting = false;
let connectAttempts = 0;

async function createConnection() {
  if (sharedConnection) return sharedConnection;
  if (!RABBITMQURL) throw new Error("RABBITMQURL not set");

  if (connecting) {
    // wait briefly while another attempt completes
    await new Promise((r) => setTimeout(r, 200));
    if (sharedConnection) return sharedConnection;
  }

  connecting = true;
  try {
    sharedConnection = await amqp.connect(RABBITMQURL, { heartbeat: HEARTBEAT });
    connectAttempts = 0;

    sharedConnection.on("close", (err) => {
      console.error("🔁 RabbitMQ connection closed", err && err.message ? err.message : "");
      sharedConnection = null;
      sharedChannel = null;
    });

    sharedConnection.on("error", (err) => {
      console.error("❌ RabbitMQ connection error", err && err.message ? err.message : "");
      // let close handler clear refs
    });

    return sharedConnection;
  } catch (err) {
    connectAttempts++;
    const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * Math.pow(2, Math.max(0, connectAttempts - 1)));
    console.error(`❌ RabbitMQ connect failed (attempt ${connectAttempts}). Retrying in ${delay}ms:`, err && err.message ? err.message : err);
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
