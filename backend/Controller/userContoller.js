// const {MongoClient,ObjectId}=reqiure("mongodb")
const userModel = require("../model/userModel");
const auditLogSchema = require("../model/auditLogSchema");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // Add at the top if not already imported
const { sendMailToQueue } = require("../NotificationServices/MessageService");
const {
  sendNotification,
} = require("../utils/notificationThroughMessageBroker");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("./../utils/generateToken");
const UserModel = require("../model/userModel");
const logger = require("../utils/logger");
// const logger = require("../utils/logger");

const jwtSecretKey = process.env.JWTSECRETKEY;
const FRONTENDURL = process.env.FRONTEND;

// Create new user or Register user in the application
exports.CreateUser = catchAsync(async (req, res, next) => {
  const {
    name,
    email,
    password,
    confirmPassword,
    phoneNumber,
    drivingLicenceNumber,
    userType,
  } = req.body;

  const Password = password.trim();
  const filePath = req.file ? req.file.path : null;

  if (!name || !email || !password || !confirmPassword || !phoneNumber) {
    return next(new AppError("Fill all required data", 400));
  }

  const userExists = await userModel.findOne({ email });
  if (userExists) {
    return res.status(400).json({ error: "User already exists" });
  }

  if (password !== confirmPassword) {
    return next(new AppError("Confirm password does not match", 400));
  }

  const userNewData = new userModel({
    name,
    email,
    password,
    confirmPassword,
    phoneNumber,
    drivingLicenceNumber,
    userType,
    filePath,
  });

  await userNewData.save();

  // Send welcome email
  await sendMailToQueue({
    subject: "Welcome to Bike Rider",
    to: userNewData.email,
    EXCHANGE: "emailExchange",
    ROUTING_KEY: "task.usercreated",
    templateData: {
      name: userNewData.name,
      password: Password,
      email: userNewData.email,
    },
  });

  // Send only ONE notification
  const message = `Welcome to Bike Rider, ${userNewData.name}! Your account has been created successfully`;
  const title = "Welcome to Go Gear!";
  const type = "general";

  await sendNotification(
    userNewData._id,
    userNewData.userType,
    message,
    title,
    type,
  );

  res.status(201).json("User is created");
});

// send OTP for email verification while user Login
exports.sendOtpToEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError("Please provide email", 400));
  }
  const userExists = await userModel.findOne({ email: email });
  if (!userExists) {
    return next(new AppError("User not found", 404));
  }
  const otp = Math.floor(100000 + Math.random() * 900000);
  userExists.otp = otp;
  userExists.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes expiry
  userExists.isVerified = false;
  await userExists.save();
  await sendMailToQueue({
    subject: "Your OTP for Go Gear",
    to: email,
    EXCHANGE: "emailExchange",
    ROUTING_KEY: "task.sendotp",
    templateData: {
      name: userExists.name,
      email: email,
      otp: otp,
      experyTime: "5 minutes",
      frontendUrl: `${FRONTENDURL}/verify-otp`,
    },
  });
  res.status(200).json({
    status: "success",
    message: `OTP sent to ${email} successfully`,
  });
});

// login users  with cookie
exports.loginUser = async (req, res, next) => {
  const { userId, password } = req.body;

  const query = isNaN(userId) ? { email: userId } : { phoneNumber: userId };
  const user = await userModel.findOne(query);

  if (!user) return res.status(400).json({ message: "Invalid credentials" });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Save refresh token in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      userType: user.userType,
    },
    accessToken,
  });
};

// Refresh Token Handler
exports.refreshTokenHandler = async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token)
    return res.status(401).json({ error: "No refresh token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await userModel.findById(decoded.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    return res.json({
      success: true,
      accessToken: newAccessToken,
    });
  } catch (err) {
    return res.status(403).json({ error: "Invalid refresh token" });
  }
};

// Verify OTP for email verification while user Login through OTP verification
// exports.verifyOtp = catchAsync(async (req, res, next) => {
//   const { email, otp } = req.body;
//   // logger.info(`🔍 Verifying OTP for email: ${email}, with OTP: ${otp}`);

//   if (!email || !otp) {
//     return next(new AppError("Please provide email and OTP", 400));
//   }
//   const user = await userModel.findOne({ email: email });
//   if (!user) {
//     return next(new AppError("User not found", 404));
//   }
//   if (user.otp !== otp) {
//     return next(new AppError("Invalid OTP", 400));
//   }
//   if (user.otpExpiry < Date.now()) {
//     return next(new AppError("OTP has expired", 400));
//   }
//   // OTP is valid, proceed with desired action

