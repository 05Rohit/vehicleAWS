const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const vehicleBookingModel = require("../model/vehicleBookingModel");
// const { ObjectId } = require("mongodb");
// // const { MongoClient, ObjectId } = require("mongodb");
const vehicleModel = require("../model/vehicleDetailModel");
const userModel = require("../model/userModel");
const generateUniqueBookingId = require("../utils/generateunuiquebookingId");
const {
  sendNotification,
} = require("../utils/notificationThroughMessageBroker");
const { sendMailToQueue } = require("../NotificationServices/MessageService");

exports.createBookingDetails = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const {
    pickupDate,
    dropOffDate,
    price,
    extraExpenditure,
    tax,
    totalPrice,
    bookingStatus,
    uniqueGroupId,
  } = req.body;
  const userDetails = await userModel.findById(userId);
  if (!userDetails) {
    return next(new AppError("Unauthorised action", 400));
  }

  if (
    !pickupDate ||
    !dropOffDate ||
    !price ||
    extraExpenditure == null ||
    !tax ||
    !totalPrice ||
    !bookingStatus ||
    !uniqueGroupId
  ) {
    return next(new AppError("Fill all the required fields", 400));
  }

  const formattedStartDate = new Date(pickupDate);
  formattedStartDate.setMinutes(formattedStartDate.getMinutes() + 330);
  const formattedEndDate = new Date(dropOffDate);
  formattedEndDate.setMinutes(formattedEndDate.getMinutes() + 330);

  if (formattedStartDate >= formattedEndDate) {
    return next(
      new AppError("Pickup date must be earlier than drop-off date", 400)
    );
  }

  const vehicle = await vehicleModel.findOne({ uniqueGroupId });

  if (!vehicle) {
    return next(new AppError("No vehicle group found with this ID", 400));
  }

  let selectedVehicle = null;
  for (const v of vehicle.specificVehicleDetails) {
    if (!v.vehicleStatus) continue;

    const isOverlapping = v.bookedPeriods?.some((period) => {
      const periodStart = new Date(period.startDate);
      const periodEnd = new Date(period.endDate);
      return (
        (formattedStartDate >= periodStart &&
          formattedStartDate <= periodEnd) ||
        (formattedEndDate >= periodStart && formattedEndDate <= periodEnd) ||
        (formattedStartDate <= periodStart && formattedEndDate >= periodEnd)
      );
    });

    if (!isOverlapping) {
      selectedVehicle = v;
      break;
    }
  }

  if (!selectedVehicle) {
    return next(
      new AppError(
        "No available vehicle in this group for the selected dates",
        400
      )
    );
  }

  const bookingData = {
    pickupDate: formattedStartDate,
    dropOffDate: formattedEndDate,

    price,
    extraExpenditure,
    tax,
    totalPrice,
    userEmail: userDetails.email,
    vehicleDetails: [
      {
        name: vehicle.name,
        model: vehicle.model,
        description: vehicle.description,
        vehicleType: vehicle.vehicleType,
        uniqueVehicleId: selectedVehicle.uniqueVehicleId,
        vehicleStatus: true,
        location: selectedVehicle.location,
        vehicleNumber: selectedVehicle.vehicleNumber,
        vehicleMilage: selectedVehicle.vehicleMilage,
        filePath:
          selectedVehicle.filePath && selectedVehicle.filePath.length > 0
            ? selectedVehicle.filePath
            : vehicle.filePath || [],
        bookingStatus,
        pickupDate: formattedStartDate,
        dropOffDate: formattedEndDate,
        price,
        extraExpenditure,
        tax,
        totalPrice,
        uniqueBookingId: generateUniqueBookingId(),
      },
    ],
    userDetails: [
      {
        name: userDetails.name,
        email: userDetails.email,
        phoneNumber: userDetails.phoneNumber,
        drivingLicenceNumber: userDetails.drivingLicenceNumber,
        altMobileNumber: userDetails.altMobileNumber,
        filePath: userDetails.filePath,
      },
    ],
  };

  const existingBooking = await vehicleBookingModel.findOne({
    userEmail: userDetails.email,
  });

  if (existingBooking) {
    const lastIndex = existingBooking.vehicleDetails.length - 1;
    const lastStatus = existingBooking.vehicleDetails[lastIndex]?.bookingStatus;

    if (lastStatus === "confirmed") {
      return next(
        new AppError(
          "Cannot add new booking, existing booking is confirmed",
          400
        )
      );
    }

    if (["completed", "cancelled"].includes(lastStatus)) {
      existingBooking.vehicleDetails.push(...bookingData.vehicleDetails);

      const message = `New Vehicle Booking has been made by ${userDetails.name}. Please check the bookings for more details.`;
      const type = "important";
      const title = "Booking successful";
      const rolename = "user";

      // await sendNotification(userId, rolename, message, title, type);

      // await sendMailToQueue({
      //   subject: "Welcome to Bike Rider",
      //   to: userDetails.email,
      //   EXCHANGE: "bookingemailExchange",
      //   ROUTING_KEY: "bookingtask.userbookedvehicle",
      //   templateData: {
      //     name: userDetails.name,
      //     email: userDetails.email,
      //     vehicleName: vehicle.name,
      //     vehicleModel: vehicle.model,
      //     vehicleType: vehicle.vehicleType,
      //     location: selectedVehicle.location,
      //     vehicleNumber: selectedVehicle.vehicleNumber,
      //     startDate: formattedStartDate,
      //     endDate: formattedEndDate,
      //   },
      // });

      await existingBooking.save();

      await vehicleModel.updateOne(
        {
          "specificVehicleDetails.uniqueVehicleId":
            selectedVehicle.uniqueVehicleId,
        },
        {
          $push: {
            "specificVehicleDetails.$.bookedPeriods": {
              startDate: formattedStartDate,
              endDate: formattedEndDate,
            },
          },
        }
      );

      return res.status(200).json({
        message: "Booking added to existing user",
        data: existingBooking,
      });
    }
  }

  const newBooking = new vehicleBookingModel(bookingData);

  await newBooking.save();

  await vehicleModel.updateOne(
    {
      "specificVehicleDetails.uniqueVehicleId": selectedVehicle.uniqueVehicleId,
    },
    {
      $push: {
        "specificVehicleDetails.$.bookedPeriods": {
          startDate: formattedStartDate,
          endDate: formattedEndDate,
        },
      },
    }
  );

  const message = `New Vehicle Booking has been made by ${userDetails.name}. Please check the bookings for more details.`;
  const type = "important";
  const title = "Booking successful";
  const rolename = "user";

  // await sendNotification(userId, rolename, message, title, type);

  // await sendMailToQueue({
  //   subject: "Welcome to Bike Rider",
  //   to: userDetails.email,
  //   EXCHANGE: "bookingemailExchange",
  //   ROUTING_KEY: "bookingtask.userbookedvehicle",
  //   templateData: {
  //     name: userDetails.name,
  //     email: userDetails.email,
  //     vehicleName: vehicle.name,
  //     vehicleModel: vehicle.model,
  //     vehicleType: vehicle.vehicleType,
  //     location: selectedVehicle.location,
  //     vehicleNumber: selectedVehicle.vehicleNumber,
  //     startDate: formattedStartDate,
  //     endDate: formattedEndDate,
  //   },
  // });

  return res.status(200).json({
    message: "Booking confirmed and vehicle booking period updated",
    data: newBooking,
  });
});

