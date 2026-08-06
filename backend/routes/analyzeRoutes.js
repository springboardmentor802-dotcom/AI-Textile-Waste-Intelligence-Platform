const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { analyzeImage } = require("../controllers/analyzeController");

// @route   POST /api/analyze
// @desc    Execute image analysis by imageId
// @access  Protected
router.post("/", protect, analyzeImage);

module.exports = router;
