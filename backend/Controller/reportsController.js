const userModel = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const vehicleBookingModel = require("../model/vehicleBookingModel");
const vehicleModel = require("../model/vehicleDetailModel");

exports.getBookingData = catchAsync(async (req, res, next) => {
  const { bookingStatus } = req.body; // or req.query for GET requests
  const allBookings = await vehicleBookingModel.find({});
  const matchedBookings = [];

  allBookings.forEach((doc) => {
    const filteredVehicles = doc.vehicleDetails.filter((v) =>
      bookingStatus ? v.bookingStatus === bookingStatus : true
    );

    filteredVehicles.forEach((vehicle) => {
      matchedBookings.push({
        _id: doc._id,
        userEmail: doc.userEmail || null,
        vehicleDetails: {
          name: vehicle.name || null,
          model: vehicle.model || null,
          description: vehicle.description || null,
          vehicleType: vehicle.vehicleType || null,
          uniqueVehicleId: vehicle.uniqueVehicleId || null,
          vehicleStatus: vehicle.vehicleStatus || false,
          location: vehicle.location || null,
          vehicleNumber: vehicle.vehicleNumber || null,
          vehicleMilage: vehicle.vehicleMilage || null,
          filePath: vehicle.filePath || [],
        },
        bookingStatus: vehicle.bookingStatus || null,
        pickupDate: vehicle.pickupDate || null,
        dropOffDate: vehicle.dropOffDate || null,
        price: vehicle.price || 0,
        extraExpenditure: vehicle.extraExpenditure || 0,
        tax: vehicle.tax || 0,
        totalPrice: vehicle.totalPrice || 0,
        uniqueBookingId: vehicle.uniqueBookingId || null,
        createdAt: vehicle.createdAt || null,
        userDetails: doc.userDetails || {},
      });
    });
  });

  if (matchedBookings.length === 0) {
    return next(new AppError("No bookings found.", 404));
  }

  res.status(200).json({
    status: "success",
    data: matchedBookings,
  });
});

exports.getAllVehicleListData = catchAsync(async (req, res, next) => {
  const role = req.user.userType;
  // Check if the user is an admin
  if (role !== "admin") {
    return next(new AppError("You are not authorized to view this data", 403));
  }

  // Fetch all vehicles
  const AllVehicleData = await vehicleModel.find({});

  // Check if any vehicles were found
  if (!AllVehicleData || AllVehicleData.length === 0) {
    return next(
      new AppError("No bookings found for the specified status", 404)
    );
  }

  // Filter the fields as requested
  const filteredData = AllVehicleData.map((vehicle) => ({
    name: vehicle.name,
    vehicleType: vehicle.vehicleType,
    model: vehicle.model,
    bookingPrice: vehicle.bookingPrice,
    specificVehicleDetails: (vehicle.specificVehicleDetails || []).map(
      (detail) => ({
        vehicleNumber: detail.vehicleNumber,
        vehicleStatus: detail.vehicleStatus,
        notAvailableReason: detail.notAvailableReason,
        createdAt: detail.createdAt,
        updatedAt: detail.updatedAt,
      })
    ),
  }));

  res.status(200).json({
    status: "success",
    data: filteredData,
    count: filteredData.length,
  });
});

exports.getAllUserListData = catchAsync(async (req, res, next) => {
  const role = req.user.userType;
  // Check if the user is an admin
  if (role !== "admin") {
    return next(new AppError("You are not authorized to view this data", 403));
  }

  // Fetch all users
  const AllUserData = await userModel.find({});

  // Check if any users were found
  if (!AllUserData || AllUserData.length === 0) {
    return next(new AppError("No users found for the specified status", 404));
  }

  // Filter the fields as requested
  const filteredData = AllUserData.map((user) => ({
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    userType: user.userType,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }));

  const count = filteredData.length;

  res.status(200).json({
    status: "success",
    data: filteredData,
    count: count,
  });
});

