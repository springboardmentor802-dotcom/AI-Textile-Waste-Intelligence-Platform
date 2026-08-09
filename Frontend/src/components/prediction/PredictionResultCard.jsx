import { memo, useMemo } from "react";
import { Leaf, ScanSearch } from "lucide-react";
import "./PredictionResultCard.css";

// Centralised tuning knobs — change thresholds/geometry here only.
const CONFIDENCE_THRESHOLDS = { high: 75, medium: 50 };
const GAUGE_RADIUS = 54;
const GAUGE_CENTER_X = 60;
const GAUGE_CENTER_Y = 60;

/**
 * Coerces a possibly-missing / possibly-stringified backend number into a
 * safe 0-100 float. FastAPI can serialize numeric fields as strings
 * depending on the response model, so this guards both `undefined` and
 * `"53.99"`-style values.
 */
function toSafePercent(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return 0;
  return Math.max(0, Math.min(100, num));
}

/** Maps a confidence % to a tier label + tone class for the badge. */
function getConfidenceTier(confidence) {
  if (confidence >= CONFIDENCE_THRESHOLDS.high) return { label: "High Confidence", tone: "high" };
  if (confidence >= CONFIDENCE_THRESHOLDS.medium) return { label: "Medium Confidence", tone: "medium" };
  return { label: "Low Confidence", tone: "low" };
}

/**
 * Semicircle gauge, 0-100, green -> yellow -> red arc with a dot marker
 * at the current confidence position. Pure SVG, no external chart lib.
 * Memoized: only re-renders when the numeric confidence actually changes.
 */
const ConfidenceGauge = memo(function ConfidenceGauge({ confidence }) {
  const clamped = toSafePercent(confidence);

  const marker = useMemo(() => {
    const angle = (clamped / 100) * 180; // 0-180 degrees across the semicircle
    const rad = ((180 - angle) * Math.PI) / 180;
    return {
      x: GAUGE_CENTER_X + GAUGE_RADIUS * Math.cos(rad),
      y: GAUGE_CENTER_Y - GAUGE_RADIUS * Math.sin(rad),
    };
  }, [clamped]);

  return (
    <div className="pred-gauge">
      <svg
        viewBox="0 0 120 70"
        className="pred-gauge-svg"
        role="img"
        aria-label={`Confidence score: ${clamped.toFixed(2)} percent`}
      >
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#e2574c" />
            <stop offset="50%" stopColor="#e8b93f" />
            <stop offset="100%" stopColor="#3fa35a" />
          </linearGradient>
        </defs>
        <path
          d={`M 6 ${GAUGE_CENTER_Y} A ${GAUGE_RADIUS} ${GAUGE_RADIUS} 0 0 1 114 ${GAUGE_CENTER_Y}`}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <circle cx={marker.x} cy={marker.y} r="5.5" className="pred-gauge-marker" aria-hidden="true" />
      </svg>
      <div className="pred-gauge-value">{clamped.toFixed(2)}%</div>
    </div>
  );
});

function PredictionResultCard({ result }) {
  if (!result) return null;

  const { material, confidence, defect, defect_confidence, sustainability } = result;

  // material_information's exact key isn't confirmed against the backend
  // schema yet — fall back through likely candidates so the badge never
  // silently renders "undefined" if the field name differs.
  const materialType =
  sustainability?.material_information?.material_type ||
  "Unknown";

  const safeConfidence = toSafePercent(confidence);
  const tier = getConfidenceTier(safeConfidence);
  const defectLabel =
  defect?.toLowerCase() === "defect free"
    ? "No Defect"
    : defect || "Unknown";
  const hasDefect = Boolean(defect) && !/^(none|no defect|defect free)$/i.test(defect.trim());
  const defectConfidenceLabel =
  defect_confidence === null || defect_confidence === undefined || Number.isNaN(Number(defect_confidence))
    ? "—"
    : `${toSafePercent(defect_confidence).toFixed(2)}%`;

  return (
    <section className="pred-card pred-result-card-v2" aria-labelledby="pred-result-heading">
      <h3 id="pred-result-heading" className="pred-result-eyebrow">
        Prediction Result
      </h3>

      <div className="pred-result-top-row">
        <div className="pred-result-material-block">
          <div className="pred-result-icon-circle" aria-hidden="true">
            <Leaf size={20} />
          </div>
          <div>
            <p className="pred-result-label">Predicted Material</p>
            <h2 className="pred-result-material-name">{material || "Unknown Material"}</h2>
            <span className="pred-result-badge pred-result-badge-fiber">{materialType}</span>
          </div>
        </div>

        <div className="pred-result-confidence-block">
          <p className="pred-result-label pred-result-label-right">Confidence Score</p>
          <ConfidenceGauge confidence={safeConfidence} />
          <span
            className={`pred-result-badge pred-result-badge-tone-${tier.tone}`}
            role="status"
          >
            {tier.label}
          </span>
        </div>
      </div>

      <div className="pred-result-defect-panel">
        <div className="pred-result-defect-header">
            <ScanSearch size={16} aria-hidden="true" />
            <p className="pred-result-defect-title">
            Defect Detection
            </p>
        </div>
        
        <div className="pred-result-defect-rows">
          <div className="pred-result-defect-row">
            <span className="pred-result-defect-key">Prediction</span>
            <span className={`pred-result-defect-value ${hasDefect ? "pred-result-defect-value-alert" : "pred-result-defect-value-ok"}`}>
                {defectLabel}
            </span>
          </div>
          <div className="pred-result-defect-row">
            <span className="pred-result-defect-key">Confidence</span>
            <span className="pred-result-defect-value">{defectConfidenceLabel}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

// Memoized: Predictions.jsx re-renders on unrelated state changes
// (isLoading, error, previewUrl), and `result` is only ever replaced by a
// new object on a fresh prediction — so a shallow prop comparison is safe
// and avoids re-running the gauge math / re-mounting DOM unnecessarily.
export default memo(PredictionResultCard);