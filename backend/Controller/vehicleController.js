// const {MongoClient,ObjectId}=reqiure("mongodb")
const vehicleModel = require("../model/vehicleDetailModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../model/userModel");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Kolkata");
// const NotificationService = require("../NotificationServices/NotificationService");
const { createAuditLog } = require("../utils/createAuditLog");
const AUDIT_ACTIONS = require("../config/auditActions");
const runTransaction = require("../model/runTransaction");

const { sendMailToQueue } = require("../NotificationServices/MessageService");
const {
  sendNotification,
} = require("../utils/notificationThroughMessageBroker");
// const logger = require("../utils/logger");
const redisClient = require("../config/redisClient");

// 🟢 Add Vehicle Details
exports.addVehicleDetails = catchAsync(async (req, res, next) => {
  const {
    name,
    description,
    vehicleType,
    model,
    vehicleNumber,
    location,
    vehicleStatus,
    vehicleMilage,
    notAvailableReason,
    bookingPrice,
  } = req.body;

  const { id: userId, userType, email, name: userName } = req.user;

  if (!userId) return next(new AppError("Login to add Vehicle", 401));
  if (userType !== "admin")
    return next(new AppError("Admin access required", 403));

  if (!name || !vehicleType || !model || !vehicleNumber) {
    return next(new AppError("Fill all required data", 400));
  }

  /* =======================
     FORMAT BOOKING PRICE
  ======================== */
  let formattedBookingPrice = [];
  try {
    formattedBookingPrice = Array.isArray(bookingPrice)
      ? bookingPrice.map(({ range, price }) => ({
          range: Number(range),
          price: Number(price),
        }))
      : JSON.parse(bookingPrice).map(({ range, price }) => ({
          range: Number(range),
          price: Number(price),
        }));
  } catch {
    return next(new AppError("Invalid bookingPrice format", 400));
  }

  const files = req.files;
  const filePaths = files?.map((f) => f.path) || [];
  if (!filePaths.length)
    return next(new AppError("Select the Vehicle Image", 400));

  const createdTime = moment().toDate();

  /* =======================
     TRANSACTION START
  ======================== */
  const result = await runTransaction(async (session) => {
    // 🔴 Unique vehicle number check
    const vehicleExists = await vehicleModel.findOne(
      { "specificVehicleDetails.vehicleNumber": vehicleNumber },
      null,
      { session },
    );

    if (vehicleExists) {
      throw new AppError("Vehicle number must be unique", 400);
    }

    const existingVehicle = await vehicleModel.findOne({ name, model }, null, {
      session,
    });

    let vehicleDoc;
    let auditAction;

    if (existingVehicle) {
      /* =======================
         APPEND VEHICLE DETAILS
      ======================== */
      existingVehicle.specificVehicleDetails.push({
        location,
        vehicleStatus,
        vehicleNumber,
        vehicleMilage,
        notAvailableReason,
        createdAt: createdTime,
        updatedAt: createdTime,
      });

      existingVehicle.filePath = filePaths;
      await existingVehicle.save({ session });

      vehicleDoc = existingVehicle;
      auditAction = AUDIT_ACTIONS.UPDATE_VEHICLE;
    } else {
      /* =======================
         CREATE NEW VEHICLE
      ======================== */
      const createdVehicle = await vehicleModel.create(
        [
          {
            name,
            description,
            vehicleType,
            model,
            bookingPrice: formattedBookingPrice,
            specificVehicleDetails: [
              {
                location,
                vehicleStatus,
                vehicleNumber,
                vehicleMilage,
                notAvailableReason,
                bookingPrice: formattedBookingPrice,
                createdAt: createdTime,
                updatedAt: createdTime,
              },
            ],
            filePath: filePaths,
            createdBy: {
              name: userName,
              email,
              createdTime,
            },
          },
        ],
        { session },
      );

      vehicleDoc = createdVehicle[0];
      auditAction = AUDIT_ACTIONS.ADD_VEHICLE;
    }

    /* =======================
       AUDIT LOG (TX SAFE)
    ======================== */
    await createAuditLog({
      action: auditAction,
      entityType: "VEHICLE",
      entityId: vehicleDoc._id.toString(),
      performedBy: {
        userId,
        userType,
        email,
      },
      newValue: vehicleDoc,
      req,
      session,
    });

    return vehicleDoc;
  });

  // Invalidate Redis Cache , so that new Data push in Redis
  await redisClient.del("vehicles:all");

  /* =======================
     POST-TX ACTIONS
  ======================== */
  await sendMailToQueue({
    subject: "New Vehicle Added",
    to: email,
    EXCHANGE: "emailExchange",
    ROUTING_KEY: "task.newvehicleadded",
    templateData: {
      userName,
      vehicleName: name,
      created: createdTime.toLocaleDateString("en-IN"),
      price: formattedBookingPrice[0]?.price || 0,
      vehicleNumber,
      vehicleId: result._id.toString(),
    },
  });

  await sendNotification(
    userId,
    "admin",
    `New Vehicle ${vehicleNumber} added by ${userName}`,
    "Vehicle Added",
    "important",
  );

  res.status(201).json({
    message: "Vehicle added successfully",
    data: result,
  });
});

