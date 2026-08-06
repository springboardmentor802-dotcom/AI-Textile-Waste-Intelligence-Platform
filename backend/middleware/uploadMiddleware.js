const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `textile-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/pjpeg",
  ];
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];

  const fileMimeType = (file.mimetype || "").toLowerCase();
  const ext = path.extname(file.originalname || "").toLowerCase();

  const isMimeValid = allowedMimeTypes.includes(fileMimeType);
  const isExtValid = allowedExtensions.includes(ext);

  if (isMimeValid || isExtValid) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file format. Only JPG, JPEG, PNG, and WEBP images are supported."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});

module.exports = upload;
