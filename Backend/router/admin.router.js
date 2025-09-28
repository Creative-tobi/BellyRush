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
} = require("../controller/admin.controller");
const upload = require("../config/multer")
const authmiddleware = require("../middleware/auth.middleware");
const rolemiddleware = require("../middleware/role.middleware");

const router = express.Router();

router.post("/adminregister", upload.single("profileImage"), createAdmin);
router.post("/adminlogin", adminLogin);
router.get("/adminprofile", authmiddleware, adminProfile);
router.post("/verifyotp", verifyOTP);
router.put("/resendotp", resendOTP);

router.get("/allvendor",rolemiddleware("admin") , getVendor);
router.get("/allbuyer", rolemiddleware("admin"), getBuyer);
router.get("/alldelivery", rolemiddleware("admin"), getDelivery);
router.get("/allmenu", rolemiddleware("admin"), getMenu);
router.get("/allorder", rolemiddleware("admin"), getOrder);

router.delete("/removeVendor", rolemiddleware("admin"), deleteVendor);
router.delete("/removeBuyer", rolemiddleware("admin"), deleteBuyer);
router.get("/removeDelivery", rolemiddleware("admin"), deleteDelivery);
router.delete("/removeMenu", rolemiddleware("admin"), deleteMenu);
router.delete("/removeOrder", rolemiddleware("admin"), deleteOrder);

module.exports = router