// 🟢 Get All Vehicle Data
// exports.getAllVehicleData = catchAsync(async (req, res, next) => {
//   const vehicleData = await vehicleModel.find({});
//   res.status(200).json({ message: "All Vehicle Data", data: vehicleData });
// });

exports.getAllVehicleData = catchAsync(async (req, res, next) => {
  const CACHE_KEY = "vehicles:all";

  // 🔹 1. Check Redis
  const cachedVehicleData = await redisClient.get(CACHE_KEY);

  if (cachedVehicleData) {
    return res.status(200).json({
      message: "All Vehicle Data (from cache)",
      source: "redis",
      data: JSON.parse(cachedVehicleData),
    });
  }

  // 🔹 2. Fetch from DB
  const vehicleData = await vehicleModel.find({});

  // 🔹 3. Store in Redis (TTL = 10 minutes)
  await redisClient.setEx(
    CACHE_KEY,
    600, // seconds
    JSON.stringify(vehicleData),
  );

  res.status(200).json({
    message: "All Vehicle Data (from DB)",
    source: "db",
    data: vehicleData,
  });
});

// 🟢 Get Vehicle Data by Name it help when admin search
exports.getVehicleDataByName = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(new AppError("Fill the data properly", 400));
  }
  const vehicleData = await vehicleModel.findOne({ name: name });

  if (!vehicleData) {
    return next(new AppError("No vehicle found", 400));
  }

  res.status(200).json({ message: "Vehicle successfully", data: vehicleData });
});

// 🟢 Get Vehicle Data by Model it help when user search
exports.getVehicleDataByModel = catchAsync(async (req, res, next) => {
  const { model } = req.body;

  if (!model) {
    return next(new AppError("Fill data properly", 400));
  }
  const vehicleData = await vehicleModel.find({ model: model });

  if (!vehicleData) {
    return next(new AppError("Vehicle not found ", 400));
  }

  res
    .status(200)
    .json({ message: "Vehicle data successfully", data: vehicleData });
});
// 🟢 Get Vehicle Data by Vehicle Type it help when user search
exports.getVehicleDataByVehicleType = catchAsync(async (req, res, next) => {
  const { vehicleType } = req.body;

  if (!vehicleType) {
    return next(new AppError("Fill data properly", 400));
  }
  const vehicleData = await vehicleModel.find({ vehicleType: vehicleType });

  if (!vehicleData) {
    return next(new AppError("Fill data properly", 400));
  }

  res
    .status(200)
    .json({ message: "Vehicle data successfully", data: vehicleData });
});

