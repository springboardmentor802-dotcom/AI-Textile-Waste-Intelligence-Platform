const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const { predictImage } = require("../controllers/predictController");

// @route   POST /api/predict
// @desc    Upload textile image and run model prediction in one request
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
  predictImage
);

module.exports = router;
