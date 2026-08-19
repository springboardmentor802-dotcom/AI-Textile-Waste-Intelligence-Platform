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
  FaIndustry,
  FaLeaf,
  FaRecycle,
  FaRobot,
  FaShieldAlt,
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
  getDashboardData,
} from "../../services/dashboardService";

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
    ].find(Array.isArray) || []
  );
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


const objectToChartData = (
  object = {},
  excludedValues = [],
) =>
  Object.entries(object)
    .filter(
      ([name]) =>
        !excludedValues.includes(
          String(name).trim(),
        ),
    )
    .map(([name, value]) => ({
      name: titleCase(name),
      value: Number(value || 0),
    }))
    .filter(
      (item) =>
        item.value > 0,
    )
    .sort(
      (first, second) =>
        second.value - first.value,
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
    decisionAnalysis ||
    {};

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
      sustainability?.sustainability_score,
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
      item?.condition_analysis?.condition,
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

  const [dashboardData, setDashboardData] =
    useState(null);

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
          getDashboardData(),
          getPredictionHistory(),
        ]);

      if (!active) {
        return;
      }

      if (
        results[0].status ===
        "fulfilled"
      ) {
        setDashboardData(
          results[0].value,
        );
      } else {
        setWarning(
          "Role-based dashboard data could not be loaded.",
        );
      }

      if (
        results[1].status ===
        "fulfilled"
      ) {
        setHistory(
          normalizeList(
            results[1].value,
          ),
        );
      }

      if (
        results[0].status ===
          "rejected" &&
        results[1].status ===
          "rejected"
      ) {
        setWarning(
          "Dashboard data sources could not be loaded.",
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
    () =>
      history.map(
        readRecord,
      ),
    [history],
  );


  const recentRecords = useMemo(
    () =>
      [...records]
        .sort(
          (first, second) => {
            if (!first.date) return 1;
            if (!second.date) return -1;

            return (
              second.date -
              first.date
            );
          },
        )
        .slice(0, 5),
    [records],
  );


  const common =
    dashboardData?.common || {};

  const dashboardType =
    dashboardData?.dashboard_type ||
    "basic";

  const displayRole =
    dashboardData?.display_role ||
    user?.role ||
    "User";

  const userName = firstValue(
    user?.username,
    user?.name,
    "User",
  );


  const config = useMemo(() => {
    switch (dashboardType) {
      case "admin":
        return {
          eyebrow:
            "Platform administration",

          description:
            "Monitor users, textile activity, inventory and platform-wide circular intelligence from one administrative workspace.",

          primaryAction: {
            label:
              "Analyse textile",
            path:
              "/upload-waste",
          },

          secondaryAction: {
            label:
              "View analytics",
            path:
              "/analytics",
          },

          scoreLabel:
            "Platform sustainability",

          chartTitle:
            "Recovery pathway distribution",

          chartLabel:
            "Platform circularity",

          chartData:
            objectToChartData(
              common.recovery_categories,
              [
                "Not Assessed",
                "Unknown",
                "Manual Verification",
              ],
            ),

          metrics: [
            {
              label:
                "Platform users",
              value:
                dashboardData
                  ?.admin
                  ?.total_users ?? 0,
              description:
                "Registered users across all platform roles",
              icon:
                FaUsers,
            },
            {
              label:
                "AI analyses",
              value:
                common.total_analyses ?? 0,
              description:
                "Total textile intelligence records",
              icon:
                FaCloudUploadAlt,
            },
            {
              label:
                "Inventory batches",
              value:
                dashboardData
                  ?.admin
                  ?.total_inventory_batches ??
                0,
              description:
                "Textile waste batches currently registered",
              icon:
                FaBoxes,
            },
            {
              label:
                "Manual reviews",
              value:
                common.manual_review_required ??
                0,
              description:
                "Assessments requiring human verification",
              icon:
                FaShieldAlt,
            },
          ],

          operations: [
            {
              label:
                "Platform users",
              value:
                dashboardData
                  ?.admin
                  ?.total_users ?? 0,
              path:
                null,
              icon:
                FaUsers,
            },
            {
              label:
                "Inventory batches",
              value:
                dashboardData
                  ?.admin
                  ?.total_inventory_batches ??
                0,
              path:
                "/inventory",
              icon:
                FaBoxes,
            },
            {
              label:
                "Completed assessments",
              value:
                common.completed_assessments ??
                0,
              path:
                "/analytics",
              icon:
                FaCheckCircle,
            },
            {
              label:
                "Total waste weight",
              value:
                `${Number(
                  common.total_weight_kg ||
                    0,
                ).toFixed(1)} kg`,
              path:
                null,
              icon:
                FaRecycle,
            },
          ],
        };


      case "manufacturer":
        return {
          eyebrow:
            "Textile manufacturing intelligence",

          description:
            "Track your production waste, material mix, recovery potential and sustainability performance from a manufacturer-focused workspace.",

          primaryAction: {
            label:
              "Register waste",
            path:
              "/upload-waste",
          },

          secondaryAction: {
            label:
              "Batch analysis",
            path:
              "/batch-analysis",
          },

          scoreLabel:
            "Waste sustainability",

          chartTitle:
            "Material distribution",

          chartLabel:
            "Production profile",

          chartData:
            objectToChartData(
              dashboardData
                ?.manufacturer
                ?.material_distribution,
              [
                "Unverified",
                "Awaiting Material Verification",
              ],
            ),

          metrics: [
            {
              label:
                "Production waste",
              value:
                `${Number(
                  dashboardData
                    ?.manufacturer
                    ?.production_waste_kg ||
                    0,
                ).toFixed(1)} kg`,
              description:
                "Total waste represented by your analyses",
              icon:
                FaIndustry,
            },
            {
              label:
                "AI analyses",
              value:
                common.total_analyses ?? 0,
              description:
                "Your recorded textile assessments",
              icon:
                FaRobot,
            },
            {
              label:
                "High recovery items",
              value:
                dashboardData
                  ?.manufacturer
                  ?.high_recovery_items ??
                0,
              description:
                "Assessments with recovery score of 70 or higher",
              icon:
                FaRecycle,
            },
            {
              label:
                "Manual reviews",
              value:
                common.manual_review_required ??
                0,
              description:
                "Waste samples needing confirmation",
              icon:
                FaCheckCircle,
            },
          ],

          operations: [
            {
              label:
                "Reusable items",
              value:
                common.reusable_items ??
                0,
              path:
                "/recommendations",
              icon:
                FaRecycle,
            },
            {
              label:
                "Completed assessments",
              value:
                common.completed_assessments ??
                0,
              path:
                null,
              icon:
                FaCheckCircle,
            },
            {
              label:
                "Average recovery",
              value:
                `${Number(
                  common.average_recovery_score ||
                    0,
                ).toFixed(1)}/100`,
              path:
                "/recommendations",
              icon:
                FaChartLine,
            },
            {
              label:
                "Total analysed weight",
              value:
                `${Number(
                  common.total_weight_kg ||
                    0,
                ).toFixed(1)} kg`,
              path:
                "/analytics",
              icon:
                FaBoxes,
            },
          ],
        };


      case "recycler":
        return {
          eyebrow:
            "Recycling facility intelligence",

          description:
            "Prioritize recoverable textile streams, monitor processing opportunities and evaluate recycling pathways across platform waste records.",

          primaryAction: {
            label:
              "View recommendations",
            path:
              "/recommendations",
          },

          secondaryAction: {
            label:
              "Open inventory",
            path:
              "/inventory",
          },

          scoreLabel:
            "Average recovery potential",

          chartTitle:
            "Recycling pathway distribution",

          chartLabel:
            "Processing intelligence",

          chartData:
            objectToChartData(
              dashboardData
                ?.recycler
                ?.recycling_methods,
              [
                "Awaiting Material Verification",
                "Awaiting Optional Material Confirmation",
              ],
            ),

          metrics: [
            {
              label:
                "Recovery opportunities",
              value:
                dashboardData
                  ?.recycler
                  ?.recovery_opportunities ??
                0,
              description:
                "Waste streams scoring 70+ for recovery",
              icon:
                FaRecycle,
            },
            {
              label:
                "Mechanical recycling",
              value:
                dashboardData
                  ?.recycler
                  ?.mechanical_recycling ??
                0,
              description:
                "Records directed toward mechanical recycling",
              icon:
                FaBoxes,
            },
            {
              label:
                "Chemical recycling",
              value:
                dashboardData
                  ?.recycler
                  ?.chemical_recycling ??
                0,
              description:
                "Records directed toward chemical recycling",
              icon:
                FaRobot,
            },
            {
              label:
                "Manual review queue",
              value:
                dashboardData
                  ?.recycler
                  ?.manual_review_queue ??
                0,
              description:
                "Cases requiring operator verification",
              icon:
                FaCheckCircle,
            },
          ],

          operations: [
            {
              label:
                "Total analysed waste",
              value:
                `${Number(
                  common.total_weight_kg ||
                    0,
                ).toFixed(1)} kg`,
              path:
                "/inventory",
              icon:
                FaBoxes,
            },
            {
              label:
                "Reusable opportunities",
              value:
                dashboardData
                  ?.recycler
                  ?.reuse_opportunities ??
                0,
              path:
                "/recommendations",
              icon:
                FaRecycle,
            },
            {
              label:
                "Recyclable records",
              value:
                common.recyclable_items ??
                0,
              path:
                "/recommendations",
              icon:
                FaCheckCircle,
            },
            {
              label:
                "Average recovery score",
              value:
                `${Number(
                  common.average_recovery_score ||
                    0,
                ).toFixed(1)}/100`,
              path:
                null,
              icon:
                FaChartLine,
            },
          ],
        };


      case "sustainability":
        return {
          eyebrow:
            "Sustainability intelligence",

          description:
            "Monitor sustainability performance, circularity levels and recovery outcomes across the textile waste intelligence platform.",

          primaryAction: {
            label:
              "Open analytics",
            path:
              "/analytics",
          },

          secondaryAction: {
            label:
              "View recommendations",
            path:
              "/recommendations",
          },

          scoreLabel:
            "Average sustainability",

          chartTitle:
            "Circularity level distribution",

          chartLabel:
            "Circular economy",

          chartData:
            objectToChartData(
              dashboardData
                ?.sustainability
                ?.circularity_levels,
              [
                "Not Assessed",
                "Insufficient Data",
              ],
            ),

          metrics: [
            {
              label:
                "Scored assessments",
              value:
                dashboardData
                  ?.sustainability
                  ?.scored_assessments ??
                0,
              description:
                "Assessments with sustainability scoring",
              icon:
                FaLeaf,
            },
            {
              label:
                "High sustainability",
              value:
                dashboardData
                  ?.sustainability
                  ?.high_sustainability_assessments ??
                0,
              description:
                "Assessments scoring 70 or above",
              icon:
                FaCheckCircle,
            },
            {
              label:
                "Low sustainability",
              value:
                dashboardData
                  ?.sustainability
                  ?.low_sustainability_assessments ??
                0,
              description:
                "Assessments scoring below 40",
              icon:
                FaChartLine,
            },
            {
              label:
                "Manual reviews",
              value:
                common.manual_review_required ??
                0,
              description:
                "Records awaiting human verification",
              icon:
                FaRobot,
            },
          ],

          operations: [
            {
              label:
                "Average sustainability",
              value:
                `${Number(
                  common.average_sustainability_score ||
                    0,
                ).toFixed(1)}/100`,
              path:
                "/analytics",
              icon:
                FaLeaf,
            },
            {
              label:
                "Average recovery",
              value:
                `${Number(
                  common.average_recovery_score ||
                    0,
                ).toFixed(1)}/100`,
              path:
                "/recommendations",
              icon:
                FaRecycle,
            },
            {
              label:
                "Reusable records",
              value:
                common.reusable_items ??
                0,
              path:
                null,
              icon:
                FaCheckCircle,
            },
            {
              label:
                "Analysed textile weight",
              value:
                `${Number(
                  common.total_weight_kg ||
                    0,
                ).toFixed(1)} kg`,
              path:
                "/analytics",
              icon:
                FaBoxes,
            },
          ],
        };


      default:
        return {
          eyebrow:
            "AI textile intelligence",

          description:
            "Monitor textile waste analysis, recovery pathways and sustainability intelligence.",

          primaryAction: {
            label:
              "Analyse textile",
            path:
              "/upload-waste",
          },

          secondaryAction: {
            label:
              "View recommendations",
            path:
              "/recommendations",
          },

          scoreLabel:
            "Average sustainability",

          chartTitle:
            "Recovery pathway distribution",

          chartLabel:
            "Circular pathways",

          chartData:
            objectToChartData(
              common.recovery_categories,
            ),

          metrics: [
            {
              label:
                "AI analyses",
              value:
                common.total_analyses ?? 0,
              description:
                "Textile intelligence records",
              icon:
                FaRobot,
            },
            {
              label:
                "Completed assessments",
              value:
                common.completed_assessments ??
                0,
              description:
                "Fully assessed samples",
              icon:
                FaCheckCircle,
            },
            {
              label:
                "Reusable items",
              value:
                common.reusable_items ??
                0,
              description:
                "Potential reuse opportunities",
              icon:
                FaRecycle,
            },
            {
              label:
                "Manual reviews",
              value:
                common.manual_review_required ??
                0,
              description:
                "Records requiring verification",
              icon:
                FaChartLine,
            },
          ],

          operations: [],
        };
    }
  }, [
    dashboardType,
    dashboardData,
    common,
  ]);


  const score =
    dashboardType === "recycler"
      ? Number(
          common.average_recovery_score ||
            0,
        )
      : Number(
          common.average_sustainability_score ||
            0,
        );


  if (loading) {
    return (
      <main className="db-page db-loading">
        <div className="db-loader" />

        <h2>
          Preparing your intelligence workspace
        </h2>

        <p>
          Loading role-based textile intelligence and operational data.
        </p>
      </main>
    );
  }


  if (!dashboardData) {
    return (
      <main className="db-page db-loading">
        <FaRobot
          style={{
            fontSize: "42px",
            marginBottom: "16px",
          }}
        />

        <h2>
          Dashboard unavailable
        </h2>

        <p>
          The role-based dashboard could not be loaded.
        </p>
      </main>
    );
  }


  return (
    <main className="db-page">

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="db-hero">

        <div className="db-hero-copy">

          <span className="db-eyebrow">
            {config.eyebrow}
          </span>

          <h1>
            Welcome back, {userName}.
          </h1>

          <p>
            {config.description}
          </p>

          <div className="db-hero-actions">

            <button
              type="button"
              className="db-primary-action"
              onClick={() =>
                navigate(
                  config.primaryAction.path,
                )
              }
            >
              {config.primaryAction.label}

              <FaArrowRight />
            </button>

            <button
              type="button"
              className="db-secondary-action"
              onClick={() =>
                navigate(
                  config.secondaryAction.path,
                )
              }
            >
              {config.secondaryAction.label}
            </button>

          </div>

        </div>


        <div className="db-hero-score">

          <div
            className="db-score-ring"
            style={{
              "--score":
                `${
                  Math.min(
                    100,
                    Math.max(
                      0,
                      Math.round(score),
                    ),
                  ) * 3.6
                }deg`,
            }}
          >

            <div>

              <strong>
                {Math.round(score)}
              </strong>

              <span>/100</span>

            </div>

          </div>


          <div>

            <span>
              {config.scoreLabel}
            </span>

            <strong>
              {displayRole}
            </strong>

            <small>
              Role-specific intelligence generated from persisted platform data
            </small>

          </div>

        </div>

      </section>


      {/* ================================================= */}
      {/* WARNING */}
      {/* ================================================= */}

      {warning && (
        <div className="db-warning">

          <span>i</span>

          <p>
            {warning}
          </p>

        </div>
      )}


      {/* ================================================= */}
      {/* KPI CARDS */}
      {/* ================================================= */}

      <section className="db-metrics">

        {config.metrics.map(
          (
            metric,
            index,
          ) => {

            const Icon =
              metric.icon;

            return (
              <article
                key={
                  metric.label
                }
                className={
                  index === 0
                    ? "db-metric db-metric-dark"
                    : "db-metric"
                }
              >

                <div className="db-metric-icon">
                  <Icon />
                </div>

                <span>
                  {metric.label}
                </span>

                <strong>
                  {metric.value}
                </strong>

                <p>
                  {metric.description}
                </p>

              </article>
            );
          },
        )}

      </section>


      {/* ================================================= */}
      {/* CHART + OPERATIONS */}
      {/* ================================================= */}

      <section className="db-main-grid">

        <article className="db-panel db-recovery-panel">

          <div className="db-panel-heading">

            <div>

              <span className="db-section-label">
                {config.chartLabel}
              </span>

              <h2>
                {config.chartTitle}
              </h2>

            </div>

            <button
              type="button"
              onClick={() =>
                navigate(
                  dashboardType ===
                    "manufacturer"
                    ? "/recommendations"
                    : "/analytics",
                )
              }
            >
              Explore

              <FaArrowRight />
            </button>

          </div>


          <div className="db-recovery-content">

            <div className="db-donut">

              {config.chartData.length ? (

                <ResponsiveContainer
                  width="100%"
                  height="100%"
                >

                  <PieChart>

                    <Pie
                      data={
                        config.chartData
                      }
                      dataKey="value"
                      nameKey="name"
                      innerRadius={68}
                      outerRadius={102}
                      paddingAngle={5}
                      cornerRadius={8}
                    >

                      {config.chartData.map(
                        (
                          item,
                          index,
                        ) => (
                          <Cell
                            key={
                              item.name
                            }
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
                    Role-specific chart data will appear after assessed textile records are available.
                  </p>

                </div>

              )}

            </div>


            <div className="db-recovery-list">

              {config.chartData
                .slice(0, 6)
                .map(
                  (
                    item,
                    index,
                  ) => (

                    <div
                      key={
                        item.name
                      }
                    >

                      <span
                        style={{
                          background:
                            CHART_COLORS[
                              index %
                                CHART_COLORS.length
                            ],
                        }}
                      />

                      <p>
                        {item.name}
                      </p>

                      <strong>
                        {item.value}
                      </strong>

                    </div>

                  ),
                )}

            </div>

          </div>


          <div className="db-data-note">

            <span>i</span>

            <p>
              Dashboard data is filtered and summarized according to the authenticated user's platform role.
            </p>

          </div>

        </article>


        <article className="db-panel db-operations-panel">

          <div className="db-panel-heading">

            <div>

              <span className="db-section-label">
                {displayRole}
              </span>

              <h2>
                Workspace status
              </h2>

            </div>

          </div>


          <div className="db-operation-list">

            {config.operations.map(
              (
                operation,
              ) => {

                const Icon =
                  operation.icon;

                if (
                  operation.path
                ) {
                  return (
                    <button
                      key={
                        operation.label
                      }
                      type="button"
                      onClick={() =>
                        navigate(
                          operation.path,
                        )
                      }
                    >

                      <span className="db-operation-icon">
                        <Icon />
                      </span>

                      <span>

                        <strong>
                          {operation.value}
                        </strong>

                        <small>
                          {operation.label}
                        </small>

                      </span>

                      <FaArrowRight />

                    </button>
                  );
                }


                return (
                  <div
                    key={
                      operation.label
                    }
                    className="db-operation-static"
                  >

                    <span className="db-operation-icon">
                      <Icon />
                    </span>

                    <span>

                      <strong>
                        {operation.value}
                      </strong>

                      <small>
                        {operation.label}
                      </small>

                    </span>

                  </div>
                );
              },
            )}

          </div>

        </article>

      </section>


      {/* ================================================= */}
      {/* RECENT ANALYSES */}
      {/* ================================================= */}

      <section className="db-panel db-recent-panel">

        <div className="db-panel-heading">

          <div>

            <span className="db-section-label">
              Latest intelligence
            </span>

            <h2>
              Recent textile analyses
            </h2>

          </div>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/analytics",
              )
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
                  <th>
                    Visual fabric class
                  </th>

                  <th>
                    Material
                  </th>

                  <th>
                    Condition
                  </th>

                  <th>
                    Decision
                  </th>

                  <th>
                    Confidence
                  </th>

                  <th>
                    Status
                  </th>
                </tr>

              </thead>


              <tbody>

                {recentRecords.map(
                  (
                    item,
                  ) => (

                    <tr
                      key={
                        `${item.id}-${item.classId}`
                      }
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
                          className={
                            `db-condition db-condition-${String(
                              item.condition,
                            ).toLowerCase()}`
                          }
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
                        {item.confidence.toFixed(
                          1,
                        )}%
                      </td>


                      <td>

                        <span
                          className={
                            `db-status ${
                              String(
                                item.assessmentStatus,
                              ).toLowerCase() ===
                              "provisional"

                                ? "is-provisional"

                                : "is-complete"
                            }`
                          }
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
              Textile analyses will appear here after assessment records become available.
            </p>

          </div>

        )}

      </section>


      <p className="db-disclaimer">
        Dashboard intelligence is generated from persisted textile assessments and is presented according to the authenticated platform role.
      </p>

    </main>
  );
}


export default Dashboard;