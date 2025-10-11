const express = require("express");
const {
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
} = require("../controller/delivery.controller");
const authmiddleware = require("../middleware/auth.middleware");
const  upload  = require("../config/multer");

router = express.Router();

router.get("/deliveryprofile", authmiddleware, deliveryProfile);
router.post("/deliveryregister", upload.single("profileImage"), createDelivery);
router.post("/deliverylogin", deliveryLogin);
router.put("/delivery/status", updateStatus);
router.put("/updatedeliveryprofile", authmiddleware, upload.single("profileImage"), updateDeliveryProfile);

router.post("/deliveryotp", verifyOTP);
router.put("/resenddeliveryotp", resendOTP);

router.put("/updatelocation", authmiddleware, updateLocation);
router.get("/findnearbydeliveries", findNearbyDeliveries);
router.post("/deliverorder/:id", authmiddleware, deliverOrder);
router.get("/getassignorder", authmiddleware, GetAssignOrder);
router.put("/updateorderstatus/:id", authmiddleware, updateOrderStatus);

module.exports = router;
