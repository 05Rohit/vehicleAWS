const jwt = require('jsonwebtoken');
const User = require('../model/userModel'); // Adjust the path to your user model
const jwtSecretKey = process.env.JWT_SECRET_KEY;


const verifyToken = async (req, res, next) => {
  // Get the token directly from cookies
  const token = req.cookies.jwttoken; // Assuming the cookie name is 'jwttoken'

  if (!token) {
    return res.status(401).json({ error: 'No token provided, access denied' });
  }

  try {
    // Decode the token
    const decoded = jwt.verify(token, jwtSecretKey); // Use your JWT secret key here

    // Attach the decoded user info to the request object
    req.user = decoded;


    // Optionally, you can verify the user exists in the database (if needed)
    const user = await User.findById(req.user._id);


    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Proceed to the next middleware or route handler
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

module.exports = verifyToken;
