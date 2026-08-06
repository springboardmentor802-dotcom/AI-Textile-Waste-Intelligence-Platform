/**
 * Recycling Recommendation Engine - Controller Layer
 * 
 * Exposes endpoints for recommendation health and evaluation.
 */

const recommendationService = require("../services/recommendationService");

const getHealth = async (req, res) => {
  return res.status(200).json({
    status: "UP",
    module: "Recycling Recommendation Engine",
    timestamp: new Date().toISOString(),
    version: "1.0.0-day3",
  });
};

const evaluateRecommendation = async (req, res) => {
  try {
    const { material, condition, contaminationLevel, wasteCategory, recyclability, quantity, uploadedImage } = req.body;
    const createdBy = req.user ? req.user._id : null;

    const recommendations = await recommendationService.generateRecommendations({
      material,
      condition,
      contaminationLevel,
      wasteCategory,
      recyclability,
      quantity,
      persist: true,
      createdBy,
      uploadedImage,
    });

    return res.status(200).json({
      material,
      condition,
      recommendations,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Recommendation Evaluation Error:`, error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "An unexpected error occurred while processing recycling recommendations",
    });
  }
};

const getHistory = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const limit = parseInt(req.query.limit, 10) || 20;

    const records = await recommendationService.getRecommendationHistory({ userId, limit });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Recommendation History Error:`, error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to retrieve recommendation history",
    });
  }
};

module.exports = {
  getHealth,
  evaluateRecommendation,
  getHistory,
};
