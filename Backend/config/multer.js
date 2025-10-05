const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: (req, file, cb) =>{
        cb(null, "uploads/");
    },

    filename: (req, file, cb) =>{
        const uniqueName = Date.now() + "-" + file.originalname;
        cb(null, uniqueName);
    },
});

const fileFilter = (req, file, cb) =>{
    if(file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else{
        cb(new Error("Only image files are allowed!"), false)
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {fileSize: 2 * 1024 * 1024},
});

module.exports = upload;