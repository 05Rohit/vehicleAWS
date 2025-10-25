require("dotenv").config();
const amqp = require("amqplib");

const RABBITMQURL = process.env.RABBITMQURL + "?heartbeat=60";

let connection = null;
let channel = null;

async function connectRabbitMQ() {
  try {
    if (!connection) {
      connection = await amqp.connect(RABBITMQURL);

      connection.on("close", () => {
        console.error("🔁 RabbitMQ Email Producer connection closed. Reconnecting...");
        connection = null;
        setTimeout(connectRabbitMQ, 5000);
      });

      connection.on("error", (err) => {
        console.error("❌ RabbitMQ Email Producer error:", err.message);
      });
    }

    if (!channel) {
      channel = await connection.createChannel();
    }

    console.log("✅ Email Producer Connected to RabbitMQ");
  } catch (err) {
    console.error("❌ Failed to connect to RabbitMQ:", err.message);
    setTimeout(connectRabbitMQ, 5000);
  }
}

async function sendMailToQueue({ subject, to, EXCHANGE, ROUTING_KEY, templateData }) {
  if (!channel) await connectRabbitMQ();

  try {
    await channel.assertExchange(EXCHANGE, "direct", { durable: true });

    const message = {
      producerId: "email-producer",
      type: "email",
      timestamp: new Date().toISOString(),
      payload: { subject, to, templateData },
    };

    channel.publish(
      EXCHANGE,
      ROUTING_KEY,
      Buffer.from(JSON.stringify(message)),
      { persistent: true }
    );

    console.log(`📨 Email queued ➜ ${ROUTING_KEY}`);
  } catch (err) {
    console.error("⚠️ Failed to publish email message:", err.message);
  }
}

connectRabbitMQ(); // Initialize on start

module.exports = { sendMailToQueue };
