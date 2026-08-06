/**
 * Recycling Recommendation Engine - Service Layer
 * 
 * Service handling recommendation evaluation, ranking, and explanation formatting.
 * Follows SOLID principles and decouples business logic from HTTP transport layer.
 */

const mongoose = require("mongoose");
const { evaluateRecommendations } = require("../utils/recommendationRules");
const RecommendationRecord = require("../models/recommendationModel");

class RecommendationService {
  /**
   * Generates prioritized list of recycling recommendations with reasons and environmental benefits.
   * 
   * @param {Object} payload Input parameters
   * @param {string} payload.material Material name (Cotton, Polyester, etc.)
   * @param {string} payload.condition Condition status (Pristine, Good, Fair, Worn, Damaged, Severe Waste)
   * @param {string} [payload.contaminationLevel] Contamination level
   * @param {string} [payload.wasteCategory] Waste category
   * @param {string} [payload.recyclability] Recyclability classification
   * @param {number} [payload.quantity] Waste quantity in kg
   * @param {boolean} [payload.persist] Whether to save to DB
   * @param {string} [payload.createdBy] Optional user ID
   * @param {string} [payload.uploadedImage] Optional UploadedImage ID
   * @returns {Promise<Array<{ name: string, priority: string, reason: string, environmental_benefit: string }>>} Ranked recommendations
   */
  async generateRecommendations({
    material,
    condition,
    contaminationLevel = "Clean",
    wasteCategory = "",
    recyclability = "",
    quantity = 1,
    persist = false,
    createdBy = null,
    uploadedImage = null,
  }) {
    // Execute decision rule engine
    const recommendations = evaluateRecommendations({
      material,
      condition,
      contaminationLevel,
      wasteCategory,
      recyclability,
      quantity,
    });

    if (persist && mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        const recordData = {
          material,
          condition,
          contaminationLevel,
          wasteCategory,
          recyclability,
          quantity,
          recommendations,
          status: "Completed",
        };
        if (createdBy) recordData.createdBy = createdBy;
        if (uploadedImage) recordData.uploadedImage = uploadedImage;

        await RecommendationRecord.create(recordData);
      } catch (err) {
        console.warn(`[Recommendation Persistence Warning] Skipping DB save: ${err.message}`);
      }
    }

    return recommendations;
  }

  /**
   * Retrieves past recommendation evaluation history.
   * 
   * @param {Object} options Query options
   * @param {string} [options.userId] User ID filter
   * @param {number} [options.limit=20] Limit
   * @returns {Promise<Array<Object>>} Saved recommendation records
   */
  async getRecommendationHistory({ userId = null, limit = 20 } = {}) {
    if (!mongoose.connection || mongoose.connection.readyState !== 1) {
      return [];
    }
    const query = {};
    if (userId) query.createdBy = userId;

    return await RecommendationRecord.find(query)
      .populate("uploadedImage")
      .sort({ createdAt: -1 })
      .limit(limit);
  }
}

module.exports = new RecommendationService();
