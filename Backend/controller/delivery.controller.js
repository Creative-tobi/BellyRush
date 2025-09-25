const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendmail = require("../service/nodemailer");
const Buyer = require("../model/buyer.model");
const Delivery = require("../model/delivery.model");
const { Vendor, Menu, Order } = require("../model/vendor.model");
const upload = require("../config/multer");

//register delivery man
async function createDelivery(req, res) {
  try {
    const {
      name,
      email,
      password,
      OTP,
      phone,
      address,
      curentLocation,
      status,
      deliveryArea,
      earnings,
      rating,
      reviews,
      orders,
      payout,
    } = req.body;

    const profileImage = req.file ? req.file.path : null;
    
    const existingDelivery = await Delivery.findOne({ email });
    if (existingDelivery) {
      return res.status(400).send({ error: "Rider's email already exist" });
    }


    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //creating OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log(otp);

    const newDelivery = new Delivery({
      name,
      email,
      password: hashedPassword,
      OTP: otp,
      phone,
      address,
      profileImage,
      curentLocation,
      status,
      deliveryArea,
      earnings,
      rating,
      reviews,
      orders,
      payout,
      otpExpires: Date.now() * 10 * 60 * 1000,
    });

    await newDelivery.save();

    //generate token
    const token = jwt.sign(
      {
        id: newDelivery._id,
        role: "delivery man",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    //messages sent through node mailer

    //response
    res.status(200).send({
      message:
        "You have successfull registered on BellyRush as a delivery man ",
      token,
      delivery: {
        id: newDelivery._id,
        name: newDelivery.name,
        email: newDelivery.email,
        OTP: newDelivery.OTP,
        phone: newDelivery.phone,
        address: newDelivery.address,
        currentLocation: newDelivery.currentLocation,
        status: newDelivery.status,
        deliveryArea: newDelivery.deliveryArea,
        earnings: newDelivery.earnings,
        rating: newDelivery.rating,
        reviews: newDelivery.reviews,
        orders: newDelivery.orders,
        payout: newDelivery.payout,
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
    const delivery = await Delivery.findOne(email);

    if (!delivery) {
      return res.status(404).send({ message: "Delivery man not found" });
    }

    //generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    delivery.OTP = otp;
    delivery.otpExpired = Date.now() + 10 * 60 * 1000;
    await delivery.save();

    //email sending

    res.status(200).send({
      message: "New OTP sent successfully",
      email: delivery.email,
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

    const delivery = await Delivery.findOne({ email });
    if (!delivery) {
      return res.status(404).send({ message: "Delivery man not available" });
    }

    if (delivery.OTP !== Number(OTP))
      return res.status(400).send({ message: "Invalid OTp" });

    if (delivery.otpExpired < Date.now())
      return res
        .status(400)
        .send({ message: "OTP expires, please request a new one" });

    delivery.isVerified = true;
    delivery.OTP = null;
    delivery.otpExpired = null;
    await delivery.save();

    res.status(200).send({ message: "Account verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
}

//Delivery login
async function deliveryLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).send({ message: "Invalid credential" });
    }

    const delivery = await Delivery.findOne({ email });
    if (!delivery) {
      return res.status(404).send({ error: "Delivery man not found" });
    }

    const otpverify = await Delivery.findOne({ email, isVerified });
    if (!otpverify) {
      return res.status(400).send({ message: "Please verify your account" });
    }

    const token = jwt.sign(
      {
        id: delivery._id,
        role: "delivery",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    res.status(200).send({
      message: "Login successful",
      token,
      delivery: {
        id: delivery._id,
        name: delivery._name,
        email: delivery.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//Delivery man's profile
async function deliveryProfile(req, res) {
  try {
    const deliveryID = req.user.id;
    const delivery = await Delivery.findById(deliveryID).select("-password");

    if (!delivery) {
      return res.status(400).send({ message: "Delivery not found" });
    }

    res.status(200).send({ message: "Delivery profile", delivery });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
}

module.exports = {
  createDelivery,
  resendOTP,
  verifyOTP,
  deliveryLogin,
  deliveryProfile,
};
