const mongoose = require("mongoose");
const newNotificationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  type: { type: String, required: true, default: "general" },
  notificationId: { type: String, required: true, default: "general" },
  rolename: { type: String, required: true },
  message: { type: String, required: true },
  title: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
module.exports = mongoose.model("NewNotification", newNotificationSchema);