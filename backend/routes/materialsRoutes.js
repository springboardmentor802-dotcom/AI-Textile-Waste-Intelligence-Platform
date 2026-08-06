const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getMaterials } = require("../controllers/materialsController");

// @route   GET /api/materials
// @desc    Get all supported materials
// @access  Protected
router.get("/", protect, getMaterials);

module.exports = router;
