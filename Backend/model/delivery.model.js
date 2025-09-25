const mongoose = require("mongoose");

const deliverySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "delivery" },
  OTP: { type: Number, default: null },
  otpExpired: Date,
  isVerified: { type: Boolean, default: false },
  phone: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  profileImage: { type: String, default: "" },
  currentLocation: { type: String, default: "" },
  status: { type: String, default: "available" },
  deliveryArea: { type: String, default: "" },
  earnings: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  orders: { type: Number, default: 0 },
  payout: { type: Number, default: 0 },

});

module.exports = mongoose.model("Delivery", deliverySchema);