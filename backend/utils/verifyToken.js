const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const logger = require("./logger");

const verifyToken = async (req, res, next) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "No token provided, access denied" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    req.user = decoded;

    const user = await User.findById(decoded.id);

    if (!user) return res.status(401).json({ error: "User not found" });


    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(403).json({ error: "Token expired", expired: true });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

module.exports = verifyToken;

