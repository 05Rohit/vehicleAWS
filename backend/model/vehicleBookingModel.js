

const mongoose = require("mongoose");
const moment = require("moment-timezone");
moment.tz.setDefault("Asia/Kolkata");

const Counter = require("./bookingIDCounerSchema");

const bookingVehicleSchema = new mongoose.Schema(
  {
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

        bookingStatus: {
          type: String,
          enum: ["pending", "confirmed", "cancelled", "completed"],
          required: true,
        },

        pickupDate: { type: Date, required: true },
        dropOffDate: { type: Date, required: true },

        price: { type: Number, required: true },
        extraExpenditure: { type: Number, required: true },
        tax: { type: Number, required: true },
        totalPrice: { type: Number, required: true },

        damage: { type: Number, default: 0 },

        // ❗ NO unique:true here
        uniqueBookingId: {
          type: Number,
          immutable: true,
        },

        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    userDetails: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  { timestamps: true }
);

/* 🔥 CORRECT WAY TO ENFORCE UNIQUENESS */
bookingVehicleSchema.index(
  { "vehicleDetails.uniqueBookingId": 1 },
  { unique: true }
);

/* 🔥 OPTIMIZED AUTO-INCREMENT LOGIC */
bookingVehicleSchema.pre("save", async function (next) {
  if (!this.isNew) return next();

  const detailsNeedingId = this.vehicleDetails.filter(
    (detail) => !detail.uniqueBookingId
  );

  if (!detailsNeedingId.length) return next();

  const counter = await Counter.findOneAndUpdate(
    { name: "bookingId" },
    { $inc: { seq: detailsNeedingId.length } },
    { new: true, upsert: true }
  );

  let startSeq = counter.seq - detailsNeedingId.length + 1;

  for (const detail of detailsNeedingId) {
    detail.uniqueBookingId = startSeq++;
  }

  next();
});

const vehicleBookingModel = mongoose.model(
  "BookingDetail",
  bookingVehicleSchema
);

module.exports = vehicleBookingModel;
