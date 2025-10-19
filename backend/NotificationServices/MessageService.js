require("dotenv").config();
const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL;

const sendMailToQueue = async ({
  subject,
  to,
  EXCHANGE,
  ROUTING_KEY,
  templateData,
}) => {
  // console.log(
  //   "🚀 Preparing to send message to queue...",
  //   subject,
  //   to,
  //   EXCHANGE,
  //   ROUTING_KEY,
  //   templateData
  // );

  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE, "direct", { durable: true });

    const message = {
      producerId: "email-producer",
      type: "email",
      timestamp: new Date().toISOString(),
      payload: {
        subject: subject,
        to: to,
        templateData: templateData,
      },
    };

  channel.publish(
      EXCHANGE,
      ROUTING_KEY,
      Buffer.from(JSON.stringify(message)),
      {
        persistent: true,
      }
    );

    setTimeout(() => {
      connection.close();
    }, 500);
  } catch (error) {
    console.error("❌ Producer error:", error.message);
    throw error;
  }
};

module.exports = { sendMailToQueue };
