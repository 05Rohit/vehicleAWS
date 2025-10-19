const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads'); // specify the uploads directory
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + file.originalname;
    cb(null, uniqueSuffix); // create a unique filename using the current timestamp
  },
});

const fileFilter = (req, file, cb) => {
const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Accept the file
  } else {
    cb(new Error('Only .jpeg and .png files are allowed'), false); // Reject the file
  }
};

// Max file size limit (10MB)
const maxSize = 10 * 1024 * 1024; // 10MB

// Setup multer upload configuration
const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: fileFilter,
}).array('files', 10); // Accept up to 10 files at a time

module.exports = upload;