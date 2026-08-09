import { Leaf, Droplet, Zap, Trash2, AlertTriangle } from "lucide-react";
import "./EnvironmentalImpactCard.css";

/**
 * Formats a numeric metric with a unit suffix, gracefully falling back
 * to "N/A" when the backend value is missing (null/undefined) - this
 * happens for the "Unclassified" fabric class, where the Environmental
 * Impact Engine intentionally returns null rather than guessing.
 *
 * @param {number|null|undefined} value - Raw numeric value from the API.
 * @param {string} unit - Unit label to append (e.g. "kg", "L", "MJ").
 * @param {number} [decimals=1] - Decimal places to round to.
 * @returns {string} Formatted display string, or "N/A".
 */
function formatMetric(value, unit, decimals = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "N/A";
  }
  return `${value.toFixed(decimals)} ${unit}`;
}

/**
 * Maps an environmental_score (0-100) to a recovery category label and
 * a CSS modifier class, mirroring the tiering language used by the
 * Circularity Score so the two scores read consistently on the page.
 *
 * @param {number} score
 * @returns {{ label: string, className: string }}
 */
function getEnvironmentalScoreMeta(score) {
  if (score >= 85) return { label: "Excellent Recovery", className: "impact-score-excellent" };
  if (score >= 70) return { label: "High Recovery", className: "impact-score-high" };
  if (score >= 55) return { label: "Moderate Recovery", className: "impact-score-moderate" };
  if (score >= 40) return { label: "Limited Recovery", className: "impact-score-limited" };
  return { label: "Low Recovery", className: "impact-score-low" };
}

/**
 * A single stat tile (icon + value + label) used for each environmental
 * metric. Kept as a small internal component to avoid repeating the
 * same markup four times.
 */
function ImpactStat({ icon, iconClass, value, label, description }) {
  return (
    <div className="impact-stat">
      <div className={`impact-stat-icon ${iconClass}`}>{icon}</div>
      <p className="impact-stat-value">{value}</p>
      <p className="impact-stat-label">{label}</p>
      <p className="impact-stat-description">{description}</p>
    </div>
  );
}

/**
 * EnvironmentalImpactCard
 *
 * Displays the estimated environmental savings for the predicted item,
 * sourced from `result.sustainability.environmental_impact`.
 *
 * Expected shape (all fields nullable):
 * {
 *   estimated_co2_saved_kg,
 *   estimated_water_saved_liters,
 *   estimated_energy_saved_mj,
 *   estimated_landfill_diversion_kg,
 *   environmental_score,
 *   status
 * }
 *
 * @param {object} props
 * @param {object} props.environmentalImpact - The environmental_impact object from the API response.
 */
function EnvironmentalImpactCard({ environmentalImpact }) {
  const data = environmentalImpact || {};
  const isUnavailable = data.status && data.status !== "ok";
  const scoreMeta = typeof data.environmental_score === "number"
    ? getEnvironmentalScoreMeta(data.environmental_score)
    : null;

  return (
    <section className="impact-card" aria-labelledby="impact-card-title">
      <header className="impact-card-header">
        <div className="impact-header-left">
            <div className="impact-header-icon">
                <Leaf size={18}/>
            </div>

            <h3 className="impact-card-title">
                Environmental Impact
            </h3>
        </div>
        <div className="impact-header-badges">
          {/* Improvement 3: status badge */}
          

          {/* Improvement 1: score + category badge */}
          {scoreMeta && (
            <span className={`impact-score-badge ${scoreMeta.className}`}>
              <span className="impact-score-dot" />
              <span className="impact-score-text">
                <span className="impact-score-label">{scoreMeta.label}</span>
                <span className="impact-score-value">{data.environmental_score}/100</span>
              </span>
            </span>
          )}
        </div>
      </header>

      {isUnavailable ? (
        <div className="impact-unavailable">
          <AlertTriangle size={18} />
          <span>
            Environmental impact data isn&apos;t available for this material yet.
          </span>
        </div>
      ) : (
        <div className="impact-grid">
          <ImpactStat
            icon={<Leaf size={18} />}
            iconClass="impact-icon-co2"
            value={formatMetric(data.estimated_co2_saved_kg, "kg", 2)}
            label="CO₂ Saved"
            description="Carbon emissions avoided through recycling"
          />
          <ImpactStat
            icon={<Droplet size={18} />}
            iconClass="impact-icon-water"
            value={formatMetric(data.estimated_water_saved_liters, "L", 0)}
            label="Water Saved"
            description="Water conserved compared to virgin production"
          />
          <ImpactStat
            icon={<Zap size={18} />}
            iconClass="impact-icon-energy"
            value={formatMetric(data.estimated_energy_saved_mj, "MJ", 1)}
            label="Energy Saved"
            description="Energy reduced by choosing circular solutions"
          />
          <ImpactStat
            icon={<Trash2 size={18} />}
            iconClass="impact-icon-landfill"
            value={formatMetric(data.estimated_landfill_diversion_kg, "kg", 2)}
            label="Landfill Diverted"
            description="Waste diverted from landfill through recycling"
          />
        </div>
      )}
    </section>
  );
}

export default EnvironmentalImpactCard; 