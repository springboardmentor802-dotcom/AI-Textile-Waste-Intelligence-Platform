const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema(
  {
    imagePath: {
      type: String,
      required: [true, "Original image path is required"],
    },
    preprocessedImagePath: {
      type: String,
      required: [true, "Preprocessed image path is required"],
    },
    predictedMaterial: {
      type: String,
      required: [true, "Predicted material is required"],
      trim: true,
    },
    materialConfidence: {
      type: Number,
      required: [true, "Material prediction confidence is required"],
    },
    wasteCategory: {
      type: String,
      required: [true, "Waste category is required"],
      trim: true,
    },
    wasteConfidence: {
      type: Number,
      required: [true, "Waste category confidence is required"],
    },
    recyclabilityScore: {
      type: Number,
      required: [true, "Recyclability score is required"],
      min: 0,
      max: 100,
    },
    recyclabilityGrade: {
      type: String,
      required: [true, "Recyclability grade (color) is required"],
      enum: ["Green", "Yellow", "Orange", "Red"],
    },
    recyclabilityGradeText: {
      type: String,
      required: true,
    },
    condition: {
      type: String,
      required: true,
    },
    preprocessingMetadata: {
      resizedShape: { type: [Number], default: [128, 128, 3] },
      denoiseMethod: { type: String, default: "Bilateral Filter" },
      normalization: { type: String, default: "Min-Max Normalization" },
      averageBrightness: { type: Number },
      contrastStd: { type: Number },
    },
    recommendations: {
      type: [String],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Analysis", analysisSchema);
