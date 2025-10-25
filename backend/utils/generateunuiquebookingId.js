const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Kolkata");

let dailyCounter = 0;
let lastDate = moment().format("YYMMDD");

const generateUniqueBookingId = () => {
  const today = moment().format("YYMMDD");

  // Reset counter if new day
  if (today !== lastDate) {
    dailyCounter = 0;
    lastDate = today;
  }

  dailyCounter += 1;
  const counterPadded = String(dailyCounter).padStart(3, "0");

  return `${today}${counterPadded}`;
};

module.exports = generateUniqueBookingId;