// 🟢 Update Vehicle Details (Particular Vehicle Details )

exports.updateVehicle = catchAsync(async (req, res, next) => {
  const { uniqueId } = req.params;
  const { id: userId, userType, email, name: userName } = req.user;

  if (!uniqueId) return next(new AppError("Provide Unique Id", 400));

  const {
    location,
    vehicleStatus,
    vehicleNumber,
    vehicleMilage,
    notAvailableReason,
  } = req.body;

  const createdTime = moment().toDate();

  /* =======================
     TRANSACTION START
  ======================== */
  const result = await runTransaction(async (session) => {
    /* =======================
       FIND VEHICLE
    ======================== */
    const existingVehicle = await vehicleModel.findOne(
      { "specificVehicleDetails.uniqueVehicleId": Number(uniqueId) },
      null,
      { session },
    );

    if (!existingVehicle) throw new AppError("Vehicle not found", 404);

    const oldVehicleDetails = existingVehicle.specificVehicleDetails.find(
      (v) => v.uniqueVehicleId === Number(uniqueId),
    );

    if (!oldVehicleDetails)
      throw new AppError("Vehicle details not found", 404);

    const oldData = oldVehicleDetails.toObject();

    /* =======================
       UPDATE VEHICLE
    ======================== */
    const updatedVehicle = await vehicleModel.findOneAndUpdate(
      { "specificVehicleDetails.uniqueVehicleId": Number(uniqueId) },
      {
        $set: {
          "specificVehicleDetails.$.vehicleStatus": vehicleStatus,
          "specificVehicleDetails.$.vehicleMilage": vehicleMilage,
          "specificVehicleDetails.$.notAvailableReason": notAvailableReason,
          "specificVehicleDetails.$.location": location,
          "specificVehicleDetails.$.vehicleNumber": vehicleNumber,
          "specificVehicleDetails.$.updatedAt": new Date(),
        },
      },
      { new: true, runValidators: true, session },
    );

    if (!updatedVehicle) throw new AppError("Error updating vehicle", 400);

    const newVehicleDetails = updatedVehicle.specificVehicleDetails.find(
      (v) => v.uniqueVehicleId === Number(uniqueId),
    );

    const newData = newVehicleDetails.toObject();

    /* =======================
       DIFF CALCULATION
    ======================== */
    const changedFields = [];
    const oldDiff = {};
    const newDiff = {};

    for (const key in newData) {
      if (
        oldData[key] !== undefined &&
        JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])
      ) {
        changedFields.push(key);
        oldDiff[key] = oldData[key];
        newDiff[key] = newData[key];
      }
    }

    // Invalidate Redis Cache , so that new Data push in Redis
    await redisClient.del("vehicles:all");

    /* =======================
       AUDIT LOG (TX SAFE)
    ======================== */
    await createAuditLog({
      action: AUDIT_ACTIONS.UPDATE_VEHICLE,
      entityType: "VEHICLE",
      entityId: updatedVehicle._id.toString(),
      performedBy: {
        userId,
        userType,
        email,
      },
      oldValue: oldDiff,
      newValue: newDiff,
      req,
      session,
    });

    return {
      updatedVehicle,
      changedFields,
      vehicleName: existingVehicle.name,
    };
  });

  /* =======================
     POST-TRANSACTION ACTIONS
  ======================== */
  const changedText =
    result.changedFields.length > 0
      ? `Updated fields: ${result.changedFields.join(", ")}.`
      : "No major changes detected.";

  // 📧 Email
  await sendMailToQueue({
    subject: "Vehicle Details Updated",
    to: email,
    EXCHANGE: "emailExchange",
    ROUTING_KEY: "task.vehicleUpdated",
    templateData: {
      userName,
      vehicleName: result.vehicleName,
      updated: createdTime.toLocaleDateString("en-IN"),
      changedText,
    },
  });

  // 🔔 Notification
  await sendNotification(
    userId,
    "admin",
    `${userName} updated vehicle details. ${changedText}`,
    "Vehicle Updated",
    "update",
  );

  /* =======================
     ✅ RESPONSE
  ======================== */
  res.status(200).json({
    message: "Vehicle updated successfully",
    data: result.updatedVehicle,
    changedFields: result.changedFields,
  });
});

