// const {MongoClient,ObjectId}=reqiure("mongodb")
const vehicleModel = require("../model/vehicleDetailModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const User = require("../model/userModel");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Kolkata");
// const NotificationService = require("../NotificationServices/NotificationService");

const { sendMailToQueue } = require("../NotificationServices/MessageService");
const {
  sendNotification,
} = require("../utils/notificationThroughMessageBroker");

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

  const userId = req.user._id;
  const userType = req.user.userType;
  const emailId = req.user.email;
  const UserName = req.user.name;

  if (!userId) return next(new AppError("Login to add Vehicle", 400));

  if (userType !== "admin")
    return next(
      new AppError("Unauthorized access: admin privileges required.", 400)
    );
  if (!name || !vehicleType || !model || !vehicleNumber) {
    return next(new AppError("Fill all required data", 400));
  }

  const userDetails = await User.findById(userId);
  if (userDetails.userType !== "admin") {
    return next(new AppError("Unauthorized for this action", 400));
  }

  // 🔥 Handle booking price parsing
  let formattedBookingPrice = [];
  if (Array.isArray(bookingPrice)) {
    formattedBookingPrice = bookingPrice.map(({ range, price }) => ({
      range: Number(range),
      price: Number(price),
    }));
  } else if (typeof bookingPrice === "string") {
    try {
      formattedBookingPrice = JSON.parse(bookingPrice).map(
        ({ range, price }) => ({
          range: Number(range),
          price: Number(price),
        })
      );
    } catch (error) {
      return next(new AppError("Invalid bookingPrice format", 400));
    }
  }

  // 🔥 Check if vehicleNumber already exists
  const existingVehicleWithNumber = await vehicleModel.findOne({
    "specificVehicleDetails.vehicleNumber": vehicleNumber,
  });

  if (existingVehicleWithNumber) {
    return next(new AppError("Vehicle number must be unique", 400));
  }

  const files = req.files;

  // console.log("Files received:", files.originalname);

  let filePaths = files?.map((file) => `/uploads/${file.filename}`) || [];
    if (!files) {
    return next(new AppError("Select the Vehicle Image ", 400));
  }
  const createdTime = moment().toDate();

  try {
    const existingVehicle = await vehicleModel.findOne({
      $and: [{ name }, { model }],
    });

    if (existingVehicle) {
      // Append to existing
      existingVehicle.specificVehicleDetails.push({
        location,
        vehicleStatus,
        vehicleNumber,
        vehicleMilage,
        notAvailableReason,
        createdAt: createdTime,
        updatedAt: createdTime,
      });

      if (req.files) existingVehicle.filePath = filePaths;

      existingVehicle.createdBy = {
        name: userDetails.name,
        email: emailId,
        phoneNumber: userDetails.phoneNumber,
        createdTime,
      };
      await existingVehicle.save();

      await sendMailToQueue({
        subject: "New Vehicle Added",
        to: emailId,
        EXCHANGE: "emailExchange",
        ROUTING_KEY: "task.newvehicleadded",
        templateData: {
          userName: userDetails.name,
          vehicleName: name,
          created: createdTime.toLocaleDateString("en-IN"),
          price: formattedBookingPrice[0]?.price || 0,
          vehicleNumber:
            existingVehicle.specificVehicleDetails[0].vehicleNumber,
          vehicleId: existingVehicle._id.toString(),
          vehicleId: existingVehicle._id.toString(),
        },
      });

      return res.status(200).json("Vehicle added successfully");
    } else {
      // Create new vehicle
      const newVehicle = new vehicleModel({
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
        filePath: req.files ? filePaths : null,
        createdBy: {
          name: userDetails.name,
          email: emailId,
          phoneNumber: userDetails.phoneNumber,
          createdTime,
        },
      });

      await newVehicle.save();

      // ✅ Send Email Notification
      await sendMailToQueue({
        subject: "New Vehicle Added",
        to: emailId,
        EXCHANGE: "emailExchange",
        ROUTING_KEY: "task.newvehicleadded",
        templateData: {
          userName: userDetails.name,
          vehicleName: name,
          Created: createdTime.toLocaleDateString("en-IN"),
          price: formattedBookingPrice[0]?.price || 0,
          vehicleNumber: newVehicle.specificVehicleDetails[0].vehicleNumber,
          vehicleId: newVehicle._id.toString(),
        },
      });

      const message = `New Vehicle ${vehicleNumber} Added by ${UserName}  `;
      const type = "important";
      const title = "Vehicle Added to the System";
      const rolename = "admin";

      await sendNotification(userId, rolename, message, title, type);

      return res.status(201).json("Vehicle created successfully");
    }
  } catch (error) {
    return next(error);
  }
});

