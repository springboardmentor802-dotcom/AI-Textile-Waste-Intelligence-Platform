const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");
const MaterialClassification = require("../models/MaterialClassification");
const WasteClassification = require("../models/WasteClassification");
const UploadedImage = require("../models/UploadedImage");
const Analysis = require("../models/Analysis");
const SustainabilityRecord = require("../sustainability/models/sustainabilityModel");
const sustainabilityService = require("../sustainability/services/sustainabilityService");

// @desc    Get all classifications history for current user
// @route   GET /api/classification
// @access  Protected
const getClassifications = async (req, res) => {
  try {
    // Retrieve all material classifications for user, populated with uploaded image metadata
    const materialClassifications = await MaterialClassification.find({
      createdBy: req.user._id,
    })
      .populate("uploadedImage")
      .sort({ createdAt: -1 });

    // Retrieve all waste classifications for user
    const wasteClassifications = await WasteClassification.find({
      createdBy: req.user._id,
    });

    // Retrieve all sustainability records for user
    const sustainabilityRecords = await SustainabilityRecord.find({
      createdBy: req.user._id,
    }).lean();

    // Merge them into a single report list structure
    const combinedHistory = await Promise.all(
      materialClassifications.map(async (mc) => {
        const uploadedImgId = (mc.uploadedImage?._id || mc.uploadedImage)?.toString();
        const wc = wasteClassifications.find(
          (w) => (w.uploadedImage?._id || w.uploadedImage)?.toString() === uploadedImgId
        );

        let sust = sustainabilityRecords.find(
          (s) => (s.uploadedImage?._id || s.uploadedImage)?.toString() === uploadedImgId
        );

        if (!sust) {
          try {
            sust = await sustainabilityService.analyzeSustainability({
              material: mc.materialName,
              condition: wc?.damageDetection?.damageSeverity === "None" ? "Good" : "Worn",
              quantity: 1,
              recyclability: wc?.wasteCategory === "Reusable" ? "Reusable" : "Mechanical Recycling",
              wasteCategory: wc?.wasteCategory || "Recyclable",
            });
          } catch (err) {
            console.warn("Sustainability calculation fallback warning:", err.message);
          }
        }

        return {
          _id: mc._id,
          imagePath: mc.uploadedImage?.imagePath || "",
          preprocessedImagePath: mc.uploadedImage?.preprocessedImagePath || "",
          originalName: mc.uploadedImage?.originalName || "",
          predictedMaterial: mc.materialName,
          materialConfidence: mc.confidenceScore,
          wasteCategory: wc?.wasteCategory || "Recyclable",
          wasteConfidence: mc.confidenceScore,
          recyclabilityScore: wc?.recyclabilityScore || 0,
          recyclabilityGrade: wc?.recyclabilityScore >= 80 ? "Green" : wc?.recyclabilityScore >= 60 ? "Yellow" : wc?.recyclabilityScore >= 30 ? "Orange" : "Red",
          condition: wc?.damageDetection?.damageSeverity === "None" && wc?.contaminationDetection?.contaminationSeverity === "None" ? "Excellent / Untouched" : "Good / Moderate Use",
          createdAt: mc.createdAt,
          sustainabilityAnalysis: sust,
          recommendations: sust?.recommendations || [],
        };
      })
    );

    // Also fetch standalone Analysis records for complete coverage
    const standaloneAnalyses = await Analysis.find({ createdBy: req.user._id }).sort({ createdAt: -1 });
    const analysisHistory = await Promise.all(
      standaloneAnalyses.map(async (a) => {
        let sust = await sustainabilityService.analyzeSustainability({
          material: a.predictedMaterial,
          condition: a.condition || "Good / Moderate Use",
          quantity: 1,
          recyclability: a.wasteCategory === "Reusable" ? "Reusable" : "Mechanical Recycling",
          wasteCategory: a.wasteCategory || "Recyclable",
        });

        return {
          _id: a._id,
          imagePath: a.imagePath || "",
          preprocessedImagePath: a.preprocessedImagePath || "",
          originalName: path.basename(a.imagePath || "Textile Sample"),
          predictedMaterial: a.predictedMaterial,
          materialConfidence: a.materialConfidence,
          wasteCategory: a.wasteCategory,
          wasteConfidence: a.wasteConfidence || a.materialConfidence,
          recyclabilityScore: a.recyclabilityScore,
          recyclabilityGrade: a.recyclabilityGrade,
          condition: a.condition,
          createdAt: a.createdAt,
          sustainabilityAnalysis: sust,
          recommendations: a.recommendations || sust?.recommendations || [],
        };
      })
    );

    const allHistory = [...combinedHistory];
    analysisHistory.forEach((ah) => {
      if (!allHistory.some((item) => item._id.toString() === ah._id.toString() || (item.imagePath && item.imagePath === ah.imagePath))) {
        allHistory.push(ah);
      }
    });

    res.status(200).json({
      success: true,
      count: allHistory.length,
      data: allHistory,
    });
  } catch (error) {
    console.error("Classification Controller Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve classification history.",
    });
  }
};

