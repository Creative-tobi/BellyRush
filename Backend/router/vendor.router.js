const express = require("express");
const {
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
  getAvailableDeliveryRiders,
} = require("../controller/vendor.controller");

const authmiddleware = require("../middleware/auth.middleware");
const upload = require("../config/multer");

router = express.Router();

router.get("/vendorprofile", authmiddleware, vendorProfile);
router.post("/registervendor", upload.single("profileImage"), createVendor);
router.post("/vendorlogin", vendorLogin);
router.post("/vendorotp", verifyOTP);
router.put("/resendvendorotp", resendOTP);
router.put("/updatevendor", authmiddleware,upload.single("profileImage"), updateVendor);

router.post("/createmenu", upload.single("profileImage"), createMenu);
router.put("/updatemenu/:id", updateMenu);
router.delete("/deletemenu/:id", authmiddleware, deletemenu);
router.put("/updatestatus/:id", authmiddleware, updateStatus);
router.get("/vendororders", authmiddleware, getVendorOrders);
router.get("/vendormenu", authmiddleware, getVendorMenu);
router.post("/assignorder", authmiddleware, assignOrder);
router.get("/availabledeliveries", authmiddleware, getAvailableDeliveryRiders);
module.exports = router;
