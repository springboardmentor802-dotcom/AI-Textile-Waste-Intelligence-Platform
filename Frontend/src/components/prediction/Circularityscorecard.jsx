import { RefreshCcw, AlertTriangle, Clock } from "lucide-react";
import "./CircularityScoreCard.css";

/** Ring geometry - shared by the SVG circle math below. */
const RING_RADIUS = 52;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Maps a circularity_category string to a theme color used for the
 * progress ring and category badge. Falls back to gray for the
 * "Unclassified" safe-fallback category, so an unrecognized/unknown
 * category never renders with a misleading color.
 *
 * @param {string} category
 * @returns {string} A CSS color value.
 */
// Replaces getCategoryColor() - returns a CSS class instead of a hex string
function getCategoryClassName(category) {
  switch (category) {
    case "Excellent Recovery Potential":
      return "circ-cat-excellent";
    case "High Recovery Potential":
      return "circ-cat-high";
    case "Moderate Recovery Potential":
      return "circ-cat-moderate";
    case "Limited Recovery Potential":
      return "circ-cat-limited";
    case "Disposal Recommended":
      return "circ-cat-disposal";
    default:
      return "circ-cat-unknown";
  }
}

/** Clamps a score to the 0-100 range used by the progress ring. */
function clampScore(value) {
  if (typeof value !== "number" || Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, value));
}

/**
 * A single labeled breakdown bar (e.g. "Material Recyclability - 85%").
 * Handles a null score (formula input unavailable) by rendering an
 * empty track instead of guessing a value.
 */
/** Maps a 0-100 value to a color tier class for the breakdown bar fill. */
function getBarColorClass(hasValue, value) {
  if (!hasValue) return "circ-fill-gray";
  if (value >= 70) return "circ-fill-green";
  if (value >= 50) return "circ-fill-yellow";
  if (value >= 30) return "circ-fill-orange";
  return "circ-fill-red";
}

function BreakdownBar({ label, value }) {
  const hasValue = typeof value === "number" && !Number.isNaN(value);
  const percent = hasValue ? clampScore(value) : 0;
  const fillColorClass = getBarColorClass(hasValue, percent);

  return (
    <div className="circ-breakdown-row">
      <span className="circ-breakdown-label">{label}</span>
      <div className="circ-breakdown-track">
        <div
          className={`circ-breakdown-fill ${fillColorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="circ-breakdown-value">{hasValue ? `${value}%` : "N/A"}</span>
    </div>
  );
}

/**
 * CircularityScoreCard
 *
 * Displays the Circularity Score (the project's weighted circular-
 * economy formula) as a progress ring, plus a breakdown of its five
 * inputs, sourced from `result.sustainability.waste_scoring`.
 *
 * Expected shape:
 * {
 *   circularity_score: number | null,
 *   circularity_category: string,
 *   score_breakdown: {
 *     material_recyclability, material_condition, reuse_score,
 *     environmental_benefit, processing_feasibility
 *   },
 *   status
 * }
 *
 * @param {object} props
 * @param {object} props.wasteScoring - The waste_scoring object from the API response.
 */
function CircularityScoreCard({ wasteScoring }) {
  const data = wasteScoring || {};
  const breakdown = data.score_breakdown || {};
  const isUnavailable = data.status && data.status !== "ok";

  const score = clampScore(data.circularity_score);
  const categoryClass = getCategoryClassName(data.circularity_category);
  const dashOffset = RING_CIRCUMFERENCE - (score / 100) * RING_CIRCUMFERENCE;

  return (
    <section className="circ-card" aria-labelledby="circ-card-title">
      <header className="circ-card-header">
        <div className="circ-header-icon" aria-hidden="true">
          <RefreshCcw size={18} />
        </div>
        <h3 id="circ-card-title" className="circ-card-title">
          Circular Economy Score
        </h3>
      </header>

      {isUnavailable ? (
        <div className="circ-unavailable">
          <AlertTriangle size={18} />
          <span>Circularity score isn&apos;t available for this material yet.</span>
        </div>
      ) : (
        <div className="circ-body">
          {/* Left column: progress ring + recovery badge */}
          <div className="circ-col circ-col-ring">
            <div className="circ-ring-wrap">
              <svg
                className="circ-ring"
                viewBox="0 0 120 120"
                role="img"
                aria-label={`Circularity score ${score} out of 100`}
              >
                <circle
                  className="circ-ring-track"
                  cx="60"
                  cy="60"
                  r={RING_RADIUS}
                />
                <circle
                  className={`circ-ring-fill ${categoryClass}`}
                  cx="60"
                  cy="60"
                  r={RING_RADIUS}
                  strokeDasharray={RING_CIRCUMFERENCE}
                  strokeDashoffset={dashOffset}
                />
              </svg>
              <div className="circ-ring-center">
                <span className="circ-ring-score">{data.circularity_score ?? "N/A"}</span>
                <span className="circ-ring-max">/100</span>
              </div>
            </div>

            <span className={`circ-category-badge ${categoryClass}`}>
              {data.circularity_category || "N/A"}
            </span>
          </div>

          {/* Middle column: score breakdown bars */}
          <div className="circ-col circ-col-breakdown">
            <div className="circ-breakdown-heading">
              <h4 className="circ-breakdown-title">Score Breakdown</h4>
              <span className="circ-breakdown-subtitle">(5 Weighted Factors)</span>
            </div>

            <div className="circ-breakdown">
              <BreakdownBar label="Material Recyclability (35%)" value={breakdown.material_recyclability} />
              <BreakdownBar label="Reuse Potential (20%)" value={breakdown.reuse_score} />
              <BreakdownBar label="Material Condition (20%)" value={breakdown.material_condition} />
              <BreakdownBar label="Environmental Benefit (15%)" value={breakdown.environmental_benefit} />
              <BreakdownBar label="Processing Feasibility (10%)" value={breakdown.processing_feasibility} />
            </div>
          </div>

          {/* Right column: explanation card */}
          <aside className="circ-explain-card" aria-labelledby="circ-explain-title">
            <div className="circ-explain-heading">
              <Clock size={15} className="circ-explain-icon" aria-hidden="true" />
              <h4 id="circ-explain-title" className="circ-explain-title">
                Score Calculation
              </h4>
            </div>
            <ul className="circ-explain-list">
              <li>Material Recyclability (35%)</li>
              <li>Reuse Potential (20%)</li>
              <li>Material Condition (20%)</li>
              <li>Environmental Benefit (15%)</li>
              <li>Processing Feasibility (10%)</li>
            </ul>
            <p className="circ-explain-footer">
              These five weighted factors are combined to calculate the overall Circular Economy Score.
            </p>
          </aside>
        </div>
      )}
    </section>
  );
}

export default CircularityScoreCard;