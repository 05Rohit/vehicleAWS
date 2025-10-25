require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const path = require('path');


// DB Connection
require("./DatabaseConnection/dataBaseConnection");

// Route imports
const userRoutes = require("./router/userRoutes");
const vehicleRoutes = require("./router/vehicleRoute");
const bookingRoutes = require("./router/bookingRoutes");

// Utils
const errorHandlerMiddleware = require("./utils/errorHandlingMiddleware");

// Create Express app and HTTP server
const app = express();
const server = http.createServer(app);

// ✅ Configure CORS (must come first)
app.use(
  cors({
    origin: process.env.FRONTEND,      
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS","PATCH"],
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
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ API Routes
app.use(userRoutes);
app.use(vehicleRoutes);
app.use(bookingRoutes);
app.use(require("./router/notificationRoutes"));

// ✅ Default base route
app.get("/", (req, res) => {
  res.send("Hello, RentalBike Backend 🚴");
});

// ✅ Global Error Handler
app.use(errorHandlerMiddleware);

// ✅ Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
