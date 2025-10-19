const newNotificationSchema = require("../model/notificationNodel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");

const { MongoClient } = require("mongodb");
const client = new MongoClient("mongodb://localhost:27017/");
const dbName = "rentalBikeWebsite";
const notificationCollectionName = "newnotifications";

exports.createNotification = catchAsync(async (req, res, next) => {
  const { notificationId, userId, rolename, message, title, type } = req.body;

  if (!userId || !message || !title || !rolename || !notificationId || !type) {
    return next(new AppError("Please provide all required fields.", 400));
  }
  const newNotification = await newNotificationSchema.create({
    userId,
    notificationId,
    rolename,
    message,
    title,
    type,

  });


  logger.info(`Notification created for user ${userId}`);
  res.status(201).json({
    status: "success",
    data: newNotification,
  });
});

exports.getNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  if (!userId) {
    return next(new AppError("Login is required", 400));
  }

  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(notificationCollectionName);

  const notifications = await collection
    .find({ userId })
    .sort({ isRead: 1, createdAt: -1 }) // 🔁 sort: unread first, then newest
    .toArray();

  if (notifications.length === 0) {
    return res.status(404).json({ message: "No notifications found" });
  }
  const count = notifications.filter((n) => !n.isRead).length;
  res.status(200).json({
    status: "success",
    data: notifications,
    count: count,
  });
});

exports.handleReadNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { notificationId, isRead } = req.body;
  if (!notificationId) {
    return next(new AppError("Notification ID is required", 400));
  }

  if (!userId) {
    return next(new AppError("Login is required", 400));
  }

  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(notificationCollectionName);

  const updatedNotification = await collection.findOneAndUpdate(
    {
      notificationId,
      userId,
    },
    {
      $set: {
        isRead: isRead, // Default to true if not provided
      },
    }
  );

  if (!updatedNotification) {
    return res.status(404).json({ message: "Notification not found" });
  }

  res.status(200).json({
    status: "success",
  });
});

exports.handleReadAllNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const { isRead } = req.body;

  if (!userId) {
    return next(new AppError("Login is required", 400));
  }

  await client.connect();
  const db = client.db(dbName);
  const collection = db.collection(notificationCollectionName);

  const result = await collection.updateMany(
    { userId },
    {
      $set: {
        isRead: isRead === undefined ? true : isRead,
      },
    }
  );

  if (result.modifiedCount === 0) {
    return res.status(404).json({ message: "No notifications were updated" });
  }

  res.status(200).json({
    status: "success",
    message: `${result.modifiedCount} notifications marked as read.`,
  });
});