// 🟢 Delete Vehicle (Particular Vehicle Details ) . If after delete, vehicle group length become 0 then delete we delete the group Also
// exports.deleteVehicle = catchAsync(async (req, res, next) => {
//   const { uniqueId } = req.params;
//   const userId = req.user.id;
//   const emailId = req.user.email;
//   const userName = req.user.name;
//   const userType = req.user.userType;

//   if (!userId) return next(new AppError("Login to delete Vehicle", 401));
//   if (!uniqueId)
//     return next(new AppError("Unique Vehicle ID is required", 400));

//   const result = await runTransaction(async (session) => {
//     // Find vehicle that contains the specific vehicle ID
//     const existingVehicle = await vehicleModel.findOne(
//       {
//         "specificVehicleDetails.uniqueVehicleId": uniqueId,
//       },
//       null,
//       { session }
//     );

//     if (!existingVehicle) return next(new AppError("Vehicle not found", 404));

//     // Extract the deleted vehicle details before deleting
//     const deletedVehicleDetails = existingVehicle.specificVehicleDetails.find(
//       (v) => String(v.uniqueVehicleId) === String(uniqueId)
//     );

//     if (!deletedVehicleDetails)
//       return next(new AppError("Specific vehicle not found", 404));

//     const deletedSnapshot = deletedVehicleDetails.toObject();

//     // Remove the specific vehicle entry from the array
//     const updatedVehicle = await vehicleModel.findOneAndUpdate(
//       { _id: existingVehicle._id },
//       { $pull: { specificVehicleDetails: { uniqueVehicleId: uniqueId } } },
//       { new: true, session }
//     );

//     let documentDeleted = false;

//     // If no vehicles left, delete whole document
//     if (!updatedVehicle || updatedVehicle.specificVehicleDetails.length === 0) {
//       await vehicleModel.findByIdAndDelete(existingVehicle._id, { session });
//       documentDeleted = true;
//       return res.status(200).json({
//         message: "Vehicle document deleted as no specific vehicles remain",
//       });
//     }

//     //     /* =======================
//     //        AUDIT LOG (TX SAFE)
//     //     ======================== */
//     await createAuditLog({
//       action: AUDIT_ACTIONS. DELETE_VEHICLE,
//       entityType: "VEHICLE_DELETE",
//       entityId: result.existingVehicle._id.toString(),
//       performedBy: {
//         userId,
//         userType,
//         email: emailId,
//       },
//       oldValue: {
//         deletedVehicle: deletedSnapshot,
//         documentDeleted,
//       },
//       newValue: null,
//       req,
//       session,
//     });
//   });

//   // Send Email Notification
//   const createdTime = new Date();
//   await sendMailToQueue({
//     subject: "Vehicle Deleted",
//     to: emailId,
//     EXCHANGE: "emailExchange",
//     ROUTING_KEY: "task.vehicleDeleted",
//     templateData: {
//       userName,
//       vehicleName: result.existingVehicle.name,
//       updated: createdTime.toLocaleDateString("en-IN"),
//       price: result.existingVehicle.bookingPrice?.[0]?.price || 0,
//       vehicleNumber: result.deletedVehicleDetails.vehicleNumber || "",
//       vehicleId: result.existingVehicle._id.toString(),
//     },
//   });

//   // Send App Notification
//   const message = `${userName} has removed vehicle ${result.deletedVehicleDetails.vehicleNumber} from the system.`;
//   const type = "admin";
//   const title = "Vehicle Successfully Deleted";
//   await sendNotification(userId, "admin", message, title, type);