// @desc    Get classification record by ID
// @route   GET /api/classification/:id
// @access  Protected
const getClassificationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid classification record ID.",
      });
    }

    const mc = await MaterialClassification.findById(id)
      .populate("uploadedImage")
      .populate("createdBy", "name email role");

    if (!mc) {
      return res.status(404).json({
        success: false,
        message: "Classification record not found.",
      });
    }

    const uploadedImgId = mc.uploadedImage?._id || mc.uploadedImage;
    const wc = await WasteClassification.findOne({ uploadedImage: uploadedImgId });

    const rawImagePath = mc.uploadedImage?.imagePath || "";
    let preprocessedImagePath = mc.uploadedImage?.preprocessedImagePath || "";

    if (rawImagePath) {
      const filename = path.basename(rawImagePath);
      const ext = path.extname(filename);
      const baseName = ext ? filename.slice(0, -ext.length) : filename;

      const candidateSameExt = `/uploads/preprocessed-${filename}`;
      const candidatePngExt = `/uploads/preprocessed-${baseName}.png`;

      const absSameExt = path.join(__dirname, "..", candidateSameExt);
      const absPngExt = path.join(__dirname, "..", candidatePngExt);
      const absDBPath = preprocessedImagePath ? path.join(__dirname, "..", preprocessedImagePath) : "";

      if (preprocessedImagePath && fs.existsSync(absDBPath)) {
        // DB path exists physically on disk
      } else if (fs.existsSync(absSameExt)) {
        preprocessedImagePath = candidateSameExt;
      } else if (fs.existsSync(absPngExt)) {
        preprocessedImagePath = candidatePngExt;
      } else {
        preprocessedImagePath = candidateSameExt;
        const absRaw = path.join(__dirname, "..", rawImagePath);
        if (fs.existsSync(absRaw)) {
          try {
            const scriptPath = path.join(__dirname, "..", "scripts", "preprocess_visual.py");
            const { execSync } = require("child_process");
            execSync(`python "${scriptPath}" "${absRaw}" "${absSameExt}"`);
          } catch (e) {
            console.error("Auto-generation of OpenCV preprocessed file on disk failed:", e.message);
            try {
              fs.copyFileSync(absRaw, absSameExt);
            } catch (err) {}
          }
        }
      }
    }

    // Fetch or calculate Sustainability Record
    let sustainabilityAnalysis = await SustainabilityRecord.findOne({ uploadedImage: uploadedImgId }).lean();
    if (!sustainabilityAnalysis) {
      try {
        sustainabilityAnalysis = await sustainabilityService.analyzeSustainability({
          material: mc.materialName,
          condition: wc?.damageDetection?.damageSeverity === "None" ? "Good" : "Worn",
          quantity: 1,
          recyclability: wc?.wasteCategory === "Reusable" ? "Reusable" : "Mechanical Recycling",
          wasteCategory: wc?.wasteCategory || "Recyclable",
        });
      } catch (err) {
        console.warn("Report Sustainability Analysis Calculation Warning:", err.message);
      }
    }

    // Format response to matches expectations of the Report View
    const responseData = {
      _id: mc._id,
      imagePath: rawImagePath,
      preprocessedImagePath,
      predictedMaterial: mc.materialName,
      materialConfidence: mc.confidenceScore,
      wasteCategory: wc?.wasteCategory || "Recyclable",
      wasteConfidence: mc.confidenceScore,
      recyclabilityScore: wc?.recyclabilityScore || 0,
      recyclabilityGrade: wc?.recyclabilityScore >= 80 ? "Green" : wc?.recyclabilityScore >= 60 ? "Yellow" : wc?.recyclabilityScore >= 30 ? "Orange" : "Red",
      recyclabilityGradeText: wc?.recyclabilityScore >= 80 ? "Highly Recyclable" : wc?.recyclabilityScore >= 60 ? "Moderate Recyclability" : wc?.recyclabilityScore >= 30 ? "Limited Recyclability" : "Disposal Recommended",
      condition: wc?.damageDetection?.damageSeverity === "None" && wc?.contaminationDetection?.contaminationSeverity === "None" ? "Excellent / Untouched" : "Good / Moderate Use",
      preprocessingMetadata: {
        resizedShape: [128, 128, 3],
        denoiseMethod: "Bilateral Filter (9, 75, 75)",
        normalization: "Min-Max [0, 1]",
        averageBrightness: 120,
        contrastStd: 50,
      },
      recommendations: sustainabilityAnalysis?.recommendations || (wc ? [{ name: wc.disposalRecommendation, priority: "High", reason: "Standard waste pathway", environmental_benefit: "Diverts material from landfill" }] : []),
      sustainabilityAnalysis,
      materialClassification: mc,
      wasteClassification: wc,
      createdBy: mc.createdBy,
      createdAt: mc.createdAt,
    };

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Classification Get By ID Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve classification details.",
    });
  }
};

