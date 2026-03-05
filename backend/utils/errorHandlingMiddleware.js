// // errorHandler.js
// const logger = require("./logger");  // Make sure you have a logger setup
// const AppError = require("./appError");

// // Handle database errors
// const handleCastErrorDB = (err) => {
//   const message = `Invalid ${err.path}: ${err.value}.`;
//   return new AppError(message, 400);
// };

// function handleJWTError() {
//   return new AppError("Invalid token. Please log in again!", 401);
// }

// function handleJWTExpiredError() {
//   return new AppError("Your token has expired! Please log in again.", 401);
// }

// const handleDuplicateFieldsDB = (err) => {
//   const value = err.keyValue.name;
//   const message = `Duplicate field value: ${value}. Please use another value!`;
//   return new AppError(message, 400);
// };

// const handleValidationErrorDB = (err) => {
//   const errors = Object.values(err.errors).map((el) => el.message);
//   const message = `Invalid input data. ${errors.join(". ")}`;
//   return new AppError(message, 400);
// };

// const handleUnknownError = (err) => {
//   return new AppError("An unknown error occurred.", 500);
// };

// // Send errors in development
// const sendErrorDev = (err, res) => {
//   logger.error(err);
//   res.status(err.statusCode).json({
//     status: err.status,
//     error: err,
//     message: err.message,
//     stack: err.stack,
//   });
// };

// // Send errors in production
// const sendErrorProd = (err, res) => {
//   if (err.isOperational) {
//     logger.error(err);
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//     });
//   } else {
//     logger.error("ERROR 💥", err);
//     res.status(500).json({
//       status: "error",
//       message: "Something went very wrong! Please try again later.",
//     });
//   }
// };

// const errorHandlerMiddleware = (err, req, res, next) => {
//   err.statusCode = err.statusCode || 500;
//   err.status = err.status || "error";

//   if (process.env.NODEENV === "development") {
//     sendErrorDev(err, res);
//   } else if (process.env.NODEENV === "production") {
//     let error = { ...err };
//     error.message = err.message;

//     if (error.name === "CastError") error = handleCastErrorDB(error);
//     if (error.code === 11000) error = handleDuplicateFieldsDB(error);
//     if (error.name === "ValidationError") error = handleValidationErrorDB(error);
//     if (error.name === "JsonWebTokenError") error = handleJWTError();
//     if (error.name === "TokenExpiredError") error = handleJWTExpiredError();
//     else error = handleUnknownError(error); // For other unknown errors

//     sendErrorProd(error, res);
//   } else {
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//     });
//   }
// };

// module.exports = errorHandlerMiddleware;


const logger = require("./logger");
const AppError = require("./appError");

/* =======================
   DB ERROR HANDLERS
======================= */

const handleCastErrorDB = (err) =>
  new AppError(`Invalid ${err.path}: ${err.value}.`, 400);

const handleDuplicateFieldsDB = (err) => {
  const value = Object.values(err.keyValue)[0];
  return new AppError(
    `Duplicate field value: ${value}. Please use another value!`,
    400
  );
};




/* =======================
   GLOBAL ERROR HANDLER
======================= */

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
};


const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  return new AppError(`Invalid input data. ${errors.join(". ")}`, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token. Please log in again!", 401);

const handleJWTExpiredError = () =>
  new AppError("Your token has expired! Please log in again.", 401);

/* =======================
   SEND ERRORS
======================= */

// const sendErrorDev = (err, res) => {
//   logger.error(err);
//   res.status(err.statusCode).json({
//     status: err.status,
//     message: err.message,
//     stack: err.stack,
//   });
// };

// const sendErrorProd = (err, res) => {
//   if (err.isOperational) {
//     res.status(err.statusCode).json({
//       status: err.status,
//       message: err.message,
//     });
//   } else {
//     logger.error("UNEXPECTED ERROR 💥", err);
//     res.status(500).json({
//       status: "error",
//       message: "Something went very wrong! Please try again later.",
//     });
//   }
// };

/* =======================
   DEV ERROR SENDER
======================= */

const sendErrorDev = (err, res) => {
  // ✅ LOG FULL ERROR (console + file)
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    isOperational: err.isOperational,
  });

  // ✅ SEND FULL ERROR TO CLIENT
  res.status(err.statusCode || 500).json({
    status: err.status || "error",
    message: err.message,
    stack: err.stack,
  });
};

/* =======================
   PROD ERROR SENDER
======================= */

const sendErrorProd = (err, res) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    logger.error("UNEXPECTED ERROR 💥", err);

    res.status(500).json({
      status: "error",
      message: "Something went very wrong!",
    });
  }
};

/* =======================
   GLOBAL HANDLER
======================= */

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  }

  if (process.env.NODE_ENV === "production") {
    let error = err;

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError") error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
