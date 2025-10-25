require("dotenv").config();
const amqp = require("amqplib");

const RABBITMQURL = process.env.RABBITMQURL;
const EXCHANGE = "notifications_topic";
const HEARTBEAT = 60;

let sharedConnection = null;
let sharedChannel = null;
let connecting = false;

async function connectWithRetry(retries = 0) {
  if (sharedConnection) return sharedConnection;
  if (!RABBITMQURL) throw new Error("RABBITMQURL not set");

  if (connecting) {
    // wait for ongoing connection attempt
    await new Promise((r) => setTimeout(r, 200));
    if (sharedConnection) return sharedConnection;
  }

  connecting = true;
  try {
    sharedConnection = await amqp.connect(RABBITMQURL, { heartbeat: HEARTBEAT });

    sharedConnection.on("close", () => {
      sharedConnection = null;
      sharedChannel = null;
    });
    sharedConnection.on("error", () => {
      // clear references so next call reconnects
      sharedConnection = null;
      sharedChannel = null;
    });

    return sharedConnection;
  } catch (err) {
    connecting = false;
    const delay = Math.min(30000, 1000 * Math.pow(2, retries)); // exponential backoff up to 30s
    await new Promise((r) => setTimeout(r, delay));
    return connectWithRetry(retries + 1);
  } finally {
    connecting = false;
  }
}

async function ensureChannel() {
  if (sharedChannel) return sharedChannel;
  const conn = await connectWithRetry();
  sharedChannel = await conn.createChannel();
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
      // broker signaled backpressure; wait briefly
      await new Promise((r) => setTimeout(r, 100));
    }
  } catch (error) {
    console.error("Error sending notification:", error && error.message ? error.message : error);
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
