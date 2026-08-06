const mongoose = require("mongoose");

const materialClassificationSchema = new mongoose.Schema(
  {
    uploadedImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadedImage",
      required: [true, "Uploaded image reference is required"],
    },
    materialName: {
      type: String,
      required: [true, "Material name is required"],
      enum: [
        "Cotton",
        "Polyester",
        "Wool",
        "Silk",
        "Linen",
        "Denim",
        "Nylon",
        "Rayon",
        "Acrylic",
        "Mixed Fabric",
        "Mixed Fabrics",
      ],
    },
    confidenceScore: {
      type: Number,
      required: [true, "Confidence score is required"],
      min: 0,
      max: 100,
    },
    materialDescription: {
      type: String,
      required: [true, "Material description is required"],
    },
    fabricDetection: {
      type: String,
      required: [true, "Fabric detection output is required"], // e.g. "Knit", "Woven", "Non-woven"
    },
    textureAnalysis: {
      type: String,
      required: [true, "Texture analysis output is required"], // e.g. "Smooth fabric texture", "Coarse weave pattern"
    },
    colorAnalysis: {
      dominantColors: {
        type: [String],
        required: [true, "Dominant colors are required"], // Hex codes: ["#E2E8F0", "#3B82F6"]
      },
      paletteDescription: {
        type: String,
        required: [true, "Color palette description is required"],
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

module.exports = mongoose.model("MaterialClassification", materialClassificationSchema);
