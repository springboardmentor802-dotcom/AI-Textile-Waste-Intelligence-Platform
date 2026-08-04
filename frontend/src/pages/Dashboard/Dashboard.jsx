import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  FaArrowRight,
  FaBoxes,
  FaChartLine,
  FaCheckCircle,
  FaCloudUploadAlt,
  FaLeaf,
  FaRecycle,
  FaRobot,
  FaUsers,
} from "react-icons/fa";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../contexts/AuthContext";

import {
  getUsers,
} from "../../services/userService";
import {
  getInventory,
} from "../../services/inventoryService";
import {
  getRecommendations,
} from "../../services/recommendationService";
import {
  getAnalytics,
} from "../../services/analyticsService";
import {
  getPredictionHistory,
} from "../../services/predictionService";

import "./Dashboard.css";


const CHART_COLORS = [
  "#0f766e",
  "#2f80ed",
  "#9bd33d",
  "#f59e0b",
  "#8b5cf6",
  "#64748b",
];


const firstValue = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== "",
  );


const normalizeList = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  return (
    [
      response?.data,
      response?.uploads,
      response?.history,
      response?.results,
      response?.items,
      response?.users,
      response?.inventory,
      response?.recommendations,
      response?.rules,
    ].find(Array.isArray) || []
  );
};


const getCount = (response) => {
  const explicitCount = firstValue(
    response?.count,
    response?.total,
    response?.total_count,
  );

  if (
    Number.isFinite(
      Number(explicitCount),
    )
  ) {
    return Number(explicitCount);
  }

  return normalizeList(response).length;
};


const normalizeConfidence = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  const percentage =
    number >= 0 && number <= 1
      ? number * 100
      : number;

  return Math.min(
    100,
    Math.max(0, percentage),
  );
};


