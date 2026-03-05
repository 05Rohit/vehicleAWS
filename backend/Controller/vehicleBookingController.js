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
const runTransaction = require("../model/runTransaction");
const logger = require("../utils/logger");

// 🟢 Create Vehicle Booking Details where new details stored in the mongoDb
// exports.createBookingDetails = catchAsync(async (req, res, next) => {
//   const userId = req.user.id;

//   const {
//     pickupDate,
//     dropOffDate,
//     price,
//     extraExpenditure,
//     tax,
//     totalPrice,
//     bookingStatus,
//     uniqueGroupId,
//   } = req.body;

//   /* =======================
//      1️⃣ VALIDATIONS
//   ======================== */
//   if (
//     !pickupDate ||
//     !dropOffDate ||
//     price == null ||
//     extraExpenditure == null ||
//     tax == null ||
//     totalPrice == null ||
//     !bookingStatus ||
//     !uniqueGroupId
//   ) {
//     return next(new AppError("Fill all the required fields", 400));
//   }

//   const user = await userModel.findById(userId);
//   if (!user) {
//     return next(new AppError("Unauthorized action", 401));
//   }

//   /* =======================
//      2️⃣ DATE HANDLING (IST)
//   ======================== */
//   const startDate = new Date(pickupDate);
//   const endDate = new Date(dropOffDate);

//   startDate.setMinutes(startDate.getMinutes() + 330);
//   endDate.setMinutes(endDate.getMinutes() + 330);

//   if (startDate >= endDate) {
//     return next(
//       new AppError("Pickup date must be earlier than drop-off date", 400)
//     );
//   }

//   /* =======================
//      3️⃣ FIND VEHICLE GROUP
//   ======================== */
//   const vehicleGroup = await vehicleModel.findOne({ uniqueGroupId });
//   if (!vehicleGroup) {
//     return next(new AppError("No vehicle group found", 404));
//   }

//   /* =======================
//      4️⃣ FIND AVAILABLE VEHICLE
//   ======================== */
//   const selectedVehicle = vehicleGroup.specificVehicleDetails.find((v) => {
//     if (!v.vehicleStatus) return false;

//     return !v.bookedPeriods?.some((period) => {
//       const pStart = new Date(period.startDate);
//       const pEnd = new Date(period.endDate);

//       return (
//         (startDate >= pStart && startDate <= pEnd) ||
//         (endDate >= pStart && endDate <= pEnd) ||
//         (startDate <= pStart && endDate >= pEnd)
//       );
//     });
//   });

//   if (!selectedVehicle) {
//     return next(
//       new AppError("No available vehicle for the selected dates", 400)
//     );
//   }

//   /* =======================
//      5️⃣ PREPARE BOOKING DATA
//   ======================== */
//   const bookingDetail = {
//     name: vehicleGroup.name,
//     model: vehicleGroup.model,
//     description: vehicleGroup.description,
//     vehicleType: vehicleGroup.vehicleType,
//     uniqueVehicleId: selectedVehicle.uniqueVehicleId,
//     vehicleStatus: true,
//     location: selectedVehicle.location,
//     vehicleNumber: selectedVehicle.vehicleNumber,
//     vehicleMilage: selectedVehicle.vehicleMilage,
//     filePath:
//       selectedVehicle.filePath?.length > 0
//         ? selectedVehicle.filePath
//         : vehicleGroup.filePath || [],
//     bookingStatus,
//     pickupDate: startDate,
//     dropOffDate: endDate,
//     price,
//     extraExpenditure,
//     tax,
//     totalPrice: Number(totalPrice),
//     uniqueBookingId: generateUniqueBookingId(),
//   };

//   /* =======================
//      6️⃣ CHECK EXISTING BOOKING
//   ======================== */

//   let bookingDoc = await vehicleBookingModel.findOne({
//     userEmail: user.email,
//   });

//   if (bookingDoc) {
//     const lastStatus = bookingDoc.vehicleDetails.at(-1)?.bookingStatus || null;

//     if (lastStatus === "confirmed") {
//       return next(new AppError("Existing booking is already confirmed", 400));
//     }

//     bookingDoc.vehicleDetails.push(bookingDetail);
//   } else {
//     bookingDoc = new vehicleBookingModel({
//       userEmail: user.email,
//       vehicleDetails: [bookingDetail],
//       userDetails: [
//         {
//           name: user.name,
//           email: user.email,
//           phoneNumber: user.phoneNumber,
//           drivingLicenceNumber: user.drivingLicenceNumber,
//           altMobileNumber: user.altMobileNumber,
//           filePath: user.filePath,
//         },
//       ],
//     });
//   }

