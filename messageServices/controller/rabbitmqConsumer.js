require("dotenv").config();

const amqp = require("amqplib");
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
} = require("../utils/mailTemplate.jsx");

const RABBITMQURL = process.env.RABBITMQURL;
const EXCHANGE = "emailExchange";
const BOOKINGEXCHANGE = "bookingemailExchange";

const MAX_RETRIES = 5;
const BASE_DELAY_MS = 1000; // 1 second

// Consumer for new vehicle added
const startConsumerForNewVehicle = async () => {
  const ROUTING_KEY = "task.newvehicleadded";
  const QUEUE_NAME = "newvehicleadded";
  const DLQ_NAME = "emailNewVehicleDLQ";

  try {
    const connection = await amqp.connect(RABBITMQURL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE, "direct", { durable: true });
    await channel.assertQueue(DLQ_NAME, { durable: true });

    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": "emailNewVehicleDLQ",
      },
    });

    await channel.bindQueue(QUEUE_NAME, EXCHANGE, ROUTING_KEY);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          const headers = msg.properties.headers || {};
          const retryCount = headers["x-retry-count"] || 0;

          try {
            const parsed = JSON.parse(messageContent);
            const { subject, to, templateData } = parsed.payload;

            // Send email using your template
            await vehicleCreationEmail({ to, subject, templateData });

            channel.ack(msg);
          } catch (err) {
            // console.error("❌ Error processing message:", err.message);
            if (retryCount < MAX_RETRIES) {
              const delay = BASE_DELAY_MS * Math.pow(2, retryCount);

              setTimeout(() => {
                channel.sendToQueue(QUEUE_NAME, msg.content, {
                  headers: { "x-retry-count": retryCount + 1 },
                  persistent: true,
                });
                // console.log(
                //   `🔁 Retrying message (${
                //     retryCount + 1
                //   }/${MAX_RETRIES}) after ${delay}ms`
                // );
              }, delay);

              channel.ack(msg);
            } else {
              console.warn("🚨 Max retries reached. Sending to DLQ.");
              channel.sendToQueue("emailNewVehicleDLQ", msg.content, {
                persistent: true,
              });
              channel.ack(msg);
            }
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("❌ Consumer error:", error.message);
  }
};

const startConsumerForUpdateVehicle = async () => {
  const ROUTING_KEY = "task.vehicleUpdated";
  const QUEUE_NAME = "vehicleUpdated";
  const DLQ_NAME = "vehicleUpdatedDLQ";

  try {
    const connection = await amqp.connect(RABBITMQURL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE, "direct", { durable: true });
    await channel.assertQueue(DLQ_NAME, { durable: true });

    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": "vehicleUpdatedDLQ",
      },
    });

    await channel.bindQueue(QUEUE_NAME, EXCHANGE, ROUTING_KEY);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          const headers = msg.properties.headers || {};
          const retryCount = headers["x-retry-count"] || 0;

          try {
            const parsed = JSON.parse(messageContent);
            const { subject, to, templateData } = parsed.payload;

            // Send email using your template
            await vehicleUpdateEmail({ to, subject, templateData });

            channel.ack(msg);
          } catch (err) {
            // console.error("❌ Error processing message:", err.message);
            if (retryCount < MAX_RETRIES) {
              const delay = BASE_DELAY_MS * Math.pow(2, retryCount);

              setTimeout(() => {
                channel.sendToQueue(QUEUE_NAME, msg.content, {
                  headers: { "x-retry-count": retryCount + 1 },
                  persistent: true,
                });
                // console.log(
                //   `🔁 Retrying message (${
                //     retryCount + 1
                //   }/${MAX_RETRIES}) after ${delay}ms`
                // );
              }, delay);

              channel.ack(msg);
            } else {
              console.warn("🚨 Max retries reached. Sending to DLQ.");
              channel.sendToQueue("vehicleUpdatedDLQ", msg.content, {
                persistent: true,
              });
              channel.ack(msg);
            }
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("❌ Consumer error:", error.message);
  }
};

