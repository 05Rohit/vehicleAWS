const AppError = require("./appError");

const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.userType)) {
      return next(
        new AppError(
          "Unauthorized access: admin privileges required",
          403
        )
      );
    }
    next();
  };
};

module.exports = restrictTo;
