const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendmail = require("../service/nodemailer");
const Admin = require("../model/admin.model");
const Buyer = require("../model/buyer.model");
const Delivery = require("../model/delivery.model");
const { Vendor, Menu, Order} = require("../model/vendor.model");
const upload = require("../config/multer")

//register admin
async function createAdmin(req, res) {
  try {
    const { name, email, password, OTP, phone, } =
      req.body;
      
      const profileImage = req.file ? req.file.path : null;
    
      const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).send({ error: "Admin email already exist" });
    }


    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //creating OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log(otp);

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

    //messages sent through node mailer

    //response
    res.status(200).send({
      message: "You have successfull registered on BellyRush as an admin",
      token,
      admin: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        OTP: newAdmin.OTP,
        phone: newAdmin.phone,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//resend OTP
async function resendOTP(req, res) {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({email});

    if (!admin) {
      return res.status(404).send({ message: "Admin not found" });
    }

    //generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    admin.OTP = otp;
    admin.otpExpired = Date.now() + 10 * 60 * 1000;
    await admin.save();

    //email sendign

    res.status(200).send({
      message: "New OTP sent successfully",
      email: admin.email,
      OTP: admin.OTP,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
}

//verify OTP
async function verifyOTP(req, res) {
  const { email, OTP } = req.body;
  try {
    if (!email || !OTP) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).send({ message: "Admin not available" });
    }

    if (admin.OTP !== Number(OTP))
      return res.status(400).send({ message: "Invalid OTp" });

    if (admin.otpExpired < Date.now())
      return res
        .status(400)
        .send({ message: "OTP expires, please request a new one" });

    admin.isVerified = true;
    admin.OTP = null;
    admin.otpExpired = null;
    await admin.save();

    res.status(200).send({ message: "Account verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
}

//Admin login
async function adminLogin(req, res){
    try {
        const {email, password} = req.body;
        if(!email || !password){
          return  res.status(400).send({message: "Invalid credential"});
        }

        const admin = await Admin.findOne({email});
        if(!admin){
            return res.status(404).send({error: "Admin not found"});
        }

        const validPassword = await bcrypt.compare(password, admin.password);
        if (!validPassword) {
          return res.status(400).send({ message: "Invalid credentials" });
        }

        const otpverify = await Admin.findOne({email, isVerified: true});
        if(!otpverify){
          return res.status(400).send({message: "Please verify your account"})
        };

        const token = jwt.sign(
          {
            id: admin._id, role: "admin"
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "2h"
          }
        );

        res.status(200).send({
          message: "Login successful",
          token,
          admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email
          },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({error: "Internal server error"})
    }
};

//Admin's profile
async function adminProfile(req, res){
  try {
    const adminID = req.user.id;
    const admin = await Admin.findById(adminID).select("-password");

    if (!admin){
      return res.status(400).send({message: "Admin not found"});
    };

    res.status(200).send({message: "Admin profile", admin});
  } catch (error) {
    console.error(error);
    res.status(500).send({error: "internal server error"});
  }
}


module.exports = {
  createAdmin,
  resendOTP,
  verifyOTP,
  adminLogin,
  adminProfile,
};