const startConsumerForDelteVehicle = async () => {
  const ROUTING_KEY = "task.vehicleDeleted";
  const QUEUE_NAME = "vehicleDeleted";
  const DLQ_NAME = "vehicleDeletedDLQ";

  try {
    const connection = await amqp.connect(RABBITMQURL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE, "direct", { durable: true });
    await channel.assertQueue(DLQ_NAME, { durable: true });

    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": "vehicleDeletedDLQ",
      },
    });

    await channel.bindQueue(QUEUE_NAME, EXCHANGE, ROUTING_KEY);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          const headers = msg.properties.headers || {};
          const retryCount = headers["x-retry-count"] || 0;

          try {
            const parsed = JSON.parse(messageContent);
            const { subject, to, templateData } = parsed.payload;

            // Send email using your template
            await vehicleDeleteEmail({ to, subject, templateData });

            channel.ack(msg);
          } catch (err) {
            // console.error("❌ Error processing message:", err.message);
            if (retryCount < MAX_RETRIES) {
              const delay = BASE_DELAY_MS * Math.pow(2, retryCount);

              setTimeout(() => {
                channel.sendToQueue(QUEUE_NAME, msg.content, {
                  headers: { "x-retry-count": retryCount + 1 },
                  persistent: true,
                });
                // console.log(
                //   `🔁 Retrying message (${
                //     retryCount + 1
                //   }/${MAX_RETRIES}) after ${delay}ms`
                // );
              }, delay);

              channel.ack(msg);
            } else {
              console.warn("🚨 Max retries reached. Sending to DLQ.");
              channel.sendToQueue("vehicleDeletedDLQ", msg.content, {
                persistent: true,
              });
              channel.ack(msg);
            }
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("❌ Consumer error:", error.message);
  }
};

const startConsumerForUserCreation = async () => {
  const ROUTING_KEY = "task.usercreated";
  const QUEUE_NAME = "usercreated";
  const DLQ_NAME = "usercreatedDLQ";

  try {
    const connection = await amqp.connect(RABBITMQURL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE, "direct", { durable: true });
    await channel.assertQueue(DLQ_NAME, { durable: true });

    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": "usercreatedDLQ",
      },
    });

    await channel.bindQueue(QUEUE_NAME, EXCHANGE, ROUTING_KEY);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          const headers = msg.properties.headers || {};
          const retryCount = headers["x-retry-count"] || 0;

          try {
            const parsed = JSON.parse(messageContent);
            const { subject, to, templateData } = parsed.payload;

            // Send email using your template
            await userCreationEmail({ to, subject, templateData });

            channel.ack(msg);
          } catch (err) {
            // console.error("❌ Error processing message:", err.message);
            if (retryCount < MAX_RETRIES) {
              const delay = BASE_DELAY_MS * Math.pow(2, retryCount);

              setTimeout(() => {
                channel.sendToQueue(QUEUE_NAME, msg.content, {
                  headers: { "x-retry-count": retryCount + 1 },
                  persistent: true,
                });
                // console.log(
                //   `🔁 Retrying message (${
                //     retryCount + 1
                //   }/${MAX_RETRIES}) after ${delay}ms`
                // );
              }, delay);

              channel.ack(msg);
            } else {
              console.warn("🚨 Max retries reached. Sending to DLQ.");
              channel.sendToQueue("usercreatedDLQ", msg.content, {
                persistent: true,
              });
              channel.ack(msg);
            }
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("❌ Consumer error:", error.message);
  }
};
const startConsumerForUserPasswordChange = async () => {
  const ROUTING_KEY = "task.userPasswordChanged";
  const QUEUE_NAME = "userPasswordChanged";
  const DLQ_NAME = "userPasswordChangedDLQ";

  try {
    const connection = await amqp.connect(RABBITMQURL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE, "direct", { durable: true });
    await channel.assertQueue(DLQ_NAME, { durable: true });

    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": "userPasswordChangedDLQ",
      },
    });

    await channel.bindQueue(QUEUE_NAME, EXCHANGE, ROUTING_KEY);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          const headers = msg.properties.headers || {};
          const retryCount = headers["x-retry-count"] || 0;

          try {
            const parsed = JSON.parse(messageContent);
            const { subject, to, templateData } = parsed.payload;

            // Send email using your template
            await userPasswordChangeEmail({ to, subject, templateData });

            channel.ack(msg);
          } catch (err) {
            // console.error("❌ Error processing message:", err.message);
            if (retryCount < MAX_RETRIES) {
              const delay = BASE_DELAY_MS * Math.pow(2, retryCount);

              setTimeout(() => {
                channel.sendToQueue(QUEUE_NAME, msg.content, {
                  headers: { "x-retry-count": retryCount + 1 },
                  persistent: true,
                });
                // console.log(
                //   `🔁 Retrying message (${
                //     retryCount + 1
                //   }/${MAX_RETRIES}) after ${delay}ms`
                // );
              }, delay);

              channel.ack(msg);
            } else {
              console.warn("🚨 Max retries reached. Sending to DLQ.");
              channel.sendToQueue("userPasswordChangedDLQ", msg.content, {
                persistent: true,
              });
              channel.ack(msg);
            }
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("❌ Consumer error:", error.message);
  }
};
const startConsumerForUserForgotPassword = async () => {
  const ROUTING_KEY = "task.forgotPassword";
  const QUEUE_NAME = "forgotPassword";
  const DLQ_NAME = "forgotPasswordDLQ";

  try {
    const connection = await amqp.connect(RABBITMQURL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE, "direct", { durable: true });
    await channel.assertQueue(DLQ_NAME, { durable: true });

    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": DLQ_NAME,
      },
    });

    await channel.bindQueue(QUEUE_NAME, EXCHANGE, ROUTING_KEY);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          const headers = msg.properties.headers || {};
          const retryCount = headers["x-retry-count"] || 0;

          try {
            const parsed = JSON.parse(messageContent);
            const { subject, to, templateData } = parsed.payload;

            // Send email using your template
            await userForgotPasswordEmail({ to, subject, templateData });

            channel.ack(msg);
          } catch (err) {
            // console.error("❌ Error processing message:", err.message);
            if (retryCount < MAX_RETRIES) {
              const delay = BASE_DELAY_MS * Math.pow(2, retryCount);

              setTimeout(() => {
                channel.sendToQueue(QUEUE_NAME, msg.content, {
                  headers: { "x-retry-count": retryCount + 1 },
                  persistent: true,
                });
                // console.log(
                //   `🔁 Retrying message (${
                //     retryCount + 1
                //   }/${MAX_RETRIES}) after ${delay}ms`
                // );
              }, delay);

              channel.ack(msg);
            } else {
              console.warn("🚨 Max retries reached. Sending to DLQ.");
              channel.sendToQueue(DLQ_NAME, msg.content, {
                persistent: true,
              });
              channel.ack(msg);
            }
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("❌ Consumer error:", error.message);
  }
};

