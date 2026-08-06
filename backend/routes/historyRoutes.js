const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getClassifications,
  deleteHistoryRecord,
} = require("../controllers/classificationController");

// @route   GET /api/history
// @desc    Get user's past classification analyses history list
// @access  Protected
router.get("/", protect, getClassifications);

// @route   DELETE /api/history/:id
// @desc    Delete a classification analysis record by ID
// @access  Protected
router.delete("/:id", protect, deleteHistoryRecord);

module.exports = router;
