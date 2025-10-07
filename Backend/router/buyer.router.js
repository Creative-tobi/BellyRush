const express = require("express");
const {
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
  getMenu,
  createPaymentIntent,
} = require("../controller/buyer.controller");

const upload = require("../config/multer");
const authmiddleware = require("../middleware/auth.middleware");
const rolemiddleware = require("../middleware/role.middleware");

const router = express.Router();

router.post("/createbuyer", upload.single("profileImage"), createBuyer);
router.post("/buyerlogin", buyerLogin);
router.get("/buyerprofile", authmiddleware, buyerProfile);
router.post("/otpverify", verifyOTP);
router.put("/updateotp", resendOTP);
router.get("/restaurants", getVendors);
router.post("/createorder/:id", createOrder);
router.get("/getorders", getOrders);
router.get("/getallmenu", getMenu);
router.put("/updateorder", updateOrder);
router.post("/ordercheckout", checkoutOrder);
router.post("/create-payment-intent", createPaymentIntent);

module.exports = router;