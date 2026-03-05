const express = require("express");
const router = express.Router();
const ReportController = require("../Controller/reportsController.js");
const restrictTo = require("../utils/restrictTo.js");
const verifyToken = require("../utils/verifyToken.js");

router.get(
  "/allbookingdata",
  verifyToken,
  restrictTo("admin"),
  ReportController.getBookingData
);
router.get(
  "/allvehicledata",
  verifyToken,
  restrictTo("admin"),
  ReportController.getAllVehicleListData
);
router.get(
  "/alluserdata",
  verifyToken,
  restrictTo("admin"),
  ReportController.getAllUserListData
);
router.get(
  "/allNotAvailableVehicle",
  verifyToken,
  restrictTo("admin"),
  ReportController.getAllNotAvailableVehicleListData
);
router.get(
  "/allAvailableVehicle",
  verifyToken,
  restrictTo("admin"),
  ReportController.getAllAvailableVehicleListData
);
router.get(
  "/getVehicleType",
  verifyToken,
  restrictTo("admin"),
  ReportController.getVehicleTypeCount
);
router.get(
  "/bookingMartix",
  verifyToken,
  restrictTo("admin"),
  ReportController.getAdminBookingMetrics
);

module.exports = router;
