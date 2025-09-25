const express = require("express");
const {
  createDelivery,
  resendOTP,
  verifyOTP,
  deliveryLogin,
  deliveryProfile,
  updateStatus,
} = require("../controller/delivery.controller");
const authmiddleware = require("../middleware/auth.middleware");
const upload = require("../config/multer");

router = express.Router();

router.get("/deliveryprofile", authmiddleware, deliveryProfile);
router.post("/deliveryregister", upload.single("profileImage"), createDelivery);
router.post("/deliverylogin", deliveryLogin);
router.put("/delivery/status", updateStatus);

router.post("/deliveryotp", verifyOTP);
router.put("/resenddeliveryotp", resendOTP);

module.exports = router;