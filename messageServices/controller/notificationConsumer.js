require("dotenv").config();
const amqp = require("amqplib");
const axios = require("axios");

const BACKEND_SERVICE_URL = process.env.BACKEND_SERVICE_URL;
const RABBITMQURL = process.env.RABBITMQURL + "?heartbeat=30"; // ✅ Shorter heartbeat for render

const EXCHANGE = "notifications_topic";
const DLX_EXCHANGE = "dlx_notifications";

const MAX_RETRIES = 5;

let connection;
let channel;

// ✅ Auto reconnection function
async function connectRabbitMQ() {
  try {
    connection = await amqp.connect(RABBITMQURL);
    connection.on("close", () => {
      console.error("🔁 Connection closed, retrying…");
      setTimeout(connectRabbitMQ, 5000);
    });

    connection.on("error", (err) => {
      console.error("⚠️ Connection error:", err.message);
    });

    channel = await connection.createChannel();
    console.log("✅ Connected to RabbitMQ");
  } catch (err) {
    console.error("❌ Failed to connect. Retrying in 5s:", err.message);
    setTimeout(connectRabbitMQ, 5000);
  }
}

async function notificationConsumer(rolename, io) {
  await connectRabbitMQ();

  try {
    // ✅ Create Main Exchange
    await channel.assertExchange(EXCHANGE, "topic", { durable: true });

    // ✅ Dead Letter Exchange
    await channel.assertExchange(DLX_EXCHANGE, "fanout", { durable: true });

    const queueName = `notify_${rolename}`;
    await channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": DLX_EXCHANGE,
      },
    });

    // ✅ Bind based on role
    if (rolename === "admin") {
      await channel.bindQueue(queueName, EXCHANGE, "notify.admin");
    } else if (rolename === "user") {
      await channel.bindQueue(queueName, EXCHANGE, "notify.user.*");
    }


    channel.consume(
      queueName,
      async (msg) => {
        if (!msg) return;

        const data = JSON.parse(msg.content.toString());

        try {
          // ✅ Emit websocket event
          if (data.rolename === "user")
            io.to(data.userId).emit("new_notification", data);
          if (data.rolename === "admin")
            io.to("admin").emit("new_notification", data);

          // ✅ Save to backend DB
          await sendToBackend(data);

          channel.ack(msg);
        } catch (err) {
          console.error("⚠️ Processing error:", err.message);
          channel.nack(msg, false, false); // send to DLX
        }
      },
      { noAck: false }
    );
  } catch (err) {
    console.error("❌ Channel/Binding Error:", err.message);
  }
}

// ✅ Backend API retry logic
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
    console.error(`❗ Backend attempt ${attempt} failed:`, err.message);

    if (attempt < MAX_RETRIES) {
      await new Promise((res) => setTimeout(res, 1000 * attempt));
      return sendToBackend(data, attempt + 1);
    } else {
      console.error("🚫 Backend Save Failed (DLX message created)");
    }
  }
}

module.exports = { notificationConsumer };
