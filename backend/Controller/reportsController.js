const userModel = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const logger = require("../utils/logger");
const vehicleBookingModel = require("../model/vehicleBookingModel");
const vehicleModel = require("../model/vehicleDetailModel");

exports.getBookingData = catchAsync(async (req, res, next) => {
  const { bookingStatus } = req.query; // ✅ Use query for filtering

  const matchStage = bookingStatus
    ? { "vehicleDetails.bookingStatus": bookingStatus }
    : {};

  const data = await vehicleBookingModel.aggregate([
    { $unwind: "$vehicleDetails" },

    { $match: matchStage },

    {
      $project: {
        _id: 1,
        userEmail: 1,
        bookingStatus: "$vehicleDetails.bookingStatus",
        pickupDate: "$vehicleDetails.pickupDate",
        dropOffDate: "$vehicleDetails.dropOffDate",
        price: "$vehicleDetails.price",
        extraExpenditure: "$vehicleDetails.extraExpenditure",
        tax: "$vehicleDetails.tax",
        totalPrice: "$vehicleDetails.totalPrice",
        uniqueBookingId: "$vehicleDetails.uniqueBookingId",
        // createdAt: "$vehicleDetails.createdAt",

        userDetails: 1,

        vehicleDetails: {
          name: "$vehicleDetails.name",
          model: "$vehicleDetails.model",
          vehicleNumber: "$vehicleDetails.vehicleNumber",
        },
      },
    },
  ]);

  if (!data.length) {
    return next(new AppError("No bookings found.", 404));
  }

  res.status(200).json({
    status: "success",
    count: data.length,
    data,
  });
});

exports.getAllVehicleListData = catchAsync(async (req, res, next) => {
  const data = await vehicleModel.aggregate([
    {
      $project: {
        name: 1,
        vehicleType: 1,
        model: 1,
        bookingPrice: 1,

        specificVehicleDetails: {
          $map: {
            input: "$specificVehicleDetails",
            as: "detail",
            in: {
              vehicleNumber: "$$detail.vehicleNumber",
              vehicleStatus: "$$detail.vehicleStatus",
              notAvailableReason: "$$detail.notAvailableReason",
              createdAt: "$$detail.createdAt",
              updatedAt: "$$detail.updatedAt",
            },
          },
        },
      },
    },
    {
      $addFields: {
        count: { $size: "$specificVehicleDetails" },
      },
    },
  ]);

  if (!data.length) {
    return next(new AppError("No Vehicle found", 404));
  }

  res.status(200).json({
    status: "success",
    count: data.length,
    data,
  });
});

exports.getAllUserListData = catchAsync(async (req, res, next) => {
  // Fetch all users
  const AllUserData = await userModel.find({});

  // Check if any users were found
  if (!AllUserData || AllUserData.length === 0) {
    return next(new AppError("No users found for the specified status", 404));
  }

  // Filter the fields as requested
  const filteredData = AllUserData.map((user) => ({
    id:user._id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    userType: user.userType,
    totalBooking: user.bookingInfo?.totalBooking,
    activeBooking: user.bookingInfo?.activeBooking,
    moneySpend: user.bookingInfo?.moneySpend,
    cancelbooking: user.bookingInfo?.cancelbooking,
    drivingLicenceNumber: user.drivingLicenceNumber,
    isDLverify: user.isDLverify,
    createdAt: user.createdAt,
    // updatedAt: user.updatedAt,
  }));

  const count = filteredData.length;

  res.status(200).json({
    status: "success",
    data: filteredData,
    count: count,
  });
});



