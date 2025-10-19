const express = require("express");
const upload = require("../utils/multer");
const rateLimit = require("express-rate-limit");

const userController = require("../Controller/userContoller"); // Ensure correct spelling of 'userController'
const verifyToken = require("../utils/verifyToken.js");
const router = express.Router();

// Rate limiter middleware
const createUserLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200, // Limit each IP to 10 create user requests per `window` (here, per minute)
  message: "Too many accounts created from this IP, please try again after a minute",
});

// Apply the rate limiter to the create user route
router.post("/createuser", createUserLimiter, upload.single('file'), userController.CreateUser);
router.post("/login", userController.loginUser);
router.post("/download/:id", verifyToken, userController.downloadFile);
router.patch("/updateuserdetails", verifyToken, userController.updateUserDetails);
router.patch("/changepassword", verifyToken, userController.changePassword);
router.patch("/addaltmob", verifyToken, userController.addAlternateMobileNumber);
router.post("/logout", userController.logoutUser);
router.post("/protectedroute", userController.protectedRoute);
router.post("/checkAuth", userController.checkAuth);

router.post("/ContactUs", userController.handleContactUsFunction);
router.post("/forgotPasswordemail", userController.handleForgotPasswordSendEmail);
router.post("/resetpassword", userController.resetPassword);
router.post("/sendnotification", userController.sendNotificationToAllAdmins);
router.post("/getalladmin", userController.getAdminUsers);

module.exports = router;