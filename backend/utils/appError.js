class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true; // Marks the error as operational, so it's not logged as a server crash
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
