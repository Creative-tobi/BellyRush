const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendmail = require("../service/nodemailer");
const Admin = require("../model/admin.model");
const Buyer = require("../model/buyer.model");
const Delivery = require("../model/delivery.model");
const { Vendor, Menu, Order } = require("../model/vendor.model");
const upload = require("../config/multer");


const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};


const sendOTPEmail = async (email, otp, name) => {
  try {
    await sendmail({
      to: email,
      subject: "Your BellyRush Admin OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4CAF50;">Welcome to BellyRush, ${name}!</h2>
          <p>Your OTP verification code is:</p>
          <div style="background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 24px; font-weight: bold; margin: 20px 0;">
            ${otp}
          </div>
          <p>This OTP will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr>
          <p>Best regards,<br>BellyRush Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw new Error("Failed to send verification email");
  }
};

//register admin
async function createAdmin(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    // Input validation
    if (!name || !email || !password || !phone) {
      return res.status(400).send({
        error: "Name, email, password, and phone are required",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).send({
        error: "Please provide a valid email address",
      });
    }

    if (!validatePhone(phone)) {
      return res.status(400).send({
        error: "Please provide a valid phone number",
      });
    }

    if (password.length < 6) {
      return res.status(400).send({
        error: "Password must be at least 6 characters long",
      });
    }

    const profileImage = req.file ? req.file.path : null;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).send({ error: "Admin email already exists" });
    }

    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //creating OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log("Generated OTP:", otp);

    const newAdmin = new Admin({
      name,
      email,
      password: hashedPassword,
      OTP: otp,
      phone,
      profileImage,
      otpExpired: Date.now() + 10 * 60 * 1000,
    });

    await newAdmin.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, name);
    } catch (emailError) {
      console.warn(
        "Email sending failed, but admin was created:",
        emailError.message
      );
      
    }

    //generate token
    const token = jwt.sign(
      {
        id: newAdmin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    //response
    res.status(201).send({
      message:
        "You have successfully registered on BellyRush as an admin. Please check your email for OTP verification.",
      token,
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        phone: newAdmin.phone,
      },
    });
  } catch (error) {
    console.error("Admin registration error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).send({ error: "Invalid input data" });
    }
    res.status(500).send({ error: "Internal server error" });
  }
}

//resend OTP
async function resendOTP(req, res) {
  try {
    const { email } = req.body;

    // Validation
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    if (!validateEmail(email)) {
      return res
        .status(400)
        .send({ message: "Please provide a valid email address" });
    }

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(404).send({ message: "Admin not found" });
    }

    // Check if account is already verified
    if (admin.isVerified) {
      return res.status(400).send({ message: "Account is already verified" });
    }

    //generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    admin.OTP = otp;
    admin.otpExpired = Date.now() + 10 * 60 * 1000;
    await admin.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, admin.name);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return res.status(500).send({ message: "Failed to send OTP email" });
    }

    res.status(200).send({
      message: "New OTP sent successfully",
      email: admin.email,
    });
  } catch (error) {
    console.error("Resend OTP error:", error);
    res.status(500).send({ message: "Internal server error" });
  }
}