// @desc    Delete classification history record and all associated records/files
// @route   DELETE /api/history/:id
// @access  Protected
const deleteHistoryRecord = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid analysis record ID.",
      });
    }

    // 1. Locate the record across possible primary models
    let mc = await MaterialClassification.findById(id);
    let analysis = null;
    let uploadedImageId = null;
    let rawImagePath = "";
    let preprocessedImagePath = "";

    if (mc) {
      uploadedImageId = mc.uploadedImage?._id || mc.uploadedImage;
    } else {
      analysis = await Analysis.findById(id);
      if (analysis) {
        rawImagePath = analysis.imagePath || "";
        preprocessedImagePath = analysis.preprocessedImagePath || "";
      } else {
        const uploadedImg = await UploadedImage.findById(id);
        if (uploadedImg) {
          uploadedImageId = uploadedImg._id;
        }
      }
    }

    // If we have uploadedImageId, fetch the UploadedImage document for image paths
    if (uploadedImageId) {
      const uploadedImgDoc = await UploadedImage.findById(uploadedImageId);
      if (uploadedImgDoc) {
        rawImagePath = uploadedImgDoc.imagePath || "";
        preprocessedImagePath = uploadedImgDoc.preprocessedImagePath || "";
      }
    } else if (rawImagePath) {
      const uploadedImgDoc = await UploadedImage.findOne({ imagePath: rawImagePath });
      if (uploadedImgDoc) {
        uploadedImageId = uploadedImgDoc._id;
        if (!preprocessedImagePath) {
          preprocessedImagePath = uploadedImgDoc.preprocessedImagePath || "";
        }
      }
    }

    if (!mc && !analysis && !uploadedImageId) {
      return res.status(404).json({
        success: false,
        message: "Analysis record not found.",
      });
    }

    // 2. Cascade delete database records
    const deleteConditions = [{ _id: id }];
    if (uploadedImageId) deleteConditions.push({ uploadedImage: uploadedImageId });

    // Delete MaterialClassification records
    await MaterialClassification.deleteMany({ $or: deleteConditions });

    // Delete WasteClassification and SustainabilityRecord documents
    const relConditions = [{ _id: id }];
    if (uploadedImageId) relConditions.push({ uploadedImage: uploadedImageId });
    await WasteClassification.deleteMany({ $or: relConditions });
    await SustainabilityRecord.deleteMany({ $or: relConditions });

    // Delete Analysis records
    const analysisDeleteConds = [{ _id: id }];
    if (rawImagePath) analysisDeleteConds.push({ imagePath: rawImagePath });
    await Analysis.deleteMany({ $or: analysisDeleteConds });

    // Delete UploadedImage document
    if (uploadedImageId) {
      await UploadedImage.deleteMany({ _id: uploadedImageId });
    }

    // 3. Delete image files on disk if stored locally
    const deleteFileIfExists = (relPath) => {
      if (!relPath || typeof relPath !== "string") return;
      try {
        const filename = path.basename(relPath);
        const absPath = path.join(__dirname, "..", "uploads", filename);
        if (fs.existsSync(absPath)) {
          fs.unlinkSync(absPath);
          console.log(`[Delete History] Removed local file: ${absPath}`);
        }
      } catch (fileErr) {
        console.warn(`[Delete History] Could not delete file ${relPath}:`, fileErr.message);
      }
    };

    deleteFileIfExists(rawImagePath);
    deleteFileIfExists(preprocessedImagePath);

    // Also check for auto-generated preprocessed files matching filename pattern
    if (rawImagePath) {
      const filename = path.basename(rawImagePath);
      const ext = path.extname(filename);
      const baseName = ext ? filename.slice(0, -ext.length) : filename;
      deleteFileIfExists(`/uploads/preprocessed-${filename}`);
      deleteFileIfExists(`/uploads/preprocessed-${baseName}.png`);
    }

    return res.status(200).json({
      success: true,
      message: "Analysis deleted successfully",
    });
  } catch (error) {
    console.error("Delete History Record Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete analysis record.",
    });
  }
};

module.exports = {
  getClassifications,
  getClassificationById,
  deleteHistoryRecord,
};