exports.getAllVehicleData = catchAsync(async (req, res, next) => {
  const vehicleData = await vehicleModel.find({});
  res
    .status(200)
    .json({ message: "All Vehicle Data", data: vehicleData });
});
exports.getVehicleDataByName = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  if (!name) {
    return next(new AppError("Fill the data properly", 400));
  }
  const vehicleData = await vehicleModel.findOne({ name: name });

  if (!vehicleData) {
    return next(new AppError("No vehicle found", 400));
  }

  res
    .status(200)
    .json({ message: "Vehicle deleted successfully", data: vehicleData });
});

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
    .json({ message: "Vehicle deleted successfully", data: vehicleData });
});
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
    .json({ message: "Vehicle deleted successfully", data: vehicleData });
});

// I have to verify all API's with postman and then I will remove the comments

exports.updateVehicle = catchAsync(async (req, res, next) => {
  const { uniqueId } = req.params;
  const userType = req.user.userType;

  if (userType !== "admin")
    return next(
      new AppError("Unauthorized access: admin privileges required.", 400)
    );

  if (!uniqueId) {
    return next(new AppError("Provide Unique Id", 400));
  }

  const {
    location,
    vehicleStatus,
    vehicleNumber,
    vehicleMilage,
    notAvailableReason,
  } = req.body;

  const userId = req.user._id;
  const emailId = req.user.email;
  const userName = req.user.name;
  if (!userId) {
    return next(new AppError("Login to update Vehicle", 400));
  }

  // Find the vehicle containing the specific vehicle
  const existingVehicle = await vehicleModel.findOne({
    "specificVehicleDetails.uniqueVehicleId": Number(uniqueId),
  });

  const createdTime = moment().toDate();

  if (!existingVehicle) {
    return next(new AppError("Vehicle not found", 400));
  }
  // Store old data for comparison
  const oldVehicleDetails = existingVehicle.specificVehicleDetails.find(
    (v) => v.uniqueVehicleId === Number(uniqueId)
  );

  // Update the specific vehicle inside the array
  const updatedVehicle = await vehicleModel.findOneAndUpdate(
    { "specificVehicleDetails.uniqueVehicleId": Number(uniqueId) },
    {
      $set: {
        "specificVehicleDetails.$.vehicleStatus": vehicleStatus,
        "specificVehicleDetails.$.vehicleMilage": vehicleMilage,
        "specificVehicleDetails.$.notAvailableReason": notAvailableReason,
        "specificVehicleDetails.$.location": location,
        "specificVehicleDetails.$.vehicleNumber": vehicleNumber,
        // "specificVehicleDetails.$.bookingPrice": formattedBookingPrice,
        "specificVehicleDetails.$.updatedAt": new Date(),
      },
    },
    { new: true, runValidators: true }
  );

  if (!updatedVehicle) {
    return next(new AppError("Error updating vehicle", 400));
  }

  // --- 🔍 Compare old and new vehicle details ---
  const newVehicleDetails = updatedVehicle.specificVehicleDetails.find(
    (v) => v.uniqueVehicleId === Number(uniqueId)
  );

  let changedFields = [];

  if (oldVehicleDetails && newVehicleDetails) {
    const oldData = oldVehicleDetails.toObject
      ? oldVehicleDetails.toObject()
      : oldVehicleDetails;
    const newData = newVehicleDetails.toObject
      ? newVehicleDetails.toObject()
      : newVehicleDetails;

    for (const key in newData) {
      if (
        oldData[key] !== undefined &&
        JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])
      ) {
        changedFields.push(key);
      }
    }
  }

  const changedText =
    changedFields.length > 0
      ? `Updated fields: ${changedFields.join(", ")}.`
      : "No major changes detected.";

  // --- 📧 Send Email ---
  await sendMailToQueue({
    subject: "Vehicle Details Updated",
    to: emailId,
    EXCHANGE: "emailExchange",
    ROUTING_KEY: "task.vehicleUpdated",
    templateData: {
      userName: userName,
      vehicleName: existingVehicle.name,
      updated: createdTime.toLocaleDateString("en-IN"),
      // price: formattedBookingPrice[0]?.price || 0,
      vehicleNumber: newVehicleDetails?.vehicleNumber,
      vehicleId: existingVehicle._id.toString(),
      changedText: changedText,
    },
  });

  // --- 🔔 Send App Notification ---
  const message = `${userName} updated details of vehicle ${existingVehicle.name}. ${changedText}`;
  const title = "Vehicle Details Updated";
  const type = "update";
  await sendNotification(userId, "admin", message, title, type);

  // --- ✅ Response ---
  res.status(200).json({
    message: "Vehicle updated successfully",
    data: updatedVehicle,
    changedFields,
  });
});

