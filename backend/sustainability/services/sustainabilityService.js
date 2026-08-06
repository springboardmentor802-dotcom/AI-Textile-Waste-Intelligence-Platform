/**
 * Sustainability Intelligence Engine - Service Layer
 * 
 * Implements core business logic for textile waste sustainability evaluation.
 * Integrates mathematical calculation engines and the Recycling Recommendation Engine.
 */

const mongoose = require("mongoose");
const {
  calculateCarbonSavings,
  calculateWasteDiversionMetrics,
  calculateResourceRecoveryMetrics,
  calculateSustainabilityScoreAndPerformance,
} = require("../utils/sustainabilityCalculators");
const { SUSTAINABILITY_UNITS, createMetricResult, formatAnalyzeResponse } = require("../utils/sustainabilityUtils");
const recommendationService = require("../../recommendation/services/recommendationService");
const SustainabilityRecord = require("../models/sustainabilityModel");

/**
 * Task 1: Calculate Carbon Footprint Estimation (CO2e Saved in kg).
 * 
 * @param {string} material Textile material name (e.g. Cotton, Polyester, Denim, Silk)
 * @param {string} condition Material condition (e.g. Good, Worn)
 * @param {number} quantity Waste mass in kilograms
 * @param {string} recyclability Recyclability classification (e.g. Reusable, Mechanical Recycling)
 * @returns {Promise<{ value: number, unit: string, factorUsed: number }>} Calculated carbon saved metric
 */
const calculateCarbonFootprint = async (material, condition, quantity, recyclability) => {
  const result = calculateCarbonSavings(material, quantity, recyclability, condition);
  return createMetricResult(result.carbonSaved, SUSTAINABILITY_UNITS.CARBON_FOOTPRINT);
};

/**
 * Task 2: Calculate Waste Diversion Analysis.
 * 
 * @param {string} material Material name
 * @param {string} condition Material condition
 * @param {number} quantity Waste mass in kg
 * @param {string} recyclability Recyclability classification
 * @returns {Promise<{ value: number, unit: string, breakdown: Object }>} Calculated waste diversion metric
 */
const calculateWasteDiversion = async (material, condition, quantity, recyclability) => {
  const breakdown = calculateWasteDiversionMetrics(quantity, recyclability, condition);
  const metric = createMetricResult(breakdown.wasteDiversionPct, SUSTAINABILITY_UNITS.WASTE_DIVERSION);
  return { ...metric, breakdown };
};

/**
 * Task 3: Calculate Resource Recovery Estimation.
 * 
 * @param {string} material Material name
 * @param {string} condition Material condition
 * @param {number} quantity Waste mass in kg
 * @param {string} recyclability Recyclability classification
 * @returns {Promise<{ value: number, unit: string, breakdown: Object }>} Calculated resource recovery metric
 */
const calculateResourceRecovery = async (material, condition, quantity, recyclability) => {
  const breakdown = calculateResourceRecoveryMetrics(material, quantity, recyclability, condition);
  const metric = createMetricResult(breakdown.recoveryEfficiencyPct, SUSTAINABILITY_UNITS.RESOURCE_RECOVERY);
  return { ...metric, breakdown };
};

/**
 * Task 4: Generate Overall Sustainability Score & Performance Level.
 * 
 * @param {string} material Material name
 * @param {string} condition Material condition
 * @param {number} quantity Waste mass in kg
 * @param {string} recyclability Recyclability classification
 * @returns {Promise<{ score: number, performance: string }>} Weighted score result
 */
const calculateSustainabilityScore = async (material, condition, quantity, recyclability) => {
  const carbonRes = calculateCarbonSavings(material, quantity, recyclability, condition);
  const diversionRes = calculateWasteDiversionMetrics(quantity, recyclability, condition);
  const recoveryRes = calculateResourceRecoveryMetrics(material, quantity, recyclability, condition);

  return calculateSustainabilityScoreAndPerformance(
    carbonRes.carbonSaved,
    quantity,
    diversionRes.wasteDiversionPct,
    recoveryRes.recoveryEfficiencyPct,
    condition
  );
};

/**
 * Task 6 & 7: Main Service Orchestrator for Comprehensive Sustainability & Recommendation Workflow.
 * 
 * Image Upload -> Material Classification -> Waste Classification -> Recyclability Assessment
 * -> Sustainability Engine -> Recommendation Engine -> Final Response payload + MongoDB Persistence
 * 
 * @param {Object} input - Validated input payload
 * @param {string} input.material - Material name
 * @param {string} input.condition - Material condition
 * @param {number} input.quantity - Batch quantity in kg
 * @param {string} input.recyclability - Recyclability classification
 * @param {string} [input.contaminationLevel] - Contamination level
 * @param {string} [input.wasteCategory] - Waste category
 * @param {string} [input.createdBy] - Optional user ID
 * @param {string} [input.uploadedImage] - Optional UploadedImage ID
 * @returns {Promise<Object>} Formatted API output object matching Task 7 contract
 */
