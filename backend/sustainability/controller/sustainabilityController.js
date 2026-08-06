/**
 * Sustainability Intelligence Engine - Controller Layer
 * 
 * Handles incoming HTTP requests for sustainability analysis and engine health checks.
 * Follows MVC pattern and delegates calculation business logic to Sustainability Service.
 */

const sustainabilityService = require("../services/sustainabilityService");
const { ENGINE_STATUS } = require("../utils/sustainabilityUtils");

/**
 * @desc    Health check endpoint for Sustainability Intelligence Engine
 * @route   GET /api/sustainability/health
 * @access  Public
 */
const getHealth = async (req, res) => {
  try {
    return res.status(200).json({
      status: ENGINE_STATUS.HEALTHY,
      module: "Sustainability Intelligence Engine",
      timestamp: new Date().toISOString(),
      version: "1.0.0-day2",
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Sustainability Health Check Error:`, error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to perform sustainability health check",
    });
  }
};

/**
 * @desc    Analyze textile waste sustainability impact (Calculates Carbon, Diversion, Recovery, & Score)
 * @route   POST /api/sustainability/analyze
 * @access  Public / Protected
 */
const analyzeSustainability = async (req, res) => {
  try {
    const { material, condition, quantity, recyclability, contaminationLevel, wasteCategory, uploadedImage } = req.body;
    const createdBy = req.user ? req.user._id : null;

    // Execute sustainability analysis via Service Layer
    const result = await sustainabilityService.analyzeSustainability({
      material,
      condition,
      quantity,
      recyclability,
      contaminationLevel,
      wasteCategory,
      createdBy,
      uploadedImage,
    });

    // Return HTTP 200 OK with calculated metrics payload
    return res.status(200).json(result);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Sustainability Analysis Error:`, error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "An unexpected error occurred while processing sustainability analysis",
    });
  }
};

/**
 * @desc    Get sustainability analysis history
 * @route   GET /api/sustainability/history
 * @access  Public / Protected
 */
const getHistory = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : null;
    const limit = parseInt(req.query.limit, 10) || 20;

    const records = await sustainabilityService.getSustainabilityHistory({ userId, limit });

    return res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Sustainability History Error:`, error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to retrieve sustainability history",
    });
  }
};

/**
 * @desc    Get single sustainability analysis record by ID
 * @route   GET /api/sustainability/history/:id
 * @access  Public / Protected
 */
const getRecordById = async (req, res) => {
  try {
    const { id } = req.params;
    const record = await sustainabilityService.getSustainabilityRecordById(id);

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Sustainability record not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Sustainability Record Error:`, error);
    return res.status(500).json({
      success: false,
      error: "Internal Server Error",
      message: "Failed to retrieve sustainability record",
    });
  }
};

module.exports = {
  getHealth,
  analyzeSustainability,
  getHistory,
  getRecordById,
};
