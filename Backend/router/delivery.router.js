const express = require("express");
const {
    createDelivery,
      resendOTP,
      verifyOTP,
      deliveryLogin,
      deliveryProfile,
} = require("../controller/delivery.controller");
const authmiddleware = require("../middleware/auth.middleware");
const upload = require("../config/multer");

router = express.Router();

router.get("/deliveryprofile", authmiddleware, deliveryProfile);
router.post("/deliveryregister", upload.single("profileImage"), createDelivery);
router.post("/deliverylogin", deliveryLogin);

router.post("/verifyotp", verifyOTP);
router.put("/resendotp", resendOTP);

module.exports = router;