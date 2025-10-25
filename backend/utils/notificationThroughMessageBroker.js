const amqp = require("amqplib");

const RABBITMQURL = process.env.RABBITMQURL + "?heartbeat=30"; // ✅ CloudAMQP-safe

let connection;
let channel;

async function connectRabbitMQ() {
  try {
    if (!connection) {
      connection = await amqp.connect(RABBITMQURL);
      connection.on("close", () => {
        console.error("🔁 Producer connection lost. Reconnecting...");
        connection = null;
        setTimeout(connectRabbitMQ, 5000);
      });
    }

    if (!channel) channel = await connection.createChannel();

    await channel.assertExchange("notifications_topic", "topic", {
      durable: true,
    });

    console.log("✅ RabbitMQ Producer Connected");
  } catch (err) {
    console.error("❌ Producer connection failed:", err.message);
    setTimeout(connectRabbitMQ, 5000);
  }
}

// ✅ improved send function
async function sendNotification(userId, rolename, message, title, type) {
  if (!channel) await connectRabbitMQ();

  try {
    let routingKey =
      rolename === "admin"
        ? "notify.admin"
        : `notify.user.${userId}`;

    const notificationId = Date.now().toString(36);

    const payload = JSON.stringify({
      notificationId,
      userId,
      rolename,
      message,
      title,
      type,
      timestamp: new Date().toISOString(),
    });

    channel.publish("notifications_topic", routingKey, Buffer.from(payload), {
      persistent: true,
    });

    console.log(`📨 Notification Sent ➜ ${routingKey}`);
  } catch (err) {
    console.error("⚠️ Publish failed, retrying:", err.message);
    setTimeout(
      () => sendNotification(userId, rolename, message, title, type),
      2000
    );
  }
}

connectRabbitMQ(); // ✅ Initialize first

module.exports = { sendNotification };
