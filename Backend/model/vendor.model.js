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
  menu: { type: mongoose.Types.ObjectId, ref: "menu" },
});

const menuScema = new mongoose.Schema({
  userID: { type: mongoose.Types.ObjectId, ref: "Vendor" },
  foodname: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: "" },
  ingredients: { type: [String], required: true },
});

const Order = new mongoose.Schema({
  userID: { type: mongoose.Types.ObjectId, ref: "menu" },
  items: [],
  deliveryaddress: { type: String, required: true },
  contact: { type: String, required: true },
  time: { type: Date, required: true },
  totalamount: { type: Number, required: true },
  status: { type: String, default: "pending" },
  buyer: { type: mongoose.Types.ObjectId, ref: "Buyer" },
  vendor: { type: mongoose.Types.ObjectId, ref: "Vendor" },
  delivery: { type: mongoose.Types.ObjectId, ref: "Delivery", default: null },
});

module.exports = {
    Vendor: mongoose.model("Vendor", vendorSchema),
    Menu: mongoose.model("Menu", menuScema),
    Order: mongoose.model("Order", Order)
}