//   /* =======================
//      7️⃣ SAVE BOOKING
//   ======================== */
//   await bookingDoc.save();

//   /* =======================
//      8️⃣ BLOCK VEHICLE DATES
//   ======================== */
//   await vehicleModel.updateOne(
//     {
//       "specificVehicleDetails.uniqueVehicleId": selectedVehicle.uniqueVehicleId,
//     },
//     {
//       $push: {
//         "specificVehicleDetails.$.bookedPeriods": {
//           startDate,
//           endDate,
//         },
//       },
//     }
//   );

//   /* =======================
//      9️⃣ UPDATE USER STATS
//   ======================== */
//   await userModel.findByIdAndUpdate(
//     userId,
//     {
//       $inc: {
//         "bookingInfo.totalBooking": 1,
//         "bookingInfo.activeBooking": 1,
//         "bookingInfo.moneySpend": Number(totalPrice),
//       },
//     },
//     { runValidators: true }
//   );

//   /* =======================
//      🔔 NOTIFICATION + EMAIL
//   ======================== */
//   const message = `New Vehicle Booking has been made by ${user.name}.`;
//   await sendNotification(
//     userId,
//     "user",
//     message,
//     "Booking successful",
//     "important"
//   );

//   await sendMailToQueue({
//     subject: "Welcome to Bike Rider",
//     to: user.email,
//     EXCHANGE: "bookingemailExchange",
//     ROUTING_KEY: "bookingtask.userbookedvehicle",
//     templateData: {
//       name: user.name,
//       email: user.email,
//       vehicleName: vehicleGroup.name,
//       vehicleModel: vehicleGroup.model,
//       vehicleType: vehicleGroup.vehicleType,
//       location: selectedVehicle.location,
//       vehicleNumber: selectedVehicle.vehicleNumber,
//       startDate,
//       endDate,
//     },
//   });

//   /* =======================
//      ✅ RESPONSE
//   ======================== */
//   res.status(200).json({
//     message: "Booking created successfully",
//     data: bookingDoc,
//   });
// });

