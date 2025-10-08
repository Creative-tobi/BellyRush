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
  updateItemQuantity,
  updateOrder,
  checkoutOrder,
  getMenu,
  createPaymentIntent,
  updateAddress,
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
router.post("/createorder", authmiddleware, createOrder);
router.get("/getorders", authmiddleware, getOrders);
router.put("/updateitemquantity", authmiddleware, updateItemQuantity);
router.get("/getallmenu/:vendorId", getMenu);
router.put("/updateorder", updateOrder);
router.put("/updateaddress", authmiddleware, updateAddress);
router.post("/ordercheckout", checkoutOrder);
router.post("/create-payment-intent/:id", createPaymentIntent);

module.exports = router;