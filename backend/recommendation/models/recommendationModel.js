/**
 * Recycling Recommendation Engine - Mongoose Model
 * 
 * Defines schema for storing recommendation logs and analytical histories.
 */

const mongoose = require("mongoose");

const recommendationSchema = new mongoose.Schema(
  {
    material: {
      type: String,
      required: true,
      trim: true,
    },
    condition: {
      type: String,
      required: true,
      trim: true,
    },
    contaminationLevel: {
      type: String,
      default: "Clean",
    },
    wasteCategory: {
      type: String,
      default: "Recyclable",
    },
    recyclability: {
      type: String,
      default: "Mechanical Recycling",
    },
    quantity: {
      type: Number,
      default: 1,
    },
    recommendations: [
      {
        name: { type: String, required: true },
        priority: { type: String, required: true },
        reason: { type: String, required: true },
        environmental_benefit: { type: String, required: true },
      },
    ],
    uploadedImage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadedImage",
      required: false,
    },
    status: {
      type: String,
      default: "Completed",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RecommendationRecord", recommendationSchema);
