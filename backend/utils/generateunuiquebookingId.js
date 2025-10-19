const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Kolkata");

const generateUniqueBookingId = () => {
  const timestamp = moment().format("YYYYMMDDHHmmssSSS");
  const random = Math.floor(Math.random() * 1000); // 3-digit randomness
  return `${timestamp}${random}`;
};

module.exports = generateUniqueBookingId;
