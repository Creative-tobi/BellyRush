const express = require("express");
const {
    createAdmin,
      resendOTP,
      verifyOTP,
      adminLogin,
      adminProfile,
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

module.exports = router