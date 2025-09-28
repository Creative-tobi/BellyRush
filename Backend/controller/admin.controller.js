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

//get all vendor
async function getVendor(req, res) {
  try {
    const allVendor = await Vendor.find().select("-password");
    res.status(200).send({ message: "All vendor fetched sussessfully", allVendor });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
}

//get all buyer
async function getBuyer(req, res) {
  try {
    const allBuyer = await Buyer.find().select("-password");
    res.status(200).send({message: "All buyer fetched successfully", allBuyer});
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
}

//get all delivery
async function getDelivery(req, res) {
  try {
    const allDelivery = await Delivery.find().select("-password");
    res.status(200).send({message: "All delivery fetched successfully", allDelivery});
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
}

//get all menu
async function getMenu(req, res) {
  try {
    const allMenu = await Menu.find().select("-password");
    res.status(200).send({message: "All menu fetched successfully", allMenu});
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
}

//get all order
async function getOrder(req, res) {
  try {
    const allOrder = await Order.find().select("-password");
    res.status(200).send({message: "All order fetched successfully", allOrder});
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
}

//deleting vendor
async function deleteVendor(req, res) {
  try {
    const adminID = req.user.id;
    const admin = await Admin.findById(adminID);
    const vendorToDelete = await Vendor.findById(req.params.id);
    if(!vendorToDelete){
      return res.status(404).send({error: "Vendor not found"});
    }

    const deletedVendor = await Vendor.findByIdAndDelete(req.params.id);
    res.status(200).send({message: "Vendor deleted successfully", deletedVendor});
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
}


//deleting buyer
async function deleteBuyer(req, res) {
  try {
    const adminID = req.user.id;
    const admin = await Admin.findById(adminID);
    const BuyerToDelete = await Buyer.findById(req.params.id);
    if(!BuyerToDelete){
      return res.status(404).send({error: "Buyer not found"});
    }

    const deletedBuyer = await Buyer.findByIdAndDelete(req.params.id);
    res.status(200).send({message: "Buyer deleted successfully", deletedBuyer});
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
}


//deleting delivery
async function deleteDelivery(req, res) {
  try {
    const adminID = req.user.id;
    const admin = await Admin.findById(adminID);
    const DeliveryToDelete = await Delivery.findById(req.params.id);
    if(!DeliveryToDelete){
      return res.status(404).send({error: "Delivery not found"});
    }

    const deletedDelivery = await Delivery.findByIdAndDelete(req.params.id);
    res.status(200).send({message: "Delivery deleted successfully", deletedDelivery});
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
}


//deleting menu
async function deleteMenu(req, res) {
  try {
    const adminID = req.user.id;
    const admin = await Admin.findById(adminID);
    const MenuToDelete = await Menu.findById(req.params.id);
    if(!MenuToDelete){
      return res.status(404).send({error: "Menu not found"});
    }

    const deletedMenu = await Menu.findByIdAndDelete(req.params.id);
    res.status(200).send({message: "Menu deleted successfully", deletedMenu});
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
}


//deleting order
async function deleteOrder(req, res) {
  try {
    const adminID = req.user.id;
    const admin = await Admin.findById(adminID);
    const OrderToDelete = await Order.findById(req.params.id);
    if(!OrderToDelete){
      return res.status(404).send({error: "Order not found"});
    }

    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    res.status(200).send({message: "Order deleted successfully", deletedOrder});
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
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