exports.deleteVehicle = catchAsync(async (req, res, next) => {
  const { uniqueId } = req.params;
  const userId = req.user._id;
  const emailId = req.user.email;
  const userName = req.user.name;
  const userType = req.user.userType;

  if (userType !== "admin")
    return next(
      new AppError("Unauthorized access: admin privileges required.", 400)
    );

  if (!userId) return next(new AppError("Login to delete Vehicle", 400));
  if (!uniqueId)
    return next(new AppError("Unique Vehicle ID is required", 400));

  // Find vehicle that contains the specific vehicle ID
  const existingVehicle = await vehicleModel.findOne({
    "specificVehicleDetails.uniqueVehicleId": uniqueId,
  });

  if (!existingVehicle) return next(new AppError("Vehicle not found", 400));

  // Extract the deleted vehicle details before deleting
  const deletedVehicleDetails = existingVehicle.specificVehicleDetails.find(
    (v) => String(v.uniqueVehicleId) === String(uniqueId)
  );

  if (!deletedVehicleDetails)
    return next(new AppError("Specific vehicle not found", 400));


  // Remove the specific vehicle entry from the array
  const updatedVehicle = await vehicleModel.findOneAndUpdate(
    { _id: existingVehicle._id },
    { $pull: { specificVehicleDetails: { uniqueVehicleId: uniqueId } } },
    { new: true }
  );

  // If no vehicles left, delete whole document
  if (!updatedVehicle || updatedVehicle.specificVehicleDetails.length === 0) {
    await vehicleModel.findByIdAndDelete(existingVehicle._id);
    return res.status(200).json({
      message: "Vehicle document deleted as no specific vehicles remain",
    });
  }

  // Send Email Notification
  const createdTime = new Date();
  await sendMailToQueue({
    subject: "Vehicle Deleted",
    to: emailId,
    EXCHANGE: "emailExchange",
    ROUTING_KEY: "task.vehicleDeleted",
    templateData: {
      userName,
      vehicleName: existingVehicle.name,
      updated: createdTime.toLocaleDateString("en-IN"),
      price: existingVehicle.bookingPrice?.[0]?.price || 0,
      vehicleNumber: deletedVehicleDetails.vehicleNumber || "",
      vehicleId: existingVehicle._id.toString(),
    },
  });

  // Send App Notification
  const message = `${userName} has removed vehicle ${deletedVehicleDetails.vehicleNumber} from the system.`;
  const type = "admin";
  const title = "Vehicle Successfully Deleted";
  await sendNotification(userId, "admin", message, title, type);

  res.status(200).json({
    message: "Specific vehicle deleted successfully",
    deletedVehicleDetails,
  });
});

exports.updateVehicleGroupDetails = catchAsync(async (req, res, next) => {
  const { groupId } = req.params;

  if (!groupId) {
    return next(new AppError("Provide groupId", 400));
  }

  const { bookingPrice, name, model, vehicleType } = req.body;
  const userId = req.user._id;
  const userName = req.user.name;
  const userType = req.user.userType;

  if (userType !== "admin")
    return next(
      new AppError("Unauthorized access: admin privileges required.", 400)
    );
  if (!userId) {
    return next(new AppError("Login to update Vehicle", 400));
  }

  const existingVehicle = await vehicleModel.findOne({
    uniqueGroupId: groupId,
  });

  if (!existingVehicle) {
    return next(new AppError("Vehicle not found", 400));
  }

  // Format bookingPrice
  let formattedBookingPrice = [];
  if (Array.isArray(bookingPrice)) {
    formattedBookingPrice = bookingPrice.map(({ range, price }) => ({
      range: Number(range),
      price: Number(price),
    }));
  } else if (typeof bookingPrice === "string") {
    try {
      formattedBookingPrice = JSON.parse(bookingPrice).map(
        ({ range, price }) => ({
          range: Number(range),
          price: Number(price),
        })
      );
    } catch (error) {
      return next(new AppError("Invalid bookingPrice format", 400));
    }
  }

  // Construct update object only with provided fields
  const updateFields = { updatedAt: new Date() };

  if (formattedBookingPrice.length > 0)
    updateFields.bookingPrice = formattedBookingPrice;
  if (name) updateFields.name = name;
  if (model) updateFields.model = model;
  if (vehicleType) updateFields.vehicleType = vehicleType;

  const updatedVehicle = await vehicleModel.findOneAndUpdate(
    { uniqueGroupId: groupId },
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  if (!updatedVehicle) {
    return next(new AppError("Error updating vehicle", 400));
  }

  const message = `${userName} has updated the information for vehicle ${existingVehicle.name}.`;
  const type = "admin";
  const title = "Vehicle Group Information Updated";

  await sendNotification(userId, "admin", message, title, type);

  res.status(200).json({
    message: "Vehicle updated successfully",
    data: updatedVehicle,
  });
});
