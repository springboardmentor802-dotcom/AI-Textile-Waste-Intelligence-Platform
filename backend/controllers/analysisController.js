const { classifyTextileImage, SUPPORTED_MATERIALS } = require("../services/aiService");
const { materialProfiles } = require("../services/materialKnowledge");
const Analysis = require("../models/Analysis");

// @desc    Upload textile image and run AI material classification & waste categorization
// @route   POST /api/analysis/classify
// @access  Protected
const classifyImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload a valid textile image (JPG, JPEG, PNG, or WEBP) for analysis.",
      });
    }

    console.log(`[${new Date().toISOString()}] AI Classification initiated for file: ${req.file.originalname} (${req.file.size} bytes)`);

    // Run AI preprocessing and material classification
    const analysisResult = await classifyTextileImage(req.file);

    // Construct accessible image URL relative to server root
    const imageUrl = `/uploads/${req.file.filename}`;

    // Save prediction record to database
    const savedAnalysis = await Analysis.create({
      imagePath: imageUrl,
      preprocessedImagePath: analysisResult.preprocessedImagePath,
      predictedMaterial: analysisResult.prediction.predictedMaterial,
      materialConfidence: analysisResult.prediction.materialConfidence,
      wasteCategory: analysisResult.prediction.wasteCategory,
      wasteConfidence: analysisResult.prediction.wasteConfidence,
      recyclabilityScore: analysisResult.prediction.recyclabilityScore,
      recyclabilityGrade: analysisResult.prediction.recyclabilityGrade,
      recyclabilityGradeText: analysisResult.prediction.recyclabilityGradeText,
      condition: analysisResult.prediction.condition,
      preprocessingMetadata: {
        resizedShape: analysisResult.preprocessingMetadata.resizedShape,
        denoiseMethod: analysisResult.preprocessingMetadata.denoiseMethod,
        normalization: analysisResult.preprocessingMetadata.normalization,
        averageBrightness: analysisResult.preprocessingMetadata.averageBrightness,
        contrastStd: analysisResult.preprocessingMetadata.contrastStd,
      },
      recommendations: analysisResult.recommendations,
      createdBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      _id: savedAnalysis._id,
      prediction: {
        ...analysisResult.prediction,
        _id: savedAnalysis._id,
      },
      materialInfo: analysisResult.materialInfo,
      preprocessedMetadata: analysisResult.preprocessingMetadata,
      imageUrl,
      preprocessedImageUrl: analysisResult.preprocessedImagePath,
      recommendations: analysisResult.recommendations,
      uploadedFile: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("AI Classification Error:", error.message);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to analyze textile image.",
    });
  }
};

// @desc    Get all supported textile materials and classification metadata
// @route   GET /api/analysis/materials
// @access  Protected
const getSupportedMaterials = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      supportedMaterials: SUPPORTED_MATERIALS,
      profiles: materialProfiles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch supported materials.",
    });
  }
};

// @desc    Get recent analyses for the current user
// @route   GET /api/analysis/history
// @access  Protected
const getRecentAnalyses = async (req, res) => {
  try {
    const analyses = await Analysis.find({ createdBy: req.user._id })
      .sort({ createdAt: -1 })
      .limit(10);
    res.status(200).json({ success: true, count: analyses.length, data: analyses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get detailed analysis record by ID for reporting
// @route   GET /api/analysis/:id
// @access  Protected
const getAnalysisById = async (req, res) => {
  try {
    const analysis = await Analysis.findById(req.params.id).populate(
      "createdBy",
      "name email role"
    );

    if (!analysis) {
      return res.status(404).json({ success: false, message: "Analysis record not found" });
    }

    // Enrich with material knowledge profile
    const materialInfo = materialProfiles[analysis.predictedMaterial] || materialProfiles["Mixed Fabrics"];

    res.status(200).json({
      success: true,
      data: analysis,
      materialInfo,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard aggregated statistics
// @route   GET /api/analysis/dashboard-stats
// @access  Protected
const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Total Count
    const totalAnalysed = await Analysis.countDocuments({ createdBy: userId });

    // Material Distribution
    const materialDistribution = await Analysis.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: "$predictedMaterial", count: { $sum: 1 } } },
    ]);

    // Waste Category Distribution
    const wasteDistribution = await Analysis.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: "$wasteCategory", count: { $sum: 1 } } },
    ]);

    // Recyclability Statistics (Average Score and Grade Distribution)
    const recyclabilityAvg = await Analysis.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: null, avgScore: { $avg: "$recyclabilityScore" } } },
    ]);

    const gradeDistribution = await Analysis.aggregate([
      { $match: { createdBy: userId } },
      { $group: { _id: "$recyclabilityGrade", count: { $sum: 1 } } },
    ]);

    const avgScore = recyclabilityAvg.length > 0 ? Math.round(recyclabilityAvg[0].avgScore) : 0;

    // Compile statistics
    res.status(200).json({
      success: true,
      stats: {
        totalAnalysed,
        avgScore,
        materialDistribution: materialDistribution.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        wasteDistribution: wasteDistribution.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        gradeDistribution: gradeDistribution.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  classifyImage,
  getSupportedMaterials,
  getRecentAnalyses,
  getAnalysisById,
  getDashboardStats,
};

