/**
 * Recycling Recommendation Engine - Validation Middleware
 * 
 * Validates HTTP payloads for the standalone Recommendation API endpoints.
 */

const validateRecommendationRequest = (req, res, next) => {
  const errors = [];
  const { material, condition } = req.body || {};

  if (!material || typeof material !== "string" || material.trim() === "") {
    errors.push("Field 'material' is required and must be a non-empty string.");
  }

  if (!condition || typeof condition !== "string" || condition.trim() === "") {
    errors.push("Field 'condition' is required and must be a non-empty string.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "Validation failed for recommendation request",
      details: errors,
    });
  }

  next();
};

module.exports = {
  validateRecommendationRequest,
};