//   if (user.otp == otp) {
//     user.otp = null;
//     user.otpExpiry = null;
//     user.isVerified = true;
//     await user.save();
//   }
//   res.status(200).json({
//     status: "success",
//     message: "OTP verified successfully",
//   });
// });

exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new AppError("Please provide email and OTP", 400));
  }

  const user = await userModel.findOne({ email });
  if (!user) {
    return next(new AppError("User not found", 404));
  }

  if (user.otp !== otp) {
    return next(new AppError("Invalid OTP", 400));
  }

  if (user.otpExpiry < Date.now()) {
    return next(new AppError("OTP has expired", 400));
  }

  /* ================= OTP VALID ================= */

  // Clear OTP fields
  user.otp = null;
  user.otpExpiry = null;
  user.isVerified = true;
  await user.save();

  /* ================= LOGIN LOGIC ================= */

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      userType: user.userType,
    },
    accessToken,
  });
});

// This function give user details for My Profile
exports.getMyDetails = catchAsync(async (req, res, next) => {
  const id = req.user?.id;

  if (!id) {
    return next(new AppError("Invalid Login", 400));
  }

  // const userDetails = await UserModel.findById({ _id: id });
  const userDetails = await UserModel.findById(id).select(
    "name email phoneNumber userType altMobileNumber filePath bookingInfo drivingLicenceNumber drivingLicenceFilePath isDLverify currentLocation isDLverify",
  );

  res.status(200).json({ message: "Success", user: userDetails });
});
// Update user details like name , phone number , driving licence number , etc
exports.updateUserDetails = catchAsync(async (req, res, next) => {
  const { name, drivingLicenceNumber, altMobileNumber, currentLocation } =
    req.body;

  const userId = req.user.id;
  // Check if the user ID is provided
  if (!userId) {
    return next(new AppError("Login is required ", 400));
  }

  // Create an object with the fields to be updated
  const updateFields = {};
  if (name) updateFields.name = name.trim();
  if (drivingLicenceNumber)
    updateFields.drivingLicenceNumber = drivingLicenceNumber.trim();
  if (altMobileNumber !== undefined) {
    const mobileStr = String(altMobileNumber);

    if (!/^\d{10}$/.test(mobileStr)) {
      return next(
        new AppError("Alternate mobile number must be exactly 10 digits", 400),
      );
    }

    updateFields.altMobileNumber = mobileStr;
  }
  if (currentLocation) updateFields.currentLocation = currentLocation.trim();

  // Find the user by ID and update the fields
  const updatedUser = await userModel.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true },
  );

  // Check if the user was found and updated
  if (!updatedUser) {
    return next(new AppError("User Not Found ", 400));
  }

  res
    .status(200)
    .json({ message: "User details updated successfully", user: updatedUser });
});