// exports.getAllAvailableVehicleListData = catchAsync(async (req, res, next) => {
//   // const data = await vehicleModel.aggregate([
//   //   {
//   //     $project: {
//   //       name: 1,
//   //       vehicleType: 1,
//   //       model: 1,
//   //       specificVehicleDetails: {
//   //         $filter: {
//   //           input: "$specificVehicleDetails",
//   //           as: "detail",
//   //           cond: { $eq: ["$$detail.vehicleStatus", true] }, // ✅ AVAILABLE
//   //         },
//   //       },
//   //     },
//   //   },
//   //   {
//   //     $addFields: {
//   //       specificVehicleDetailsCount: {
//   //         $size: "$specificVehicleDetails",
//   //       },
//   //     },
//   //   },
//   //   {
//   //     $match: {
//   //       specificVehicleDetailsCount: { $gt: 0 },
//   //     },
//   //   },
//   //   {
//   //     $project: {
//   //       name: 1,
//   //       vehicleType: 1,
//   //       model: 1,
//   //       specificVehicleDetailsCount: 1,
//   //       specificVehicleDetails: {
//   //         uniqueVehicleId: 1,
//   //         vehicleStatus: 1,
//   //         vehicleNumber: 1,
//   //       },
//   //     },
//   //   },
//   // ]);
//   const data = await vehicleModel.aggregate([
//     // 1️⃣ explode array
//     {
//       $unwind: "$specificVehicleDetails",
//     },

//     // 2️⃣ filter EARLY (critical)
//     {
//       $match: {
//         "specificVehicleDetails.vehicleStatus": true,
//       },
//     },

//     // 3️⃣ keep only required fields
//     {
//       $project: {
//         name: 1,
//         vehicleType: 1,
//         model: 1,
//         "specificVehicleDetails.uniqueVehicleId": 1,
//         "specificVehicleDetails.vehicleStatus": 1,
//         "specificVehicleDetails.notAvailableReason": 1,
//         "specificVehicleDetails.vehicleNumber": 1,
//       },
//     },

//     // 4️⃣ regroup per vehicle
//     {
//       $group: {
//         _id: "$_id",
//         name: { $first: "$name" },
//         vehicleType: { $first: "$vehicleType" },
//         model: { $first: "$model" },
//         specificVehicleDetails: { $push: "$specificVehicleDetails" },
//         specificVehicleDetailsCount: { $sum: 1 },
//       },
//     },
//   ]);

//   if (!data.length) {
//     return next(new AppError("No available vehicles found", 404));
//   }

//   const totalAvailableVehicles = data.reduce(
//     (sum, v) => sum + v.specificVehicleDetailsCount,
//     0
//   );

//   res.status(200).json({
//     status: "success",
//     vehicleGroupCount: data.length,
//     count: totalAvailableVehicles,
//     // data,
//   });
// });

