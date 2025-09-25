const mongoose = require("mongoose");

const adminSchema = new mongoose.Schema({
    name: {type: String, required: true},
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    role: {type:String, required: true, default: "admin"},
    OTP: {type: Number, default: null},
    otpExpired: Date,
    isVerified: {type: Boolean, default: false},
    phone: {type: String, required: true, unique: true},
    address: {type: String, required: true},
    profileImage: {type: String, default: ""},
    
})

module.exports = mongoose.model("Admin", adminSchema);