const express = require("express");
const router = reportRouter = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getClassifications,
  getClassificationById,
  deleteHistoryRecord,
} = require("../controllers/classificationController");

// @route   GET /api/classification
// @desc    Get user's past classifications list
// @access  Protected
router.get("/", protect, getClassifications);

// @route   GET /api/classification/:id
// @desc    Get populated classification record details by ID
// @access  Protected
router.get("/:id", protect, getClassificationById);

// @route   DELETE /api/classification/:id
// @desc    Delete classification record details by ID
// @access  Protected
router.delete("/:id", protect, deleteHistoryRecord);

module.exports = router;
