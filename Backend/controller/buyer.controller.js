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
    const { name, email, password, OTP, phone } = req.body;

    // ✅ Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).send({ error: "All fields are required" });
    }
    if (typeof email !== "string" || !email.includes("@")) {
      return res.status(400).send({ error: "Invalid email format" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .send({ error: "Password must be at least 6 characters long" });
    }

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

    // ✅ Validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).send({ message: "Valid email is required" });
    }

    const buyer = await Buyer.findOne({ email });
    if (!buyer) {
      return res.status(404).send({ message: "Buyer not found" });
    }

    //generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    buyer.OTP = otp;
    buyer.otpExpired = Date.now() + 10 * 60 * 1000;
    await buyer.save();

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
    // ✅ Validation
    if (!email || !OTP) {
      return res.status(400).send({ message: "Email and OTP are required" });
    }
    if (isNaN(OTP)) {
      return res.status(400).send({ message: "OTP must be numeric" });
    }

    const buyer = await Buyer.findOne({ email });
    if (!buyer) {
      return res.status(404).send({ message: "Buyer not available" });
    }

    if (buyer.OTP !== Number(OTP))
      return res.status(400).send({ message: "Invalid OTP" });

    if (buyer.otpExpired < Date.now())
      return res
        .status(400)
        .send({ message: "OTP expired, please request a new one" });

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
async function buyerLogin(req, res) {
  try {
    const { email, password } = req.body;

    // ✅ Validation
    if (!email || !password) {
      return res.status(400).send({ message: "Email and password required" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .send({ message: "Password must be at least 6 characters" });
    }

    const buyer = await Buyer.findOne({ email });
    if (!buyer) {
      return res.status(404).send({ error: "Buyer not found" });
    }

    const validPassword = await bcrypt.compare(password, buyer.password);
    if (!validPassword) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    const otpverify = await Buyer.findOne({ email, isVerified: true });
    if (!otpverify) {
      return res.status(400).send({ message: "Please verify your account" });
    }

    const token = jwt.sign(
      {
        id: buyer._id,
        role: "buyer",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "2h",
      }
    );

    res.status(200).send({
      message: "Login successful",
      token,
      buyer: {
        id: buyer._id,
        name: buyer.name,
        email: buyer.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//Buyer's profile
async function buyerProfile(req, res) {
  try {
    const buyerID = req.user.id;

    if (!buyerID) {
      return res.status(400).send({ message: "Buyer ID missing in token" });
    }

    const buyer = await Buyer.findById(buyerID).select("-password");
    if (!buyer) {
      return res.status(404).send({ message: "Buyer not found" });
    }

    res.status(200).send({ message: "Buyer profile", buyer });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
}

//getting all vendors
async function getVendors(req, res) {
  try {
    const allVendors = await Vendor.find().select("-password");
    if (!allVendors || allVendors.length === 0) {
      return res.status(404).send({ message: "No vendors found" });
    }
    res
      .status(200)
      .send({ Message: "Available vendors fetch", vendor: allVendors });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "internal server error" });
  }
}

// CREATE ORDER
async function createOrder(req, res) {
  try {
    const { menuId, deliveryaddress, contact, buyerId, quantity } = req.body;

    // ✅ Validation
    if (!menuId || !buyerId || !deliveryaddress || !contact) {
      return res
        .status(400)
        .send({
          message: "menuId, buyerId, deliveryaddress, contact required",
        });
    }
    if (quantity && quantity <= 0) {
      return res
        .status(400)
        .send({ message: "Quantity must be greater than 0" });
    }

    const menu = await Menu.findById(menuId).populate(
      "vendor",
      "restaurantName email"
    );
    if (!menu) {
      return res.status(404).send({ message: "Menu not found" });
    }

    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return res.status(404).send({ message: "Buyer not found" });
    }

    let order = await Order.findOne({ buyer: buyerId, status: "pending" });

    if (!order) {
      order = new Order({
        buyer: buyerId,
        vendor: menu.vendor._id,
        items: [],
        deliveryaddress,
        contact,
        totalamount: 0,
        status: "pending",
        paymentStatus: "unpaid",
      });
    }

    const existingItem = order.items.find(
      (item) => item.menuId.toString() === menuId
    );

    if (existingItem) {
      existingItem.quantity += quantity || 1;
    } else {
      order.items.push({
        menuId: menu._id,
        name: menu.foodname,
        price: menu.price,
        quantity: quantity || 1,
      });
    }

    order.totalamount = order.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await order.save();

    res.status(201).send({
      message: "Item added to order successfully",
      order,
    });
  } catch (error) {
    console.error("Create Order Error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

// GET ORDERS
async function getOrders(req, res) {
  try {
    const buyerId = req.user.id;

    if (!buyerId) {
      return res.status(400).send({ message: "Buyer ID missing in token" });
    }

    const orders = await Order.find({ buyer: buyerId })
      .populate("buyer", "name email")
      .populate("vendor", "restaurantName email")
      .populate("delivery", "name phone");

    if (!orders || orders.length === 0) {
      return res.status(404).send({ message: "No orders found" });
    }

    res.status(200).send({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
}

// UPDATE ORDER
async function updateOrder(req, res) {
  try {
    const { id } = req.params;
    const { status, delivery } = req.body;

    if (!id) {
      return res.status(400).send({ message: "Order ID is required" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    if (status) order.status = status;
    if (delivery) order.delivery = delivery;

    await order.save();

    res.status(200).send({
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Internal server error" });
  }
}

// CHECKOUT ORDER
async function checkoutOrder(req, res) {
  try {
    const { orderId, paymentIntentId } = req.body;

    // ✅ Validation
    if (!orderId) {
      return res.status(400).send({ message: "orderId is required" });
    }
    if (!paymentIntentId) {
      return res.status(400).send({ message: "paymentIntentId is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    if (order.paymentStatus === "succeeded") {
      return res.status(400).send({ message: "Order already paid" });
    }

    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (
      paymentIntent.status !== "succeeded" &&
      paymentIntent.status !== "requires_capture"
    ) {
      return res.status(400).send({ message: "Payment not successful yet" });
    }

    order.paymentStatus = "succeeded";
    order.status = "paid";
    await order.save();

    res.status(200).send({
      message: "Payment confirmed, order marked as paid",
      order,
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    res.status(500).send({ error: "Internal server error" });
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
  updateOrder,
  checkoutOrder,
};