exports.createBookingDetails = catchAsync(async (req, res, next) => {
  const userId = req.user.id;

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

  /* =======================
     1️⃣ BASIC VALIDATIONS
  ======================== */
  if (
    !pickupDate ||
    !dropOffDate ||
    price == null ||
    extraExpenditure == null ||
    tax == null ||
    totalPrice == null ||
    !bookingStatus ||
    !uniqueGroupId
  ) {
    return next(new AppError("Fill all the required fields", 400));
  }

  const user = await userModel.findById(userId);
  if (!user) {
    return next(new AppError("Unauthorized action", 401));
  }

  /* =======================
     2️⃣ DATE HANDLING (IST)
  ======================== */
  const startDate = new Date(pickupDate);
  const endDate = new Date(dropOffDate);

  startDate.setMinutes(startDate.getMinutes() + 330);
  endDate.setMinutes(endDate.getMinutes() + 330);

  if (startDate >= endDate) {
    return next(
      new AppError("Pickup date must be earlier than drop-off date", 400)
    );
  }

  /* =======================
     3️⃣ TRANSACTION START
  ======================== */
  const result = await runTransaction(async (session) => {
    /* =======================
       FIND VEHICLE GROUP
    ======================== */
    const vehicleGroup = await vehicleModel.findOne({ uniqueGroupId }, null, {
      session,
    });

    if (!vehicleGroup) {
      throw new AppError("No vehicle group found", 404);
    }

    /* =======================
       FIND AVAILABLE VEHICLE
       (INSIDE TRANSACTION)
    ======================== */
    const selectedVehicle = vehicleGroup.specificVehicleDetails.find((v) => {
      if (!v.vehicleStatus) return false;

      return !v.bookedPeriods?.some((period) => {
        const pStart = new Date(period.startDate);
        const pEnd = new Date(period.endDate);

        return (
          (startDate >= pStart && startDate <= pEnd) ||
          (endDate >= pStart && endDate <= pEnd) ||
          (startDate <= pStart && endDate >= pEnd)
        );
      });
    });

    if (!selectedVehicle) {
      throw new AppError("No available vehicle for the selected dates", 400);
    }

    /* =======================
       PREPARE BOOKING DATA
    ======================== */
    const bookingDetail = {
      name: vehicleGroup.name,
      model: vehicleGroup.model,
      description: vehicleGroup.description,
      vehicleType: vehicleGroup.vehicleType,
      uniqueVehicleId: selectedVehicle.uniqueVehicleId,
      vehicleStatus: true,
      location: selectedVehicle.location,
      vehicleNumber: selectedVehicle.vehicleNumber,
      vehicleMilage: selectedVehicle.vehicleMilage,
      filePath:
        selectedVehicle.filePath?.length > 0
          ? selectedVehicle.filePath
          : vehicleGroup.filePath || [],
      bookingStatus,
      pickupDate: startDate,
      dropOffDate: endDate,
      price,
      extraExpenditure,
      tax,
      totalPrice: Number(totalPrice),
      uniqueBookingId: generateUniqueBookingId(),
    };

    /* =======================
       CHECK EXISTING BOOKING
    ======================== */
    let bookingDoc = await vehicleBookingModel.findOne(
      { userEmail: user.email },
      null,
      { session }
    );

    if (bookingDoc) {
      const lastStatus =
        bookingDoc.vehicleDetails.at(-1)?.bookingStatus || null;

      if (lastStatus === "confirmed") {
        throw new AppError("Existing booking is already confirmed", 400);
      }

      bookingDoc.vehicleDetails.push(bookingDetail);
    } else {
      bookingDoc = new vehicleBookingModel({
        userEmail: user.email,
        vehicleDetails: [bookingDetail],
        userDetails: [
          {
            name: user.name,
            email: user.email,
            phoneNumber: user.phoneNumber,
            drivingLicenceNumber: user.drivingLicenceNumber,
            altMobileNumber: user.altMobileNumber,
            filePath: user.filePath,
          },
        ],
      });
    }

    /* =======================
       SAVE BOOKING
    ======================== */
    await bookingDoc.save({ session });

    /* =======================
       BLOCK VEHICLE DATES
    ======================== */
    await vehicleModel.updateOne(
      {
        "specificVehicleDetails.uniqueVehicleId":
          selectedVehicle.uniqueVehicleId,
      },
      {
        $push: {
          "specificVehicleDetails.$.bookedPeriods": {
            startDate,
            endDate,
          },
        },
      },
      { session }
    );

    /* =======================
       UPDATE USER STATS
    ======================== */
    await userModel.findByIdAndUpdate(
      userId,
      {
        $inc: {
          "bookingInfo.totalBooking": 1,
          "bookingInfo.activeBooking": 1,
          "bookingInfo.moneySpend": Number(totalPrice),
        },
      },
      { session, runValidators: true }
    );

    return { bookingDoc, vehicleGroup, selectedVehicle };
  });

  /* =======================
     🔔 NOTIFICATION + EMAIL
     (OUTSIDE TRANSACTION)
  ======================== */
  const message = `New Vehicle Booking has been made by ${user.name}.`;

  await sendNotification(
    userId,
    "user",
    message,
    "Booking successful",
    "important"
  );

  await sendMailToQueue({
    subject: "Welcome to Bike Rider",
    to: user.email,
    EXCHANGE: "bookingemailExchange",
    ROUTING_KEY: "bookingtask.userbookedvehicle",
    templateData: {
      name: user.name,
      email: user.email,
      vehicleName: result.vehicleGroup.name,
      vehicleModel: result.vehicleGroup.model,
      vehicleType: result.vehicleGroup.vehicleType,
      location: result.selectedVehicle.location,
      vehicleNumber: result.selectedVehicle.vehicleNumber,
      startDate,
      endDate,
    },
  });

  /* =======================
     ✅ RESPONSE
  ======================== */
  res.status(200).json({
    message: "Booking created successfully",
    data: result.bookingDoc,
  });
});

/* Helper function to determine if a booking can be cancelled */

const canCancel = (pickupDate, userType) => {
  if (userType === "admin") return true;

  const hours = (new Date(pickupDate) - new Date()) / (1000 * 60 * 60); // Convert milliseconds to hours and give 1 hrs as buffer

  return hours >= 12; // Allow cancellation if more than or equal to 12 hours remain
};

// Upadte the booking details like cancel the bookings

