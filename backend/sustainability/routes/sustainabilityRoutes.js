/**
 * Sustainability Intelligence Engine - Express Routes
 * 
 * Maps HTTP endpoints to validation middleware and controller functions.
 */

const express = require("express");
const router = express.Router();
const sustainabilityController = require("../controller/sustainabilityController");
const { validateAnalyzeRequest } = require("../middleware/sustainabilityValidator");

/**
 * @route   GET /api/sustainability/health
 * @desc    Module health check
 */
router.get("/health", sustainabilityController.getHealth);

/**
 * @route   GET /api/sustainability/history
 * @desc    Get sustainability analysis history
 */
router.get("/history", sustainabilityController.getHistory);

/**
 * @route   GET /api/sustainability/history/:id
 * @desc    Get single sustainability analysis record by ID
 */
router.get("/history/:id", sustainabilityController.getRecordById);

/**
 * @route   POST /api/sustainability/analyze
 * @desc    Analyze textile waste sustainability impact
 */
router.post("/analyze", validateAnalyzeRequest, sustainabilityController.analyzeSustainability);

module.exports = router;
