// const cron = require("node-cron");
// const { MongoClient, ObjectId } = require("mongodb");
// const dotenv = require("dotenv");
// const {
//   acknowledgeEsclationToManager,
//   AutoTicketCloseToUser,
// } = require("../utils/mailTemplates");

// dotenv.config();
// const uri = process.env.MONGO_URLQ;
// const client = new MongoClient(uri);
// const dbName = process.env.DB_NAME;
// const ticketCollectionName = process.env.TICKET_COLLECTION;
// const currentTime = new Date();

// const AckEsclationToManager = async () => {
//   try {
//     await client.connect();

//     cron.schedule("* * * * * *", async () => {
//       // console.log("working");

//       try {
//         await client.connect();
//         const database = client.db(dbName);
//         const ticketCollection = database.collection(ticketCollectionName);
//         const today = new Date();

//         today.setMinutes(today.getMinutes() - 15);
//         today.setMilliseconds(0);

//         const query = {
//           statusChangedAt: { $eq: today },
//           acknowledgmentStatus: null,
//           status: "Assigned",
//         };

//         const tickets = await ticketCollection.find(query).toArray();

//         for (const ticket of tickets) {
//           if (ticket) {
//             const createdAt = `${ticket.createdAt}`;

//             const dateObj = new Date(createdAt);

//             const day = String(dateObj.getDate());
//             const month = String(dateObj.getMonth() + 1);
//             const year = dateObj.getFullYear();

//             const formattedDate = `${day}-${month}-${year}`;
//             const time = dateObj.toISOString().split("T")[1].split(".")[0];
//             const toEmail = ticket.assignedTo[0].managerEmailId;
//             const managerName = ticket.assignedTo[0].managerName;
//             const engineerName = ticket.assignedTo[0].name;
//             const uniqueID = ticket.uniqueTicketId;

//             acknowledgeEsclationToManager(
//               toEmail,
//               managerName,
//               uniqueID,
//               formattedDate,
//               time,
//               engineerName
//             );
//           }
//         }
//       } catch (error) {
//         console.error("Error in cron job:", error);
//       }
//     });
//   } catch (error) {
//     console.log("Error connecting to MongoDB:", error);
//   }
// };
// AckEsclationToManager();

// const AutoTicketClose = async () => {
//   try {
//     await client.connect();
//     cron.schedule("* * * * * *", async () => {
//       try {
//         await client.connect();
//         const database = client.db(dbName);
//         const ticketCollection = database.collection(ticketCollectionName);
//         const query = {
//           status: { $in: ["Completed"] },
//         };
//         const tickets = await ticketCollection.find(query).toArray();
//         for (const ticket of tickets) {
//           if (ticket) {
//             const completedAt = new Date(ticket.completedAt);
//             const ticketId = ticket._id;
//             const uniqueID = ticket.uniqueTicketId;
//             const userMail = ticket.email;
//             const userName = ticket.name;
//             const diffDays = Math.floor(
//               (currentTime - completedAt) / (1000 * 60 * 60 * 24)
//             );
//             if (diffDays > 3) {
//               await ticketCollection.updateOne(
//                 { _id: new ObjectId(ticketId) },
//                 {
//                   $set: {
//                     status: "Closed",
//                   },
//                 }
//               );
//               AutoTicketCloseToUser(uniqueID, userMail, userName);
//             }
//           }
//         }
//       } catch (error) {
//         console.error("Error in cron job:", error);
//       }
//     });
//   } catch (error) {
//     console.log("Error connecting to MongoDB:", error);
//   }
// };
// AutoTicketClose();
// module.exports = { AckEsclationToManager, AutoTicketClose };
