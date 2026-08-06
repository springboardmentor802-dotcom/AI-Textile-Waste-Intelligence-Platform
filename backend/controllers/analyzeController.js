const path = require("path");
const UploadedImage = require("../models/UploadedImage");
const MaterialClassification = require("../models/MaterialClassification");
const WasteClassification = require("../models/WasteClassification");
const { classifyTextileImage } = require("../services/aiService");

// @desc    Analyze textile image by imageId
// @route   POST /api/analyze
// @access  Protected
const analyzeImage = async (req, res) => {
  try {
    const { imageId } = req.body;

    if (!imageId) {
      return res.status(400).json({
        success: false,
        message: "Image ID is required for textile analysis.",
      });
    }

    // Retrieve uploaded image metadata
    const uploadedImage = await UploadedImage.findById(imageId);
    if (!uploadedImage) {
      return res.status(404).json({
        success: false,
        message: "Uploaded image record not found.",
      });
    }

    // Reconstruct the file object structure expected by aiService.js
    const filename = uploadedImage.imagePath.replace("/uploads/", "");
    const file = {
      path: path.join(__dirname, "../uploads", filename),
      filename: filename,
      originalname: uploadedImage.originalName,
      mimetype: uploadedImage.mimeType,
      size: uploadedImage.size,
    };

    console.log(`[Analysis Controller] Executing classification for image: ${uploadedImage.originalName}`);

    // Call classification pipeline (TensorFlow/FastAPI or Local Fallback)
    const analysisResult = await classifyTextileImage(file);

    // Normalize Mixed Fabrics to singular Mixed Fabric to match strict schema constraints
    let finalMaterialName = analysisResult.prediction.predictedMaterial;
    if (finalMaterialName === "Mixed Fabrics") {
      finalMaterialName = "Mixed Fabric";
    }

    // Save Material Classification metadata
    const materialClassification = await MaterialClassification.create({
      uploadedImage: uploadedImage._id,
      materialName: finalMaterialName,
      confidenceScore: analysisResult.prediction.materialConfidence,
      materialDescription: analysisResult.materialInfo.description,
      fabricDetection: analysisResult.fabricDetection,
      textureAnalysis: analysisResult.textureAnalysis,
      colorAnalysis: {
        dominantColors: analysisResult.colorAnalysis.dominantColors,
        paletteDescription: analysisResult.colorAnalysis.paletteDescription,
      },
      createdBy: req.user._id,
    });

    // Save Waste Classification metadata
    const wasteClassification = await WasteClassification.create({
      uploadedImage: uploadedImage._id,
      wasteCategory: analysisResult.prediction.wasteCategory,
      recyclabilityScore: analysisResult.prediction.recyclabilityScore,
      reusePotential: analysisResult.reusePotential,
      disposalRecommendation: analysisResult.disposalRecommendation,
      damageDetection: {
        damageDetected: analysisResult.damageDetection.damageDetected,
        damageType: analysisResult.damageDetection.damageType,
        damageSeverity: analysisResult.damageDetection.damageSeverity,
      },
      contaminationDetection: {
        contaminationDetected: analysisResult.contaminationDetection.contaminationDetected,
        contaminationType: analysisResult.contaminationDetection.contaminationType,
        contaminationSeverity: analysisResult.contaminationDetection.contaminationSeverity,
      },
      createdBy: req.user._id,
    });

    res.status(200).json({
      success: true,
      message: "Textile image analyzed successfully.",
      data: {
        _id: materialClassification._id, // match existing frontend expectations for record reference
        uploadedImage,
        materialClassification,
        wasteClassification,
        preprocessedImageUrl: analysisResult.preprocessedImagePath,
        preprocessingMetadata: analysisResult.preprocessingMetadata,
        recommendations: analysisResult.recommendations,
        fallbackMode: analysisResult.fallbackMode,
      },
    });
  } catch (error) {
    console.error("Analysis Controller Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to analyze textile image.",
    });
  }
};

module.exports = {
  analyzeImage,
};
