/**
 * Sustainability Intelligence Engine - Utilities & Constants
 * 
 * Provides standardized measurement units, constant definitions, and response formatting 
 * helpers for sustainability calculations and API responses.
 */

// Standard measurement units for sustainability parameters
const SUSTAINABILITY_UNITS = Object.freeze({
  CARBON_FOOTPRINT: "kg CO2e",
  WASTE_DIVERSION: "%",
  RESOURCE_RECOVERY: "kg",
  SUSTAINABILITY_SCORE: "points",
});

// Engine operational status
const ENGINE_STATUS = Object.freeze({
  HEALTHY: "UP",
  OPERATIONAL: "Active Calculation Engine",
  COMPLETED: "Calculations Completed Successfully",
});

/**
 * Helper to build standard metric result objects.
 * 
 * @param {number} value - Numeric metric value
 * @param {string} unit - Measurement unit
 * @returns {{ value: number, unit: string }} Standard metric object
 */
const createMetricResult = (value = 0, unit = "") => {
  return {
    value: Number(value) || 0,
    unit: unit || "",
  };
};

/**
 * Format standard response payload for POST /api/sustainability/analyze endpoint matching Task 7.
 * 
 * @param {Object} params Parameters
 * @param {string} params.material Material name
 * @param {string} [params.wasteCategory] Waste classification category
 * @param {number} params.quantity Quantity in kg
 * @param {number} params.carbonSaved CO2 saved in kg
 * @param {number} params.wasteDiversion Diversion percentage (0-100)
 * @param {number} params.resourceRecovery Recovery efficiency/mass
 * @param {number} params.sustainabilityScore Overall score (0-100)
 * @param {string} params.performance Performance level (Excellent, Good, etc.)
 * @param {Array} [params.recommendations] Array of recommendation objects
 * @param {Object} [params.details] Extended detail breakdown
 * @returns {Object} Structured API response payload
 */
const formatAnalyzeResponse = ({
  material,
  wasteCategory = "Recyclable",
  quantity,
  carbonSaved,
  waterSaved,
  wasteDiversion,
  resourceRecovery,
  sustainabilityScore,
  performance,
  recommendations = [],
  details = {},
}) => {
  const cSaved = Number(carbonSaved) || 0;
  const wSaved = Number(waterSaved) || Number(details.waterSaved) || 0;
  const wDiversion = Number(wasteDiversion) || 0;
  const rRecovery = Number(resourceRecovery) || 0;
  const sScore = Number(sustainabilityScore) || 0;

  return {
    material: material || "Unknown",
    waste_category: wasteCategory || "Recyclable",
    wasteCategory: wasteCategory || "Recyclable",
    quantity: Number(quantity) || 0,
    carbon_saved: cSaved,
    carbonSaved: cSaved,
    water_saved: wSaved,
    waterSaved: wSaved,
    waste_diversion: wDiversion,
    wasteDiversion: wDiversion,
    resource_recovery: rRecovery,
    resourceRecovery: rRecovery,
    sustainability_score: sScore,
    sustainabilityScore: sScore,
    performance: performance || "Average",
    recommendations: recommendations || [],
    details: {
      divertedWeightKg: details.divertedWeightKg || 0,
      reusablePct: details.reusablePct || 0,
      recycledPct: details.recycledPct || 0,
      disposalPct: details.disposalPct || 0,
      recoverableMaterialKg: details.recoverableMaterialKg || 0,
      recoveryEfficiencyPct: details.recoveryEfficiencyPct || 0,
      circularityContribution: details.circularityContribution || 0,
      emissionFactorUsed: details.emissionFactorUsed || 0,
      waterSaved: wSaved,
    },
  };
};

module.exports = {
  SUSTAINABILITY_UNITS,
  ENGINE_STATUS,
  createMetricResult,
  formatAnalyzeResponse,
};
