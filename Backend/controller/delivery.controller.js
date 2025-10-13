const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  cloudinary,
  storage,
} = require("../config/cloudinary");
const Delivery = require("../model/delivery.model");
const geocoder = require("../config/geocoder");
const { sendEmail }= require("../service/nodemailer");
const { Vendor, Menu, Order } = require("../model/vendor.model");
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
    await sendEmail({
      to: email,
      subject: "Your BellyRush Delivery OTP Verification",
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
    await sendEmail({
      to: email,
      subject: "BellyRush Delivery Account Verified",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4CAF50;">Account Verified Successfully!</h2>
          <p>Hello ${name},</p>
          <p>Your BellyRush delivery account has been successfully verified.</p>
          <p>You can now start accepting delivery requests and earning money!</p>
          <hr>
          <p>Best regards,<br>BellyRush Team</p>
        </div>
      `,
    });
  } catch (error) {
    console.warn("Failed to send verification success email:", error.message);
  }
};

// Register delivery man
async function createDelivery(req, res) {
  try {
    const {
      name,
      email,
      password,
      phone,
      address,
      currentLocation,
      status = "offline",
      deliveryArea,
      earnings = 0,
      rating = 0,
      reviews = 0,
      orders = 0,
      payout = 0,
    } = req.body;

    // Enhanced Validation
    if (!name || !email || !password || !phone || !currentLocation) {
      return res.status(400).send({
        error:
          "Name, email, password, phone, and current location are required",
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

    let profileImage = null;
    if (req.file) {
      profileImage = req.file.path;
    }
    const existingDelivery = await Delivery.findOne({ email });
    if (existingDelivery) {
      return res.status(400).send({ error: "Delivery email already exists" });
    }

    // Geocode the currentLocation with error handling
    let locationData = null;
    try {
      const geoResult = await geocoder.geocode(currentLocation);
      locationData = geoResult && geoResult.length > 0 ? geoResult[0] : null;
    } catch (geoError) {
      console.error("Geocoding error:", geoError);
      return res.status(400).send({
        error: "Invalid location address. Please provide a valid address.",
      });
    }

    const location = locationData
      ? {
          type: "Point",
          coordinates: [locationData.longitude, locationData.latitude],
          formattedAddress: locationData.formattedAddress,
        }
      : {
          type: "Point",
          coordinates: [0, 0],
          formattedAddress: currentLocation || "",
        };

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    console.log("Generated OTP:", otp);

    const newDelivery = new Delivery({
      name,
      email,
      password: hashedPassword,
      OTP: otp,
      phone,
      address,
      profileImage,
      currentLocation: location,
      status,
      deliveryArea,
      earnings,
      rating,
      reviews,
      orders,
      payout,
      otpExpired: Date.now() + 10 * 60 * 1000,
    });

    await newDelivery.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, name);
    } catch (emailError) {
      console.warn(
        "Email sending failed, but delivery was created:",
        emailError.message
      );
      // Don't fail the entire registration if email fails
    }

    // Generate JWT
    const token = jwt.sign(
      { id: newDelivery._id, role: "delivery" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(201).send({
      message:
        "You have successfully registered as a delivery man. Please check your email for OTP verification.",
      token,
      delivery: {
        id: newDelivery._id,
        name: newDelivery.name,
        email: newDelivery.email,
        phone: newDelivery.phone,
        currentLocation: newDelivery.currentLocation,
        status: newDelivery.status,
        rating: newDelivery.rating,
        earnings: newDelivery.earnings,
      },
    });
  } catch (error) {
    console.error("createDelivery error:", error);
    if (error.name === "ValidationError") {
      return res.status(400).send({ error: "Invalid input data" });
    }
    res.status(500).send({ error: "Internal server error" });
  }
}

// Resend OTP
async function resendOTP(req, res) {
  try {
    const { email } = req.body;

    // Enhanced Validation
    if (!email) {
      return res.status(400).send({ message: "Email is required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).send({ message: "Valid email is required" });
    }

    const delivery = await Delivery.findOne({ email });

    if (!delivery) {
      return res.status(404).send({ message: "Delivery man not found" });
    }

    // Check if account is already verified
    if (delivery.isVerified) {
      return res.status(400).send({ message: "Account is already verified" });
    }

    // Generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    delivery.OTP = otp;
    delivery.otpExpired = Date.now() + 10 * 60 * 1000;

    await delivery.save();

    // Send OTP email
    try {
      await sendOTPEmail(email, otp, delivery.name);
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      return res.status(500).send({ message: "Failed to send OTP email" });
    }

    res.status(200).send({
      message: "New OTP sent successfully",
      email: delivery.email,
    });
  } catch (error) {
    console.error("resendOTP error:", error);
    res.status(500).send({ message: "Internal server error" });
  }
}

// Verify OTP
async function verifyOTP(req, res) {
  const { email, OTP } = req.body;

  try {
    // Enhanced Validation
    if (!email || !OTP) {
      return res.status(400).send({ message: "Email and OTP are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).send({ message: "Valid email is required" });
    }

    if (!/^\d{4}$/.test(OTP)) {
      return res.status(400).send({ message: "OTP must be a 4-digit number" });
    }

    const delivery = await Delivery.findOne({ email });
    if (!delivery) {
      return res.status(404).send({ message: "Delivery man not found" });
    }

    // Check if already verified
    if (delivery.isVerified) {
      return res.status(400).send({ message: "Account is already verified" });
    }

    if (delivery.OTP !== Number(OTP)) {
      return res.status(400).send({ message: "Invalid OTP" });
    }

    if (delivery.otpExpired < Date.now()) {
      return res
        .status(400)
        .send({ message: "OTP expired, request a new one" });
    }

    delivery.isVerified = true;
    delivery.OTP = null;
    delivery.otpExpired = null;

    await delivery.save();

    // Send verification success email
    try {
      await sendVerificationSuccessEmail(email, delivery.name);
    } catch (emailError) {
      console.warn(
        "Failed to send verification success email:",
        emailError.message
      );
    }

    res.status(200).send({ message: "Account verified successfully" });
  } catch (error) {
    console.error("verifyOTP error:", error);
    res.status(500).send({ message: "Internal server error" });
  }
}

// Delivery login
async function deliveryLogin(req, res) {
  try {
    const { email, password } = req.body;

    // Enhanced Validation
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

    const delivery = await Delivery.findOne({ email });
    if (!delivery) {
      return res.status(404).send({ message: "Delivery man not found" });
    }

    const validPassword = await bcrypt.compare(password, delivery.password);
    if (!validPassword) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    if (!delivery.isVerified) {
      return res.status(400).send({ message: "Please verify your account" });
    }

    const token = jwt.sign(
      { id: delivery._id, role: "delivery" },
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
        name: delivery.name,
        email: delivery.email,
        currentLocation: delivery.currentLocation,
        status: delivery.status,
        rating: delivery.rating,
        earnings: delivery.earnings,
      },
    });
  } catch (error) {
    console.error("deliveryLogin error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

// Delivery profile
async function deliveryProfile(req, res) {
  try {
    const deliveryID = req.user.id;
    const delivery = await Delivery.findById(deliveryID).select("-password");

    if (!delivery) {
      return res.status(404).send({ message: "Delivery not found" });
    }

    res.status(200).send({ message: "Delivery profile", delivery });
  } catch (error) {
    console.error("deliveryProfile error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

// Update status
async function updateStatus(req, res) {
  try {
    const { status, email } = req.body;

    // Enhanced Validation
    if (!email || !status) {
      return res.status(400).send({ message: "Email and status are required" });
    }

    if (!validateEmail(email)) {
      return res.status(400).send({ message: "Valid email is required" });
    }

    const validStatuses = ["available", "busy", "offline"];
    if (!validStatuses.includes(status)) {
      return res.status(400).send({
        message: `Invalid status. Valid statuses are: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    const delivery = await Delivery.findOne({ email });

    if (!delivery) {
      return res.status(404).send({ message: "Delivery man not found" });
    }

    delivery.status = status;
    await delivery.save();

    res.status(200).send({
      message: "Delivery man status updated successfully",
      delivery: {
        id: delivery._id,
        name: delivery.name,
        email: delivery.email,
        status: delivery.status,
        currentLocation: delivery.currentLocation,
      },
    });
  } catch (error) {
    console.error("updateStatus error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

// Update delivery location (New endpoint)
async function updateLocation(req, res) {
  try {
    const deliveryId = req.user.id;
    const { currentLocation } = req.body;

    if (!currentLocation) {
      return res.status(400).send({ error: "Current location is required" });
    }

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).send({ error: "Delivery not found" });
    }

    // Geocode the new location
    let locationData = null;
    try {
      const geoResult = await geocoder.geocode(currentLocation);
      locationData = geoResult && geoResult.length > 0 ? geoResult[0] : null;
    } catch (geoError) {
      console.error("Geocoding error:", geoError);
      return res.status(400).send({
        error: "Invalid location address. Please provide a valid address.",
      });
    }

    const location = locationData
      ? {
          type: "Point",
          coordinates: [locationData.longitude, locationData.latitude],
          formattedAddress: locationData.formattedAddress,
        }
      : {
          type: "Point",
          coordinates: [0, 0],
          formattedAddress: currentLocation || "",
        };

    delivery.currentLocation = location;
    delivery.address = currentLocation;
    await delivery.save();

    res.status(200).send({
      message: "Location updated successfully",
      delivery: {
        id: delivery._id,
        currentLocation: delivery.currentLocation,
        status: delivery.status,
      },
    });
  } catch (error) {
    console.error("updateLocation error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

// Find nearby deliveries 
async function findNearbyDeliveries(req, res) {
  try {
    const { latitude, longitude, maxDistance = 5000 } = req.query;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .send({ error: "Latitude and longitude are required" });
    }

    const deliveries = await Delivery.find({
      status: "available",
      isVerified: true,
      "currentLocation.coordinates": {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: parseInt(maxDistance),
        },
      },
    })
      .select("-password -OTP -otpExpired")
      .limit(10);

    res.status(200).send({
      message: "Nearby available deliveries found",
      deliveries,
      count: deliveries.length,
    });
  } catch (error) {
    console.error("findNearbyDeliveries error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

async function deliverOrder(req, res) {
  try {
    const orderId = req.params.id?.trim();
    const deliveryId = req.user.id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    if (order.delivery?.toString() !== deliveryId) {
      return res
        .status(403)
        .send({ message: "Not authorized to deliver this order" });
    }

    if (order.status !== "paid") {
      return res.status(400).send({ message: "Order is not out for delivery" });
    }

    order.status = "delivered";
    await order.save();

    // Credit delivery share to delivery guy's earnings
    const delivery = await Delivery.findById(deliveryId);
    if (delivery) {
      delivery.earnings += order.deliveryShare / 100; // Convert cents to dollars
      delivery.orders += 1;
      delivery.status = "available";
      await delivery.save();
    }

    res.status(200).send({ message: "Order delivered successfully", order });
  } catch (error) {
    console.error("deliverOrder error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

async function GetAssignOrder(req, res) {
  try {
    const deliveryId = req.user.id;

    const orders = await Order.find({
      delivery: deliveryId,
      status: { $in: ["pending", "pickedup", "paid"] },
    })
      .populate("buyer", "name phone address")
      .populate("vendor", "restaurantName")
      .sort({ createdAt: -1 });

    res
      .status(200)
      .send({ message: "Assigned orders fetched successfully", orders });
  } catch (error) {
    console.error("GetAssignOrder error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

//updating order status
async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params; // Fixed: was req.params.id instead of req.params
    const { status } = req.body;

    // Enhanced Validation
    if (!id) {
      return res.status(400).send({ message: "Order ID is required" });
    }

    if (!status) {
      return res.status(400).send({ message: "Status is required" });
    }

    const validStatuses = [
      "pending",
      "paid",
      "inprogress",
      "completed",
      "cancelled",
      "delivered",
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

    if (order.delivery.toString() !== req.user.id) {
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

//updating details details
async function updateDeliveryProfile(req, res) {
  try {
    const deliveryId = req.user?.id;
    if (!deliveryId) {
      return res
        .status(401)
        .json({ message: "Unauthorized: User not authenticated" });
    }

    const body = req.body || {};

    let profileImage = null;
    if (req.file) {
      profileImage = req.file.path; 
    }

    const {
      name,
      email,
      phone,
    } = body;

    const delivery = await Delivery.findById(deliveryId);
    if (!delivery) {
      return res.status(404).json({ message: "Delivery rider not found" });
    }

  
    if (delivery._id.toString() !== deliveryId.toString()) {
      return res
        .status(403)
        .json({
          message: "Forbidden: You can only update your own rider profile",
        });
    }

     if (profileImage !== undefined && profileImage !== null) {
      delivery.profileImage = profileImage;
    }

   if (name !== undefined) delivery.name = name;
   if (email !== undefined) delivery.email = email;
   if (phone !== undefined) delivery.phone = phone;

   const updatedDelivery = await delivery.save();

    return res.status(200).json({
      message: "Rider details updated successfully",
      delivery: updatedDelivery,
    });
  } catch (error) {
    console.error("Update vendor error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

// POST /payrider
async function payRiderForDelivery(req, res) {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res.status(400).json({ error: "orderId is required" });
    }

    const order = await Order.findById(orderId).populate(
      "delivery",
      "earnings"
    );

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (!order.delivery) {
      return res
        .status(400)
        .json({ error: `No rider assigned to order ${orderId}` });
    }

    if (order.status !== "delivered") {
      return res
        .status(400)
        .json({ error: "Order must be in 'delivered' status" });
    }

    const deliveryFeeCents = 200; // $2.00 in cents

    await Delivery.findByIdAndUpdate(order.delivery._id, {
      $inc: { earnings: deliveryFeeCents },
    });

    console.log(
      `Rider ${order.delivery._id} credited $${(
        deliveryFeeCents / 100
      ).toFixed(2)} for order ${orderId}`
    );

    res.status(200).json({ message: "Rider paid successfully" });
  } catch (error) {
    console.error("Pay rider error:", error.message);
    res.status(500).json({ error: "Failed to pay rider" });
  }
}

module.exports = {
  createDelivery,
  resendOTP,
  verifyOTP,
  deliveryLogin,
  deliveryProfile,
  updateStatus,
  updateLocation,
  findNearbyDeliveries,
  deliverOrder,
  GetAssignOrder,
  updateOrderStatus,
  updateDeliveryProfile,
  payRiderForDelivery,
};