const startConsumerForContactusForm = async () => {
  const ROUTING_KEY = "task.contactus";
  const QUEUE_NAME = "contactus";
  const DLQ_NAME = "contactusDLQ";

  try {
    const connection = await amqp.connect(RABBITMQURL);
    const channel = await connection.createChannel();

    await channel.assertExchange(EXCHANGE, "direct", { durable: true });
    await channel.assertQueue(DLQ_NAME, { durable: true });

    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": "contactusDLQ",
      },
    });

    await channel.bindQueue(QUEUE_NAME, EXCHANGE, ROUTING_KEY);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          const headers = msg.properties.headers || {};
          const retryCount = headers["x-retry-count"] || 0;

          try {
            const parsed = JSON.parse(messageContent);
            const { subject, to, templateData } = parsed.payload;

            // console.log(
            //   "Processing ContactUs message for:",
            //   to,
            //   subject,
            //   templateData
            // );

            // Send email using your template
            await userContactUsFormEmail({ to, subject, templateData });

            channel.ack(msg);
          } catch (err) {
            // console.error("❌ Error processing message:", err.message);
            if (retryCount < MAX_RETRIES) {
              const delay = BASE_DELAY_MS * Math.pow(2, retryCount);

              setTimeout(() => {
                channel.sendToQueue(QUEUE_NAME, msg.content, {
                  headers: { "x-retry-count": retryCount + 1 },
                  persistent: true,
                });
                // console.log(
                //   `🔁 Retrying message (${
                //     retryCount + 1
                //   }/${MAX_RETRIES}) after ${delay}ms`
                // );
              }, delay);

              channel.ack(msg);
            } else {
              console.warn("🚨 Max retries reached. Sending to DLQ.");
              channel.sendToQueue("contactusDLQ", msg.content, {
                persistent: true,
              });
              channel.ack(msg);
            }
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("❌ Consumer error:", error.message);
  }
};

