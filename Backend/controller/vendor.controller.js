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
      deliveryarea,
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
      deliveryarea,
      earnings,
      rating,
      reviews,
      payout,
      otpExpired: Date.now() + 10 * 60 * 1000,
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
        restaurantName: newVendor.restaurantName,
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
        commission: newVendor.commission,
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
    const vendor = await Vendor.findOne({email});

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
      OTP: vendor.OTP,
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
      return res.status(400).send({ message: "Invalid OTp" });

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
    return  res.status(400).send({ message: "Invalid credential" });
    }

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(404).send({ error: "Delivery man not found" });
    }

    const validPassword = await bcrypt.compare(password, vendor.password);
    if (!validPassword) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    const otpverify = await Vendor.findOne({ email, isVerified: true });
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
        restaurantName: vendor.restaurantName,
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

    res.status(200).send({ message: "Vendor profile", vendor });
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
    const restaurant = await Vendor.findOne({email});

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
// Create Menu
async function createMenu(req, res) {
  try {
    const { foodname, description, category, price, ingredients, vendor } = req.body;

    // vendor ID should come from logged-in vendor (req.user.id)
    // const vendorId = req.user.id;

    // ensure vendor exists
    const vendorId = await Vendor.findById(vendor);
    if (!vendorId) {
      return res.status(404).send({ message: "Vendor not found" });
    }

    const profileImage = req.file ? req.file.path : null;

    const newMenu = await Menu.create({
      vendor: vendorId,
      foodname,
      description,
      category,
      price,
      profileImage,
      ingredients,
    });

    res.status(201).send({
      message: "Menu item created successfully",
      menu: newMenu,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
}

// Update Menu
async function updateMenu(req, res) {
  try {
    const { id } = req.params; 
    const { foodname, description, category, price, ingredients } = req.body;

    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).send({ message: "Menu item not found" });
    }

    // only allow vendor who owns the menu to update
    if (menu.vendor.toString() !== req.user.id) {
      return res.status(403).send({ message: "Unauthorized to update this menu" });
    }

    // update fields
    if (foodname) menu.foodname = foodname;
    if (description) menu.description = description;
    if (category) menu.category = category;
    if (price) menu.price = price;
    if (ingredients) menu.ingredients = ingredients;
    if (req.file) menu.profileImage = req.file.path;

    await menu.save();

    res.status(200).send({
      message: "Menu item updated successfully",
      menu,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//deleting menu
async function deletemenu(req, res) {
  try {
    const { id } = req.params; // menu item id

    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).send({ message: "Menu item not found" });
    }

    // only vendor who owns the menu can delete
    if (menu.vendor.toString() !== req.user.id) {
      return res
        .status(403)
        .send({ message: "Unauthorized to delete this menu" });
    }

    await Menu.findByIdAndDelete(id);

    res.status(200).send({
      message: "Menu item deleted successfully",
      deletedMenuId: id,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//updating order status

async function updateStatus(req, res) {
  try {
    const {id} = req.params.id
    const {
     status
    } = req.body;
    const orderstatus = await Order.findOne({id});

    if (!orderstatus) {
      return res
        .status(404)
        .send({ message: "Delivery man not available not available" });
    }

    orderstatus.status = status;
    await orderstatus.save();
    return res
      .status(200)
      .send({ message: "Order status updated details updated successful", delivery });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
};

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
  updateStatus,
};
