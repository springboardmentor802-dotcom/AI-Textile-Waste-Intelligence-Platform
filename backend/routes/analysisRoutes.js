const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { protect } = require("../middleware/authMiddleware");
const {
  classifyImage,
  getSupportedMaterials,
  getRecentAnalyses,
  getAnalysisById,
  getDashboardStats,
} = require("../controllers/analysisController");
const { deleteHistoryRecord } = require("../controllers/classificationController");

// Configure Multer Disk Storage for Temporary Image Preservation
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `textile-${uniqueSuffix}${ext}`);
  },
});

// File Filter for Format Validation (JPG, JPEG, PNG)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
  if (allowedMimeTypes.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file format. Only JPG, JPEG, and PNG images are supported."
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB Max Size
  fileFilter,
});

// @route   POST /api/analysis/classify
// @desc    Upload image and classify textile material
// @access  Protected
router.post(
  "/classify",
  protect,
  (req, res, next) => {
    upload.single("image")(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: "File size exceeds the 10MB limit. Please upload a smaller image.",
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  },
  classifyImage
);

// @route   GET /api/analysis/materials
// @desc    Get supported materials and profiles
// @access  Protected
router.get("/materials", protect, getSupportedMaterials);

// @route   GET /api/analysis/history
// @desc    Get user's past analyses
// @access  Protected
router.get("/history", protect, getRecentAnalyses);

// @route   GET /api/analysis/dashboard-stats
// @desc    Get dashboard stats
// @access  Protected
router.get("/dashboard-stats", protect, getDashboardStats);

// @route   GET /api/analysis/:id
// @desc    Get analysis record by ID
// @access  Protected
router.get("/:id", protect, getAnalysisById);

// @route   DELETE /api/analysis/:id
// @desc    Delete analysis record by ID
// @access  Protected
router.delete("/:id", protect, deleteHistoryRecord);

module.exports = router;

