const express = require("express");
const upload = require("../utils/multer");
const rateLimit = require("express-rate-limit");

const userController = require("../Controller/userContoller"); // Ensure correct spelling of 'userController'
const verifyToken = require("../utils/verifyToken.js");
const router = express.Router();
const { userUpload, singleUserUpload } = require("../utils/multer.js");
const restrictTo = require("../utils/restrictTo.js");


// Rate limiter middleware
const createUserLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // Limit each IP to 10 create user requests per `window` (here, per minute)
  message:
    "Too many accounts created from this IP, please try again after a minute",
});

// Apply the rate limiter to the create user route
router.post(
  "/createuser",
  createUserLimiter,
  singleUserUpload,
  userController.CreateUser
);
// User login route
router.post("/login", userController.loginUser);
// File download route
router.post("/download/:id", verifyToken, userController.downloadFile);

// Change password
router.patch("/changepassword", verifyToken, userController.changePassword);
// Add alternate mobile number
router.patch(
  "/addaltmob",
  verifyToken,
  userController.addAlternateMobileNumber
);
// Logout user
router.post("/logout", verifyToken, userController.logoutUser);
// Protected & check auth route example
router.post("/protectedroute", userController.protectedRoute);
router.post("/checkAuth", verifyToken, userController.checkAuth);

router.post("/ContactUs", userController.handleContactUsFunction);
// Get and Update user details
router.get("/myprofile", verifyToken, userController.getMyDetails);
router.patch(
  "/updateuserdetails",
  verifyToken,
  userController.updateUserDetails
);
// Forgot password and reset password
router.post(
  "/forgotPasswordemail",
  userController.handleForgotPasswordSendEmail
);
router.post("/resetpassword", userController.resetPassword);
// Send notification to all admin users
router.post("/sendnotification", userController.sendNotificationToAllAdmins);
router.post("/getalladmin", userController.getAdminUsers);
// OTP related routes
router.post("/sendOtp", userController.sendOtpToEmail);
router.post("/verifyOtp", userController.verifyOtp);
// Refresh token route
router.post("/refresh-token", userController.refreshTokenHandler);

// Upload driving licence document
router.post(
  "/uploadProfilePhoto",
  verifyToken,
  singleUserUpload,
  userController.uploadUserProfilePhoto
);
// Upload driving licence document
router.post(
  "/uploadDrivingLicence",
  verifyToken,
  singleUserUpload,
  userController.uploaddrivingLicenceDocument
);
router.get(
  "/downloadDrivingLicence",
  verifyToken,
  userController.downloadDrivingLicence
);

// Fetch driving licence document List
router.get(
  "/fetchDLList",
  verifyToken,
  restrictTo("admin"),
  userController.notVerifiedDrivingLicenceList
);
// Verify driving licence document
router.patch(
  "/verifyDrivingLicenceDocument",
  verifyToken,
    restrictTo("admin"),
  userController.drivingLiceceDocumentVerification
);

// Fetch audit logs
router.get(
  "/getAuditLogs",
  // verifyToken,
  //   restrictTo("admin"),
  userController.getAuditLogs
);
router.get(
  "/auditlogsByID/:id",
  // verifyToken,
  //   restrictTo("admin"),
  userController.getAuditLogById
);

module.exports = router;
