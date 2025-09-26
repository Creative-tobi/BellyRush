const mongoose = require("mongoose");

const buyerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "buyer" },
  OTP: { type: Number, default: null },
  otpExpired: Date,
  isVerified: { type: Boolean, default: false },
  phone: { type: String, required: true, unique: true },
  profileImage: { type: String, default: "" },

  // 🔹 Stripe integration fields
  stripeCustomerId: { type: String }, // Customer object ID in Stripe
  defaultPaymentMethod: { type: String }, // e.g. card ID
  paymentHistory: [
    {
      paymentIntentId: { type: String },
      amount: { type: Number },
      currency: { type: String, default: "USD" },
      status: { type: String }, // succeeded, pending, failed
      createdAt: { type: Date, default: Date.now },
    },
  ],

  // Optional wallet/balance system if you want to track credits in-app
  walletBalance: { type: Number, default: 0 },
});

module.exports = mongoose.model("Buyer", buyerSchema);
