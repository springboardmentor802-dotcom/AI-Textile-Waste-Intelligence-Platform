import {
  Recycle,
  Tag,
  RefreshCw,
  ListChecks,
  HelpCircle,
  Gift,
  Sparkles,
  Factory,
} from "lucide-react";
import "./RecommendationCard.css";

/**
 * Renders a value with graceful fallback for missing/null backend data.
 *
 * @param {string|null|undefined} value
 * @returns {string}
 */
function displayValue(value) {
  return value ? value : "N/A";
}

/**
 * Maps a reuse_potential value ("high" | "medium" | "low" | "unknown")
 * to a display label and a color-coded badge class, so the user can
 * scan reuse-worthiness at a glance instead of reading raw text.
 *
 * @param {string} value
 * @returns {{ label: string, className: string }}
 */
function getReusePotentialMeta(value) {
  switch ((value || "").toLowerCase()) {
    case "high":
      return { label: "High", className: "rec-badge-high" };
    case "medium":
      return { label: "Medium", className: "rec-badge-medium" };
    case "low":
      return { label: "Low", className: "rec-badge-low" };
    default:
      return { label: "Unknown", className: "rec-badge-unknown" };
  }
}

/**
 * Maps the primary_method value to an icon, a color theme, and the
 * display label. Distinguishes recycling / reuse / donation / upcycling
 * / industrial recovery methods so the "kind" of action is recognizable
 * before the user even reads the text. Falls back to a neutral "manual
 * review" state when no primary method is available (e.g. Unclassified
 * fabric, or an empty recommended_actions list).
 *
 * @param {string|null|undefined} method
 * @returns {{ icon: JSX.Element, className: string, label: string }}
 */
function getPrimaryMethodMeta(method) {
  if (!method) {
    return {
      icon: <HelpCircle size={16} aria-hidden="true" />,
      className: "rec-primary-review",
      label: "Manual review required",
    };
  }

  switch (method) {
    case "Fiber Recycling":
    case "Mechanical Recycling":
    case "Chemical Recycling":
      return {
        icon: <Recycle size={16} aria-hidden="true" />,
        className: "rec-primary-recycle",
        label: method,
      };
    case "Fabric Reuse":
      return {
        icon: <RefreshCw size={16} aria-hidden="true" />,
        className: "rec-primary-reuse",
        label: method,
      };
    case "Donation":
      return {
        icon: <Gift size={16} aria-hidden="true" />,
        className: "rec-primary-donation",
        label: method,
      };
    case "Upcycling":
      return {
        icon: <Sparkles size={16} aria-hidden="true" />,
        className: "rec-primary-upcycle",
        label: method,
      };
    case "Industrial Recovery":
      return {
        icon: <Factory size={16} aria-hidden="true" />,
        className: "rec-primary-recovery",
        label: method,
      };
    default:
      return {
        icon: <Tag size={16} aria-hidden="true" />,
        className: "rec-primary-default",
        label: method,
      };
  }
}

/**
 * Maps a single recommended action (from the project's fixed 7-action
 * taxonomy) to an icon and a color theme for its chip. Each action
 * family (recycling / reuse / donation / upcycling / recovery) gets a
 * visually distinct treatment so a multi-action recommendation is
 * scannable rather than a wall of identical green tags.
 *
 * @param {string} action - One of the recommended_actions values.
 * @returns {{ icon: JSX.Element, className: string }}
 */
function getActionChipMeta(action) {
  switch (action) {
    case "Fiber Recycling":
      return { icon: <Recycle size={13} aria-hidden="true" />, className: "rec-chip-fiber" };
    case "Mechanical Recycling":
      return { icon: <Recycle size={13} aria-hidden="true" />, className: "rec-chip-mechanical" };
    case "Chemical Recycling":
      return { icon: <Recycle size={13} aria-hidden="true" />, className: "rec-chip-chemical" };
    case "Fabric Reuse":
      return { icon: <RefreshCw size={13} aria-hidden="true" />, className: "rec-chip-reuse" };
    case "Donation":
      return { icon: <Gift size={13} aria-hidden="true" />, className: "rec-chip-donation" };
    case "Upcycling":
      return { icon: <Sparkles size={13} aria-hidden="true" />, className: "rec-chip-upcycle" };
    case "Industrial Recovery":
      return { icon: <Factory size={13} aria-hidden="true" />, className: "rec-chip-recovery" };
    default:
      return { icon: <Tag size={13} aria-hidden="true" />, className: "rec-chip-default" };
  }
}

/**
 * RecommendationCard
 *
 * Displays the recycling/recovery recommendation for the predicted
 * material, sourced from `result.sustainability.recommendations`.
 *
 * Expected shape:
 * {
 *   recommended_actions: string[],
 *   primary_method: string | null,
 *   reuse_potential: string,
 *   waste_category: string,
 *   status
 * }
 *
 * @param {object} props
 * @param {object} props.recommendations - The recommendations object from the API response.
 */
function RecommendationCard({ recommendations }) {
  const data = recommendations || {};
  const actions = Array.isArray(data.recommended_actions) ? data.recommended_actions : [];

  const primaryMeta = getPrimaryMethodMeta(data.primary_method);
  const reuseMeta = getReusePotentialMeta(data.reuse_potential);

  return (
    <section className="rec-card" aria-labelledby="rec-card-title">
      <header className="rec-card-header">
        <div className="rec-header-icon" aria-hidden="true">
          <Recycle size={18} />
        </div>
        <h3 id="rec-card-title" className="rec-card-title">
          Recycling Recommendation
        </h3>
        
      </header>

      {/* Primary method - the single "best" recommended action, styled by category */}
      <div
        className={`rec-primary ${primaryMeta.className}`}
        aria-label={`Primary recommended method: ${primaryMeta.label}`}
      >
        {primaryMeta.icon}
        <div>
          <p className="rec-primary-label">Primary Method</p>
          <p className="rec-primary-value">{primaryMeta.label}</p>
        </div>
      </div>

      {/* Waste category + reuse potential */}
      <div className="rec-info-row">
        <div className="rec-info-item">
          <Tag size={15} className="rec-info-icon" aria-hidden="true" />
          <div>
            <p className="rec-info-label">Waste Category</p>
            <p className="rec-info-value">{displayValue(data.waste_category)}</p>
          </div>
        </div>
        <div className="rec-info-item">
          <RefreshCw size={15} className="rec-info-icon" aria-hidden="true" />
          <div>
            <p className="rec-info-label">Reuse Potential</p>
            <span className={`rec-potential-badge ${reuseMeta.className}`}>
              {reuseMeta.label}
            </span>
          </div>
        </div>
      </div>

      {/* Recommended actions as color-coded chips */}
      <div className="rec-actions-block">
        <p className="rec-actions-title">
          <ListChecks size={14} aria-hidden="true" />
          Recommended Actions
        </p>
        {actions.length > 0 ? (
          <ul className="rec-actions-list" aria-label="Recommended recycling and recovery actions">
            {actions.map((action) => {
              const chipMeta = getActionChipMeta(action);
              return (
                <li
                  key={action}
                  className={`rec-action-chip ${chipMeta.className}`}
                  aria-label={`Recommended action: ${action}`}
                >
                  {chipMeta.icon}
                  {action}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="rec-actions-empty">No recommended actions available.</p>
        )}
      </div>
    </section>
  );
}

export default RecommendationCard;