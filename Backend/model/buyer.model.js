const mongoose = require("mongoose");

const buyerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "buyer" },
  OTP: { type: Number, default: null },
  otpExpired: Date,
  isVerified: { type: Boolean, default: false },
  address: { type: String },
  phone: { type: String, required: true, unique: true },
  profileImage: { type: String, default: "" },

  // Stripe integration
  stripeCustomerId: { type: String },
  defaultPaymentMethod: { type: String },
  paymentHistory: [
    {
      paymentIntentId: { type: String },
      amount: { type: Number },
      currency: { type: String, default: "USD" },
      status: { type: String },
      createdAt: { type: Date, default: Date.now },
    },
  ],

  walletBalance: { type: Number, default: 0 },
});

module.exports = mongoose.model("Buyer", buyerSchema);
