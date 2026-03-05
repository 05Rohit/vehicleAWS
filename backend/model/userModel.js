const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwtSecretKey = process.env.JWTSECRETKEY;

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,

      required: [true, "Name is required"],
    },
    email: {
      type: String,
      unique: true,
      required: [true, "Email address is required"],
      trim: true,

      lowercase: true,
      validate: {
        validator: function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
    },
    password: {
      type: String,
      trim: true,
      required: [true, "Password is required"],
      minlength: 6,
    },
    phoneNumber: {
      type: String,
      trim: true,

      required: [true, "Phone number is required"],
      validate: {
        validator: function (v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid 10-digit phone number!`,
      },
    },
    drivingLicenceNumber: {
      type: String,
      unique:true,
      trim: true,
    },
    isDLverify: {
      type: Boolean,
      default:false
    },
    drivingLicenceFilePath: {
      type: [String], // 👈 array
      default: [],
    },
    currentLocation: {
      type: String,
      trim: true,
      default: "Bengaluru",
    },
    userType: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
      trim: true,
    },
    altMobileNumber: {
      type: String,
      trim: true,

      default: null,
      validate: {
        validator: function (v) {
          if (!v) return true;
          return /^[0-9]{10}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid 10-digit alternate phone number!`,
      },
    },
    filePath: {
      type: String,
      default: null,
    },
    resetPasswordToken: {
      type: String,
      default: null,
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    otp: {
      type: Number,
      default: null,
    },
    otpExpiry: {
      type: Date,
      default: null,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    bookingInfo: {
      totalBooking: {
        type: Number,
        default: 0,
      },
      cancelbooking: {
        type: Number,
        default: 0,
      },

      activeBooking: {
        type: Number,
        default: 0,
      },
      moneySpend: {
        type: Number,
        default: 0,
      },
    },
  },
  { timestamps: true }
);
UserSchema.index({ isDLverify: 1, createdAt: -1 });


// ✅ Pre-save hook to hash password
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ✅ Instance method to generate JWT token
UserSchema.methods.generateAuthToken = function () {
  return jwt.sign(
    {
      _id: this._id.toString(),
      userType: this.userType,
      name: this.name,
      email: this.email,
    },
    jwtSecretKey,
    { expiresIn: "1d" }
  );
};

// ✅ Method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const UserModel = mongoose.model("User", UserSchema);
module.exports = UserModel;
