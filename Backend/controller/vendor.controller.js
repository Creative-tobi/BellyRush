const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendmail = require("../service/nodemailer");
const Buyer = require("../model/buyer.model");
const Delivery = require("../model/delivery.model");
const { Vendor, Menu, Order } = require("../model/vendor.model");
const upload = require("../config/multer")

//register vendor
async function createVendor(req, res) {
  try {
    const {
      restaurantName,
      email,
      password,
      OTP,
      phone,
      address,
      description,
      hours,
      Cuisine,
      status,
      deliveryArea,
      earnings,
      rating,
      reviews,
      commission,
      payout,
      menu,
    } = req.body;
    
    const profileImage = req.file ? req.file.path : null;

    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).send({ error: "Vendor's email already exist" });
    }


    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //creating OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log(otp);

    const newVendor = new Vendor({
      restaurantName,
      email,
      password: hashedPassword,
      OTP: otp,
      phone,
      address,
      profileImage,
      description,
      hours,
      commission,
      menu,
      Cuisine,
      status,
      deliveryArea,
      earnings,
      rating,
      reviews,
      payout,
      otpExpires: Date.now() * 10 * 60 * 1000,
    });

    await newVendor.save();

    //generate token
    const token = jwt.sign(
      {
        id: newVendor._id,
        role: "vendor man",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    //messages sent through node mailer

    //response
    res.status(200).send({
      message: "You have successfull registered on BellyRush as a vendor ",
      token,
      VideoEncoder: {
        id: newVendor._id,
        restaurantName: newVendor.name,
        email: newVendor.email,
        OTP: newVendor.OTP,
        phone: newVendor.phone,
        address: newVendor.address,
        status: newVendor.status,
        description: newVendor.description,
        hours: newVendor.hours,
        deliveryarea: newVendor.deliveryarea,
        Cuisine: newVendor.Cuisine,
        earnings: newVendor.earnings,
        rating: newVendor.rating,
        reviews: newVendor.reviews,
        commission: newVendor.commision,
        payout: newVendor.payout,
        menu: newVendor.menu,
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
    const vendor = await Vendor.findOne(email);

    if (!vendor) {
      return res.status(404).send({ message: "Vendor not found" });
    }

    //generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    vendor.OTP = otp;
    vendor.otpExpired = Date.now() + 10 * 60 * 1000;
    await vendor.save();

    //email sending

    res.status(200).send({
      message: "New OTP sent successfully",
      email: vendor.email,
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

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(404).send({ message: "Vendor not available" });
    }

    if (vendor.OTP !== Number(OTP))
      return res.satus(400).send({ message: "Invalid OTp" });

    if (vendor.otpExpired < Date.now())
      return res
        .status(400)
        .send({ message: "OTP expires, please request a new one" });

    vendor.isVerified = true;
    vendor.OTP = null;
    vendor.otpExpired = null;
    await vendor.save();

    res.status(200).send({ message: "Account verified successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
}

//Delivery login
async function vendorLogin(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).send({ message: "Invalid credential" });
    }

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(404).send({ error: "Delivery man not found" });
    }

    const otpverify = await Vendor.findOne({ email, isVerified });
    if (!otpverify) {
      return res.status(400).send({ message: "Please verify your account" });
    }

    const token = jwt.sign(
      {
        id: vendor._id,
        role: "vendor",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    res.status(200).send({
      message: "Login successful",
      token,
      vendor: {
        id: vendor._id,
        name: vendor._name,
        email: vendor.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//Delivery man's profile
async function vendorProfile(req, res) {
  try {
    const vendorID = req.user.id;
    const vendor = await Vendor.findById(vendorID).select("-password");

    if (!vendor) {
      return res.status(400).send({ message: "Vendor not found" });
    }

    res.status(200).send({ message: "Vendor profile", delivery });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
}

//updating vendors details

async function updateVendor(req, res) {
  try {
    // const { id } = req.user.id;
    const {
      email,
      profileImage,
      description,
      hours,
      status,
      Cuisine,
      deliveryarea,
      rating,
      reviews,
      commission,
      payout,
      menu,
    } = req.body;
    const restaurant = await Vendor.findOne(email);

    if (!restaurant) {
      return res.status(404).send({ message: "Vendr not available" });
    }

    restaurant.profileImage = profileImage;
    restaurant.description = description;
    restaurant.hours = hours;
    restaurant.status = status;
    restaurant.Cuisine = Cuisine;
    restaurant.deliveryarea = deliveryarea;
    restaurant.rating = rating;
    restaurant.reviews = reviews;
    restaurant.commission = commission;
    restaurant.payout = payout;
    restaurant.menu = menu;

    await restaurant.save();
    return res
      .status(200)
      .send({ message: "Vendors details updated successful", restaurant });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
};

//creating menu
async function createMenu(req, res){
  try {
    const {
      foodname,
      description,
      category,
      price,
      image,
      ingredients,
      userID
    } = req.body;

    const menu = Menu.findOne(userID);

    if(!menu){
      return res.status(404).send({message: "Vendor not found"})
    };

    const newMenu = await Menu.create({
      foodname,
      description,
      category,
      price,
      image,
      ingredients,
    });

    newMenu.save();

    res.status(200).send({message: "Menu added successly"})

  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
};

//updating menu
async function updateMenu(req, res) {
  try {
    const {
      userID,
      foodname,
      description,
      category,
      price,
      image,
      ingredients,
    } = req.body;
    const menu= await Menu.findOne(userID);

    if (!menu) {
      return res.status(404).send({ message: "Vendor not available" });
    }

    menu.image = image;
    menu.description = description;
    menu.foodname = foodname;
    menu.price = price;
    menu.category = category;
    menu.ingredients = ingredients;
    await menu.save();
    return res
      .status(200)
      .send({ message: "Vendors details updated successful", menu });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
};

//deleting menu
async function deletemenu(req, res){
  try {
    const vendorID = req.user.id;
    const vendor = await Vendor.findById(vendorID);
    const menuToDelete = await Menu.findById(req.params.id);
    if(!menuToDelete){
      return res.status(404).send({error: "Menu not found"});
    };

    const deleted = await Menu.findByIdAndDelete(req.params.id);

    return res.status(200).send({message: "Menu deleted successfuflly"});
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
}

module.exports = {
  createVendor,
  resendOTP,
  verifyOTP,
  vendorLogin,
  vendorProfile,
  updateVendor,
  createMenu,
  updateMenu,
  deletemenu,
};
