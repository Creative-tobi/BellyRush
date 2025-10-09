
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary").cloudinary; // ✅ Import cloudinary instance

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "buyers",
    allowed_formats: ["jpg", "png", "jpeg"],
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});
module.exports = upload;
