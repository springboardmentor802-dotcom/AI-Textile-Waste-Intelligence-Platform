/**
 * Recycling Recommendation Engine - Express Routes
 */

const express = require("express");
const router = express.Router();
const recommendationController = require("../controllers/recommendationController");
const { validateRecommendationRequest } = require("../middleware/recommendationValidator");

router.get("/health", recommendationController.getHealth);
router.get("/history", recommendationController.getHistory);
router.post("/evaluate", validateRecommendationRequest, recommendationController.evaluateRecommendation);

module.exports = router;
