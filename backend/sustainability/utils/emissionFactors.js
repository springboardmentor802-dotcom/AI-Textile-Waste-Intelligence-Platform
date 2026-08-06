/**
 * Sustainability Intelligence Engine - Configurable Emission & Recovery Factors
 * 
 * Provides industry-aligned Life Cycle Assessment (LCA) reference factors for textile materials,
 * recycling method efficiencies, and condition quality degradation multipliers.
 * Configurable without hardcoding values directly into calculation logic.
 */

// Baseline CO2e savings per kilogram of material diverted from virgin production (kg CO2e / kg)
const MATERIAL_EMISSION_FACTORS = Object.freeze({
  Cotton: 8.50,
  Polyester: 6.20,
  Denim: 9.80,
  Silk: 15.40,
  Wool: 13.80,
  Nylon: 7.90,
  Linen: 5.40,
  Rayon: 4.80,
  Viscose: 4.80,
  Acrylic: 4.50,
  "Mixed Fabric": 5.10,
  "Mixed Fabrics": 5.10,
  Blended: 5.10,
  "Mixed Fabric / Blended": 5.10,
  Default: 5.00,
});

// Baseline Water savings in Liters per kilogram of material diverted from virgin production (Liters / kg)
const MATERIAL_WATER_FACTORS = Object.freeze({
  Cotton: 7500,
  Denim: 8500,
  Silk: 5500,
  Wool: 4500,
  Linen: 3500,
  Rayon: 2500,
  Nylon: 2000,
  Polyester: 1500,
  Acrylic: 1800,
  "Mixed Fabric": 3000,
  "Mixed Fabrics": 3000,
  Default: 3000,
});

// Processing/Recyclability Method Efficiency Multiplier (0.0 to 1.0)
const RECYCLABILITY_EFFICIENCY_FACTORS = Object.freeze({
  Reusable: 0.95,
  "Direct Reuse": 0.95,
  "Mechanical Recycling": 0.85,
  "Chemical Recycling": 0.75,
  Downcycling: 0.50,
  Recyclable: 0.80,
  "Incineration with Energy Recovery": 0.25,
  "Landfill / Disposal": 0.00,
  NonRecyclable: 0.05,
  Default: 0.70,
});

// Condition Degradation & Yield Multiplier (0.0 to 1.0)
const CONDITION_YIELD_FACTORS = Object.freeze({
  Pristine: 1.00,
  New: 1.00,
  Good: 0.90,
  Fair: 0.75,
  Worn: 0.60,
  Damaged: 0.50,
  "Worn / Damaged": 0.55,
  "Severe Waste": 0.35,
  Poor: 0.40,
  Default: 0.75,
});

// Primary Waste Allocation Ratios by Recyclability Tier
const WASTE_DIVERSION_ALLOCATION = Object.freeze({
  Reusable: { reusablePct: 85, recycledPct: 10, disposalPct: 5 },
  "Direct Reuse": { reusablePct: 90, recycledPct: 8, disposalPct: 2 },
  "Mechanical Recycling": { reusablePct: 15, recycledPct: 75, disposalPct: 10 },
  "Chemical Recycling": { reusablePct: 5, recycledPct: 85, disposalPct: 10 },
  Recyclable: { reusablePct: 25, recycledPct: 65, disposalPct: 10 },
  Downcycling: { reusablePct: 0, recycledPct: 60, disposalPct: 40 },
  NonRecyclable: { reusablePct: 0, recycledPct: 10, disposalPct: 90 },
  "Landfill / Disposal": { reusablePct: 0, recycledPct: 0, disposalPct: 100 },
  Default: { reusablePct: 20, recycledPct: 60, disposalPct: 20 },
});

/**
 * Helper to retrieve material emission factor with case-insensitive matching & fallback.
 * 
 * @param {string} material Material name
 * @returns {number} Emission factor in kg CO2e per kg
 */
const getMaterialEmissionFactor = (material) => {
  if (!material || typeof material !== "string") return MATERIAL_EMISSION_FACTORS.Default;
  const matchKey = Object.keys(MATERIAL_EMISSION_FACTORS).find(
    (key) => key.toLowerCase() === material.trim().toLowerCase()
  );
  return matchKey ? MATERIAL_EMISSION_FACTORS[matchKey] : MATERIAL_EMISSION_FACTORS.Default;
};

/**
 * Helper to retrieve recyclability method efficiency multiplier.
 * 
 * @param {string} recyclability Recyclability classification string
 * @returns {number} Multiplier float (0.0 to 1.0)
 */
const getRecyclabilityEfficiencyFactor = (recyclability) => {
  if (!recyclability || typeof recyclability !== "string") return RECYCLABILITY_EFFICIENCY_FACTORS.Default;
  const matchKey = Object.keys(RECYCLABILITY_EFFICIENCY_FACTORS).find(
    (key) => key.toLowerCase() === recyclability.trim().toLowerCase()
  );
  return matchKey ? RECYCLABILITY_EFFICIENCY_FACTORS[matchKey] : RECYCLABILITY_EFFICIENCY_FACTORS.Default;
};

/**
 * Helper to retrieve condition yield factor.
 * 
 * @param {string} condition Condition string
 * @returns {number} Multiplier float (0.0 to 1.0)
 */
const getConditionYieldFactor = (condition) => {
  if (!condition || typeof condition !== "string") return CONDITION_YIELD_FACTORS.Default;
  const matchKey = Object.keys(CONDITION_YIELD_FACTORS).find(
    (key) => key.toLowerCase() === condition.trim().toLowerCase()
  );
  return matchKey ? CONDITION_YIELD_FACTORS[matchKey] : CONDITION_YIELD_FACTORS.Default;
};

/**
 * Helper to retrieve waste allocation percentages for diversion breakdown.
 * 
 * @param {string} recyclability Recyclability classification
 * @returns {{ reusablePct: number, recycledPct: number, disposalPct: number }} Percentage allocation object
 */
const getWasteDiversionAllocation = (recyclability) => {
  if (!recyclability || typeof recyclability !== "string") return WASTE_DIVERSION_ALLOCATION.Default;
  const matchKey = Object.keys(WASTE_DIVERSION_ALLOCATION).find(
    (key) => key.toLowerCase() === recyclability.trim().toLowerCase()
  );
  return matchKey ? WASTE_DIVERSION_ALLOCATION[matchKey] : WASTE_DIVERSION_ALLOCATION.Default;
};

/**
 * Helper to retrieve material water saving factor with case-insensitive matching & fallback.
 * 
 * @param {string} material Material name
 * @returns {number} Water saving factor in Liters per kg
 */
const getMaterialWaterFactor = (material) => {
  if (!material || typeof material !== "string") return MATERIAL_WATER_FACTORS.Default;
  const matchKey = Object.keys(MATERIAL_WATER_FACTORS).find(
    (key) => key.toLowerCase() === material.trim().toLowerCase()
  );
  return matchKey ? MATERIAL_WATER_FACTORS[matchKey] : MATERIAL_WATER_FACTORS.Default;
};

module.exports = {
  MATERIAL_EMISSION_FACTORS,
  MATERIAL_WATER_FACTORS,
  RECYCLABILITY_EFFICIENCY_FACTORS,
  CONDITION_YIELD_FACTORS,
  WASTE_DIVERSION_ALLOCATION,
  getMaterialEmissionFactor,
  getMaterialWaterFactor,
  getRecyclabilityEfficiencyFactor,
  getConditionYieldFactor,
  getWasteDiversionAllocation,
};