//verify OTP
async function verifyOTP(req, res) {
  const { email, OTP } = req.body;
  try {
    // Input validation
    if (!email || !OTP) {
      return res.status(400).send({ message: "Email and OTP are required" });
    }

    if (!validateEmail(email)) {
      return res
        .status(400)
        .send({ message: "Please provide a valid email address" });
    }

    if (!/^\d{4}$/.test(OTP)) {
      return res.status(400).send({ message: "OTP must be a 4-digit number" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).send({ message: "Admin not available" });
    }

    // Check if already verified
    if (admin.isVerified) {
      return res.status(400).send({ message: "Account is already verified" });
    }

    if (admin.OTP !== Number(OTP)) {
      return res.status(400).send({ message: "Invalid OTP" });
    }

    if (admin.otpExpired < Date.now()) {
      return res
        .status(400)
        .send({ message: "OTP expired, please request a new one" });
    }

    admin.isVerified = true;
    admin.OTP = null;
    admin.otpExpired = null;
    await admin.save();

    // Send verification success email
    try {
      await sendmail({
        to: email,
        subject: "BellyRush Admin Account Verified",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #4CAF50;">Account Verified Successfully!</h2>
            <p>Hello ${admin.name},</p>
            <p>Your BellyRush admin account has been successfully verified.</p>
            <p>You can now log in to your admin dashboard.</p>
            <hr>
            <p>Best regards,<br>BellyRush Team</p>
          </div>
        `,
      });
    } catch (emailError) {
      console.warn(
        "Failed to send verification success email:",
        emailError.message
      );
    }

    res.status(200).send({ message: "Account verified successfully" });
  } catch (error) {
    console.error("OTP verification error:", error);
    res.status(500).send({ message: "Internal server error" });
  }
}

//Admin login
async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res
        .status(400)
        .send({ message: "Email and password are required" });
    }

    if (!validateEmail(email)) {
      return res
        .status(400)
        .send({ message: "Please provide a valid email address" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).send({ error: "Admin not found" });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    // Check verification status
    if (!admin.isVerified) {
      return res
        .status(400)
        .send({ message: "Please verify your account first" });
    }

    const token = jwt.sign(
      {
        id: admin._id,
        role: "admin",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    res.status(200).send({
      message: "Login successful",
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//Admin's profile
async function adminProfile(req, res) {
  try {
    const adminID = req.user.id;
    const admin = await Admin.findById(adminID).select("-password");

    if (!admin) {
      return res.status(404).send({ message: "Admin not found" });
    }

    res.status(200).send({ message: "Admin profile", admin });
  } catch (error) {
    console.error("Admin profile error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//get all vendor
async function getVendor(req, res) {
  try {
    const allVendor = await Vendor.find().select("-password");
    res
      .status(200)
      .send({ message: "All vendors fetched successfully", allVendor });
  } catch (error) {
    console.error("Get vendors error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//get all buyer
async function getBuyer(req, res) {
  try {
    const allBuyer = await Buyer.find().select("-password");
    res
      .status(200)
      .send({ message: "All buyers fetched successfully", allBuyer });
  } catch (error) {
    console.error("Get buyers error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//get all delivery
async function getDelivery(req, res) {
  try {
    const allDelivery = await Delivery.find().select("-password");
    res
      .status(200)
      .send({
        message: "All delivery personnel fetched successfully",
        allDelivery,
      });
  } catch (error) {
    console.error("Get delivery error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//get all menu
async function getMenu(req, res) {
  try {
    const allMenu = await Menu.find().select("-password");
    res
      .status(200)
      .send({ message: "All menu items fetched successfully", allMenu });
  } catch (error) {
    console.error("Get menu error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//get all order
async function getOrder(req, res) {
  try {
    const allOrder = await Order.find().select("-password");
    res
      .status(200)
      .send({ message: "All orders fetched successfully", allOrder });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//deleting vendor
async function deleteVendor(req, res) {
  try {
    const adminID = req.user.id;
    const vendorToDelete = await Vendor.findById(req.params.id);
    if (!vendorToDelete) {
      return res.status(404).send({ error: "Vendor not found" });
    }

    const deletedVendor = await Vendor.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .send({ message: "Vendor deleted successfully", deletedVendor });
  } catch (error) {
    console.error("Delete vendor error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//deleting buyer
async function deleteBuyer(req, res) {
  try {
    const buyerToDelete = await Buyer.findById(req.params.id);
    if (!buyerToDelete) {
      return res.status(404).send({ error: "Buyer not found" });
    }

    const deletedBuyer = await Buyer.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .send({ message: "Buyer deleted successfully", deletedBuyer });
  } catch (error) {
    console.error("Delete buyer error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//deleting delivery
async function deleteDelivery(req, res) {
  try {
    const deliveryToDelete = await Delivery.findById(req.params.id);
    if (!deliveryToDelete) {
      return res.status(404).send({ error: "Delivery personnel not found" });
    }

    const deletedDelivery = await Delivery.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .send({
        message: "Delivery personnel deleted successfully",
        deletedDelivery,
      });
  } catch (error) {
    console.error("Delete delivery error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//deleting menu
async function deleteMenu(req, res) {
  try {
    const menuToDelete = await Menu.findById(req.params.id);
    if (!menuToDelete) {
      return res.status(404).send({ error: "Menu item not found" });
    }

    const deletedMenu = await Menu.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .send({ message: "Menu item deleted successfully", deletedMenu });
  } catch (error) {
    console.error("Delete menu error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//deleting order
async function deleteOrder(req, res) {
  try {
    const orderToDelete = await Order.findById(req.params.id);
    if (!orderToDelete) {
      return res.status(404).send({ error: "Order not found" });
    }

    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    res
      .status(200)
      .send({ message: "Order deleted successfully", deletedOrder });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

module.exports = {
  createAdmin,
  resendOTP,
  verifyOTP,
  adminLogin,
  adminProfile,
  getVendor,
  getBuyer,
  getDelivery,
  getMenu,
  getOrder,
  deleteVendor,
  deleteBuyer,
  deleteDelivery,
  deleteMenu,
  deleteOrder,
};