//   res.status(200).json({
//     message: result.documentDeleted
//       ? "Vehicle document deleted successfully"
//       : "Specific vehicle deleted successfully",
//     deletedVehicleDetails: result.deletedVehicleDetails,
//   });
// });
exports.deleteVehicle = catchAsync(async (req, res, next) => {
  const { uniqueId } = req.params;
  const userId = req.user.id;
  const emailId = req.user.email;
  const userName = req.user.name;
  const userType = req.user.userType;

  if (!userId) return next(new AppError("Login to delete Vehicle", 401));
  if (!uniqueId)
    return next(new AppError("Unique Vehicle ID is required", 400));

  const result = await runTransaction(async (session) => {
    const existingVehicle = await vehicleModel.findOne(
      { "specificVehicleDetails.uniqueVehicleId": uniqueId },
      null,
      { session },
    );

    if (!existingVehicle) throw new AppError("Vehicle not found", 404);

    const deletedVehicleDetails = existingVehicle.specificVehicleDetails.find(
      (v) => String(v.uniqueVehicleId) === String(uniqueId),
    );

    if (!deletedVehicleDetails)
      throw new AppError("Specific vehicle not found", 404);

    const deletedSnapshot = deletedVehicleDetails.toObject();

    const updatedVehicle = await vehicleModel.findOneAndUpdate(
      { _id: existingVehicle._id },
      { $pull: { specificVehicleDetails: { uniqueVehicleId: uniqueId } } },
      { new: true, session },
    );

    let documentDeleted = false;

    if (!updatedVehicle || updatedVehicle.specificVehicleDetails.length === 0) {
      await vehicleModel.findByIdAndDelete(existingVehicle._id, { session });
      documentDeleted = true;
    }

    // Invalidate Redis Cache , so that new Data push in Redis
    await redisClient.del("vehicles:all");

    /* =======================
       AUDIT LOG (TX SAFE)
    ======================== */
    await createAuditLog({
      action: AUDIT_ACTIONS.DELETE_VEHICLE,
      entityType: "VEHICLE",
      entityId: existingVehicle._id.toString(),
      performedBy: {
        userId,
        userType,
        email: emailId,
      },
      oldValue: {
        deletedVehicle: deletedSnapshot,
        documentDeleted,
      },
      newValue: null,
      req,
      session,
    });

    return {
      existingVehicle,
      deletedVehicleDetails: deletedSnapshot,
      documentDeleted,
    };
  });

  /* =======================
     EMAIL NOTIFICATION
  ======================== */
  const createdTime = new Date();

  await sendMailToQueue({
    subject: "Vehicle Deleted",
    to: emailId,
    EXCHANGE: "emailExchange",
    ROUTING_KEY: "task.vehicleDeleted",
    templateData: {
      userName,
      vehicleName: result.existingVehicle.name,
      updated: createdTime.toLocaleDateString("en-IN"),
      price: result.existingVehicle.bookingPrice?.[0]?.price || 0,
      vehicleNumber: result.deletedVehicleDetails.vehicleNumber || "",
      vehicleId: result.existingVehicle._id.toString(),
    },
  });

  /* =======================
     APP NOTIFICATION
  ======================== */
  const message = `${userName} has removed vehicle ${result.deletedVehicleDetails.vehicleNumber} from the system.`;

  await sendNotification(
    userId,
    "admin",
    message,
    "Vehicle Successfully Deleted",
    "important",
  );

  /* =======================
     FINAL RESPONSE (ONCE)
  ======================== */
  res.status(200).json({
    message: result.documentDeleted
      ? "Vehicle document deleted successfully"
      : "Specific vehicle deleted successfully",
    deletedVehicleDetails: result.deletedVehicleDetails,
  });
});

// 🟢 Update Vehicle Group Details