exports.getAllNotAvailableVehicleListData = catchAsync(
  async (req, res, next) => {
    const role = req.user.userType;
    // Check if the user is an admin
    if (role !== "admin") {
      return next(
        new AppError("You are not authorized to view this data", 403)
      );
    }

    // Fetch all vehicles
    const AllVehicleData = await vehicleModel.find({});

    // Check if any vehicles were found
    if (!AllVehicleData || AllVehicleData.length === 0) {
      return next(
        new AppError("No bookings found for the specified status", 404)
      );
    }

    const filteredData = AllVehicleData.map((vehicle) => {
      const specificVehicleDetails = (
        vehicle.specificVehicleDetails || []
      ).filter(
        (detail) =>
          typeof detail.vehicleStatus === "string" ||
          detail.vehicleStatus === false
      );
      return {
        name: vehicle.name,
        vehicleType: vehicle.vehicleType,
        model: vehicle.model,
        specificVehicleDetails,
        specificVehicleDetailsCount: specificVehicleDetails.length,
      };
    }).filter((vehicle) => vehicle.specificVehicleDetails.length > 0);
    // Filter the fields as requested

    const count = filteredData.length;

    res.status(200).json({
      status: "success",
      data: count,
    });
  }
);
exports.getAllVehicleAvailableList = catchAsync(async (req, res, next) => {
  const role = req.user.userType;
  // Check if the user is an admin
  if (role !== "admin") {
    return next(new AppError("You are not authorized to view this data", 403));
  }

  // Fetch all vehicles
  const AllVehicleData = await vehicleModel.find({});

  // Check if any vehicles were found
  if (!AllVehicleData || AllVehicleData.length === 0) {
    return next(
      new AppError("No bookings found for the specified status", 404)
    );
  }

  // Filter the fields as requested
  const filteredData = AllVehicleData.map((vehicle) => {
    const specificVehicleDetails = (
      vehicle.specificVehicleDetails || []
    ).filter(
      (detail) =>
        typeof detail.vehicleStatus === "string" ||
        detail.vehicleStatus === true
    );
    return {
      name: vehicle.name,
      vehicleType: vehicle.vehicleType,
      model: vehicle.model,
      specificVehicleDetails,
      specificVehicleDetailsCount: specificVehicleDetails.length,
    };
  }).filter((vehicle) => vehicle.specificVehicleDetails.length > 0);

  res.status(200).json({
    status: "success",
    data: filteredData,
  });
});

exports.getAllScootyVehicleAvailableList = catchAsync(
  async (req, res, next) => {
    const role = req.user.userType;
    // Check if the user is an admin
    if (role !== "admin") {
      return next(
        new AppError("You are not authorized to view this data", 403)
      );
    }

    // Fetch all vehicles
    const AllVehicleData = await vehicleModel.find({});

    // Check if any vehicles were found
    if (!AllVehicleData || AllVehicleData.length === 0) {
      return next(
        new AppError("No bookings found for the specified status", 404)
      );
    }

    // Filter for Scooty vehicles and return required details
    const filteredData = AllVehicleData.filter(
      (vehicle) => vehicle.vehicleType === "Scooty"
    ).map((vehicle) => ({
      name: vehicle.name,
      vehicleType: vehicle.vehicleType,
      model: vehicle.model,
      bookingPrice: vehicle.bookingPrice,
    }));

    res.status(200).json({
      status: "success",
      data: filteredData,
      count: filteredData.length,
    });
  }
);
exports.getAllBikeVehicleAvailableList = catchAsync(async (req, res, next) => {
  const role = req.user.userType;
  // Check if the user is an admin
  if (role !== "admin") {
    return next(new AppError("You are not authorized to view this data", 403));
  }

  // Fetch all vehicles
  const AllVehicleData = await vehicleModel.find({});

  // Check if any vehicles were found
  if (!AllVehicleData || AllVehicleData.length === 0) {
    return next(
      new AppError("No bookings found for the specified status", 404)
    );
  }

  // Filter for Scooty vehicles and return required details
  const filteredData = AllVehicleData.filter(
    (vehicle) => vehicle.vehicleType === "Bike"
  ).map((vehicle) => ({
    name: vehicle.name,
    vehicleType: vehicle.vehicleType,
    model: vehicle.model,
    bookingPrice: vehicle.bookingPrice,
  }));

  res.status(200).json({
    status: "success",
    data: filteredData,
    count: filteredData.length,
  });
});
