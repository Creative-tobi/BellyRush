const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../service/nodemailer");
const Buyer = require("../model/buyer.model");
const Delivery = require("../model/delivery.model");
const { Vendor, Menu, Order } = require("../model/vendor.model");
const upload = require("../config/multer");

// Validation helper functions
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone);
};

// Nodemailer email templates
const sendOTPEmail = async (email, otp, restaurantName) => {
  try {
    await sendEmail({
      to: email,
      subject: "Your BellyRush Vendor OTP Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4CAF50;">Welcome to BellyRush, ${restaurantName}!</h2>
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

const sendVerificationSuccessEmail = async (email, restaurantName) => {
  try {
    await sendEmail({
      to: email,
      subject: "BellyRush Vendor Account Verified",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4CAF50;">Account Verified Successfully!</h2>
          <p>Hello ${restaurantName} team,</p>
          <p>Your BellyRush vendor account has been successfully verified.</p>
          <p>You can now start adding menu items and accepting orders from customers!</p>
          <hr>
          <p>Best regards,<br>BellyRush Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.warn("Failed to send verification success email:", error.message);
  }
};

//register vendor
async function createVendor(req, res) {
  try {
    const {
      restaurantName,
      email,
      password,
      phone,
      address,
      description,
      hours,
      Cuisine,
      status = "inactive",
      deliveryarea,
      earnings = 0,
      rating = 0,
      reviews = 0,
      commission = 0,
      payout = 0,
    } = req.body;

    const profileImage = req.file ? req.file.path : null;

    // ✅ Enhanced Validation
    if (!restaurantName || !email || !password || !phone || !address) {
      return res.status(400).send({
        error:
          "Restaurant name, email, password, phone, and address are required",
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).send({ error: "Invalid email format" });
    }

    if (!validatePhone(phone)) {
      return res.status(400).send({ error: "Invalid phone number format" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .send({ error: "Password must be at least 6 characters long" });
    }

    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).send({ error: "Vendor's email already exists" });
    }

    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //creating OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log("Generated OTP:", otp);

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

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, restaurantName);
    } catch (emailError) {
      console.warn(
        "Email sending failed, but vendor was created:",
        emailError.message
      );
      // Don't fail the entire registration if email fails
    }

    //generate token
    const token = jwt.sign(
      {
        id: newVendor._id,
        role: "vendor",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    res.status(201).send({
      message:
        "You have successfully registered on BellyRush as a vendor. Please check your email for OTP verification.",
      token,
      vendor: {
        id: newVendor._id,
        restaurantName: newVendor.restaurantName,
        email: newVendor.email,
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
      },
    });
  } catch (error) {
    console.error("Vendor registration error:", error);
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

    // ✅ Enhanced Validation
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).send({ message: "Valid email is required" });
    }

    const vendor = await Vendor.findOne({ email });

    if (!vendor) {
      return res.status(404).send({ message: "Vendor not found" });
    }

    // Check if account is already verified
    if (vendor.isVerified) {
      return res.status(400).send({ message: "Account is already verified" });
    }

    //generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    vendor.OTP = otp;
    vendor.otpExpired = Date.now() + 10 * 60 * 1000;
    await vendor.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, vendor.restaurantName);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return res.status(500).send({ message: "Failed to send OTP email" });
    }

    res.status(200).send({
      message: "New OTP sent successfully",
      email: vendor.email,
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
    // ✅ Enhanced Validation
    if (!email || !OTP) {
      return res.status(400).send({ message: "Email and OTP are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).send({ message: "Valid email is required" });
    }

    if (!/^\d{4}$/.test(OTP)) {
      return res.status(400).send({ message: "OTP must be a 4-digit number" });
    }

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(404).send({ message: "Vendor not available" });
    }

    // Check if already verified
    if (vendor.isVerified) {
      return res.status(400).send({ message: "Account is already verified" });
    }

    if (vendor.OTP !== Number(OTP))
      return res.status(400).send({ message: "Invalid OTP" });

    if (vendor.otpExpired < Date.now())
      return res
        .status(400)
        .send({ message: "OTP expired, please request a new one" });

    vendor.isVerified = true;
    vendor.OTP = null;
    vendor.otpExpired = null;
    await vendor.save();

    // Send verification success email
    try {
      await sendVerificationSuccessEmail(email, vendor.restaurantName);
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

//Vendor login
async function vendorLogin(req, res) {
  try {
    const { email, password } = req.body;

    // ✅ Enhanced Validation
    if (!email || !password) {
      return res
        .status(400)
        .send({ message: "Email and password are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).send({ message: "Valid email is required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .send({ message: "Password must be at least 6 characters" });
    }

    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(404).send({ error: "Vendor not found" });
    }

    const validPassword = await bcrypt.compare(password, vendor.password);
    if (!validPassword) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    if (!vendor.isVerified) {
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
        status: vendor.status,
        rating: vendor.rating,
        earnings: vendor.earnings,
      },
    });
  } catch (error) {
    console.error("Vendor login error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//Vendor's profile
async function vendorProfile(req, res) {
  try {
    const vendorID = req.user.id;
    const vendor = await Vendor.findById(vendorID).select("-password");

    if (!vendor) {
      return res.status(404).send({ message: "Vendor not found" });
    }

    res.status(200).send({ message: "Vendor profile", vendor });
  } catch (error) {
    console.error("Vendor profile error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//updating vendor details
async function updateVendor(req, res) {
  try {
    const { email } = req.body;

    // ✅ Enhanced Validation
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).send({ message: "Valid email is required" });
    }

    const {
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

    const restaurant = await Vendor.findOne({ email });

    if (!restaurant) {
      return res.status(404).send({ message: "Vendor not available" });
    }

    // Ensure only the logged-in vendor can update their own details
    if (restaurant._id.toString() !== req.user.id) {
      return res
        .status(403)
        .send({ message: "Unauthorized to update this vendor" });
    }

    // Update fields only if provided
    if (profileImage !== undefined) restaurant.profileImage = profileImage;
    if (description !== undefined) restaurant.description = description;
    if (hours !== undefined) restaurant.hours = hours;
    if (status !== undefined) restaurant.status = status;
    if (Cuisine !== undefined) restaurant.Cuisine = Cuisine;
    if (deliveryarea !== undefined) restaurant.deliveryarea = deliveryarea;
    if (rating !== undefined) restaurant.rating = rating;
    if (reviews !== undefined) restaurant.reviews = reviews;
    if (commission !== undefined) restaurant.commission = commission;
    if (payout !== undefined) restaurant.payout = payout;
    if (menu !== undefined) restaurant.menu = menu;

    await restaurant.save();
    return res
      .status(200)
      .send({
        message: "Vendor details updated successfully",
        vendor: restaurant,
      });
  } catch (error) {
    console.error("Update vendor error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//creating menu
// Create Menu
async function createMenu(req, res) {
  try {
    const { foodname, description, category, price, ingredients, vendor } =
      req.body;

    // ✅ Enhanced Validation
    if (!foodname || !price || !vendor) {
      return res.status(400).send({
        message: "Food name, price, and vendor ID are required",
      });
    }

    if (isNaN(price) || price <= 0) {
      return res
        .status(400)
        .send({ message: "Price must be a positive number" });
    }

    // Ensure vendor exists and is verified
    const vendorDoc = await Vendor.findById(vendor);
    if (!vendorDoc) {
      return res.status(404).send({ message: "Vendor not found" });
    }

    if (!vendorDoc.isVerified) {
      return res
        .status(400)
        .send({
          message: "Vendor account must be verified to create menu items",
        });
    }

    // Ensure only the logged-in vendor can create menu items for their restaurant
    // if (vendorDoc._id.toString() !== req.user.id) {
    //   return res
    //     .status(403)
    //     .send({ message: "Unauthorized to create menu for this vendor" });
    // }

    const profileImage = req.file ? req.file.path : null;

    const newMenu = await Menu.create({
      vendor: vendorDoc._id,
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
    console.error("Create menu error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).send({ error: "Invalid menu data" });
    }
    res.status(500).send({ error: "Internal server error" });
  }
}

// Update Menu
async function updateMenu(req, res) {
  try {
    const { id } = req.params;
    const { foodname, description, category, price, ingredients } = req.body;

    // ✅ Enhanced Validation
    if (price !== undefined && (isNaN(price) || price <= 0)) {
      return res
        .status(400)
        .send({ message: "Price must be a positive number" });
    }

    const menu = await Menu.findById(id);
    if (!menu) {
      return res.status(404).send({ message: "Menu item not found" });
    }

    // only allow vendor who owns the menu to update
    if (menu.vendor.toString() !== req.user.id) {
      return res
        .status(403)
        .send({ message: "Unauthorized to update this menu" });
    }

    // update fields only if provided
    if (foodname !== undefined) menu.foodname = foodname;
    if (description !== undefined) menu.description = description;
    if (category !== undefined) menu.category = category;
    if (price !== undefined) menu.price = price;
    if (ingredients !== undefined) menu.ingredients = ingredients;
    if (req.file) menu.profileImage = req.file.path;

    await menu.save();

    res.status(200).send({
      message: "Menu item updated successfully",
      menu,
    });
  } catch (error) {
    console.error("Update menu error:", error);
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
    console.error("Delete menu error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//updating order status
async function updateStatus(req, res) {
  try {
    const { id } = req.params; // Fixed: was req.params.id instead of req.params
    const { status } = req.body;

    // ✅ Enhanced Validation
    if (!id) {
      return res.status(400).send({ message: "Order ID is required" });
    }

    if (!status) {
      return res.status(400).send({ message: "Status is required" });
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res.status(400).send({
        message: `Invalid status. Valid statuses are: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    // Ensure only the vendor who owns the order can update its status
    if (order.vendor.toString() !== req.user.id) {
      return res
        .status(403)
        .send({ message: "Unauthorized to update this order" });
    }

    order.status = status;
    await order.save();

    res.status(200).send({
      message: "Order status updated successfully",
      order: {
        id: order._id,
        status: order.status,
        buyer: order.buyer,
        items: order.items,
        totalamount: order.totalamount,
      },
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

// Get vendor's orders
async function getVendorOrders(req, res) {
  try {
    const vendorId = req.user.id;

    const orders = await Order.find({ vendor: vendorId })
      .populate("buyer", "name email phone")
      .populate("delivery", "name phone")
      .sort({ createdAt: -1 });

    res.status(200).send({
      message: "Vendor orders fetched successfully",
      orders,
      count: orders.length,
    });
  } catch (error) {
    console.error("Get vendor orders error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

// Get vendor's menu
async function getVendorMenu(req, res) {
  try {
    const vendorId = req.user.id;

    const menuItems = await Menu.find({ vendor: vendorId });

    res.status(200).send({
      message: "Vendor menu fetched successfully",
      menu: menuItems,
      count: menuItems.length,
    });
  } catch (error) {
    console.error("Get vendor menu error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

async function assignOrder(req, res){
  try {
    const { orderId, deliveryId } = req.body;
    const vendorId = req.user.id;

    const order = await Order.findById(orderId).populate("vendor");
    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    };

    if(order.vendor._id.toString() !== vendorId){ 
      return res.status(403).send({ message: "Unauthorized to assign this order" });
    }

    const  delivery = await Delivery.findById(deliveryId);
    if(!delivery){
      return res.status(404).send({ message: "Delivery person not found" });
    }

    if(delivery.status !== "available"){
      return res.status(400).send({ message: "Delivery person is not available" });
    }

    order.delivery = deliveryId;
    order.status = "assigned";
    await order.save();
    res.status(200).send({message: "Order assigned to delivery person successfully", order: await order.populate("delivery", "name phone")});
  } catch (error) {
    console.error("Assigned order error:", error);
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
  updateStatus,
  getVendorOrders,
  getVendorMenu,
  assignOrder,
};
