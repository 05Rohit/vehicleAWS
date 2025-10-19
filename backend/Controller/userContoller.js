// const {MongoClient,ObjectId}=reqiure("mongodb")
const userModel = require("../model/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // Add at the top if not already imported
const { sendMailToQueue } = require("../NotificationServices/MessageService");
const {
  sendNotification,
} = require("../utils/notificationThroughMessageBroker");

const jwtSecretKey = process.env.JWT_SECRET_KEY;
const FRONTENDURL = process.env.FRONTEND;

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
    type
  );

  res.status(201).json("User is created");
});

exports.loginUser = catchAsync(async (req, res, next) => {
  const start = Date.now();
  const { userId, password } = req.body;
  if (!userId || !password) {
    return next(new AppError("Fill in all data", 400));
  }

  const query = isNaN(userId) ? { email: userId } : { phoneNumber: userId };

  const userExists = await userModel.findOne(query);

  if (!userExists) {
    return next(new AppError("Invalid credentials", 400));
  }

  const isPasswordMatch = await bcrypt.compare(password, userExists.password);

  if (!isPasswordMatch) {
    return next(new AppError("Invalid credentials", 400));
  }

  const token = await userExists.generateAuthToken();

  res.cookie("jwttoken", token, {
    expires: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    sameSite: "Lax",
    httpOnly: true,
    secure: true, // ✅ Must be true on Render (uses HTTPS)
    sameSite: "None", // ✅ Required for cross-origin cookies
  });

  const end = Date.now();
  // console.log(`Login took ${end - start} ms`);

  res.status(200).json({
    user: {
      name: userExists.name,
      email: userExists.email,
      phoneNumber: userExists.phoneNumber,
      userType: userExists.userType,
      userImage: userExists.filePath,
      id: userExists._id,
    },
    token,
  });
});

exports.updateUserDetails = catchAsync(async (req, res, next) => {
  const { name, phoneNumber, drivingLicenceNumber, userType } = req.body;

  const userId = req.user._id;

  // Check if the user ID is provided
  if (!userId) {
    return next(new AppError("Login is required ", 400));
  }

  // Create an object with the fields to be updated
  const updateFields = {};
  if (name) updateFields.name = name;
  if (phoneNumber) updateFields.phoneNumber = phoneNumber;
  if (drivingLicenceNumber)
    updateFields.drivingLicenceNumber = drivingLicenceNumber;
  if (userType) updateFields.userType = userType;

  // Find the user by ID and update the fields
  const updatedUser = await userModel.findByIdAndUpdate(
    userId,
    { $set: updateFields },
    { new: true, runValidators: true }
  );

  // Check if the user was found and updated
  if (!updatedUser) {
    return next(new AppError("User Not Found ", 400));
  }

  res
    .status(200)
    .json({ message: "User details updated successfully", user: updatedUser });
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { oldPassword, newPassword, confirmNewPassword } = req.body;

  const userId = req.user._id;

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
    userExists.password
  );
  if (!isPasswordMatch) {
    return next(new AppError("Old Password is incorrect ", 400));
  }

  if (newPassword !== confirmNewPassword) {
    return next(
      new AppError("New password is not match Confirm password ", 400)
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

exports.addAlternateMobileNumber = catchAsync(async (req, res) => {
  const { altMobileNumber } = req.body;

  const userId = req.user._id;

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
    { new: true, useFindAndModify: false }
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

exports.downloadFile = catchAsync(async (req, res, next) => {
  const userDetails = await userModel.findById(req.params.id);
  if (!userDetails) {
    return next(new AppError("user Not found", 404));
  }
  const filePath = userDetails.filePath;
  res.download(filePath);
});

exports.logoutUser = catchAsync(async (req, res, next) => {
  // Clear the jwttoken cookie by setting it to an expired date
  res.cookie("jwttoken", "", {
    expires: new Date(0), // Setting the expiration date to 0 to expire the cookie
    httpOnly: true, // Make sure it's only accessible via HTTP requests, not JavaScript
  });
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

exports.checkAuth = catchAsync(async (req, res, next) => {
  const token = req.cookies.jwttoken;
  if (!token) {
    return;
  }
  try {
    const decoded = jwt.verify(token, jwtSecretKey);
    const currentUser = await userModel.findOne({ email: decoded.email });
    if (!currentUser) {
      return next(new AppError("UnAuthenticated action ,User not found", 400));
    }
    const expirationTime = Date.now() + 60 * 60 * 1000; // Example expiration time
    res.status(200).json({
      status: "success",
      expiredAt: { expirationTime },
      data: {
        user: {
          name: currentUser.name,
          userType: currentUser.userType,
          email: currentUser.email,
          phoneNumber: currentUser.phoneNumber,
          userImage: currentUser.userImage,
          id: currentUser._id,
        },
      },
    });
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
});

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
    email
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

  const NotificationMessage = `Your Queries send to Bike Raider Team`;
  const NotificationMessageForAdmin = `New Queries are there`;
  const typeOne = "user";
  const typeTwo = "admin";

  res.status(200).json({
    status: "success",
    message: `Message sent successfully`,
  });
});

// exports.handleContactUsFunction = catchAsync(async (req, res, next) => {
//   const { name, email, message } = req.body;
//   await sendMailToQueue({
//     subject: "Welcome to Bike Rider",
//     to: email,
//     EXCHANGE: "emailExchange",
//     ROUTING_KEY: "task.contactus",
//     templateData: {
//       name: name,
//       message: message,
//       email: email,
//     },
//   });

//   res.status(200).json({
//     status: "success",
//     message: `Message sent successfully`,
//   });
// });

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
  // console.log("Notifications sent to all Admin users");
  res.status(200).json({
    success: true,
    message: "Notifications sent to all Admin users",
  });
});
