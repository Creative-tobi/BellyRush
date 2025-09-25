const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Delivery = require("../model/delivery.model");
const geocoder = require("../config/geocoder");

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
      status,
      deliveryArea,
      earnings,
      rating,
      reviews,
      orders,
      payout,
    } = req.body;

    const profileImage = req.file ? req.file.path : null;

    // Geocode the currentLocation
    const geoResult = await geocoder.geocode(currentLocation);

    const locationData =
      geoResult && geoResult.length > 0 ? geoResult[0] : null;

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

    // Check if delivery man already exists
    const existingDelivery = await Delivery.findOne({ email });
    if (existingDelivery) {
      return res.status(400).send({ error: "Rider's email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

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

    // Generate JWT
    const token = jwt.sign(
      { id: newDelivery._id, role: "delivery" },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    res.status(200).send({
      message: "You have successfully registered as a delivery man",
      token,
      delivery: newDelivery,
    });
  } catch (error) {
    console.error("createDelivery error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

// Resend OTP
async function resendOTP(req, res) {
  try {
    const { email } = req.body;
    const delivery = await Delivery.findOne({ email });

    if (!delivery) {
      return res.status(404).send({ message: "Delivery man not found" });
    }

    // Generate new OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    delivery.OTP = otp;
    delivery.otpExpired = Date.now() + 10 * 60 * 1000;

    await delivery.save();

    res.status(200).send({
      message: "New OTP sent successfully",
      OTP: delivery.OTP,
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
    if (!email || !OTP) {
      return res.status(400).send({ message: "Invalid credentials" });
    }

    const delivery = await Delivery.findOne({ email });
    if (!delivery) {
      return res.status(404).send({ message: "Delivery man not found" });
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
    if (!email || !password)
      return res.status(400).send({ message: "Invalid credentials" });

    const delivery = await Delivery.findOne({ email });
    if (!delivery)
      return res.status(404).send({ message: "Delivery man not found" });

    const validPassword = await bcrypt.compare(password, delivery.password);
    if (!validPassword)
      return res.status(400).send({ message: "Invalid credentials" });

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

    if (!delivery)
      return res.status(404).send({ message: "Delivery not found" });

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
    const delivery = await Delivery.findOne({ email });

    if (!delivery)
      return res.status(404).send({ message: "Delivery man not found" });

    delivery.status = status;
    await delivery.save();

    res.status(200).send({
      message: "Delivery man status updated successfully",
      delivery,
    });
  } catch (error) {
    console.error("updateStatus error:", error);
    res.status(500).send({ error: "Internal server error" });
  }
}

module.exports = {
  createDelivery,
  resendOTP,
  verifyOTP,
  deliveryLogin,
  deliveryProfile,
  updateStatus,
};
