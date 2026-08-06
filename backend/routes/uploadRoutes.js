const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { uploadImage } = require("../controllers/uploadController");

// @route   POST /api/upload
// @desc    Upload textile image and save metadata
// @access  Protected
router.post(
  "/",
  protect,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  },
  uploadImage
);

module.exports = router;
