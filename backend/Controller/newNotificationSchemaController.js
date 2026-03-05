const Notification = require("../model/notificationNodel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");

// 🟢 Create Notification for events
exports.createNotification = catchAsync(async (req, res, next) => {
  const { notificationId, userId, rolename, message, title, type } = req.body;

  if (!userId || !message || !title || !rolename || !notificationId || !type) {
    return next(new AppError("Please provide all required fields.", 400));
  }

  const newNotification = await Notification.create({
    userId,
    notificationId,
    rolename,
    message,
    title,
    type,
  });

  // logger.info(`Notification created for user ${userId}`);

  res.status(201).json({
    status: "success",
    data: newNotification,
  });
});

// 🟢 Get Notifications for a user
exports.getNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user?.id;
  // logger.info(`Fetching notifications for user ID: ${userId}`);

  if (!userId) {
    return next(new AppError("Login is required", 400));
  }

  const notifications = await Notification.find({ userId })
    .sort({ isRead: 1, createdAt: -1 })
    .lean();

  if (!notifications || notifications.length === 0) {
    return res.status(200).json({
      status: "success",
      data: [],
      count: 0,
      message: "No notifications found.",
    });
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  res.status(200).json({
    status: "success",
    data: notifications,
    count: unreadCount,
  });
});

// 🟢 Mark a single notification as read/unread
exports.handleReadNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user?.id;
  const { notificationId, isRead = true } = req.body;

  if (!notificationId) {
    return next(new AppError("Notification ID is required", 400));
  }

  if (!userId) {
    return next(new AppError("Login is required", 400));
  }

  const updatedNotification = await Notification.findOneAndUpdate(
    { notificationId, userId },
    { $set: { isRead } },
    { new: true }
  );

  if (!updatedNotification) {
    return next(new AppError("Notification not found", 404));
  }

  res.status(200).json({
    status: "success",
    message: `Notification marked as ${isRead ? "read" : "unread"}.`,
  });
});

// 🟢 Mark all notifications as read/unread
exports.handleReadAllNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user?.id;
  const { isRead = true } = req.body;

  if (!userId) {
    return next(new AppError("Login is required", 400));
  }

  const result = await Notification.updateMany(
    { userId },
    { $set: { isRead } }
  );

  res.status(200).json({
    status: "success",
    message: `${result.modifiedCount} notifications marked as ${
      isRead ? "read" : "unread"
    }.`,
  });
});
