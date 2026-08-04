import {
  FaTimes,
} from "react-icons/fa";

import "./RecommendationDrawer.css";


const formatNumber = (
  value,
  maximumFractionDigits = 1,
) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits,
  }).format(Number(value) || 0);


function RecommendationDrawer({
  recommendation,
  onClose,
}) {
  if (!recommendation) {
    return null;
  }

  const score = Math.min(
    100,
    Math.max(
      0,
      Number(
        recommendation.displayedScore ||
          0,
      ),
    ),
  );


  return (
    <div
      className="recommendation-drawer-backdrop"
      onClick={onClose}
    >
      <aside
        className="recommendation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Recommendation details"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <header className="recommendation-drawer-header">
          <div>
            <span>
              Recommendation details
            </span>

            <h2>
              REC-
              {String(
                recommendation.id,
              ).padStart(3, "0")}
            </h2>
          </div>

          <button
            type="button"
            className="recommendation-drawer-close"
            aria-label="Close details"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </header>


        <div className="recommendation-drawer-body">
          <section className="drawer-primary-decision">
            <span>
              Recommended pathway
            </span>

            <h3>
              {recommendation.recommendation}
            </h3>

            <div className="drawer-score">
              <div>
                <span>
                  Sustainability score
                </span>

                <strong>
                  {score.toFixed(1)}/100
                </strong>
              </div>

              <div>
                <span
                  style={{
                    width: `${score}%`,
                  }}
                />
              </div>
            </div>
          </section>


          <section className="drawer-section">
            <div className="drawer-section-heading">
              <span>
                Textile assessment
              </span>

              <h3>
                Material and condition
              </h3>
            </div>

            <div className="drawer-detail-grid">
              <div>
                <span>Material</span>

                <strong>
                  {recommendation.material}
                </strong>
              </div>

              <div>
                <span>Visual class</span>

                <strong>
                  {recommendation.fabricClass ||
                    "Not available"}
                </strong>
              </div>

              <div>
                <span>Condition</span>

                <strong>
                  {recommendation.condition}
                </strong>
              </div>

              <div>
                <span>
                  Contamination
                </span>

                <strong>
                  {
                    recommendation.contamination
                  }
                </strong>
              </div>

              <div>
                <span>Circularity</span>

                <strong>
                  {
                    recommendation.circularityLevel
                  }
                </strong>
              </div>

              <div>
                <span>
                  Recovery category
                </span>

                <strong>
                  {
                    recommendation.recoveryCategory
                  }
                </strong>
              </div>
            </div>
          </section>


          <section className="drawer-section">
            <div className="drawer-section-heading">
              <span>
                AI explanation
              </span>

              <h3>
                Decision rationale
              </h3>
            </div>

            <p className="drawer-explanation">
              {recommendation.description}
            </p>
          </section>


          <section className="drawer-section">
            <div className="drawer-section-heading">
              <span>
                Environmental impact
              </span>

              <h3>
                Estimated recovery benefits
              </h3>
            </div>

            <div className="drawer-impact-grid">
              <div>
                <span>CO₂ saved</span>

                <strong>
                  {formatNumber(
                    recommendation.co2Saved,
                  )}{" "}
                  kg
                </strong>
              </div>

              <div>
                <span>Water saved</span>

                <strong>
                  {formatNumber(
                    recommendation.waterSaved,
                    0,
                  )}{" "}
                  L
                </strong>
              </div>

              <div>
                <span>Energy saved</span>

                <strong>
                  {formatNumber(
                    recommendation.energySaved,
                  )}{" "}
                  kWh
                </strong>
              </div>

              <div>
                <span>
                  Landfill diverted
                </span>

                <strong>
                  {formatNumber(
                    recommendation.landfillDiverted,
                  )}{" "}
                  kg
                </strong>
              </div>
            </div>
          </section>


          <section className="drawer-section">
            <div className="drawer-section-heading">
              <span>
                Dataset evidence
              </span>

              <h3>
                Supporting intelligence
              </h3>
            </div>

            <div className="drawer-evidence-grid">
              <div>
                <span>
                  Synthetic scenarios
                </span>

                <strong>
                  {formatNumber(
                    recommendation.pathwayRecords,
                    0,
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Pathway average
                </span>

                <strong>
                  {Number(
                    recommendation
                      .pathwayAverageScore ||
                      0,
                  ).toFixed(1)}
                </strong>
              </div>

              <div>
                <span>Status</span>

                <strong>
                  {recommendation.manualReview
                    ? "Manual Review"
                    : "Completed"}
                </strong>
              </div>

              <div>
                <span>
                  Environmental impact
                </span>

                <strong>
                  {
                    recommendation
                      .environmentalImpact
                  }
                </strong>
              </div>
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}


export default RecommendationDrawer;