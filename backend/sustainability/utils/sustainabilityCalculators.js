/**
 * Sustainability Intelligence Engine - Core Calculation Utilities
 * 
 * Implements pure, reusable mathematical helper functions for:
 * 1. Carbon Footprint Savings (CO2e kg)
 * 2. Waste Diversion & Landfill Avoidance Analysis (%)
 * 3. Resource Recovery & Fiber Yield Index (kg & %)
 * 4. Weighted Multi-Parameter Sustainability Scoring (0-100) & Performance Level
 */

const {
  getMaterialEmissionFactor,
  getMaterialWaterFactor,
  getRecyclabilityEfficiencyFactor,
  getConditionYieldFactor,
  getWasteDiversionAllocation,
} = require("./emissionFactors");

/**
 * Task 1: Calculate Carbon Footprint Savings & Water Savings.
 * 
 * Formula:
 * Carbon Saved = Quantity (kg) * Material Base Factor * Recyclability Efficiency * Condition Yield
 * Water Saved = Quantity (kg) * Material Water Factor * Recyclability Efficiency * Condition Yield
 * 
 * @param {string} material Material name (Cotton, Polyester, etc.)
 * @param {number} quantity Waste mass in kg
 * @param {string} recyclability Recyclability category
 * @param {string} condition Material condition
 * @returns {{ carbonSaved: number, waterSaved: number, unit: string, factorUsed: number }} Carbon & Water savings result
 */
const calculateCarbonSavings = (material, quantity, recyclability, condition) => {
  const baseFactor = getMaterialEmissionFactor(material);
  const waterFactor = getMaterialWaterFactor(material);
  const recyclabilityMultiplier = getRecyclabilityEfficiencyFactor(recyclability);
  const conditionMultiplier = getConditionYieldFactor(condition);

  const rawCarbonSaved = quantity * baseFactor * recyclabilityMultiplier * conditionMultiplier;
  const carbonSaved = Number(rawCarbonSaved.toFixed(2));
  const rawWaterSaved = quantity * waterFactor * recyclabilityMultiplier * conditionMultiplier;
  const waterSaved = Math.round(rawWaterSaved);

  return {
    carbonSaved: Math.max(0, carbonSaved),
    waterSaved: Math.max(0, waterSaved),
    unit: "kg CO2e",
    factorUsed: baseFactor,
    waterFactorUsed: waterFactor,
  };
};

/**
 * Task 2: Calculate Waste Diversion Breakdown.
 * 
 * Calculates percentages and mass diverted from landfills.
 * 
 * @param {number} quantity Waste mass in kg
 * @param {string} recyclability Recyclability tier
 * @param {string} condition Material condition
 * @returns {Object} Waste diversion metrics
 */
const calculateWasteDiversionMetrics = (quantity, recyclability, condition) => {
  const allocation = getWasteDiversionAllocation(recyclability);
  const conditionYield = getConditionYieldFactor(condition);

  // Condition slightly adjusts landfill vs recovery yield
  const reusablePct = Math.round(allocation.reusablePct * conditionYield);
  const recycledPct = Math.min(100 - reusablePct, Math.round(allocation.recycledPct * conditionYield));
  const totalDivertedPct = Math.min(100, Math.max(0, reusablePct + recycledPct));
  const disposalPct = Math.max(0, 100 - totalDivertedPct);

  const divertedWeightKg = Number(((quantity * totalDivertedPct) / 100).toFixed(2));

  return {
    wasteDiversionPct: totalDivertedPct,
    reusablePct,
    recycledPct,
    disposalPct,
    divertedWeightKg,
  };
};

/**
 * Task 3: Calculate Resource Recovery & Circularity Index.
 * 
 * @param {string} material Material type
 * @param {number} quantity Waste mass in kg
 * @param {string} recyclability Recyclability classification
 * @param {string} condition Condition status
 * @returns {Object} Resource recovery breakdown
 */