exports.getAllNotAvailableVehicleListData = catchAsync(async (req, res, next) => {
  const result = await vehicleModel.aggregate([
    /* ===================== STEP 1 ===================== */
    // Unwind vehicle array (critical for performance)
    {
      $unwind: "$specificVehicleDetails",
    },

    /* ===================== STEP 2 ===================== */
    // Filter NOT AVAILABLE vehicles only
    {
      $match: {
        "specificVehicleDetails.vehicleStatus": false,
      },
    },

    /* ===================== STEP 3 ===================== */
    // Keep only required fields
    {
      $project: {
        name: 1,
        vehicleType: 1,
        model: 1,
        "specificVehicleDetails.uniqueVehicleId": 1,
        "specificVehicleDetails.vehicleStatus": 1,
        // "specificVehicleDetails.notAvailableReason": 1,
        "specificVehicleDetails.vehicleNumber": 1,
      },
    },

    /* ===================== STEP 4 ===================== */
    // Facet: list + total count
    {
      $facet: {
        list: [
          {
            $group: {
              _id: "$_id",
              name: { $first: "$name" },
              vehicleType: { $first: "$vehicleType" },
              model: { $first: "$model" },
              specificVehicleDetails: {
                $push: "$specificVehicleDetails",
              },
              specificVehicleDetailsCount: { $sum: 1 },
            },
          },
        ],
        totalCount: [
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  /* ===================== RESPONSE ===================== */

  const list = result[0]?.list || [];
  const totalUnavailableVehicles = result[0]?.totalCount[0]?.count || 0;

  if (!list.length) {
    return next(new AppError("No unavailable vehicles found", 404));
  }

  res.status(200).json({
    status: "success",
    vehicleGroupCount: list.length,
    count: totalUnavailableVehicles, // ✅ ONLY unavailable
    data: list,
  });
});
exports.getAllAvailableVehicleListData = catchAsync(async (req, res, next) => {
  const result = await vehicleModel.aggregate([
    /* ===================== STEP 1 ===================== */
    // Unwind vehicle array (critical for performance)
    {
      $unwind: "$specificVehicleDetails",
    },

    /* ===================== STEP 2 ===================== */
    // Filter  AVAILABLE vehicles only
    {
      $match: {
        "specificVehicleDetails.vehicleStatus": true,
      },
    },

    /* ===================== STEP 3 ===================== */
    // Keep only required fields
    {
      $project: {
        name: 1,
        vehicleType: 1,
        model: 1,
        "specificVehicleDetails.uniqueVehicleId": 1,
        "specificVehicleDetails.vehicleStatus": 1,
        // "specificVehicleDetails.notAvailableReason": 1,
        "specificVehicleDetails.vehicleNumber": 1,
      },
    },

    /* ===================== STEP 4 ===================== */
    // Facet: list + total count
    {
      $facet: {
        list: [
          {
            $group: {
              _id: "$_id",
              name: { $first: "$name" },
              vehicleType: { $first: "$vehicleType" },
              model: { $first: "$model" },
              specificVehicleDetails: {
                $push: "$specificVehicleDetails",
              },
              specificVehicleDetailsCount: { $sum: 1 },
            },
          },
        ],
        totalCount: [
          {
            $count: "count",
          },
        ],
      },
    },
  ]);

  /* ===================== RESPONSE ===================== */

  const list = result[0]?.list || [];
  const totalUnavailableVehicles = result[0]?.totalCount[0]?.count || 0;

  if (!list.length) {
    return next(new AppError("No unavailable vehicles found", 404));
  }

  res.status(200).json({
    status: "success",
    vehicleGroupCount: list.length,
    count: totalUnavailableVehicles, // ✅ ONLY unavailable
    data: list,
  });
});

exports.getVehicleTypeCount = catchAsync(async (req, res, next) => {
  const data = await vehicleModel.aggregate([
    {
      $group: {
        _id: "$vehicleType",
        count: { $sum: 1 },
      },
    },
  ]);

  if (!data.length) {
    return next(new AppError("No vehicles found", 404));
  }

  // Convert aggregation array → clean object
  const counts = {};
  let totalVehicles = 0;

  data.forEach((item) => {
    counts[item._id] = item.count;
    totalVehicles += item.count;
  });

  res.status(200).json({
    status: "success",
    totalVehicles,
    counts,
  });
});

// exports.getAdminBookingMetrics = catchAsync(async (req, res, next) => {
//   const today = new Date();

//   const metrics = await vehicleBookingModel.aggregate([
//     { $unwind: "$vehicleDetails" },

//     {
//       $facet: {
//         // 🔹 Overall Summary
//         summary: [
//           {
//             $group: {
//               _id: null,
//               totalBookings: { $sum: 1 },
//               totalRevenue: {
//                 $sum: {
//                   $cond: [
//                     { $ne: ["$vehicleDetails.bookingStatus", "cancelled"] },
//                     "$vehicleDetails.totalPrice",
//                     0,
//                   ],
//                 },
//               },
//             },
//           },
//         ],

//         // 🔹 Booking Status Breakdown
//         bookingStatusStats: [
//           {
//             $group: {
//               _id: "$vehicleDetails.bookingStatus",
//               count: { $sum: 1 },
//               revenue: { $sum: "$vehicleDetails.totalPrice" },
//             },
//           },
//         ],

//         // 🔹 Upcoming Pickups
//         upcomingPickups: [
//           {
//             $match: {
//               "vehicleDetails.pickupDate": { $gte: today },
//               "vehicleDetails.bookingStatus": "confirmed",
//             },
//           },
//           { $count: "count" },
//         ],

//         // 🔹 Active Bookings
//         activeBookings: [
//           {
//             $match: {
//               // "vehicleDetails.pickupDate": { $lte: today },
//               "vehicleDetails.dropOffDate": { $gte: today },
//               "vehicleDetails.bookingStatus": "confirmed",
//             },
//           },
//           { $count: "count" },
//         ],

//         // 🔹 Cancelled Bookings
//         cancelledBookings: [
//           {
//             $match: {
//               "vehicleDetails.bookingStatus": "cancelled",
//             },
//           },
//           { $count: "count" },
//         ],
//       },
//     },
//   ]);

//   const data = metrics[0];

//   res.status(200).json({
//     status: "success",
//     dashboard: {
//       totalBookings: data.summary[0]?.totalBookings || 0,
//       totalRevenue: data.summary[0]?.totalRevenue || 0,

//       upcomingPickups: data.upcomingPickups[0]?.count || 0,
//       activeBookings: data.activeBookings[0]?.count || 0,
//       cancelledBookings: data.cancelledBookings[0]?.count || 0,
//       bookingStatusStats: data.bookingStatusStats,
//     },
//   });
// });

// Get the range
const getDateRange = (range) => {
  const now = new Date();
  let startDate = null;

  switch (range) {
    case "today":
      startDate = new Date(now.setHours(0, 0, 0, 0));
      break;

    case "week":
      startDate = new Date();
      startDate.setDate(startDate.getDate() - 7);
      break;

    case "month":
      startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 1);
      break;

    case "year":
      startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      break;

    case "all":
    default:
      startDate = null;
  }

  return startDate;
};

exports.getAdminBookingMetrics = catchAsync(async (req, res, next) => {
  const { range = "all" } = req.query;

  const today = new Date();
  const startDate = getDateRange(range);

  const matchStage = startDate
    ? { "vehicleDetails.createdAt": { $gte: startDate } }
    : {};

  const metrics = await vehicleBookingModel.aggregate([
    { $unwind: "$vehicleDetails" },

    // 🔹 DATE FILTER (Injected once)
    { $match: matchStage },

    {
      $facet: {
        // 🔹 OVERALL SUMMARY
        summary: [
          {
            $group: {
              _id: null,
              totalBookings: { $sum: 1 },
              totalRevenue: {
                $sum: {
                  $cond: [
                    { $ne: ["$vehicleDetails.bookingStatus", "cancelled"] },
                    "$vehicleDetails.totalPrice",
                    0,
                  ],
                },
              },
            },
          },
        ],

        // 🔹 BOOKING STATUS STATS
        bookingStatusStats: [
          {
            $group: {
              _id: "$vehicleDetails.bookingStatus",
              count: { $sum: 1 },
              revenue: {
                $sum: {
                  $cond: [
                    { $ne: ["$vehicleDetails.bookingStatus", "cancelled"] },
                    "$vehicleDetails.totalPrice",
                    0,
                  ],
                },
              },
            },
          },
        ],

        // 🔹 UPCOMING PICKUPS
        upcomingPickups: [
          {
            $match: {
              "vehicleDetails.pickupDate": { $gte: today },
              "vehicleDetails.bookingStatus": "confirmed",
            },
          },
          { $count: "count" },
        ],

        // 🔹 ACTIVE BOOKINGS
        activeBookings: [
          {
            $match: {
              "vehicleDetails.dropOffDate": { $gte: today },
              "vehicleDetails.bookingStatus": "confirmed",
            },
          },
          { $count: "count" },
        ],

        // 🔹 CANCELLED BOOKINGS
        cancelledBookings: [
          {
            $match: {
              "vehicleDetails.bookingStatus": "cancelled",
            },
          },
          { $count: "count" },
        ],
      },
    },
  ]);

  const data = metrics[0] || {};

  res.status(200).json({
    status: "success",
    range,
    data: {
      totalBookings: data.summary?.[0]?.totalBookings || 0,
      totalRevenue: data.summary?.[0]?.totalRevenue || 0,

      upcomingPickups: data.upcomingPickups?.[0]?.count || 0,
      activeBookings: data.activeBookings?.[0]?.count || 0,
      // cancelledBookings: data.cancelledBookings?.[0]?.count || 0,

      bookingStatusStats: data.bookingStatusStats || [],
    },
  });
});
