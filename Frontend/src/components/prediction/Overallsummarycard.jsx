import React from "react";
import { Sparkles, Leaf } from "lucide-react";
import "./OverallSummaryCard.css";

/**
 * OverallSummaryCard
 * -------------------
 * Executive summary card for the sustainability analysis result.
 * Consumes `sustainability` and safely renders every field, degrading
 * gracefully when nested objects or values are missing.
 *
 * NOTE: No backend logic, API calls, props, calculations, or data mapping
 * were changed here — only the JSX structure / CSS classes used to render
 * the existing values. The only addition is a defensive read for a
 * longer-form narrative summary (checked under a few likely backend key
 * names) used to populate the right-hand "Summary" panel; if the backend
 * does not provide one of these keys, the panel falls back to the same
 * `overall_sustainability` sentence already used elsewhere on the card so
 * nothing is fabricated.
 *
 * Expected shape (all keys optional):
 * {
 *   overall_sustainability: string,
 *   summary / detailed_summary / summary_text: string, // optional long-form text
 *   material_information: { material_type },
 *   recommendations: { primary_method, reuse_potential, waste_category, summary },
 *   environmental_impact: { environmental_score },
 *   waste_scoring: { circularity_score, circularity_category }
 * }
 */
const OverallSummaryCard = ({ sustainability }) => {
  // Destructure defensively — every nested object defaults to {} so
  // property access below never throws on missing data.
  const {
    overall_sustainability: overallSummary,
    material_information: materialInfo = {},
    recommendations = {},
    environmental_impact: environmentalImpact = {},
    waste_scoring: wasteScoring = {},
  } = sustainability || {};

  const { material_type: materialType } = materialInfo;
  const fabricClass = materialInfo.fabric_class || materialInfo.fabricClass || "Material";
  const { environmental_score: environmentalScore } = environmentalImpact;
  const {
    circularity_score: circularityScore,
    circularity_category: circularityCategory,
  } = wasteScoring;

  // Circularity score is rendered to one decimal place when it's a valid number.
  const formattedCircularityScore =
    typeof circularityScore === "number" && !Number.isNaN(circularityScore)
      ? circularityScore.toFixed(1)
      : "N/A";

  const formattedEnvironmentalScore =
    typeof environmentalScore === "number" && !Number.isNaN(environmentalScore)
      ? environmentalScore
      : "N/A";

  // Long-form narrative text for the right-hand Summary panel. This reads an
  // already-existing backend field under a few plausible key names and never
  // generates new copy — it only falls back to the same headline sentence
  // used on the left if no separate narrative field is present.
  const narrativeSummary =
    sustainability?.summary ||
    sustainability?.detailed_summary ||
    sustainability?.summary_text ||
    recommendations?.summary ||
    overallSummary ||
    "Summary is not available for this analysis.";

  const headlineSentence =
  `${fabricClass} (${materialType || "Unknown"}) shows ${
    circularityCategory || "N/A"
  } with a circularity score of ${
    formattedCircularityScore !== "N/A"
      ? formattedCircularityScore + "/100"
      : "N/A"
  }.`;

  return (
    <section className="overall-summary-card" aria-labelledby="overall-summary-heading">
      {/* LEFT COLUMN */}
      <div className="overall-summary-card__left">
        <header className="overall-summary-card__header">
          <span className="overall-summary-card__icon-wrap">
            <Leaf size={18} strokeWidth={2} />
          </span>
          <h2 id="overall-summary-heading" className="overall-summary-card__title">
            Sustainability Overview
          </h2>
        </header>

        {/* <p className="overall-summary-card__headline">{headlineSentence}</p> */}

        <div className="summary-stats-panel">
          <div className="summary-stat">
            <span className="summary-stat-card__label">Circularity Score</span>
            <span className="summary-stat-card__value">
              {formattedCircularityScore}
              {formattedCircularityScore !== "N/A" && (
                <span className="summary-stat-card__unit"> / 100</span>
              )}
            </span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-stat">
            <span className="summary-stat-card__label">Recovery Category</span>
            <span className="summary-stat-card__value summary-stat-card__value--accent">
              {circularityCategory || "N/A"}
            </span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-stat">
            <span className="summary-stat-card__label">Environmental Score</span>
            <span className="summary-stat-card__value">
              {formattedEnvironmentalScore}
              {formattedEnvironmentalScore !== "N/A" && (
                <span className="summary-stat-card__unit"> / 100</span>
              )}
            </span>
          </div>

          <div className="summary-divider"></div>

          <div className="summary-stat">
            <span className="summary-stat-card__label">Material Type</span>
            <span className="summary-stat-card__value summary-stat-card__value--with-icon">
              <Leaf size={16} strokeWidth={2} />
              <span>{materialType || "N/A"}</span>
            </span>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN */}
      <aside className="overall-summary-card__right" aria-labelledby="overall-summary-panel-heading">
        <h3 id="overall-summary-panel-heading" className="overall-summary-card__panel-title">
          Summary
        </h3>
        <p className="overall-summary-card__panel-body">{narrativeSummary}</p>
      </aside>
    </section>
  );
};

export default OverallSummaryCard;