// require("dotenv").config();
// const amqp = require("amqplib");

// const RABBITMQURL = process.env.RABBITMQURL;

// const sendMailToQueue = async ({
//   subject,
//   to,
//   EXCHANGE,
//   ROUTING_KEY,
//   templateData,
// }) => {
//   // console.log(
//   //   "🚀 Preparing to send message to queue...",
//   //   subject,
//   //   to,
//   //   EXCHANGE,
//   //   ROUTING_KEY,
//   //   templateData
//   // );

//   try {
//     const connection = await amqp.connect(RABBITMQURL + "?heartbeat=60");
//     const channel = await connection.createChannel();

//     await channel.assertExchange(EXCHANGE, "direct", { durable: true });

//     const message = {
//       producerId: "email-producer",
//       type: "email",
//       timestamp: new Date().toISOString(),
//       payload: {
//         subject: subject,
//         to: to,
//         templateData: templateData,
//       },
//     };

//     channel.publish(
//       EXCHANGE,
//       ROUTING_KEY,
//       Buffer.from(JSON.stringify(message)),
//       {
//         persistent: true,
//       }
//     );

//     setTimeout(() => {
//       connection.close();
//     }, 500);
//   } catch (error) {
//     console.error("❌ Producer error:", error.message);
//     throw error;
//   }
// };

// module.exports = { sendMailToQueue };



require("dotenv").config();
const amqp = require("amqplib");

const RABBITMQURL = process.env.RABBITMQURL + "?heartbeat=60";

let connection = null;
let channel = null;

const connectRabbit = async () => {
  try {
    connection = await amqp.connect(RABBITMQURL);
    connection.on("close", () => {
      console.error("🔁 RabbitMQ connection closed, reconnecting...");
      setTimeout(connectRabbit, 5000);
    });
    connection.on("error", (err) => {
      console.error("❌ RabbitMQ connection error:", err.message);
    });

    channel = await connection.createChannel();
    console.log("✅ RabbitMQ Connected and Channel Created");
  } catch (err) {
    console.error("❌ RabbitMQ Connection Failed, retrying in 5s:", err.message);
    setTimeout(connectRabbit, 5000);
  }
};

// Call once at startup
connectRabbit();

const sendMailToQueue = async ({ subject, to, EXCHANGE, ROUTING_KEY, templateData }) => {
  try {
    if (!channel) {
      throw new Error("Channel not ready yet");
    }

    await channel.assertExchange(EXCHANGE, "direct", { durable: true });

    const message = {
      producerId: "email-producer",
      type: "email",
      timestamp: new Date().toISOString(),
      payload: { subject, to, templateData },
    };

    channel.publish(EXCHANGE, ROUTING_KEY, Buffer.from(JSON.stringify(message)), {
      persistent: true,
    });

    console.log(`📤 Message sent to queue: ${ROUTING_KEY}`);
  } catch (error) {
    console.error("❌ Producer error:", error.message);
    throw error;
  }
};

module.exports = { sendMailToQueue };