/* ======== Upload the driving licence of the user ======*/
exports.uploaddrivingLicenceDocument = catchAsync(async (req, res, next) => {
  const userID = req.user?.id;

  // ❌ Unauthorized
  if (!userID) {
    return next(new AppError("User is not authorized", 401));
  }

  // ✅ Multer single upload → req.file
  if (!req.file) {
    return next(new AppError("Provide the Driving License Image", 400));
  }

  const filePath = req.file.path; // Cloudinary URL or local path

  // ✅ Update user
  const updatedUser = await UserModel.findByIdAndUpdate(
    userID,
    {
      $set: {
        drivingLicenceFilePath: filePath, // string (recommended)
        isDLverify: false,
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  // ❌ User not found
  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  // ✅ Success
  res.status(200).json({
    status: "success",
    message: "Driving license uploaded successfully",
    data: {
      drivingLicenceFilePath: updatedUser.drivingLicenceFilePath,
      isDLverify: updatedUser.isDLverify,
    },
  });
});
exports.uploadUserProfilePhoto = catchAsync(async (req, res, next) => {
  const userID = req.user?.id;

  // ❌ Unauthorized
  if (!userID) {
    return next(new AppError("User is not authorized", 401));
  }
  console.log("213456", userID);

  // ✅ Multer single upload → req.file
  if (!req.file) {
    return next(new AppError("Provide the Driving License Image", 400));
  }

  const UserfilePath = req.file.path; // Cloudinary URL or local path

  // ✅ Update user
  const updatedUser = await UserModel.findByIdAndUpdate(
    userID,
    {
      $set: {
        filePath: UserfilePath, // string (recommended)
      },
    },
    {
      new: true,
      runValidators: true,
    },
  );

  // ❌ User not found
  if (!updatedUser) {
    return next(new AppError("User not found", 404));
  }

  // ✅ Success
  res.status(200).json({
    status: "success",
    message: "Profile Photo uploaded successfully",
  });
});

/* ========== Download driving licence document =========*/
exports.downloadDrivingLicence = async (req, res, next) => {
  const user = await UserModel.findById(req.user.id);

  console.log("User driving licence file path:", user?.drivingLicenceFilePath);

  if (!user?.drivingLicenceFilePath) {
    return next(new AppError("Document not found", 404));
  }

  return res.json({
    fileUrl: user.drivingLicenceFilePath[0],
  });
};

/* ========== Driving licence document verification by admin =========*/
exports.drivingLiceceDocumentVerification = catchAsync(
  async (req, res, next) => {
    const { userID } = req.body;
    // ✅ Update user document
    const isUserExist = await UserModel.findByIdAndUpdate(
      userID,
      {
        $set: {
          isDLverify: true,
        },
      },
      { strict: false },
    );

    // ❌ User not found
    if (!isUserExist) {
      return next(new AppError("User not found", 404));
    }

    // ✅ Success response
    res.status(200).json({
      status: "success",
      message: "Driving license verified successfully",
    });
  },
);

exports.notVerifiedDrivingLicenceList = catchAsync(async (req, res, next) => {
  const dataList = await userModel.find(
    { isDLverify: false },
    {
      name: 1,
      email: 1,
      drivingLicenceNumber: 1,
      // dlPhoto: 1,
      isDLverify: 1,
      drivingLicenceFilePath: 1,
      phoneNumber: 1,
      altMobileNumber: 1,
      filePath: 1,
    },
  );

  if (!dataList || dataList.length === 0) {
    return res.status(200).json({
      status: "success",
      message: "No data found",
      data: [],
    });
  }

  res.status(200).json({
    status: "success",
    message: "Fetch all data",
    data: dataList,
  });
});

// Change user password
exports.changePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  const userId = req.user.id;

  if (!userId) {
    return next(new AppError("Login First ", 400));
  }
  if (!oldPassword) {
    return next(new AppError("Old Password is required ", 400));
  }
  if (!newPassword) {
    return next(new AppError("Please enter new password ", 400));
  }
  if (!confirmNewPassword) {
    return next(new AppError("please Enter Confirm Password", 400));
  }

  const userExists = await userModel.findById(userId);
  if (!userExists) {
    return next(new AppError("Invalid credentials ", 400));
  }

  const isPasswordMatch = await bcrypt.compare(
    oldPassword,
    userExists.password,
  );
  if (!isPasswordMatch) {
    return next(new AppError("Old Password is incorrect ", 400));
  }

  if (newPassword !== confirmNewPassword) {
    return next(
      new AppError("New password is not match Confirm password ", 400),
    );
  }

  userExists.password = newPassword;
  userExists.confirmPassword = confirmNewPassword;

  await userExists.save();
  await sendMailToQueue({
    subject: "Welcome to Bike Rider",
    to: userExists.email,
    EXCHANGE: "emailExchange",
    ROUTING_KEY: "task.userPasswordChanged",
    templateData: {
      name: userExists.name,
      password: newPassword,
      email: userExists.email,
    },
  });

  const message = `Your account password has been changed successfully.`;
  const type = "update";
  const title = "Account Password Update";

  await sendNotification(userId, "user", message, title, type);

  res
    .status(200)
    .json({ message: "Password updated successfully", user: userExists });
});

// Add alternate mobile number for user
exports.addAlternateMobileNumber = catchAsync(async (req, res) => {
  const { altMobileNumber } = req.body;

  const userId = req.user.id;

  // Validate input
  if (!altMobileNumber) {
    return next(new AppError("Provide Alternate number ", 400));
  }
  if (!userId) {
    return next(new AppError("Invalid credential ", 400));
  }

  // Update user's alternate mobile number
  const updatedUser = await userModel.findByIdAndUpdate(
    userId,
    { $set: { altMobileNumber: altMobileNumber } },
    { new: true, useFindAndModify: false },
  );

  // Handle case where user is not found
  if (!updatedUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const message = `Alternative Mobile number added successfully.`;
  const type = "update";
  const title = "Account mobile number Update";

  await sendNotification(userId, "user", message, type, title);

  // Send success response
  res.status(200).json({
    message: "Alternate mobile number added successfully",
    data: updatedUser,
  });
});

// Download user file like user Images
exports.downloadFile = catchAsync(async (req, res, next) => {
  const userDetails = await userModel.findById(req.params.id);
  if (!userDetails) {
    return next(new AppError("user Not found", 404));
  }
  const filePath = userDetails.filePath;
  res.download(filePath);
});

// Logout user and clear refresh token cookie
exports.logoutUser = catchAsync(async (req, res, next) => {
  const UserId = req.user.id;

  await userModel.findByIdAndUpdate(UserId, {
    $set: {
      resetPasswordToken: null,
      resetPasswordExpires: null,
      otp: null,
      otpExpiry: null,
      isVerified: false,
    },
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: true, // ✅ Must be true on Render (uses HTTPS)
    sameSite: "None", // ✅ Required for cross-origin cookies
  });

  // logger.info(`🔍 Verifying OTP for email: ${data}`);

  // Respond with a success message
  res.json({ message: "Logged out successfully" });
});

exports.protectedRoute = catchAsync(async (req, res, next) => {
  // Validate JWT token
  const token = req.cookies.jwttoken;

  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }
});

// Check authentication status and return user info if authenticated

exports.checkAuth = catchAsync(async (req, res, next) => {
  // logger.info("User from token:", req.user);

  if (!req.user) {
    return res.status(401).json({ status: "fail", error: "Unauthorized" });
  }

  res.status(200).json({
    status: "success",
    data: {
      user: req.user, // Use the user object already in token
    },
  });
});

// Handle send forgot password email with reset link
exports.handleForgotPasswordSendEmail = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError("Please provide email", 400));
  }
  const userExists = await userModel.findOne({ email: email });
  if (!userExists) {
    return next(new AppError("User not found", 404));
  }

  // Generate a reset token
  const resetToken = crypto.randomBytes(32).toString("hex");
  const resetTokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour expiry

  //Save token and expiry to user
  userExists.resetPasswordToken = resetToken;
  userExists.resetPasswordExpires = resetTokenExpiry;
  await userExists.save();

  //Create reset link (replace with your frontend URL)
  const resetLink = `${FRONTENDURL}/reset-password?token=${resetToken}&email=${encodeURIComponent(
    email,
  )}`;

  // 4. Send email with reset link
  await sendMailToQueue({
    subject: "Reset Your Bike Rider Password",
    to: email,
    EXCHANGE: "emailExchange",
    ROUTING_KEY: "task.forgotPassword",
    templateData: {
      name: userExists.name,
      email: email,
      resetLink: resetLink,
    },
  });

  res.status(200).json({
    status: "success",
    message: `Reset link sent to ${email} successfully`,
  });
});

