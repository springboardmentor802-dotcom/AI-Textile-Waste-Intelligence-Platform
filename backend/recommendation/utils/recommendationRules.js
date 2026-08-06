/**
 * Recycling Recommendation Engine - Rule Decision Engine
 * 
 * Implements intelligent rule-based evaluation to generate prioritized recommendations
 * with clear reasons and environmental benefit explanations based on textile parameters.
 */

const { RECOMMENDATION_TYPES, PRIORITY_LEVELS } = require("./recommendationTypes");

/**
 * Evaluates input parameters and returns prioritized list of recycling & recovery recommendations.
 * 
 * @param {Object} input Input parameters
 * @param {string} input.material Material type (Cotton, Polyester, Silk, Denim, Mixed Fabric, etc.)
 * @param {string} input.condition Condition status (Pristine, Good, Fair, Worn, Damaged, Severe Waste)
 * @param {string} [input.contaminationLevel] Contamination level (Clean, Low, Moderate, High)
 * @param {string} [input.wasteCategory] Waste classification category
 * @param {string} [input.recyclability] Recyclability classification
 * @param {number} [input.quantity] Waste quantity in kg
 * @returns {Array<{ name: string, priority: string, reason: string, environmental_benefit: string }>} Recommendation list
 */
const evaluateRecommendations = ({
  material = "",
  condition = "",
  contaminationLevel = "Clean",
  wasteCategory = "",
  recyclability = "",
  quantity = 1,
}) => {
  const recommendations = [];
  const normalizedMaterial = String(material).trim().toLowerCase();
  const normalizedCondition = String(condition).trim().toLowerCase();
  const normalizedContamination = String(contaminationLevel).trim().toLowerCase();
  const normalizedCategory = String(wasteCategory).trim().toLowerCase();
  const normalizedRecyclability = String(recyclability).trim().toLowerCase();

  // Rule 1: High Contamination / Severe Waste -> Industrial Recovery & Safe Disposal
  const isContaminated =
    normalizedContamination.includes("high") ||
    normalizedContamination.includes("severe") ||
    normalizedCondition.includes("severe") ||
    normalizedCondition.includes("poor") ||
    normalizedCategory.includes("landfill") ||
    normalizedRecyclability.includes("nonrecyclable");

  if (isContaminated) {
    recommendations.push({
      name: RECOMMENDATION_TYPES.INDUSTRIAL_RECOVERY,
      priority: PRIORITY_LEVELS.HIGH,
      reason: "High contamination or non-recyclable degradation prevents standard fiber re-spinning",
      environmental_benefit: "Extracts thermal/industrial energy recovery while isolating hazardous compounds",
    });

    recommendations.push({
      name: RECOMMENDATION_TYPES.SAFE_DISPOSAL,
      priority: PRIORITY_LEVELS.MEDIUM,
      reason: "Residual material unfit for circular recovery requires controlled handling",
      environmental_benefit: "Prevents soil contamination and uncontrolled toxic leaching",
    });

    return recommendations;
  }

  // Rule 2: Reusable / Good Condition Natural & Premium Fabrics (Cotton, Silk, Denim, Linen, Wool)
  const isGoodCondition =
    normalizedCondition.includes("good") ||
    normalizedCondition.includes("pristine") ||
    normalizedCondition.includes("new") ||
    normalizedCategory.includes("reusable") ||
    normalizedRecyclability.includes("reusable");

  if (isGoodCondition) {
    recommendations.push({
      name: RECOMMENDATION_TYPES.FABRIC_REUSE,
      priority: PRIORITY_LEVELS.HIGH,
      reason: "Fabric is reusable and in good condition",
      environmental_benefit: "Reduces textile waste and avoids virgin manufacturing emissions",
    });

    recommendations.push({
      name: RECOMMENDATION_TYPES.DONATION,
      priority: PRIORITY_LEVELS.MEDIUM,
      reason: "Garment/textile is wearable and functional",
      environmental_benefit: "Extends product lifespan and provides social value",
    });

    recommendations.push({
      name: RECOMMENDATION_TYPES.UPCYCLING,
      priority: PRIORITY_LEVELS.MEDIUM,
      reason: "Suitable for creative redesign and repurposing",
      environmental_benefit: "Supports circular economy and zero-waste design",
    });

    return recommendations;
  }

  // Rule 3: Cotton / Denim (Damaged / Worn) -> Fiber Recycling & Mechanical Recycling
  if (normalizedMaterial.includes("cotton") || normalizedMaterial.includes("denim") || normalizedMaterial.includes("linen")) {
    recommendations.push({
      name: RECOMMENDATION_TYPES.FIBER_RECYCLING,
      priority: PRIORITY_LEVELS.HIGH,
      reason: "Natural cotton/cellulose fibers can be shredded and re-spun into new yarn",
      environmental_benefit: "Saves up to 95% of water required for virgin cotton cultivation",
    });

    recommendations.push({
      name: RECOMMENDATION_TYPES.MECHANICAL_RECYCLING,
      priority: PRIORITY_LEVELS.MEDIUM,
      reason: "Mechanical shredding converts worn cotton into shoddy and insulation fibers",
      environmental_benefit: "Diverts textile scrap from landfills into industrial insulation",
    });

    recommendations.push({
      name: RECOMMENDATION_TYPES.UPCYCLING,
      priority: PRIORITY_LEVELS.LOW,
      reason: "Scrap pieces can be used for patchwork or industrial wipes",
      environmental_benefit: "Maximizes material economic utility before ultimate disposal",
    });

    return recommendations;
  }

  // Rule 4: Polyester / Synthetic Fabrics -> Mechanical & Chemical Recycling
  if (normalizedMaterial.includes("polyester") || normalizedMaterial.includes("nylon") || normalizedMaterial.includes("synthetic")) {
    recommendations.push({
      name: RECOMMENDATION_TYPES.MECHANICAL_RECYCLING,
      priority: PRIORITY_LEVELS.HIGH,
      reason: "Clean synthetic fibers can be mechanically pelleted into recycled rPET/polyester",
      environmental_benefit: "Reduces crude oil consumption and petro-chemical processing emissions",
    });

    recommendations.push({
      name: RECOMMENDATION_TYPES.CHEMICAL_RECYCLING,
      priority: PRIORITY_LEVELS.MEDIUM,
      reason: "Depolymerization breaks synthetics down to pure monomer building blocks",
      environmental_benefit: "Enables infinite closed-loop polyester recycling without fiber degradation",
    });

    return recommendations;
  }

  // Rule 5: Silk / Premium Delicate Fabrics -> Reuse & Upcycling
  if (normalizedMaterial.includes("silk") || normalizedMaterial.includes("wool")) {
    recommendations.push({
      name: RECOMMENDATION_TYPES.FABRIC_REUSE,
      priority: PRIORITY_LEVELS.HIGH,
      reason: "High-value luxury protein fiber in reusable state",
      environmental_benefit: "Preserves energy-intensive sericulture and livestock cultivation value",
    });

    recommendations.push({
      name: RECOMMENDATION_TYPES.UPCYCLING,
      priority: PRIORITY_LEVELS.MEDIUM,
      reason: "Silk offcuts and garments are ideal for premium luxury accessory upcycling",
      environmental_benefit: "Maximizes economic life of luxury textiles",
    });

    return recommendations;
  }

  // Rule 6: Mixed Fabric / Blended Materials -> Chemical & Mechanical Recycling
  if (normalizedMaterial.includes("mixed") || normalizedMaterial.includes("blend")) {
    recommendations.push({
      name: RECOMMENDATION_TYPES.CHEMICAL_RECYCLING,
      priority: PRIORITY_LEVELS.HIGH,
      reason: "Chemical solvent separation dissolves blended fibers (e.g. poly-cotton blends)",
      environmental_benefit: "Recovers individual pure polymer streams from complex waste blends",
    });

    recommendations.push({
      name: RECOMMENDATION_TYPES.MECHANICAL_RECYCLING,
      priority: PRIORITY_LEVELS.MEDIUM,
      reason: "Mixed fabric scrap can be mechanically converted into non-woven felts and acoustic panels",
      environmental_benefit: "Provides high-volume industrial utility for unseparated waste",
    });

    return recommendations;
  }

  // Fallback Rule for General / Unknown Textiles
  recommendations.push({
    name: RECOMMENDATION_TYPES.MECHANICAL_RECYCLING,
    priority: PRIORITY_LEVELS.HIGH,
    reason: "General textile waste suitable for mechanical shredding and fiber processing",
    environmental_benefit: "Diverts material from landfill into secondary industrial applications",
  });

  recommendations.push({
    name: RECOMMENDATION_TYPES.FIBER_RECYCLING,
    priority: PRIORITY_LEVELS.MEDIUM,
    reason: "Fibers can be reprocessed for automotive felts and carpet underlay",
    environmental_benefit: "Replaces virgin synthetic matrices with recovered post-consumer content",
  });

  return recommendations;
};

module.exports = {
  evaluateRecommendations,
};
