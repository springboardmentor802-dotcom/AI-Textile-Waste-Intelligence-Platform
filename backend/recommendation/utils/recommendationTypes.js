/**
 * Recycling Recommendation Engine - Constants & Types
 * 
 * Defines standard recommendation action types, priority levels, and default messaging templates.
 */

// Supported Recommendation Action Types
const RECOMMENDATION_TYPES = Object.freeze({
  FABRIC_REUSE: "Reuse",
  DONATION: "Donation",
  UPCYCLING: "Upcycling",
  FIBER_RECYCLING: "Fiber Recycling",
  MECHANICAL_RECYCLING: "Mechanical Recycling",
  CHEMICAL_RECYCLING: "Chemical Recycling",
  INDUSTRIAL_RECOVERY: "Industrial Recovery",
  SAFE_DISPOSAL: "Safe Disposal",
});

// Priority Tier Rankings
const PRIORITY_LEVELS = Object.freeze({
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
});

module.exports = {
  RECOMMENDATION_TYPES,
  PRIORITY_LEVELS,
};