exports.updateBookingDetails = catchAsync(async (req, res, next) => {
  const { uniqueBookingId, bookingStatus } = req.body;
  const { email: userEmail, userType, id: userId } = req.user;

  /* =======================
     1️⃣ BASIC VALIDATIONS
  ======================== */
  if (!uniqueBookingId || !bookingStatus) {
    return next(
      new AppError("Booking ID and booking status are required", 400)
    );
  }

  if (bookingStatus !== "cancelled") {
    return next(
      new AppError("Only cancellation is allowed via this endpoint", 400)
    );
  }

  if (!userEmail) {
    return next(new AppError("Unauthorized action", 401));
  }

  /* =======================
     2️⃣ TRANSACTION START
  ======================== */
  const result = await runTransaction(async (session) => {
    /* =======================
       FIND BOOKING
       - Admin → any booking
       - User  → own booking
    ======================== */
    const bookingDoc = await vehicleBookingModel.findOne(
      userType === "admin"
        ? { "vehicleDetails.uniqueBookingId": uniqueBookingId }
        : {
            userEmail,
            "vehicleDetails.uniqueBookingId": uniqueBookingId,
          },
      null,
      { session }
    );

    if (!bookingDoc) {
      throw new AppError("Booking not found", 404);
    }

    /* =======================
       FIND BOOKING DETAIL
    ======================== */
    const bookingDetail = bookingDoc.vehicleDetails.find(
      (d) => d.uniqueBookingId === uniqueBookingId
    );

    if (!bookingDetail) {
      throw new AppError("Booking details not found", 404);
    }

    if (bookingDetail.bookingStatus === "cancelled") {
      throw new AppError("Booking already cancelled", 400);
    }

    if (!canCancel(bookingDetail.pickupDate, userType)) {
      throw new AppError("Cancellation window closed", 403);
    }

    /* =======================
       UPDATE BOOKING STATUS
    ======================== */
    bookingDetail.bookingStatus = "cancelled";
    await bookingDoc.save({ session });

    /* =======================
       FREE VEHICLE SLOT
    ======================== */
    await vehicleModel.updateOne(
      {
        "specificVehicleDetails.uniqueVehicleId": bookingDetail.uniqueVehicleId,
      },
      {
        $pull: {
          "specificVehicleDetails.$.bookedPeriods": {
            startDate: bookingDetail.pickupDate,
            endDate: bookingDetail.dropOffDate,
          },
        },
      },
      { session }
    );

    /* =======================
       UPDATE USER STATS
    ======================== */
    await userModel.updateOne(
      { email: bookingDoc.userEmail },
      {
        $inc: {
          "bookingInfo.activeBooking": -1,
          "bookingInfo.cancelbooking": 1,
          "bookingInfo.moneySpend": -Number(bookingDetail.totalPrice),
        },
      },
      { session }
    );

    return { bookingDoc, bookingDetail };
  });

  /* =======================
     🔔 NOTIFICATION (OUTSIDE TX)
  ======================== */
  const message =
    userType === "admin"
      ? `Your booking ${uniqueBookingId} has been cancelled by admin.`
      : `Your booking ${uniqueBookingId} has been cancelled successfully.`;

  await sendNotification(
    userId,
    "user",
    message,
    "Booking Cancelled",
    "important"
  );

  /* =======================
     📧 EMAIL
  ======================== */
  await sendMailToQueue({
    subject: "Booking Cancelled – Bike Rider",
    to: result.bookingDoc.userEmail,
    EXCHANGE: "bookingemailExchange",
    ROUTING_KEY: "bookingtask.userbookedvehiclestatusupdate",
    templateData: {
      vehicleName: result.bookingDetail.name,
      vehicleModel: result.bookingDetail.model,
      vehicleType: result.bookingDetail.vehicleType,
      location: result.bookingDetail.location,
      vehicleNumber: result.bookingDetail.vehicleNumber,
      startDate: result.bookingDetail.pickupDate,
      endDate: result.bookingDetail.dropOffDate,
      totalPrice: result.bookingDetail.totalPrice,
      bookingStatus: "cancelled",
    },
  });

  /* =======================
     ✅ RESPONSE
  ======================== */
  res.status(200).json({
    message: "Booking cancelled successfully",
    data: result.bookingDoc,
  });
});

// 🟢 Get Vehicle Booking Details based on status filter
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

