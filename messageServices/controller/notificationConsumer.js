require("dotenv").config();
const amqp = require("amqplib");
const axios = require("axios");

const BACKEND_SERVICE_URL = process.env.BACKEND_SERVICE_URL;
const RABBITMQURL = process.env.RABBITMQURL + "?heartbeat=60";

const MAX_RETRIES = 5;

let connection = null;
let channel = null;

async function notificationConsumer(rolename, io) {
  if (!rolename || !io) {
    throw new Error("rolename and io must be provided");
  }
  try {
    // 1️⃣ Connect to RabbitMQ
    connection = await amqp.connect(RABBITMQURL);

    connection.on("close", () => {
      console.error("🔁 RabbitMQ connection closed. Reconnecting in 5s...");
      setTimeout(() => notificationConsumer(rolename, io), 5000);
    });

    connection.on("error", (err) => {
      console.error("❌ RabbitMQ connection error:", err.message);
    });

    channel = await connection.createChannel();

    const exchange = "notifications_topic";
    await channel.assertExchange(exchange, "topic", { durable: true });

    // 2️⃣ Create and bind queue
    const queueName = `notify_admin`;
    await channel.assertQueue(queueName, {
      durable: true,
      arguments: { "x-dead-letter-exchange": "dlx_exchange" },
    });

    if (rolename === "admin") {
      await channel.bindQueue(queueName, exchange, `notify.admin`);
    } else if (rolename === "user") {
      await channel.bindQueue(queueName, exchange, `notify.user.*`);
    }

    // 3️⃣ Consume messages
    channel.consume(
      queueName,
      async (msg) => {
        if (!msg) return;

        const data = JSON.parse(msg.content.toString());
        // console.log("Received notification:", data);

        try {
          // 4️⃣ Emit via socket
          if (data.rolename === "user") {
            io.to(data.userId).emit("new_notification", data);
          } else if (data.rolename === "admin") {
            io.to("admin").emit("new_notification", data);
          }

          // 5️⃣ Save to backend
          await sendToBackend(data);
          channel.ack(msg);
        } catch (err) {
          console.error("Failed to process notification:", err.message);
          channel.nack(msg, false, false);
        }
      },
      { noAck: false }
    );
  } catch (err) {
    console.error("❌ RabbitMQ Connection Error:", err.message);
    setTimeout(() => notificationConsumer(rolename, io), 5000);
  }
}

// Helper function to send notification to backend API with retry
async function sendToBackend(data, attempt = 1) {
  // console.log(data.title)
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
    console.error(`❗ Backend attempt ${attempt} failed:`, err.message);

    if (attempt < MAX_RETRIES) {
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      return sendToBackend(data, attempt + 1);
    } else {
      console.error("🚫 Max retries reached. Notification failed permanently.");
    }
  }
}

module.exports = { notificationConsumer };