const titleCase = (value) =>
  String(value || "Unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );


const readRecord = (item) => {
  const fabric =
    item?.fabric_prediction || {};
  const verification =
    item?.material_verification || {};
  const decisionAnalysis =
    item?.decision_analysis || {};
  const decision =
    decisionAnalysis?.decision ||
    decisionAnalysis || {};
  const sustainability =
    item?.sustainability_analysis || {};
  const stored =
    item?.stored_assessment || {};

  const materialSource = firstValue(
    verification?.source,
    sustainability?.material_source,
    decisionAnalysis?.material_source,
    stored?.material_source,
    item?.material_source,
    "",
  );

  const assessmentStatus = firstValue(
    sustainability?.assessment_status,
    stored?.assessment_status,
    item?.assessment_status,
    materialSource ===
      "application_class_mapping"
      ? "Provisional"
      : "Completed",
  );

  const sustainabilityScore =
    firstValue(
      sustainability
        ?.sustainability_score,
      stored?.sustainability_score,
      item?.sustainability_score,
    );

  const verified =
    materialSource === "user_verified" &&
    String(
      assessmentStatus,
    ).toLowerCase() === "completed" &&
    sustainabilityScore !== undefined &&
    sustainabilityScore !== null;

  const dateValue = firstValue(
    item?.upload_date,
    item?.created_at,
    item?.date,
    item?.timestamp,
  );

  const date = dateValue
    ? new Date(dateValue)
    : null;

  return {
    id: firstValue(
      item?.upload_id,
      item?.id,
      "—",
    ),
    classId: String(
      firstValue(
        fabric?.class_id,
        fabric?.class,
        item?.predicted_class,
        item?.class_id,
        "—",
      ),
    ).padStart(3, "0"),
    fabricName: firstValue(
      fabric?.fabric_name,
      fabric?.category,
      item?.fabric_name,
      item?.fabric_category,
      "Unknown visual class",
    ),
    material: firstValue(
      verification?.material,
      stored?.material,
      item?.material,
      "Unverified",
    ),
    materialSource,
    verified,
    condition: firstValue(
      item?.condition_analysis
        ?.condition,
      item?.condition,
      "Unknown",
    ),
    recommendation: firstValue(
      decision?.final_decision,
      decision?.recommendation,
      stored?.final_decision,
      item?.final_decision,
      "Not assessed",
    ),
    recoveryCategory: firstValue(
      decision?.recovery_category,
      stored?.recovery_category,
      item?.recovery_category,
      "Not assessed",
    ),
    confidence: normalizeConfidence(
      firstValue(
        fabric?.confidence,
        item?.confidence,
        0,
      ),
    ),
    sustainabilityScore,
    assessmentStatus,
    date:
      date &&
      !Number.isNaN(date.getTime())
        ? date
        : null,
  };
};


function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [users, setUsers] =
    useState(0);
  const [inventory, setInventory] =
    useState(0);
  const [
    recommendationRules,
    setRecommendationRules,
  ] = useState(0);
  const [analytics, setAnalytics] =
    useState({});
  const [history, setHistory] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  const [warning, setWarning] =
    useState("");


  useEffect(() => {
    let active = true;

    const loadDashboard = async () => {
      setLoading(true);
      setWarning("");

      const results =
        await Promise.allSettled([
          getUsers(),
          getInventory(),
          getPredictionHistory(),
          getRecommendations(),
          getAnalytics(),
        ]);

      if (!active) {
        return;
      }

      if (
        results[0].status ===
        "fulfilled"
      ) {
        setUsers(
          getCount(results[0].value),
        );
      }

      if (
        results[1].status ===
        "fulfilled"
      ) {
        setInventory(
          getCount(results[1].value),
        );
      }

      if (
        results[2].status ===
        "fulfilled"
      ) {
        setHistory(
          normalizeList(
            results[2].value,
          ),
        );
      }

      if (
        results[3].status ===
        "fulfilled"
      ) {
        setRecommendationRules(
          getCount(results[3].value),
        );
      }

      if (
        results[4].status ===
        "fulfilled"
      ) {
        setAnalytics(
          results[4].value || {},
        );
      }

      const failures =
        results.filter(
          (result) =>
            result.status ===
            "rejected",
        ).length;

      if (failures) {
        setWarning(
          `${failures} dashboard data source${
            failures === 1 ? "" : "s"
          } could not be loaded.`,
        );
      }

      setLoading(false);
    };

    loadDashboard();

    return () => {
      active = false;
    };
  }, []);


  const records = useMemo(
    () => history.map(readRecord),
    [history],
  );


  const totalSamples = Number(
    firstValue(
      analytics?.total_uploads,
      records.length,
      0,
    ),
  );

  const averageConfidence =
    records.length
      ? records.reduce(
          (sum, item) =>
            sum + item.confidence,
          0,
        ) / records.length
      : 0;

  const provisionalCount =
    records.filter(
      (item) =>
        item.materialSource ===
          "application_class_mapping" ||
        String(
          item.assessmentStatus,
        ).toLowerCase() ===
          "provisional",
    ).length;

  const verifiedCount =
    records.filter(
      (item) => item.verified,
    ).length;

  const scoredRecords =
    records.filter(
      (item) =>
        Number.isFinite(
          Number(
            item.sustainabilityScore,
          ),
        ),
    );

  const averageSustainability =
    scoredRecords.length
      ? scoredRecords.reduce(
          (sum, item) =>
            sum +
            Number(
              item.sustainabilityScore,
            ),
          0,
        ) / scoredRecords.length
      : Number(
          analytics
            ?.recyclable_percentage || 0,
        );

  const recoveryData = useMemo(() => {
    const counts = records.reduce(
      (result, item) => {
        const name = titleCase(
          item.recoveryCategory,
        );

        result[name] =
          (result[name] || 0) + 1;

        return result;
      },
      {},
    );

    return Object.entries(counts)
      .map(([name, value]) => ({
        name,
        value,
      }))
      .sort(
        (first, second) =>
          second.value - first.value,
      );
  }, [records]);

  const assessedRecoveryData =
    recoveryData.filter(
      (item) =>
        ![
          "Not Assessed",
          "Unknown",
          "Manual Verification",
        ].includes(item.name),
    );

  const recentRecords = [...records]
    .sort((first, second) => {
      if (!first.date) return 1;
      if (!second.date) return -1;
      return second.date - first.date;
    })
    .slice(0, 5);

  const userName = firstValue(
    user?.username,
    user?.name,
    "User",
  );


  if (loading) {
    return (
      <main className="db-page db-loading">
        <div className="db-loader" />
        <h2>
          Preparing your intelligence workspace
        </h2>
        <p>
          Connecting textile analyses, recovery rules and operational data.
        </p>
      </main>
    );
  }


  return (
    <main className="db-page">
      <section className="db-hero">
        <div className="db-hero-copy">
          <span className="db-eyebrow">
            AI textile intelligence
          </span>
          <h1>
            Welcome back, {userName}.
          </h1>
          <p>
            Track visual fabric recognition, condition intelligence and
            explainable circular recovery outcomes from one focused workspace.
          </p>

          <div className="db-hero-actions">
            <button
              type="button"
              className="db-primary-action"
              onClick={() =>
                navigate("/upload-waste")
              }
            >
              Analyse textile
              <FaArrowRight />
            </button>

            <button
              type="button"
              className="db-secondary-action"
              onClick={() =>
                navigate("/batch-analysis")
              }
            >
              Open batch analysis
            </button>
          </div>
        </div>

        <div className="db-hero-score">
          <div
            className="db-score-ring"
            style={{
              "--score":
                `${Math.round(
                  averageSustainability,
                ) * 3.6}deg`,
            }}
          >
            <div>
              <strong>
                {Math.round(
                  averageSustainability,
                )}
              </strong>
              <span>/100</span>
            </div>
          </div>

          <div>
            <span>
              Average sustainability
            </span>
            <strong>
              {scoredRecords.length} scored assessments
            </strong>
            <small>
              Based on persisted explainable results
            </small>
          </div>
        </div>
      </section>

      {warning && (
        <div className="db-warning">
          <span>i</span>
          <p>{warning}</p>
        </div>
      )}

      <section className="db-metrics">
        <article className="db-metric db-metric-dark">
          <div className="db-metric-icon">
            <FaCloudUploadAlt />
          </div>
          <span>Total AI samples</span>
          <strong>{totalSamples}</strong>
          <p>
            Complete historical analysis activity
          </p>
        </article>

        <article className="db-metric">
          <div className="db-metric-icon">
            <FaRobot />
          </div>
          <span>Provisional results</span>
          <strong>
            {provisionalCount}
          </strong>
          <p>
            Using academic class mapping
          </p>
        </article>

        <article className="db-metric">
          <div className="db-metric-icon">
            <FaCheckCircle />
          </div>
          <span>Verified materials</span>
          <strong>{verifiedCount}</strong>
          <p>
            Completed with confirmation evidence
          </p>
        </article>

        <article className="db-metric">
          <div className="db-metric-icon">
            <FaChartLine />
          </div>
          <span>Average confidence</span>
          <strong>
            {averageConfidence.toFixed(1)}%
          </strong>
          <p>
            CNN confidence—not test accuracy
          </p>
        </article>
      </section>

      <section className="db-main-grid">
        <article className="db-panel db-recovery-panel">
          <div className="db-panel-heading">
            <div>
              <span className="db-section-label">
                Circular pathways
              </span>
              <h2>Assessed recovery outcomes</h2>
            </div>
            <button
              type="button"
              onClick={() =>
                navigate("/analytics")
              }
            >
              Full analytics
              <FaArrowRight />
            </button>
          </div>

          <div className="db-recovery-content">
            <div className="db-donut">
              {assessedRecoveryData.length ? (
                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >
                  <PieChart>
                    <Pie
                      data={
                        assessedRecoveryData
                      }
                      dataKey="value"
                      nameKey="name"
                      innerRadius={68}
                      outerRadius={102}
                      paddingAngle={5}
                      cornerRadius={8}
                    >
                      {assessedRecoveryData.map(
                        (item, index) => (
                          <Cell
                            key={item.name}
                            fill={
                              CHART_COLORS[
                                index %
                                  CHART_COLORS.length
                              ]
                            }
                          />
                        ),
                      )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="db-empty">
                  <FaRecycle />
                  <p>
                    Recovery outcomes will appear after assessed predictions.
                  </p>
                </div>
              )}
            </div>

            <div className="db-recovery-list">
              {assessedRecoveryData
                .slice(0, 6)
                .map((item, index) => (
                  <div key={item.name}>
                    <span
                      style={{
                        background:
                          CHART_COLORS[
                            index %
                              CHART_COLORS.length
                          ],
                      }}
                    />
                    <p>{item.name}</p>
                    <strong>
                      {item.value}
                    </strong>
                  </div>
                ))}
            </div>
          </div>

          <div className="db-data-note">
            <span>i</span>
            <p>
              Legacy “Not Assessed” records are excluded from this recovery
              chart so it represents only completed or provisional outcomes.
            </p>
          </div>
        </article>

        <article className="db-panel db-operations-panel">
          <div className="db-panel-heading">
            <div>
              <span className="db-section-label">
                Platform operations
              </span>
              <h2>Workspace status</h2>
            </div>
          </div>

          <div className="db-operation-list">
            <button
              type="button"
              onClick={() =>
                navigate("/inventory")
              }
            >
              <span className="db-operation-icon">
                <FaBoxes />
              </span>
              <span>
                <strong>
                  {inventory}
                </strong>
                <small>
                  Inventory items
                </small>
              </span>
              <FaArrowRight />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate(
                  "/recommendations",
                )
              }
            >
              <span className="db-operation-icon">
                <FaRecycle />
              </span>
              <span>
                <strong>
                  {recommendationRules}
                </strong>
                <small>
                  Recommendation records
                </small>
              </span>
              <FaArrowRight />
            </button>

            <div className="db-operation-static">
              <span className="db-operation-icon">
                <FaUsers />
              </span>
              <span>
                <strong>{users}</strong>
                <small>
                  Platform users
                </small>
              </span>
            </div>

            <div className="db-operation-static">
              <span className="db-operation-icon">
                <FaLeaf />
              </span>
              <span>
                <strong>
                  {scoredRecords.length}
                </strong>
                <small>
                  Sustainability assessments
                </small>
              </span>
            </div>
          </div>
        </article>
      </section>

      <section className="db-panel db-recent-panel">
        <div className="db-panel-heading">
          <div>
            <span className="db-section-label">
              Latest intelligence
            </span>
            <h2>Recent textile analyses</h2>
          </div>
          <button
            type="button"
            onClick={() =>
              navigate("/analytics")
            }
          >
            View all
            <FaArrowRight />
          </button>
        </div>

        {recentRecords.length ? (
          <div className="db-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Visual fabric class</th>
                  <th>Material</th>
                  <th>Condition</th>
                  <th>Decision</th>
                  <th>Confidence</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map(
                  (item) => (
                    <tr
                      key={`${item.id}-${item.classId}`}
                    >
                      <td>
                        <strong>
                          {item.fabricName}
                        </strong>
                        <small>
                          Class {item.classId}
                        </small>
                      </td>
                      <td>
                        <strong>
                          {item.material}
                        </strong>
                        <small>
                          {item.verified
                            ? "User verified"
                            : item.materialSource ===
                                "application_class_mapping"
                              ? "Application assigned"
                              : item.material ===
                                  "Unverified"
                                ? "Unverified"
                                : "Legacy record"}
                        </small>
                      </td>
                      <td>
                        <span
                          className={`db-condition db-condition-${String(
                            item.condition,
                          ).toLowerCase()}`}
                        >
                          {item.condition}
                        </span>
                      </td>
                      <td>
                        <strong className="db-decision">
                          {item.recommendation}
                        </strong>
                        <small>
                          {item.recoveryCategory}
                        </small>
                      </td>
                      <td>
                        {item.confidence.toFixed(1)}%
                      </td>
                      <td>
                        <span
                          className={`db-status ${
                            String(
                              item.assessmentStatus,
                            ).toLowerCase() ===
                            "provisional"
                              ? "is-provisional"
                              : "is-complete"
                          }`}
                        >
                          {item.assessmentStatus}
                        </span>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="db-empty db-empty-wide">
            <FaCloudUploadAlt />
            <p>
              Analyse a textile sample to create your first intelligence record.
            </p>
          </div>
        )}
      </section>

      <p className="db-disclaimer">
        Application-assigned materials are representative assumptions for this
        academic prototype and are not fibre-composition ground truth supplied
        by the Ten Fabrics Dataset.
      </p>
    </main>
  );
}


export default Dashboard;
