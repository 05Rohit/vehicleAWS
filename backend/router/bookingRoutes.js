const express = require("express");
const bookingController = require("../Controller/vehicleBookingController");
const router = express.Router();
const verifyToken = require("../utils/verifyToken");
const restrictTo = require("../utils/restrictTo");

router.post("/addbooking", verifyToken, bookingController.createBookingDetails);
router.get(
  "/getBookingdetails",
  verifyToken,
  bookingController.getBookingDetails
);
router.patch(
  "/updateBookingDetails",
  verifyToken,
  bookingController.updateBookingDetails
);
router.patch(
  "/rescheduleBooking",
  verifyToken,
  bookingController.rescheduleBooking
);
router.patch(
  "/completeBooking",
  verifyToken,
  restrictTo("admin"),
  bookingController.updateBookingCompleted
);

module.exports = router;
