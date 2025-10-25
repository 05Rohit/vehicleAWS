
const amqp = require("amqplib");

const RABBITMQURL = process.env.RABBITMQURL;

async function sendNotification(userId, rolename, message, title, type) {
  try {
const connection = await amqp.connect(RABBITMQURL, { heartbeat: 60 });
    const channel = await connection.createChannel();


    // console.log( "hello",userId, rolename, message, title, type);

    const exchange = "notifications_topic";
    await channel.assertExchange(exchange, "topic", { durable: true });

    // Decide routing key based on target
    let routingKey;
    if (rolename === "admin") {
      routingKey = `notify.admin`; // goes to all admins
    } else if (rolename === "user") {
      routingKey = `notify.user.${userId}`; // goes only to that user
    }

    const notificationId = Math.random().toString(36).substring(2, 15); // simple unique ID generator

    const payload = JSON.stringify({
      notificationId,
      userId,
      rolename, // "admin" or "user"
      message,
      title,
      type,
      timestamp: new Date().toISOString(),
    });

    // console.log(payload)

    channel.publish(exchange, routingKey, Buffer.from(payload), {
      persistent: true,
    });

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error("Error sending notification:", error);
  }
}

module.exports = { sendNotification };