exports.updateVehicleGroupDetails = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;
  const { id: userId, name: userName, userType, email } = req.user;

  if (!groupId) return next(new AppError("Provide groupId", 400));

  if (userType !== "admin")
    return next(new AppError("Admin privileges required", 403));

  if (!userId) return next(new AppError("Login to update vehicle", 401));

  const { bookingPrice, name, model, vehicleType } = req.body;

  /* =======================
     FORMAT BOOKING PRICE
  ======================== */
  let formattedBookingPrice = [];
  try {
    if (bookingPrice) {
      formattedBookingPrice = Array.isArray(bookingPrice)
        ? bookingPrice.map(({ range, price }) => ({
            range: Number(range),
            price: Number(price),
          }))
        : JSON.parse(bookingPrice).map(({ range, price }) => ({
            range: Number(range),
            price: Number(price),
          }));
    }
  } catch {
    return next(new AppError("Invalid bookingPrice format", 400));
  }

  /* =======================
     TRANSACTION START
  ======================== */
  const result = await runTransaction(async (session) => {
    // 🔍 Find existing vehicle group
    const existingVehicle = await vehicleModel.findOne(
      { uniqueGroupId: groupId },
      null,
      { session },
    );

    if (!existingVehicle) throw new AppError("Vehicle not found", 404);

    const oldData = existingVehicle.toObject();

    /* =======================
       BUILD UPDATE OBJECT
    ======================== */
    const updateFields = { updatedAt: new Date() };

    if (formattedBookingPrice.length > 0)
      updateFields.bookingPrice = formattedBookingPrice;
    if (name) updateFields.name = name;
    if (model) updateFields.model = model;
    if (vehicleType) updateFields.vehicleType = vehicleType;

    /* =======================
       UPDATE VEHICLE GROUP
    ======================== */
    const updatedVehicle = await vehicleModel.findOneAndUpdate(
      { uniqueGroupId: groupId },
      { $set: updateFields },
      { new: true, runValidators: true, session },
    );

    if (!updatedVehicle) throw new AppError("Error updating vehicle", 400);

    const newData = updatedVehicle.toObject();

    /* =======================
       DIFF CALCULATION
    ======================== */
    const changedFields = [];
    const oldDiff = {};
    const newDiff = {};

    for (const key of Object.keys(updateFields)) {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changedFields.push(key);
        oldDiff[key] = oldData[key];
        newDiff[key] = newData[key];
      }
    }

    /* =======================
       AUDIT LOG (TX SAFE)
    ======================== */
    await createAuditLog({
      action: AUDIT_ACTIONS.UPDATE_VEHICLE_GROUP,
      entityType: "VEHICLE",
      entityId: updatedVehicle._id.toString(),
      performedBy: {
        userId,
        userType,
        email,
      },
      oldValue: oldDiff,
      newValue: newDiff,
      req,
      session,
    });

    return {
      updatedVehicle,
      changedFields,
      vehicleName: existingVehicle.name,
    };
  });

  /* =======================
     POST-TRANSACTION ACTIONS
  ======================== */
  const changedText =
    result.changedFields.length > 0
      ? `Updated fields: ${result.changedFields.join(", ")}.`
      : "No major changes detected.";

  // 🔔 Notification
  await sendNotification(
    userId,
    "admin",
    `${userName} updated vehicle group details. ${changedText}`,
    "Vehicle Group Updated",
    "admin",
  );

  /* =======================
     ✅ RESPONSE
  ======================== */
  res.status(200).json({
    message: "Vehicle group updated successfully",
    data: result.updatedVehicle,
    changedFields: result.changedFields,
  });
});

exports.verifyNotification = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const emailId = req.user.email;
  const userName = req.user.name;
  const userType = req.user.userType;
  const message = `${userName} has removed vehicle from the system.`;
  const type = "admin";
  const title = "Vehicle Successfully Deleted";
  await sendNotification(userId, "admin", message, title, type);

  res.status(200).json({
    message: "Vehicle updated successfully",
  });
});
