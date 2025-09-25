const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: "delivery" },
  OTP: { type: Number, default: null },
  otpExpired: Date,
  isVerified: { type: Boolean, default: false },
  phone: { type: String, required: true, unique: true },
  profileImage: { type: String, default: "" },
  status: { type: String, default: "available" },
  deliveryArea: { type: String, default: "" },
  earnings: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  orders: { type: Number, default: 0 },
  payout: { type: Number, default: 0 },

  // GeoJSON for current location
  currentLocation: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
    formattedAddress: { type: String, default: "" },
  },
});

// Add geospatial index
deliverySchema.index({ currentLocation: "2dsphere" });

module.exports = mongoose.model("Delivery", deliverySchema);