// Reset user password using the token from email
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { token, email, password, confirmPassword } = req.body;

  if (!token || !email || !password || !confirmPassword) {
    return next(new AppError("All fields are required", 400));
  }

  // Find user by email and check token and expiry
  const user = await userModel.findOne({
    email: email,
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }, // Token not expired
  });

  if (!user) {
    return next(new AppError("Invalid or expired reset token", 400));
  }

  if (password !== confirmPassword) {
    return next(new AppError("Passwords do not match", 400));
  }

  // Set new password and clear reset token fields
  user.password = password;
  user.confirmPassword = confirmPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({
    status: "success",
    message: "Password has been reset successfully. Please login.",
  });
});

// Handle contact us form submission and send email to support team
exports.handleContactUsFunction = catchAsync(async (req, res, next) => {
  const { name, email, message } = req.body;
  await sendMailToQueue({
    subject: "Welcome to Bike Rider",
    to: email,
    EXCHANGE: "emailExchange",
    ROUTING_KEY: "task.contactus",
    templateData: {
      name: name,
      message: message,
      email: email,
    },
  });

  res.status(200).json({
    status: "success",
    message: `Message sent successfully`,
  });
});

// Get all admin users
exports.getAdminUsers = catchAsync(async (req, res) => {
  const admins = await userModel.find({ userType: "admin" });
  res.status(200).json({ admins });
});

// Send notification to all admin users
exports.sendNotificationToAllAdmins = catchAsync(async (req, res, next) => {
  const { message } = req.body;
  if (!message) {
    return next(new AppError("Message is required", 400));
  }
  const admins = await userModel.find({ userType: "admin" });

  const title = "All Admin Message";
  const type = "general";

  for (const admin of admins) {
    sendNotification(admin._id, admin.userType, message, title, type);
  }
  res.status(200).json({
    success: true,
    message: "Notifications sent to all Admin users",
  });
});

// Get audit logs for admin users
exports.getAuditLogs = catchAsync(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const skip = (page - 1) * limit;

  const totalCount = await auditLogSchema.countDocuments();

  const logs = await auditLogSchema
    .find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select("action entityType entityId performedBy createdAt")
    .populate("performedBy.userId", "name email");

  res.status(200).json({
    status: "success",
    data: logs,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalCount / limit),
      totalRecords: totalCount,
    },
  });
});


// Get specific audit log by ID for admin users
exports.getAuditLogById = catchAsync(async (req, res, next) => {
  const log = await auditLogSchema
    .findById(req.params.id)
    .populate("performedBy.userId", "name email");

  if (!log) {
    return next(new AppError("Audit log not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: log,
  });
});