exports.rescheduleBooking = async (req, res, next) => {
  const { uniqueBookingId, pickupDate, dropOffDate } = req.body;
  const { userType } = req.user;

  if (!uniqueBookingId || !pickupDate || !dropOffDate) {
    return next(new AppError("All fields are required", 400));
  }

  await runTransaction(async (session) => {
    /* 1️⃣ Find booking */
    const booking = await vehicleBookingModel.findOne(
      { "vehicleDetails.uniqueBookingId": uniqueBookingId },
      null,
      { session }
    );

    if (!booking) {
      return next(new AppError("Booking not found", 400));
    }

    const detail = booking.vehicleDetails.find(
      (b) => b.uniqueBookingId === uniqueBookingId
    );

    if (!detail) {
      return next(new AppError("Booking detail not found", 400));
    }

    /* 2️⃣ Check availability for NEW slot (excluding current booking) */
    const availabilityQuery = {
      "specificVehicleDetails.uniqueVehicleId": detail.uniqueVehicleId,
      "specificVehicleDetails.bookedPeriods": {
        $not: {
          $elemMatch: {
            startDate: { $lt: new Date(dropOffDate) },
            endDate: { $gt: new Date(pickupDate) },
          },
        },
      },
    };

    const isAvailable = await vehicleModel.findOne(availabilityQuery, null, {
      session,
    });

    if (!isAvailable) {
      console.log("Vehicle not available for selected dates");
      return next(
        new AppError("Vehicle not available for selected dates", 409)
      );
    }

    /* 3️⃣ Add NEW booking slot (block it) */
    const blockResult = await vehicleModel.updateOne(
      { "specificVehicleDetails.uniqueVehicleId": detail.uniqueVehicleId },
      {
        $push: {
          "specificVehicleDetails.$.bookedPeriods": {
            startDate: pickupDate,
            endDate: dropOffDate,
          },
        },
      },
      { session }
    );

    if (blockResult.modifiedCount === 0) {
      throw new AppError("Failed to block vehicle for new dates", 409);
    }

    /* 4️⃣ Remove OLD booking slot */
    await vehicleModel.updateOne(
      { "specificVehicleDetails.uniqueVehicleId": detail.uniqueVehicleId },
      {
        $pull: {
          "specificVehicleDetails.$.bookedPeriods": {
            startDate: detail.pickupDate,
            endDate: detail.dropOffDate,
          },
        },
      },
      { session }
    );

    /* 5️⃣ Update booking record */
    detail.pickupDate = pickupDate;
    detail.dropOffDate = dropOffDate;

    await booking.save({ session });
  });

  res.status(200).json({
    message: "Booking rescheduled successfully",
  });
};

exports.updateBookingCompleted = catchAsync(async (req, res, next) => {
  const { uniqueBookingId, bookingStatus } = req.body;
  const { userType, id: userId } = req.user;

  /* =======================
     1️⃣ VALIDATIONS
  ======================== */
  if (!uniqueBookingId || bookingStatus !== "completed") {
    return next(
      new AppError("Only booking completion is allowed", 400)
    );
  }

  /* =======================
     2️⃣ TRANSACTION
  ======================== */
  const result = await runTransaction(async (session) => {
    const bookingDoc = await vehicleBookingModel.findOne(
      { "vehicleDetails.uniqueBookingId": uniqueBookingId },
      null,
      { session }
    );

    if (!bookingDoc) {
      throw new AppError("Booking not found", 404);
    }

    const bookingDetail = bookingDoc.vehicleDetails.find(
      (d) => d.uniqueBookingId === uniqueBookingId
    );

    if (!bookingDetail) {
      throw new AppError("Booking details not found", 404);
    }

    if (bookingDetail.bookingStatus === "cancelled") {
      throw new AppError("Cancelled booking cannot be completed", 400);
    }

    if (bookingDetail.bookingStatus === "completed") {
      throw new AppError("Booking already completed", 400);
    }

    /* =======================
       UPDATE STATUS
    ======================== */
    bookingDetail.bookingStatus = "completed";
    await bookingDoc.save({ session });

    /* =======================
       UPDATE USER STATS
    ======================== */
    await userModel.updateOne(
      { email: bookingDoc.userEmail },
      { $inc: { "bookingInfo.activeBooking": -1 } },
      { session }
    );

    return { bookingDoc, bookingDetail };
  });

  /* =======================
     🔔 NOTIFICATION
  ======================== */
  await sendNotification(
    userId,
    "user",
    `Your booking ${uniqueBookingId} has been completed successfully.`,
    "Booking Completed",
    "important"
  );

  /* =======================
     📧 EMAIL
  ======================== */
  await sendMailToQueue({
    subject: "Booking Completed – Bike Rider",
    to: result.bookingDoc.userEmail,
    EXCHANGE: "bookingemailExchange",
    ROUTING_KEY: "bookingtask.userbookedvehiclestatusupdate",
    templateData: {
      vehicleName: result.bookingDetail.name,
      vehicleModel: result.bookingDetail.model,
      vehicleType: result.bookingDetail.vehicleType,
      location: result.bookingDetail.location,
      vehicleNumber: result.bookingDetail.vehicleNumber,
      startDate: result.bookingDetail.pickupDate,
      endDate: result.bookingDetail.dropOffDate,
      totalPrice: result.bookingDetail.totalPrice,
      bookingStatus: "completed",
    },
  });

  /* =======================
     ✅ RESPONSE
  ======================== */
  res.status(200).json({
    message: "Booking completed successfully",
    data: result.bookingDoc,
  });
});
