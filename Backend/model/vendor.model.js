const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true, default: "vendor" },
  OTP: { type: Number, default: null },
  otpExpired: Date,
  isVerified: { type: Boolean, default: false },
  phone: { type: String, required: true, unique: true },
  address: { type: String, required: true },
  profileImage: { type: String, default: "" },
  description: { type: String, required: true },
  hours: { type: String, required: true },
  status: { type: String, default: "open" },
  deliveryarea: { type: String, required: true },
  Cuisine: { type: String, required: true },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 },
  commission: { type: Number, default: 0 },
  payout: { type: Number, default: 0 },
  menu: [{ type: mongoose.Types.ObjectId, ref: "Menu" }],

  // Stripe integration 
  stripeAccountId: { type: String },
  payoutsEnabled: { type: Boolean, default: false }, 
  defaultBankAccount: { type: String }, // Last 4 digits or ID of linked bank account
  balance: { type: Number, default: 0 }, // Track available funds in-app (optional)

  payoutHistory: [
    {
      transferId: { type: String }, // Stripe transfer/payout ID
      amount: { type: Number },
      currency: { type: String, default: "USD" },
      status: { type: String }, // paid, pending, failed
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

const menuScema = new mongoose.Schema(
  {
    vendor: { type: mongoose.Types.ObjectId, ref: "Vendor", required: true },
    foodname: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    profileImage: { type: String, default: "" },
    ingredients: { type: [String], required: true },
  },
  { timestamps: true } // keeps createdAt & updatedAt
);

const orderSchema = new mongoose.Schema(
  {
    buyer: { type: mongoose.Types.ObjectId, ref: "Buyer" },
    vendor: { type: mongoose.Types.ObjectId, ref: "Vendor" },
    delivery: { type: mongoose.Types.ObjectId, ref: "Delivery", default: null },

    // items from menu
    items: [
      {
        menuId: {
          type: mongoose.Types.ObjectId,
          ref: "Menu",
          required: true,
        },
        name: String,
        price: Number,
        quantity: Number,
      },
    ],

    deliveryaddress: { type: String, required: false },
    contact: { type: String, required: false },

    totalamount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "paid", "inprogress", "completed", "cancelled", "delivered"],
      default: "pending",
    },

    
    paymentStatus: {
      type: String,
      enum: ["unpaid", "processing", "succeeded", "failed", "paid"],
      default: "unpaid",
    },
  },
  { timestamps: true }
);


module.exports = {
  Vendor: mongoose.model("Vendor", vendorSchema),
  Menu: mongoose.model("Menu", menuScema),
  Order: mongoose.model("Order", orderSchema),
};