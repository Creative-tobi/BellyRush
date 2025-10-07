const express = require("express");
const Buyer = require("../model/buyer.model");
const { Vendor, Order, Menu } = require("../model/vendor.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const upload = require("../config/multer");
const stripe = require("../config/stripe");
const sendMail = require("../service/nodemailer");

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
const sendOTPEmail = async (email, otp, name) => {
  try {
    await sendMail({
      to: email,
      subject: "Your BellyRush Buyer OTP Verification",
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

const sendVerificationSuccessEmail = async (email, name) => {
  try {
    await sendMail({
      to: email,
      subject: "BellyRush Buyer Account Verified",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4CAF50;">Account Verified Successfully!</h2>
          <p>Hello ${name},</p>
          <p>Your BellyRush buyer account has been successfully verified.</p>
          <p>You can now start ordering delicious food from our vendors!</p>
          <hr>
          <p>Best regards,<br>BellyRush Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.warn("Failed to send verification success email:", error.message);
  }
};

const sendOrderConfirmationEmail = async (email, name, orderDetails) => {
  try {
    await sendMail({
      to: email,
      subject: "BellyRush Order Confirmation",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4CAF50;">Order Confirmed!</h2>
          <p>Hello ${name},</p>
          <p>Your order has been successfully placed and confirmed.</p>
          <div style="background-color: #f9f9f9; padding: 15px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <p><strong>Order ID:</strong> ${orderDetails._id}</p>
            <p><strong>Total Amount:</strong> $${(
              orderDetails.totalamount / 100
            ).toFixed(2)}</p>
            <p><strong>Status:</strong> ${orderDetails.status}</p>
          </div>
          <p>We'll notify you when your order is being prepared and delivered.</p>
          <hr>
          <p>Best regards,<br>BellyRush Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.warn("Failed to send order confirmation email:", error.message);
  }
};

//register buyer
async function createBuyer(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    // ✅ Enhanced Validation
    if (!name || !email || !password || !phone) {
      return res.status(400).send({ error: "All fields are required" });
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

    const profileImage = req.file ? req.file.path : null;

    const existingBuyer = await Buyer.findOne({ email });
    if (existingBuyer) {
      return res.status(400).send({ error: "Buyer email already exists" });
    }

    //hashing password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //creating OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log("Generated OTP:", otp);

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

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, name);
    } catch (emailError) {
      console.warn(
        "Email sending failed, but buyer was created:",
        emailError.message
      );
      // Don't fail the entire registration if email fails
    }

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

    res.status(201).send({
      message:
        "You have successfully registered on BellyRush as a buyer. Please check your email for OTP verification.",
      token,
      buyer: {
        id: newBuyer._id,
        name: newBuyer.name,
        email: newBuyer.email,
        phone: newBuyer.phone,
      },
    });
  } catch (error) {
    console.error("Buyer registration error:", error);
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

    const buyer = await Buyer.findOne({ email });
    if (!buyer) {
      return res.status(404).send({ message: "Buyer not found" });
    }

    // Check if account is already verified
    if (buyer.isVerified) {
      return res.status(400).send({ message: "Account is already verified" });
    }

    //generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    buyer.OTP = otp;
    buyer.otpExpired = Date.now() + 10 * 60 * 1000;
    await buyer.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, buyer.name);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return res.status(500).send({ message: "Failed to send OTP email" });
    }

    res.status(200).send({
      message: "New OTP sent successfully",
      email: buyer.email,
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

    const buyer = await Buyer.findOne({ email });
    if (!buyer) {
      return res.status(404).send({ message: "Buyer not available" });
    }

    // Check if already verified
    if (buyer.isVerified) {
      return res.status(400).send({ message: "Account is already verified" });
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

    // Send verification success email
    try {
      await sendVerificationSuccessEmail(email, buyer.name);
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

//buyer login
async function buyerLogin(req, res) {
  try {
    const { email, password } = req.body;

    // ✅ Enhanced Validation
    if (!email || !password) {
      return res.status(400).send({ message: "Email and password required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).send({ message: "Valid email is required" });
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

    if (!buyer.isVerified) {
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
    console.error("Buyer login error:", error);
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
    console.error("Buyer profile error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//getting all vendors
async function getVendors(req, res) {
  try {
    const allVendors = await Vendor.find({ isVerified: true }).select(
      "-password"
    );
    if (!allVendors || allVendors.length === 0) {
      return res.status(404).send({ message: "No vendors found" });
    }
    res
      .status(200)
      .send({
        message: "Available vendors fetched successfully",
        vendors: allVendors,
      });
  } catch (error) {
    console.error("Get vendors error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//GET MENU LIST
async function getMenu(req, res) {
  try {
    const allMenu = await Menu.find().select(
      "-password"
    );
    if (!Menu || allMenu.length === 0) {
      return res.status(404).send({ message: "No menu found" });
    }
    res.status(200).send({
      message: "Available menu fetched successfully",
      vendors: allMenu,
    });
  } catch (error) {
    console.error("Get menu error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}


// CREATE ORDER
async function createOrder(req, res) {
  try {
    const { menuId, deliveryaddress, contact, buyerId, quantity } = req.body;

    // ✅ Enhanced Validation
    if (!menuId || !buyerId || !deliveryaddress || !contact) {
      return res.status(400).send({
        message: "menuId, buyerId, deliveryaddress, contact are required",
      });
    }

    if (!validatePhone(contact)) {
      return res.status(400).send({ message: "Invalid contact number format" });
    }

    if (quantity && (isNaN(quantity) || quantity <= 0)) {
      return res
        .status(400)
        .send({ message: "Quantity must be a positive number" });
    }

    const menu = await Menu.findById(menuId).populate(
      "vendor",
      "restaurantName email isVerified"
    );
    if (!menu) {
      return res.status(404).send({ message: "Menu not found" });
    }

    if (!menu.vendor || !menu.vendor.isVerified) {
      return res.status(400).send({ message: "Vendor is not available" });
    }

    const buyer = await Buyer.findById(buyerId);
    if (!buyer) {
      return res.status(404).send({ message: "Buyer not found" });
    }

    if (!buyer.isVerified) {
      return res
        .status(400)
        .send({ message: "Buyer account must be verified to place orders" });
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
    // const {id} = req.user.id;
    const buyerId = req.body;

    if (!buyerId) {
      return res.status(400).send({ message: "Buyer ID missing in token" });
    }

    const orders = await Order.find({ buyer: buyerId })
      .populate("buyer", "name email")
      .populate("vendor", "restaurantName email")
      .populate("delivery", "name phone")
      .sort({ createdAt: -1 });

    if (!orders || orders.length === 0) {
      return res.status(404).send({ message: "No orders found" });
    }

    res.status(200).send({
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
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

    // Validate status if provided
    const validStatuses = [
      "pending",
      "confirmed",
      "preparing",
      "ready",
      "delivered",
      "cancelled",
    ];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).send({ message: "Invalid order status" });
    }

    if (status) order.status = status;
    if (delivery) order.delivery = delivery;

    await order.save();

    res.status(200).send({
      message: "Order updated successfully",
      order,
    });
  } catch (error) {
    console.error("Update order error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

// CHECKOUT ORDER
async function checkoutOrder(req, res) {
  try {
    const { orderId, paymentIntentId } = req.body;

    // ✅ Enhanced Validation
    if (!orderId) {
      return res.status(400).send({ message: "orderId is required" });
    }

    if (!paymentIntentId) {
      return res.status(400).send({ message: "paymentIntentId is required" });
    }

    const order = await Order.findById(orderId).populate("buyer", "name email");
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
    order.status = "confirmed";
    await order.save();

    // Send order confirmation email
    try {
      await sendOrderConfirmationEmail(
        order.buyer.email,
        order.buyer.name,
        order
      );
    } catch (emailError) {
      console.warn(
        "Failed to send order confirmation email:",
        emailError.message
      );
    }

    res.status(200).send({
      message: "Payment confirmed, order marked as confirmed",
      order,
    });
  } catch (error) {
    console.error("Checkout Error:", error);
    if (error.type === "StripeInvalidRequestError") {
      return res.status(400).send({ error: "Invalid payment intent" });
    }
    res.status(500).send({ error: "Internal server error" });
  }
}

// CREATE PAYMENT INTENT (New endpoint for frontend)
async function createPaymentIntent(req, res) {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).send({ message: "orderId is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    if (order.paymentStatus === "succeeded") {
      return res.status(400).send({ message: "Order already paid" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: order.totalamount,
      currency: "usd",
      metadata: { orderId: order._id.toString() },
      description: `Order #${order._id} payment`,
    });

    res.status(200).send({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error) {
    console.error("Create payment intent error:", error);
    res.status(500).send({ error: "Failed to create payment intent" });
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
  createPaymentIntent,
  getMenu,
};
