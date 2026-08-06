const mongoose = require("mongoose");

const wasteClassificationSchema = new mongoose.Schema(
  {
    uploadedImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadedImage",
      required: [true, "Uploaded image reference is required"],
    },
    wasteCategory: {
      type: String,
      required: [true, "Waste category is required"],
      enum: [
        "Recyclable",
        "Reusable",
        "Repairable",
        "Upcyclable",
        "Compostable",
        "Hazardous",
      ],
    },
    recyclabilityScore: {
      type: Number,
      required: [true, "Recyclability score is required"],
      min: 0,
      max: 100,
    },
    reusePotential: {
      type: String,
      required: [true, "Reuse potential is required"], // e.g. "High Potential (Minimal Wear)", "Low Potential"
    },
    disposalRecommendation: {
      type: String,
      required: [true, "Disposal recommendation is required"],
    },
    damageDetection: {
      damageDetected: {
        type: Boolean,
        required: [true, "Damage detection status is required"],
      },
      damageType: {
        type: String,
        default: "None", // e.g. "Tears", "Fraying", "Stretching", "Holes", "None"
      },
      damageSeverity: {
        type: String,
        default: "None", // e.g. "Minor", "Moderate", "Severe", "None"
      },
    },
    contaminationDetection: {
      contaminationDetected: {
        type: Boolean,
        required: [true, "Contamination detection status is required"],
      },
      contaminationType: {
        type: String,
        default: "None", // e.g. "Stains", "Chemicals", "Oils", "None"
      },
      contaminationSeverity: {
        type: String,
        default: "None", // e.g. "Minor", "Moderate", "Severe", "None"
      },
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

module.exports = mongoose.model("WasteClassification", wasteClassificationSchema);