const analyzeSustainability = async ({
  material,
  condition,
  quantity,
  recyclability,
  contaminationLevel = "Clean",
  wasteCategory = "",
  createdBy = null,
  uploadedImage = null,
}) => {
  const carbonRes = calculateCarbonSavings(material, quantity, recyclability, condition);
  const diversionRes = calculateWasteDiversionMetrics(quantity, recyclability, condition);
  const recoveryRes = calculateResourceRecoveryMetrics(material, quantity, recyclability, condition);

  const scoreRes = calculateSustainabilityScoreAndPerformance(
    carbonRes.carbonSaved,
    quantity,
    diversionRes.wasteDiversionPct,
    recoveryRes.recoveryEfficiencyPct,
    condition,
    recyclability
  );

  // Determine waste_category name (e.g., Reusable, Recyclable, NonRecyclable)
  const inferredWasteCategory = wasteCategory || (recyclability.toLowerCase().includes("reusable") ? "Reusable" : "Recyclable");

  // Execute Recommendation Engine
  const recommendations = await recommendationService.generateRecommendations({
    material,
    condition,
    contaminationLevel,
    wasteCategory: inferredWasteCategory,
    recyclability,
    quantity,
  });

  const formattedResponse = formatAnalyzeResponse({
    material,
    wasteCategory: inferredWasteCategory,
    quantity,
    carbonSaved: carbonRes.carbonSaved,
    waterSaved: carbonRes.waterSaved,
    wasteDiversion: diversionRes.wasteDiversionPct,
    resourceRecovery: recoveryRes.recoveryEfficiencyPct,
    sustainabilityScore: scoreRes.score,
    performance: scoreRes.performance,
    recommendations,
    details: {
      divertedWeightKg: diversionRes.divertedWeightKg,
      reusablePct: diversionRes.reusablePct,
      recycledPct: diversionRes.recycledPct,
      disposalPct: diversionRes.disposalPct,
      recoverableMaterialKg: recoveryRes.recoverableMaterialKg,
      recoveryEfficiencyPct: recoveryRes.recoveryEfficiencyPct,
      circularityContribution: recoveryRes.circularityContribution,
      emissionFactorUsed: carbonRes.factorUsed,
      waterSaved: carbonRes.waterSaved,
      recyclabilityScore: scoreRes.recyclabilityScore,
      reuseScore: scoreRes.reuseScore,
      materialRecoveryScore: scoreRes.materialRecoveryScore,
      overallCircularityScore: scoreRes.overallCircularityScore,
    },
  });

  // Persist record to MongoDB if database connection is active
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    try {
      const recordData = {
        material,
        condition,
        quantity,
        recyclability,
        carbonSaved: carbonRes.carbonSaved,
        waterSaved: carbonRes.waterSaved,
        wasteDiversion: diversionRes.wasteDiversionPct,
        resourceRecovery: recoveryRes.recoveryEfficiencyPct,
        sustainabilityScore: scoreRes.score,
        performance: scoreRes.performance,
        wasteCategory: inferredWasteCategory,
        recommendations,
        details: formattedResponse.details,
        status: "Completed",
      };
      if (createdBy) recordData.createdBy = createdBy;
      if (uploadedImage) recordData.uploadedImage = uploadedImage;

      const savedRecord = await SustainabilityRecord.create(recordData);
      formattedResponse._id = savedRecord._id;
      formattedResponse.createdAt = savedRecord.createdAt;
    } catch (err) {
      // If DB is offline, log warning and continue cleanly
      console.warn(`[Sustainability Persistence Warning] Skipping DB save: ${err.message}`);
    }
  }

  return formattedResponse;
};

/**
 * Retrieves past sustainability analysis history records for a user or global archive.
 * 
 * @param {Object} options Query parameters
 * @param {string} [options.userId] User ID filter
 * @param {number} [options.limit=20] Max records to return
 * @returns {Promise<Array<Object>>} List of saved sustainability records
 */
const getSustainabilityHistory = async ({ userId = null, limit = 20 } = {}) => {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    return [];
  }
  const query = {};
  if (userId) query.createdBy = userId;

  const records = await SustainabilityRecord.find(query)
    .populate("uploadedImage")
    .sort({ createdAt: -1 })
    .limit(limit);

  return records;
};

/**
 * Retrieves a single sustainability record by ID.
 * 
 * @param {string} id Record ID
 * @returns {Promise<Object|null>} Saved sustainability record
 */
const getSustainabilityRecordById = async (id) => {
  if (!mongoose.connection || mongoose.connection.readyState !== 1) {
    return null;
  }
  return await SustainabilityRecord.findById(id).populate("uploadedImage");
};

module.exports = {
  calculateCarbonFootprint,
  calculateWasteDiversion,
  calculateResourceRecovery,
  calculateSustainabilityScore,
  analyzeSustainability,
  getSustainabilityHistory,
  getSustainabilityRecordById,
};
