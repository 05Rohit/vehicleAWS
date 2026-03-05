const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true, // e.g. ADD_VEHICLE, UPDATE_VEHICLE
      index: true
    },

    entityType: {
      type: String,
      required: true, // VEHICLE, BOOKING, USER
      index: true
    },

    entityId: {
      type: String,
      required: true,
      index: true
    },

    performedBy: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },
      userType: {
        type: String,
        enum: ["admin", "user"],
        required: true
      },
      email: {
        type: String,
        required: true
      }
    },

    oldValue: {
      type: Object,
      default: null
    },

    newValue: {
      type: Object,
      default: null
    },

    ipAddress: {
      type: String
    },

    userAgent: {
      type: String
    }
  },
  {
    timestamps: true // createdAt, updatedAt
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);
