const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

/**
 * Dynamic Cloudinary storage
 * @param {string} folderName - cloudinary folder name
 */
const getCloudinaryStorage = (folderName) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: folderName,
      allowed_formats: ["jpg", "jpeg", "png", "pdf"],
      public_id: (req, file) => {
        const uniqueName = Date.now() + "-" + file.originalname.split(".")[0];
        return uniqueName;
      },
    },
  });

/* =========================
   VEHICLE FILE UPLOAD
========================= */
const vehicleUpload = multer({
  storage: getCloudinaryStorage("vehicles"),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).array("files", 5);

/* =========================
   USER FILE UPLOAD
========================= */
const userUpload = multer({
  storage: getCloudinaryStorage("users"),
  limits: { fileSize: 2 * 1024 * 1024 },
}).array("files");

/* =========================
   SINGLE FILE (OPTIONAL)
========================= */
const singleUserUpload = multer({
  storage: getCloudinaryStorage("users"),
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("files");
console.log("Multer configuration loaded.", userUpload);

module.exports = {
  vehicleUpload,
  userUpload,
  singleUserUpload,
};
