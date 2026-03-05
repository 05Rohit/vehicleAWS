require("dotenv").config();
const amqp = require("amqplib");

// Email Templates
const {
  vehicleCreationEmail,
  userCreationEmail,
  userPasswordChangeEmail,
  vehicleUpdateEmail,
  vehicleDeleteEmail,
  userContactUsFormEmail,
  userForgotPasswordEmail,
  userBookingConfirmationEmail,
  userBookingStatusUpdateEmail,
  otpEmailTemplate,
} = require("../utils/mailTemplate.jsx");

// Env Variables
const RABBITMQ_URL = process.env.RABBITMQURL;

const EMAIL_EXCHANGE = "emailExchange";
const BOOKING_EXCHANGE = "bookingemailExchange";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000;

let connection;
let channels = {};

// ✅ Create a shared RabbitMQ Connection
const connectRabbit = async () => {
  if (connection) return connection;

  connection = await amqp.connect(RABBITMQ_URL, { heartbeat: 60 });

  connection.on("error", (err) => {
    console.error("⛔ RabbitMQ error:", err.message);
  });

  connection.on("close", () => {
    console.error("🔁 RabbitMQ connection closed… Reconnecting…");
    connection = null;
    setTimeout(connectRabbit, 5000);
  });

  console.log("✅ RabbitMQ Connected Successfully");
  return connection;
};

// ✅ Create a dedicated channel for each consumer
const getChannel = async (queueName) => {
  if (channels[queueName]) return channels[queueName];

  const conn = await connectRabbit();
  const channel = await conn.createChannel();

  channels[queueName] = channel;
  return channel;
};

// ✅ Universal Retry Handler
const handleRetry = async (channel, msg, queue, dlq) => {
  const headers = msg.properties.headers || {};
  const retryCount = headers["x-retry-count"] || 0;

  if (retryCount < MAX_RETRIES) {
    const delay = BASE_DELAY_MS * Math.pow(2, retryCount);

    setTimeout(() => {
      channel.sendToQueue(queue, msg.content, {
        persistent: true,
        headers: { "x-retry-count": retryCount + 1 },
      });
    }, delay);

    console.log(`🔁 Retrying message (${retryCount + 1}/${MAX_RETRIES})`);
  } else {
    console.warn("🚨 Max retries reached. Moving to DLQ:", dlq);
    channel.sendToQueue(dlq, msg.content, { persistent: true });
  }

  channel.ack(msg);
};

// ✅ Generic Consumer Logic
const createConsumer = async ({
  exchange,
  routingKey,
  queueName,
  dlqName,
  handler,
}) => {
  try {
    const channel = await getChannel(queueName);

    await channel.assertExchange(exchange, "direct", { durable: true });
    await channel.assertQueue(dlqName, { durable: true });

    await channel.assertQueue(queueName, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": dlqName,
      },
    });

    await channel.bindQueue(queueName, exchange, routingKey);

    channel.consume(queueName, async (msg) => {
      if (!msg) return;

      try {
        const parsed = JSON.parse(msg.content.toString());
        const { subject, to, templateData } = parsed.payload;

        await handler({ to, subject, templateData });

        console.log(`✅ Processed: ${routingKey}`);
        channel.ack(msg);
      } catch (err) {
        console.error("⛔ Processing failed:", err.message);
        await handleRetry(channel, msg, queueName, dlqName);
      }
    });

    console.log(`📩 Consumer Started → ${queueName}`);
  } catch (error) {
    console.error("⛔ Consumer Error:", error.message);
  }
};

// Consumers List
const consumers = [
  {
    routingKey: "task.newvehicleadded",
    queueName: "newvehicleadded",
    dlqName: "emailNewVehicleDLQ",
    exchange: EMAIL_EXCHANGE,
    handler: vehicleCreationEmail,
  },
  {
    routingKey: "task.vehicleUpdated",
    queueName: "vehicleUpdated",
    dlqName: "vehicleUpdatedDLQ",
    exchange: EMAIL_EXCHANGE,
    handler: vehicleUpdateEmail,
  },
  {
    routingKey: "task.vehicleDeleted",
    queueName: "vehicleDeleted",
    dlqName: "vehicleDeletedDLQ",
    exchange: EMAIL_EXCHANGE,
    handler: vehicleDeleteEmail,
  },
  {
    routingKey: "task.usercreated",
    queueName: "usercreated",
    dlqName: "usercreatedDLQ",
    exchange: EMAIL_EXCHANGE,
    handler: userCreationEmail,
  },
  {
    routingKey: "task.sendotp",
    queueName: "sendotp",
    dlqName: "sendotpDLQ",
    exchange: EMAIL_EXCHANGE,
    handler: otpEmailTemplate,
  },
  {
    routingKey: "task.userPasswordChanged",
    queueName: "userPasswordChanged",
    dlqName: "userPasswordChangedDLQ",
    exchange: EMAIL_EXCHANGE,
    handler: userPasswordChangeEmail,
  },
  {
    routingKey: "task.forgotPassword",
    queueName: "forgotPassword",
    dlqName: "forgotPasswordDLQ",
    exchange: EMAIL_EXCHANGE,
    handler: userForgotPasswordEmail,
  },
  {
    routingKey: "task.contactus",
    queueName: "contactus",
    dlqName: "contactusDLQ",
    exchange: EMAIL_EXCHANGE,
    handler: userContactUsFormEmail,
  },
  {
    routingKey: "bookingtask.userbookedvehicle",
    queueName: "userbookedvehicle",
    dlqName: "userbookedvehicleDLQ",
    exchange: BOOKING_EXCHANGE,
    handler: userBookingConfirmationEmail,
  },
  {
    routingKey: "bookingtask.userbookedvehiclestatusupdate",
    queueName: "userbookedvehiclestatusupdate",
    dlqName: "userbookedvehiclestatusupdateDLQ",
    exchange: BOOKING_EXCHANGE,
    handler: userBookingStatusUpdateEmail,
  },
];

// ✅ Start All Consumers
const startAllConsumers = async () => {
  for (const consumer of consumers) {
    await createConsumer(consumer);
  }
};

startAllConsumers();

module.exports = { startAllConsumers };
