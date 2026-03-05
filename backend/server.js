const dotenv = require("dotenv");

// Load the correct .env file depending on NODE_ENV
dotenv.config({
  path:
    process.env.NODE_ENV === "production"
      ? "./.env.production"
      : "./.env.development",
});
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

// DB Connection
require("./DatabaseConnection/dataBaseConnection");

const mongoose = require("mongoose");
const VehicleGroup = require("./model/vehicleDetailModel");

// Route imports
const userRoutes = require("./router/userRoutes");
const vehicleRoutes = require("./router/vehicleRoute");
const bookingRoutes = require("./router/bookingRoutes");
const reportRoutes = require("./router/reportsRoutes");
const notificationRoutes = require("./router/notificationRoutes");

// Utils
const errorHandlerMiddleware = require("./utils/errorHandlingMiddleware");
const UserModel = require("./model/userModel");

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// ✅ Configure CORS (must come first)
app.use(
  cors({
    origin: process.env.FRONTEND,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  })
);

// ✅ Core Middlewares
app.use(cookieParser());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true }));

// ✅ Socket.IO Setup (use same CORS settings)
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true,
  },
});
app.set("io", io);

// ✅ Static file serving (for uploaded files)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(errorHandlerMiddleware);

// ✅ API Routes
app.use(userRoutes);
app.use(vehicleRoutes);
app.use(bookingRoutes);
app.use("/report", reportRoutes);
app.use(notificationRoutes);

// ✅ Default base route
app.get("/", (req, res) => {
  res.send("Hello, RentalBike Backend 🚴");
});

// app.get("/api/health", async (req, res) => {
//   await mongoose.connect(process.env.MONGOURL);

//   const GROUP_COUNT = 5;
//   const VEHICLES_PER_GROUP = 1_000_000;
//   const BATCH_SIZE = 5000; // 🔥 safe size

//   for (let i = 0; i < GROUP_COUNT; i++) {
//     const groupId = 302112393070 + i + 1;

//     const vehicleGroup = {
//       name: `VehicleNew-${i + 1}`,
//       vehicleType: "Bike",
//       model: "2023",
//       bookingPrice: [
//         { range: 60, price: 600 + i * 60 },
//         { range: 120, price: 1200 + i * 100 },
//         { range: 300, price: 1200 + i * 800 },
//       ],
//       filePath: [
//         "https://res.cloudinary.com/dks5nbvzb/image/upload/v1766842009/vehicles/1766842008307-Honda%20XPulse.jpg",
//       ],
//       specificVehicleDetails: [],
//       uniqueGroupId: groupId,
//     };

//     for (let start = 0; start < VEHICLES_PER_GROUP; start += BATCH_SIZE) {
//       const batch = [];

//       for (let j = 0; j < BATCH_SIZE; j++) {
//         const index = start + j;
//         if (index >= VEHICLES_PER_GROUP) break;

//         batch.push({
//           location: "Bangalore",
//           vehicleStatus: true,
//           vehicleNumber: `KA03CD${groupId}${index}`,
//           vehicleMilage: 12,
//           bookedPeriods: [],
//           uniqueVehicleId: groupId * 1_000_000 + index,
//         });
//       }

//       // 🔥 Push batch and save
//       vehicleGroup.specificVehicleDetails.push(...batch);

//       // Save & clear memory every batch
//       await VehicleGroup.updateOne(
//         { uniqueGroupId: groupId },
//         { $push: { specificVehicleDetails: { $each: batch } } },
//         { upsert: true }
//       );
//     }

//     console.log(`✅ Group ${groupId} inserted`);
//   }

//   res.send("Seeding completed safely 🚀");
// });

// app.get("/api/seed-users", async (req, res) => {
//   try {
//     await mongoose.connect(process.env.MONGOURL);

//     const TOTAL_USERS = 100;   // change if needed
//     const BATCH_SIZE = 1;

//     for (let start = 0; start < TOTAL_USERS; start += BATCH_SIZE) {
//       const users = [];

//       for (let i = 0; i < BATCH_SIZE; i++) {
//         const index = start + i;
//         if (index >= TOTAL_USERS) break;

//         users.push({
//           name: `User-${index}`,
//           email: `user${index}@example.com`,
//           password:
//             "$2b$12$02/q7TfWghAuMVY7lrs2Tem4WZXZNTUDlmVYLNLfIROQmSpEzHDIC",
//           phoneNumber: `9${String(index).padStart(9, "0")}`,
//           altMobileNumber: `8${String(index).padStart(9, "0")}`,
//           drivingLicenceNumber: `DL${1000000 + index}`,
//           userType: "user",
//           currentLocation: "Bengaluru",
//           isVerified: false,
// isDLverify: index % 2 === 0,
//           bookingInfo: {
//             totalBooking: index % 20,
//             activeBooking: index % 3,
//             moneySpend: 1000 + index * 10,
//             cancelbooking: index % 5,
//           },
//           filePath:
//             "https://res.cloudinary.com/dks5nbvzb/image/upload/v1768144457/users/default.jpg",
//           drivingLicenceFilePath: [
//             "https://res.cloudinary.com/dks5nbvzb/image/upload/v1767360480/users/default-dl.jpg",
//           ],
//         });
//       }

//       // 🔥 Ordered:false skips duplicates instead of crashing
//       await UserModel.insertMany(users, { ordered: false });

//       console.log(`✅ Users inserted: ${start + users.length}`);
//     }

//     res.status(200).send("✅ User seeding completed successfully");
//   } catch (error) {
//     console.error(error);
//     res.status(500).send("❌ Error while seeding users");
//   }

// //   await UserModel.deleteMany({
// //   name: { $ne: "Rohit kumar" },
// // });

// });

// ✅ Global Error Handler
app.use(errorHandlerMiddleware);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