exports.updateBookingDetails = catchAsync(async (req, res, next) => {
  const { uniqueBookingId, bookingStatus } = req.body;
  const { email: userEmail, userType, name, _id: userId } = req.user; // Get from token/session

  if (!userEmail) {
    return next(new AppError("Unauthorized for this action", 400));
  }

  if (!uniqueBookingId || !bookingStatus) {
    return next(
      new AppError("Booking ID and updated booking status are required", 400)
    );
  }

  // If admin, search without userEmail restriction
  const bookingDoc = await vehicleBookingModel.findOne(
    userType === "admin"
      ? { "vehicleDetails.uniqueBookingId": uniqueBookingId }
      : {
          userEmail: userEmail,
          "vehicleDetails.uniqueBookingId": uniqueBookingId,
        }
  );

  if (!bookingDoc) {
    return next(new AppError("No booking is present with this ID", 400));
  }

  const detailIndex = bookingDoc.vehicleDetails.findIndex(
    (detail) => detail.uniqueBookingId === uniqueBookingId
  );

  if (detailIndex === -1) {
    return next(new AppError("No booking detail found for this ID", 400));
  }

  // ✅ Update the booking status
  bookingDoc.vehicleDetails[detailIndex].bookingStatus = bookingStatus;

  const Details = bookingDoc.vehicleDetails[detailIndex];
  await bookingDoc.save();

  const message = `Your booking for ${uniqueBookingId} has been Cancelled. Please check your bookings for more details.`;
  const type = "important";
  const title = "Booking Cancelled";
  const rolename = "user";

  await sendNotification(userId, rolename, message, title, type);

  await sendMailToQueue({
    subject: "Welcome to Bike Rider",
    to: userEmail,
    EXCHANGE: "bookingemailExchange",
    ROUTING_KEY: "bookingtask.userbookedvehiclestatusupdate",
    templateData: {
      vehicleName: Details.name,
      vehicleModel: Details.model,
      vehicleType: Details.vehicleType,
      location: Details.location,
      vehicleNumber: Details.vehicleNumber,
      startDate: Details.pickupDate,
      endDate: Details.dropOffDate,
      totalPrice: Details.totalPrice,
      bookingStatus: Details.bookingStatus,
    },
  });

  res.status(200).json({
    message: "Booking status updated successfully",
    data: bookingDoc,
  });
});

exports.getBookingDetails = catchAsync(async (req, res, next) => {
  const { Status } = req.query; // Get the status from query parameters
  const { email } = req.user;

  if (!email) {
    return next(new AppError("Unauthorized for this action", 400));
  }

  const bookingDoc = await vehicleBookingModel.findOne({
    userEmail: email,
  });

  if (!bookingDoc) {
    return next(new AppError("No booking found for this user", 400));
  }

  let filteredDetails = bookingDoc.vehicleDetails;
  if (Status) {
    filteredDetails = filteredDetails.filter(
      (detail) => detail.bookingStatus === Status
    );
  }

  res.status(200).json({
    message: "Booking details retrieved successfully",
    data: filteredDetails || [],
  });
});
