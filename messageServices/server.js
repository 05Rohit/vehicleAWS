
require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const RabbitMQRoutes = require("./routes/rabbitMQRoutes");
const { notificationConsumer } = require("./controller/notificationConsumer");

const PORT = process.env.PORT || 8000;
const app = express();
app.use(express.json());
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // Replace with frontend URL in production
    methods: ["GET", "POST"],
  },
});

// Make io accessible in routes/controllers
app.set("io", io);

// ================================
// Routes
// ================================
app.use("/api", RabbitMQRoutes);

// Health Check
app.get("/", (req, res) => res.send("Message Broker Server is Running"));

// ================================
// Socket.IO Connection
// ================================
io.on("connection", (socket) => {
  // console.log("⚡ Client connected:", socket.id);

  // Register user rooms
  socket.on("register_user", (userId) => {
    socket.join(userId);
    // console.log(`User ${userId} joined rooms:`, Array.from(socket.rooms));
  });

  // Register admin room
  socket.on("register_admin", () => {
    socket.join("admin");
    // console.log("Admin joined rooms:", Array.from(socket.rooms));
  });

  // Disconnect event
  socket.on("disconnect", () => {
    // console.log("Client disconnected:", socket.id);
  });
});

// ================================
// RabbitMQ Consumers
// ================================
// Start consumer for user notifications
notificationConsumer("user", io);

// Start consumer for admin notifications
notificationConsumer("admin", io);

// ================================
// Test routes (optional)
// ================================
// app.get("/test-admin", (req, res) => {
//   io.to("admin").emit("new_notification", { message: "Hello Admin!" });
//   res.send("Admin notification sent");
// });

// app.get("/test-user", (req, res) => {
//   const testUserId = "68d7d01dcc92d950ec176450"; // replace with real userId
//   io.to(testUserId).emit("new_notification", { message: "Hello User!" });
//   res.send("User notification sent");
// });

// ================================
// Start Server
// ================================
server.listen(PORT, () => {
  // console.log(`🚀 Message Broker Server running on PORT ${PORT}`);
});