const calculateResourceRecoveryMetrics = (material, quantity, recyclability, condition) => {
  const recyclabilityEff = getRecyclabilityEfficiencyFactor(recyclability);
  const conditionYield = getConditionYieldFactor(condition);

  // Efficiency percentage (0-100)
  const recoveryEfficiencyPct = Math.round(recyclabilityEff * conditionYield * 100);
  
  // Recoverable physical material mass (kg)
  const recoverableMaterialKg = Number(((quantity * recoveryEfficiencyPct) / 100).toFixed(2));

  // Circularity Contribution Index (0 - 100 scale)
  const baseFactor = getMaterialEmissionFactor(material);
  const rawCircularity = (recoveryEfficiencyPct * 0.7) + (Math.min(15, baseFactor) * 2);
  const circularityContribution = Math.min(100, Math.max(0, Math.round(rawCircularity)));

  return {
    recoverableMaterialKg,
    recoveryEfficiencyPct,
    circularityContribution,
    recoveryPct: recoveryEfficiencyPct,
  };
};

/**
 * Task 4: Generate Waste Scoring Engine Outputs (Recyclability, Reuse, Sustainability, Material Recovery & Circularity Scores).
 * 
 * Official Weighted Scoring Model (Requirement 4):
 * - Material Recyclability: Weight 35%
 * - Material Condition: Weight 20%
 * - Reuse Potential: Weight 20%
 * - Environmental Benefit: Weight 15%
 * - Processing Feasibility: Weight 10%
 * 
 * @param {number} carbonSaved Carbon saved in kg CO2e
 * @param {number} quantity Waste quantity in kg
 * @param {number} diversionPct Waste diversion percentage (0-100)
 * @param {number} recoveryEfficiencyPct Recovery efficiency percentage (0-100)
 * @param {string} condition Material condition
 * @param {string} [recyclability] Recyclability category
 * @returns {{ score: number, recyclabilityScore: number, reuseScore: number, materialRecoveryScore: number, overallCircularityScore: number, performance: string }} Score metrics
 */
const calculateSustainabilityScoreAndPerformance = (
  carbonSaved,
  quantity,
  diversionPct,
  recoveryEfficiencyPct,
  condition,
  recyclability = "Recyclable"
) => {
  const recyclabilityEff = getRecyclabilityEfficiencyFactor(recyclability);
  const recyclabilityScore = Math.round(recyclabilityEff * 100);

  const conditionYield = getConditionYieldFactor(condition);
  const conditionScore = Math.round(conditionYield * 100);

  const allocation = getWasteDiversionAllocation(recyclability);
  const reuseScore = Math.round(allocation.reusablePct * conditionYield);

  const environmentalBenefitScore = Math.min(100, Math.max(0, Math.round((carbonSaved / Math.max(1, quantity)) * 10)));
  const processingFeasibilityScore = Math.round(recoveryEfficiencyPct);

  // Exact PDF Weighted Score Formula
  const weightedScore =
    (recyclabilityScore * 0.35) +
    (conditionScore * 0.20) +
    (reuseScore * 0.20) +
    (environmentalBenefitScore * 0.15) +
    (processingFeasibilityScore * 0.10);

  const score = Math.min(100, Math.max(0, Math.round(weightedScore)));
  const materialRecoveryScore = Math.round(recoveryEfficiencyPct);
  const overallCircularityScore = Math.min(100, Math.max(0, Math.round((diversionPct * 0.5) + (recoveryEfficiencyPct * 0.5))));

  // Performance Rating Level Mapping
  let performance = "Needs Improvement";
  if (score >= 80) {
    performance = "Excellent";
  } else if (score >= 65) {
    performance = "Good";
  } else if (score >= 50) {
    performance = "Average";
  }

  return {
    score,
    recyclabilityScore,
    reuseScore,
    materialRecoveryScore,
    overallCircularityScore,
    performance,
  };
};

module.exports = {
  calculateCarbonSavings,
  calculateWasteDiversionMetrics,
  calculateResourceRecoveryMetrics,
  calculateSustainabilityScoreAndPerformance,
};
