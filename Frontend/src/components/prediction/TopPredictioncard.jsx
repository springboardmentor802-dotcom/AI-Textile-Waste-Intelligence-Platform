import { useEffect, useState } from "react";
import { ListOrdered, Trophy, Medal, Award, ImageOff } from "lucide-react";
import "./TopPredictionCard.css";

/**
 * Maps a 1-based rank to its badge icon, color theme, and accessible
 * label. Only ranks 1-3 are expected (top_3_predictions), but a
 * neutral fallback is included defensively in case a longer array is
 * ever passed in.
 *
 * @param {number} rank - 1-based position in the prediction list.
 * @returns {{ icon: JSX.Element, className: string, label: string }}
 */
function getRankMeta(rank) {
  switch (rank) {
    case 1:
      return { icon: <Trophy size={16} aria-hidden="true" />, className: "top-rank-gold", label: "1st" };
    case 2:
      return { icon: <Medal size={16} aria-hidden="true" />, className: "top-rank-silver", label: "2nd" };
    case 3:
      return { icon: <Award size={16} aria-hidden="true" />, className: "top-rank-bronze", label: "3rd" };
    default:
      return { icon: <Medal size={16} aria-hidden="true" />, className: "top-rank-default", label: `${rank}th` };
  }
}

/**
 * A single ranked prediction row, including its own animated progress
 * bar. The bar animates from 0 to its target confidence on mount by
 * flipping a state value one tick after the initial render - CSS
 * `transition` on `.top-bar-fill` then handles the smooth fill-in.
 *
 * @param {object} props
 * @param {number} props.rank - 1-based rank (1 = highest confidence).
 * @param {string} props.material - Predicted material name.
 * @param {number} props.confidence - Confidence percentage (0-100).
 * @param {boolean} props.isTop - Whether this is the #1 (highlighted) prediction.
 */
function PredictionRow({ rank, material, confidence, isTop }) {
  // Bar starts at 0% and animates to its real value after mount, so the
  // transition is actually visible instead of rendering pre-filled.
  const [animatedWidth, setAnimatedWidth] = useState(0);
  const rankMeta = getRankMeta(rank);
  const safeConfidence = typeof confidence === "number" ?Math.min(100, Math.max(0, confidence)): 0;

  useEffect(() => {
    const frame = requestAnimationFrame(() => setAnimatedWidth(safeConfidence));
    return () => cancelAnimationFrame(frame);
  }, [safeConfidence]);

  return (
    <li className={`top-row ${isTop ? "top-row-highlight" : ""}`}>
      <span className={`top-rank-badge ${rankMeta.className}`} aria-label={`Rank ${rankMeta.label}`}>
        {rankMeta.icon}
      </span>

      <div className="top-row-body">
        <div className="top-row-heading">
          <span className="top-row-material">{material || "N/A"}</span>
          <span className="top-row-confidence">
            {typeof confidence === "number" ? `${confidence.toFixed(2)}%` : "N/A"}
          </span>
        </div>

        <div
          className="top-bar-track"
          role="progressbar"
          aria-valuenow={safeConfidence}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${material || "Unknown material"} confidence`}
        >
          <div
            className={`top-bar-fill ${rankMeta.className}`}
            style={{ width: `${animatedWidth}%` }}
          />
        </div>
      </div>

      {isTop && <span className="top-best-tag">Highest Confidence</span>}
    </li>
  );
}

/**
 * TopPredictionCard
 *
 * Displays the top 3 fabric classification predictions with ranking
 * badges (gold/silver/bronze), animated confidence bars, and the
 * highest-confidence result visually highlighted.
 *
 * Sourced from `result.top_3_predictions`, expected shape:
 * [{ material: string, confidence: number }, ...]
 *
 * @param {object} props
 * @param {Array<{material: string, confidence: number}>} props.predictions - top_3_predictions from the API response.
 */
function TopPredictionCard({ predictions }) {
  const items = Array.isArray(predictions) ? predictions.slice(0, 3) : [];

  return (
    <section className="top-card" aria-labelledby="top-card-title">
      <header className="top-card-header">
        <div className="top-header-icon" aria-hidden="true">
          <ListOrdered size={18} />
        </div>
        <h3 id="top-card-title" className="top-card-title">
          Top 3 Predictions
        </h3>
      </header>

      {items.length > 0 ? (
        <ul className="top-list">
          {items.map((item, index) => (
            <PredictionRow
              key={item?.material ?? index}
              rank={index + 1}
              material={item?.material}
              confidence={item?.confidence}
              isTop={index === 0}
            />
          ))}
        </ul>
      ) : (
        <div className="top-empty-state">
          <ImageOff size={20} aria-hidden="true" />
          <p>No prediction results available.
Upload an image to view the top three material predictions.</p>
        </div>
      )}
    </section>
  );
}

export default TopPredictionCard;