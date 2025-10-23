// const amqp = require("amqplib");
// const QUEUE = "mailQueue";

// exports.sendMailToQueue = async (mailData) => {
//   let connection;
//   try {
//     connection = await amqp.connect(
//       process.env.RABBITMQURL || "amqp://localhost"
//     );
//     const channel = await connection.createChannel();
//     await channel.assertQueue(QUEUE, { durable: true });
//     channel.sendToQueue(QUEUE, Buffer.from(JSON.stringify(mailData)), {
//       persistent: true,
//     });
//     await channel.close();
//     console.log("✅ Message sent to mailQueue");
//   } catch (error) {
//     console.error("Error sending message to queue:", error);
//   } finally {
//     if (connection) {
//       setTimeout(() => {
//         connection.close();
//         console.log("🔌 RabbitMQ connection closed after sending message");
//       }, 500);
//     }
//   }
// };
