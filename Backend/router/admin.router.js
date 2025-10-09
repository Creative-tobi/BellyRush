const express = require("express");
const {
  createAdmin,
  resendOTP,
  verifyOTP,
  adminLogin,
  adminProfile,
  getVendor,
  getBuyer,
  getDelivery,
  getMenu,
  getOrder,
  deleteVendor,
  deleteBuyer,
  deleteDelivery,
  deleteMenu,
  deleteOrder,
  updateAdmin
} = require("../controller/admin.controller");
const upload  = require("../config/multer");
const authmiddleware = require("../middleware/auth.middleware");
const rolemiddleware = require("../middleware/role.middleware");

const router = express.Router();

router.post("/adminregister", upload.single("profileImage"), createAdmin);
router.post("/adminlogin", adminLogin);
router.get("/adminprofile", authmiddleware, adminProfile);
router.post("/verifyotp", verifyOTP);
router.put("/resendotp", resendOTP);
router.put("/updateadmin", authmiddleware, upload.single("profileImage"), updateAdmin);

router.get("/allvendor", authmiddleware, rolemiddleware("admin"), getVendor);
router.get("/allbuyer", authmiddleware, rolemiddleware("admin"), getBuyer);
router.get(
  "/alldelivery",
  authmiddleware,
  rolemiddleware("admin"),
  getDelivery
);
router.get("/allmenu", authmiddleware, rolemiddleware("admin"), getMenu);
router.get("/allorder", authmiddleware, rolemiddleware("admin"), getOrder);

router.delete(
  "/removeVendor/:id",
  authmiddleware,
  rolemiddleware("admin"),
  deleteVendor
);
router.delete(
  "/removeBuyer/:id",
  authmiddleware,
  rolemiddleware("admin"),
  deleteBuyer
);
router.delete(
  "/removeDelivery/:id",
  authmiddleware,
  rolemiddleware("admin"),
  deleteDelivery
);
router.delete(
  "/removeMenu/:id",
  authmiddleware,
  rolemiddleware("admin"),
  deleteMenu
);
router.delete(
  "/removeOrder/:id",
  authmiddleware,
  rolemiddleware("admin"),
  deleteOrder
);

module.exports = router;
