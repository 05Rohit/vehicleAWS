const mongoose = require("mongoose");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Kolkata");

const bookingVehicleSchema = new mongoose.Schema({
  userEmail: {
    type: String,
    required: true,
  },
  vehicleDetails: [
    {
      name: { type: String, required: true },
      model: { type: String, required: true },
      description: { type: String, default: null },
      vehicleType: { type: String, required: true },
      uniqueVehicleId: { type: Number, required: true },
      vehicleStatus: { type: Boolean, required: true },
      location: { type: String, required: true },
      vehicleNumber: { type: String, required: true },
      vehicleMilage: { type: Number, default: null },
      filePath: [{ type: String }],
      bookingStatus: { type: String, required: true },
      pickupDate: { type: Date, required: true },
      dropOffDate: { type: Date, required: true },
      price: { type: Number, required: true },
      extraExpenditure: { type: Number, required: true },
      tax: { type: Number, required: true },
      totalPrice: { type: Number, required: true },
      damage: {
        type: Number,
        default: 0,
      },
      uniqueBookingId: {
        type: Number,
        unique: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  userDetails: { type: mongoose.Schema.Types.Mixed },
});

const vehicleBookingModel = mongoose.model(
  "BookingDetail",
  bookingVehicleSchema
);

module.exports = vehicleBookingModel;
