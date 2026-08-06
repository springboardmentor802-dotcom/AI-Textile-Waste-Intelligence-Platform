/**
 * Sustainability Intelligence Engine - Validation Middleware
 * 
 * Validates request payload parameters for the Sustainability API endpoints.
 * Enforces field presence, proper data types, and value constraints.
 */

/**
 * Express middleware to validate POST /api/sustainability/analyze payload.
 * 
 * Required fields:
 * - material: string (non-empty)
 * - condition: string (non-empty)
 * - quantity: number (greater than 0)
 * - recyclability: string (non-empty)
 */
const validateAnalyzeRequest = (req, res, next) => {
  const errors = [];
  const { material, condition, quantity, recyclability } = req.body || {};

  // Validate Material
  if (material === undefined || material === null || typeof material !== "string" || material.trim() === "") {
    errors.push("Field 'material' is required and must be a non-empty string.");
  }

  // Validate Condition
  if (condition === undefined || condition === null || typeof condition !== "string" || condition.trim() === "") {
    errors.push("Field 'condition' is required and must be a non-empty string.");
  }

  // Validate Quantity
  if (quantity === undefined || quantity === null || typeof quantity !== "number" || isNaN(quantity) || quantity <= 0) {
    errors.push("Field 'quantity' is required and must be a positive number greater than 0.");
  }

  // Validate Recyclability
  if (recyclability === undefined || recyclability === null || typeof recyclability !== "string" || recyclability.trim() === "") {
    errors.push("Field 'recyclability' is required and must be a non-empty string.");
  }

  // If validation errors exist, return HTTP 400 Bad Request
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: "Bad Request",
      message: "Validation failed for sustainability analysis request",
      details: errors,
    });
  }

  // Sanitize and trim string inputs for clean processing
  req.body.material = material.trim();
  req.body.condition = condition.trim();
  req.body.quantity = Number(quantity);
  req.body.recyclability = recyclability.trim();

  next();
};

module.exports = {
  validateAnalyzeRequest,
};
