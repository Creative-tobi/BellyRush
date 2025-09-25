const express = require("express");
const Buyer = require("../model/buyer.model");
const { Vendor, Order, Menu } = require("../model/vendor.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const upload = require("../config/multer");
const stripe = require("../config/stripe");
const sendMail = require("../service/nodemailer");

//register buyer
async function createBuyer(req, res) {
  try {
    const { name, email, password, OTP, phone, } =
      req.body;
     
      const profileImage = req.file ? req.file.path : null;
   
      const existingBuyer = await Buyer.findOne({ email });
    if (existingBuyer) {
      return res.status(400).send({ error: "Buyer email already exist" });
    }


    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //creating OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log(otp);

    const newBuyer = new Buyer({
      name,
      email,
      password: hashedPassword,
      OTP: otp,
      phone,
      profileImage,
      otpExpired: Date.now() + 10 * 60 * 1000,
    });

    await newBuyer.save();

    //generate token
    const token = jwt.sign(
      {
        id: newBuyer._id,
        role: "buyer",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    //messages sent through node mailer

    //response
    res.status(200).send({
      message: "You have successfull registered on BellyRush as a buyer",
      token,
      buyer: {
        id: newBuyer._id,
        name: newBuyer.name,
        email: newBuyer.email,
        OTP: newBuyer.OTP,
        phone: newBuyer.phone,
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
    const buyer = await Buyer.findOne({email});

    if (!buyer) {
      return res.status(404).send({ message: "Buyer not found" });
    }

    //generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    buyer.OTP = otp;
    buyer.otpExpired = Date.now() + 10 * 60 * 1000;
    await buyer.save();

    //email sendign

    res.status(200).send({
      message: "New OTP sent successfully",
      email: buyer.email,
      OTP: buyer.OTP,
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

    const buyer = await Buyer.findOne({ email });
    if (!buyer) {
      return res.status(404).send({ message: "Buyer not available" });
    }

    if (buyer.OTP !== Number(OTP))
      return res.status(400).send({ message: "Invalid OTp" });

    if (buyer.otpExpired < Date.now())
      return res
        .status(400)
        .send({ message: "OTP expires, please request a new one" });

    buyer.isVerified = true;
    buyer.OTP = null;
    buyer.otpExpired = null;
    await buyer.save();

    res.status(200).send({ message: "Account verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
}

//buyer login
async function buyerLogin(req, res){
    try {
        const {email, password} = req.body;
        if(!email || !password){
          return  res.status(400).send({message: "Invalid credential"});
        }

        const buyer = await Buyer.findOne({email});
        if(!buyer){
            return res.status(404).send({error: "Buyer not found"});
        }

        const validPassword = await bcrypt.compare(password, buyer.password);
        if (!validPassword) {
          return res.status(400).send({ message: "Invalid credentials" });
        }

        const otpverify = await Buyer.findOne({email, isVerified: true});
        if(!otpverify){
          return res.status(400).send({message: "Please verify your account"})
        };

        const token = jwt.sign(
          {
            id: buyer._id, role: "buyer"
          },
          process.env.JWT_SECRET,
          {
            expiresIn: "2h"
          }
        );

        res.status(200).send({
          message: "Login successful",
          token,
          buyer: {
            id: buyer._id,
            name: buyer.name,
            email: buyer.email
          },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send({error: "Internala server error"})
    }
};

//Buyer's profile
async function buyerProfile(req, res){
  try {
    const buyerID = req.user.id;
    const buyer = await Buyer.findById(buyerID).select("-password");

    if (!buyer){
      return res.status(400).send({message: "Buyer not found"});
    };

    res.status(200).send({message: "Buyer profile", buyer});
  } catch (error) {
    console.error(error);
    res.status(500).send({error: "internal server error"});
  }
}


//getting all vendors
async function getVendors(req, res){
  try {
    const allVendors = await Vendor.find().select("-password");
    res
      .status(200)
      .send({ Message: "Available vendors fetch", vendor: allVendors });
  } catch (error) {
     console.error(error);
     res.status(500).send({ error: "internal server error" });
  }
}

//create order
async function createOrder(req, res){
  try {
    const {
     items,
     deliveryaddress,
     contact,
     time,
     totalamount,
     status,
     buyer,
     vendor,
     delivery,
     userID
    } = req.body;

    const order = Menu.findOne({userID});

    if(!order){
      return res.status(404).send({message: "Menu not found"})
    };

    const newOrder = await Order.create({
      items,
      deliveryaddress,
      contact,
      time,
      totalamount,
      status,
      buyer,
      vendor,
      delivery,
    });

    newOrder.save();

    res.status(200).send({message: "Order createded successly"})

  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
};

//get orders
async function getOrders(req, res) {
  try {
    const { userID, email } = req.body;
    const allOrder = await Order.find();
    const buyer = await Buyer.findById(email);
    if (!buyer) {
      return res.status(404).send({ message: "Buyer not found" });
    }
    res.status(201).send({ message: "Order fetched", allOrder });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
}

module.exports = {
  createBuyer,
  resendOTP,
  verifyOTP,
  buyerLogin,
  buyerProfile,
  getVendors,
  createOrder,
  getOrders,
};