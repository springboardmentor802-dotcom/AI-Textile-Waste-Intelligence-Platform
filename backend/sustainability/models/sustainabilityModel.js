/**
 * Sustainability Intelligence Engine - Data Model
 * 
 * Mongoose schema representing a Sustainability Assessment Record.
 * Prepared in Day 1 architecture for database persistence in Day 2.
 */

const mongoose = require("mongoose");

const sustainabilitySchema = new mongoose.Schema(
  {
    material: {
      type: String,
      required: [true, "Material is required"],
      trim: true,
    },
    condition: {
      type: String,
      required: [true, "Condition is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0.001, "Quantity must be greater than 0"],
    },
    recyclability: {
      type: String,
      required: [true, "Recyclability classification is required"],
      trim: true,
    },
    carbonSaved: {
      type: Number,
      default: 0,
    },
    waterSaved: {
      type: Number,
      default: 0,
    },
    wasteDiversion: {
      type: Number,
      default: 0,
    },
    resourceRecovery: {
      type: Number,
      default: 0,
    },
    sustainabilityScore: {
      type: Number,
      default: 0,
    },
    performance: {
      type: String,
      default: "Good",
    },
    wasteCategory: {
      type: String,
      default: "Recyclable",
    },
    recommendations: [
      {
        name: { type: String, required: true },
        priority: { type: String, default: "Medium" },
        reason: { type: String, default: "" },
        environmental_benefit: { type: String, default: "" },
      },
    ],
    details: {
      divertedWeightKg: { type: Number, default: 0 },
      reusablePct: { type: Number, default: 0 },
      recycledPct: { type: Number, default: 0 },
      disposalPct: { type: Number, default: 0 },
      recoverableMaterialKg: { type: Number, default: 0 },
      recoveryEfficiencyPct: { type: Number, default: 0 },
      circularityContribution: { type: Number, default: 0 },
      emissionFactorUsed: { type: Number, default: 0 },
    },
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

module.exports = mongoose.model("SustainabilityRecord", sustainabilitySchema);
