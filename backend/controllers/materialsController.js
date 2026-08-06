const { SUPPORTED_MATERIALS } = require("../services/aiService");
const { materialProfiles } = require("../services/materialKnowledge");

// @desc    Get supported materials list
// @route   GET /api/materials
// @access  Protected
const getMaterials = async (req, res) => {
  try {
    // Map list to fit singular Mixed Fabric naming if required, or keep it consistent
    const cleanSupportedMaterials = SUPPORTED_MATERIALS.map((m) =>
      m === "Mixed Fabrics" ? "Mixed Fabric" : m
    );

    res.status(200).json({
      success: true,
      supportedMaterials: cleanSupportedMaterials,
      profiles: materialProfiles,
    });
  } catch (error) {
    console.error("Materials Controller Error:", error.message);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch supported materials.",
    });
  }
};

module.exports = {
  getMaterials,
};