const startConsumerForVehicleBooking = async () => {
  const ROUTING_KEY = "bookingtask.userbookedvehicle";
  const QUEUE_NAME = "userbookedvehicle";
  const DLQ_NAME = "userbookedvehicleDLQ";

  try {
    const connection = await amqp.connect(RABBITMQURL);
    const channel = await connection.createChannel();

    await channel.assertExchange(BOOKINGEXCHANGE, "direct", { durable: true });
    await channel.assertQueue(DLQ_NAME, { durable: true });

    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": DLQ_NAME,
      },
    });

    await channel.bindQueue(QUEUE_NAME, BOOKINGEXCHANGE, ROUTING_KEY);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          const headers = msg.properties.headers || {};
          const retryCount = headers["x-retry-count"] || 0;

          try {
            const parsed = JSON.parse(messageContent);
            const { subject, to, templateData } = parsed.payload;

            // Send email using your template
            await userBookingConfirmationEmail({ to, subject, templateData });

            channel.ack(msg);
          } catch (err) {
            // console.error("❌ Error processing message:", err.message);
            if (retryCount < MAX_RETRIES) {
              const delay = BASE_DELAY_MS * Math.pow(2, retryCount);

              setTimeout(() => {
                channel.sendToQueue(QUEUE_NAME, msg.content, {
                  headers: { "x-retry-count": retryCount + 1 },
                  persistent: true,
                });
                // console.log(
                //   `🔁 Retrying message (${
                //     retryCount + 1
                //   }/${MAX_RETRIES}) after ${delay}ms`
                // );
              }, delay);

              channel.ack(msg);
            } else {
              console.warn("🚨 Max retries reached. Sending to DLQ.");
              channel.sendToQueue(DLQ_NAME, msg.content, {
                persistent: true,
              });
              channel.ack(msg);
            }
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("❌ Consumer error:", error.message);
  }
};

const startConsumerForVehicleBookingStatusUpdate = async () => {
  const ROUTING_KEY = "bookingtask.userbookedvehiclestatusupdate";
  const QUEUE_NAME = "userbookedvehiclestatusupdate";
  const DLQ_NAME = "userbookedvehiclestatusupdateDLQ";

  try {
    const connection = await amqp.connect(RABBITMQURL);
    const channel = await connection.createChannel();

    await channel.assertExchange(BOOKINGEXCHANGE, "direct", { durable: true });
    await channel.assertQueue(DLQ_NAME, { durable: true });

    await channel.assertQueue(QUEUE_NAME, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": "",
        "x-dead-letter-routing-key": DLQ_NAME,
      },
    });

    await channel.bindQueue(QUEUE_NAME, BOOKINGEXCHANGE, ROUTING_KEY);

    channel.consume(
      QUEUE_NAME,
      async (msg) => {
        if (msg !== null) {
          const messageContent = msg.content.toString();
          const headers = msg.properties.headers || {};
          const retryCount = headers["x-retry-count"] || 0;

          try {
            const parsed = JSON.parse(messageContent);
            const { subject, to, templateData } = parsed.payload;

            //

            // Send email using your template
            await userBookingStatusUpdateEmail({ to, subject, templateData });

            channel.ack(msg);
          } catch (err) {
            // console.error("❌ Error processing message:", err.message);
            if (retryCount < MAX_RETRIES) {
              const delay = BASE_DELAY_MS * Math.pow(2, retryCount);

              setTimeout(() => {
                channel.sendToQueue(QUEUE_NAME, msg.content, {
                  headers: { "x-retry-count": retryCount + 1 },
                  persistent: true,
                });
                // console.log(
                //   `🔁 Retrying message (${
                //     retryCount + 1
                //   }/${MAX_RETRIES}) after ${delay}ms`
                // );
              }, delay);

              channel.ack(msg);
            } else {
              console.warn("🚨 Max retries reached. Sending to DLQ.");
              channel.sendToQueue(DLQ_NAME, msg.content, {
                persistent: true,
              });
              channel.ack(msg);
            }
          }
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error("❌ Consumer error:", error.message);
  }
};

startConsumerForNewVehicle();
startConsumerForUserCreation();
startConsumerForUserPasswordChange();
startConsumerForUpdateVehicle();
startConsumerForDelteVehicle();
startConsumerForContactusForm();
startConsumerForUserForgotPassword();
startConsumerForVehicleBooking();
startConsumerForVehicleBookingStatusUpdate();

module.exports = { startConsumerForNewVehicle };
