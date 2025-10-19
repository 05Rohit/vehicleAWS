const multer = require("multer");
const path = require("path");

// Allowed file types
const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png" ,'image/webp'];

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads"); // Ensure "uploads" folder exists
  },
  filename: function (req, file, cb) {
    // Unique filename
    const uniqueSuffix =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);
    cb(null, uniqueSuffix);
  },
});

// File filter function to allow only specific formats
const fileFilter = (req, file, cb) => {
  if (!file) {
    // If no file is provided, allow the request to proceed
    cb(null, true);
  } else if (allowedFileTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error("Only JPG, JPEG, and PNG files are allowed!"), false);
  }
};

const maxSize = 5 * 1024 * 1024; // 1MB file size limit

const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: fileFilter,
});

module.exports = upload;