const mongoose = require("mongoose");
const moment = require("moment-timezone");

moment.tz.setDefault("Asia/Kolkata");

const specificVehicleSchema = new mongoose.Schema({
  location: {
    type: String,
    default: "abc",
  },
  vehicleStatus: {
    type: Boolean,
    default: true,
  },
  vehicleNumber: {
    type: String,
    required: true,
    unique: true, // Enforce unique at application level, not DB level
  },
  vehicleMilage: {
    type: Number,
    default: null,
  },
  notAvailableReason: {
    type: String,
    // enum: ["In Repair", "Accident", "Other", "Booking"],
    default: null,
  },
  uniqueVehicleId: {
    type: Number,
  },
  bookedPeriods: [
    {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const vehicleDetailSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: null,
  },
  vehicleType: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  bookingPrice: [
    {
      range: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  specificVehicleDetails: [specificVehicleSchema], // Embedded schema

  uniqueGroupId: {
    type: Number,
    required: true,
  },
  filePath: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.Mixed },

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Pre-validation hook to generate unique IDs
vehicleDetailSchema.pre("validate", function (next) {
  if (this.isNew) {
    const currentDate = moment().format("YYYYMM");
    const currentTime = moment().format("HHmmss");
    this.uniqueGroupId = `${currentDate}${currentTime}`;
  }
  next();
});

// Pre-save hook for timestamps
vehicleDetailSchema.pre("save", function (next) {
  const istTime = moment().toDate();
  istTime.setMinutes(istTime.getMinutes() + 330); // Add 5 hours 30 minutes

  if (this.isNew) {
    this.createdAt = istTime;
  }
  this.updatedAt = istTime;

  // Update timestamps for specific vehicles
  this.specificVehicleDetails.forEach((vehicle) => {
    vehicle.updatedAt = istTime;
  });

  next();
});

const VehicleDetailModel = mongoose.model("VehiclesData", vehicleDetailSchema);
module.exports = VehicleDetailModel;
