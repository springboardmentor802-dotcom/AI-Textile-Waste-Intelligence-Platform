import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  getAnalytics,
  getDatasetAnalytics,
} from "../../services/analyticsService";
import { getPredictionHistory } from "../../services/predictionService";
import "./Analytics.css";

const COLORS = [
  "#0f766e",
  "#2f80ed",
  "#84cc16",
  "#f59e0b",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#64748b",
  "#ef4444",
  "#14b8a6",
];

const firstValue = (...values) =>
  values.find(
    (value) =>
      value !== undefined &&
      value !== null &&
      value !== "",
  );

const titleCase = (value) =>
  String(value || "Unknown")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const shortRecommendationLabel = (value) => {
  const label = String(value || "Unknown").trim();

  const replacements = {
    "Fiber Recovery": "Fiber Recovery",
    "Repair and Reuse": "Repair & Reuse",
    "Donation": "Donation",
    "Specialized Treatment": "Specialized",
    "Cleaning and Reassessment": "Clean & Reassess",
    "Material Separation": "Material Separation",
    "Chemical Recycling": "Chemical Recycling",
    "Direct Reuse": "Direct Reuse",
    "Hazardous Textile Waste Treatment": "Hazardous Treatment",
    "Upcycling": "Upcycling",
    "Mechanical Recycling": "Mechanical Recycling",
  };

  return replacements[label] || label;
};

const formatNumber = (value, maximumFractionDigits = 0) =>
  new Intl.NumberFormat("en-IN", {
    maximumFractionDigits,
  }).format(Number(value) || 0);

const normalizeConfidence = (value) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return 0;
  const result = number >= 0 && number <= 1 ? number * 100 : number;
  return Math.min(100, Math.max(0, result));
};

const normalizeList = (response) => {
  if (Array.isArray(response)) return response;

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

const readUpload = (item) => {
  const fabric = item?.fabric_prediction || {};
  const verification = item?.material_verification || {};
  const condition = item?.condition_analysis || {};
  const decisionAnalysis = item?.decision_analysis || {};
  const decision = decisionAnalysis?.decision || decisionAnalysis || {};
  const sustainability = item?.sustainability_analysis || {};
  const stored = item?.stored_assessment || {};

  const material = firstValue(
    verification?.material,
    stored?.material,
    item?.material,
    item?.material_name,
    "Unverified",
  );

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
    materialSource === "application_class_mapping"
      ? "Provisional"
      : "Completed",
  );

  const sustainabilityScore = firstValue(
    sustainability?.sustainability_score,
    stored?.sustainability_score,
    item?.sustainability_score,
    null,
  );

  const dateValue = firstValue(
    item?.upload_date,
    item?.created_at,
    item?.date,
    item?.timestamp,
  );

  const parsedDate = dateValue ? new Date(dateValue) : null;

  return {
    id: firstValue(item?.upload_id, item?.id, "—"),
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
      item?.predicted_category,
      "Unknown visual class",
    ),
    construction: firstValue(
      fabric?.construction,
      item?.construction,
      "Not specified",
    ),
    material,
    materialSource,
    materialVerified:
      materialSource === "user_verified" &&
      String(assessmentStatus).toLowerCase() === "completed" &&
      sustainabilityScore !== null,
    confidence: normalizeConfidence(
      firstValue(fabric?.confidence, item?.confidence, 0),
    ),
    condition: firstValue(
      condition?.condition,
      item?.condition,
      "Unknown",
    ),
    environmentalImpact: firstValue(
      decisionAnalysis?.material_data?.environmental_impact,
      item?.environmental_impact,
      "Not Available",
    ),
    recommendation: firstValue(
      decision?.final_decision,
      decision?.recommendation,
      stored?.final_decision,
      item?.final_decision,
      item?.recommendation,
      "Not assessed",
    ),
    recoveryCategory: firstValue(
      decision?.recovery_category,
      stored?.recovery_category,
      item?.recovery_category,
      "Not assessed",
    ),
    sustainabilityScore,
    assessmentStatus,
    date:
      parsedDate && !Number.isNaN(parsedDate.getTime())
        ? parsedDate
        : null,
  };
};

const countBy = (records, key) => {
  const counts = records.reduce((result, item) => {
    const name = titleCase(item[key] || "Unknown");
    result[name] = (result[name] || 0) + 1;
    return result;
  }, {});

  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

const EmptyChart = ({ message }) => (
  <div className="an-empty-chart">
    <span>◇</span>
    <p>{message}</p>
  </div>
);

function Analytics() {
  const [analyticsData, setAnalyticsData] = useState({});
  const [datasetAnalytics, setDatasetAnalytics] = useState({});
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    let active = true;

    const loadAnalytics = async () => {
      setLoading(true);
      setError("");

      const [liveResult, datasetResult, historyResult] =
        await Promise.allSettled([
          getAnalytics(),
          getDatasetAnalytics(),
          getPredictionHistory(),
        ]);

      if (!active) return;

      if (liveResult.status === "fulfilled") {
        setAnalyticsData(liveResult.value || {});
      }

      if (datasetResult.status === "fulfilled") {
        setDatasetAnalytics(datasetResult.value || {});
      }

      if (historyResult.status === "fulfilled") {
        setUploads(normalizeList(historyResult.value));
      }

      const failures = [
        liveResult,
        datasetResult,
        historyResult,
      ].filter((result) => result.status === "rejected").length;

      if (failures === 3) {
        setError(
          "Analytics could not be loaded. Confirm that the backend is running.",
        );
      } else if (datasetResult.status === "rejected") {
        setError(
          "Live analytics loaded, but synthetic dataset analytics are unavailable.",
        );
      } else if (historyResult.status === "rejected") {
        setError(
          "Dataset analytics loaded, but recent prediction history is unavailable.",
        );
      }

      setLoading(false);
    };

    loadAnalytics();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!selectedRecord) return undefined;

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setSelectedRecord(null);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [selectedRecord]);

  const records = useMemo(() => {
    const normalized = uploads.map(readUpload);

    return Array.from(
      new Map(
        normalized.map((record, index) => [
          String(
            firstValue(
              record.id,
              `${record.fabricName}-${record.date?.toISOString() || index}`,
            ),
          ),
          record,
        ]),
      ).values(),
    );
  }, [uploads]);

  const summary = datasetAnalytics?.summary || {};

  const materialData = useMemo(
    () =>
      (datasetAnalytics?.material_distribution || []).map((item) => ({
        name: item?.material || titleCase(item?.material_key),
        value: Number(item?.record_count) || 0,
      })),
    [datasetAnalytics?.material_distribution],
  );

  const recommendationData = useMemo(
    () =>
      (datasetAnalytics?.recommendation_distribution || []).map(
        (item) => {
          const name = item?.recommendation || "Unknown";

          return {
            name,
            shortName: shortRecommendationLabel(name),
            value: Number(item?.record_count) || 0,
          };
        },
      ),
    [datasetAnalytics?.recommendation_distribution],
  );

  const circularityData = useMemo(
    () =>
      (datasetAnalytics?.circularity_distribution || []).map(
        (item) => ({
          name: item?.circularity_level || "Unknown",
          value: Number(item?.record_count) || 0,
        }),
      ),
    [datasetAnalytics?.circularity_distribution],
  );

  const conditionData = useMemo(
    () =>
      (datasetAnalytics?.condition_distribution || []).map((item) => ({
        name: titleCase(item?.condition),
        value: Number(item?.record_count) || 0,
      })),
    [datasetAnalytics?.condition_distribution],
  );

  const contaminationData = useMemo(
    () =>
      (datasetAnalytics?.contamination_distribution || []).map(
        (item) => ({
          name: titleCase(item?.contamination),
          value: Number(item?.record_count) || 0,
        }),
      ),
    [datasetAnalytics?.contamination_distribution],
  );

  const liveMaterialData = useMemo(() => {
    if (records.length) {
      return countBy(records, "material").filter(
        (item) => item.name !== "Unverified",
      );
    }

    return Object.entries(analyticsData?.materials || {}).map(
      ([name, value]) => ({
        name: titleCase(name),
        value: Number(value) || 0,
      }),
    );
  }, [analyticsData?.materials, records]);

  const environmentalData = useMemo(() => {
    const validCategories = new Set([
      "Low",
      "Medium",
      "High",
    ]);

    const source = records.length
      ? countBy(records, "environmentalImpact")
      : Object.entries(
          analyticsData?.environmental_impact || {},
        ).map(([name, value]) => ({
          name: titleCase(name),
          value: Number(value) || 0,
        }));

    return source.filter((item) =>
      validCategories.has(item.name),
    );
  }, [analyticsData?.environmental_impact, records]);

  const unavailableEnvironmentalCount = useMemo(() => {
    if (records.length) {
      return records.filter(
        (item) =>
          !["Low", "Medium", "High"].includes(
            titleCase(item.environmentalImpact),
          ),
      ).length;
    }

    return Object.entries(
      analyticsData?.environmental_impact || {},
    ).reduce((total, [name, value]) => {
      const category = titleCase(name);

      if (["Low", "Medium", "High"].includes(category)) {
        return total;
      }

      return total + (Number(value) || 0);
    }, 0);
  }, [analyticsData?.environmental_impact, records]);

  const wasteTrend = useMemo(() => {
    const grouped = records.reduce((result, item) => {
      if (!item.date) return result;
      const key = item.date.toISOString().slice(0, 10);
      result[key] = (result[key] || 0) + 1;
      return result;
    }, {});

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, samples]) => ({
        date: new Date(`${date}T00:00:00`).toLocaleDateString(
          undefined,
          { day: "2-digit", month: "short" },
        ),
        samples,
      }));
  }, [records]);

  const recentRecords = [...records]
    .sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return b.date - a.date;
    })
    .slice(0, 8);

  const totalUploads = Number(
    firstValue(analyticsData?.total_uploads, records.length, 0),
  );

  const averageScore = Number(
    summary?.average_sustainability_score ||
      analyticsData?.recyclable_percentage ||
      0,
  );

  const liveMaterialTotal = liveMaterialData.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  const liveMaterialRanking = liveMaterialData.map((item) => ({
    ...item,
    percentage: liveMaterialTotal
      ? Math.round((item.value / liveMaterialTotal) * 100)
      : 0,
  }));

  const downloadReport = () => {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    pdf.setTextColor(15, 118, 110);
    pdf.setFontSize(20);
    pdf.text("AI Textile Intelligence — Analytics Report", 14, 18);

    pdf.setTextColor(71, 85, 105);
    pdf.setFontSize(10);
    pdf.text(`Generated ${new Date().toLocaleString()}`, 14, 25);

    autoTable(pdf, {
      startY: 32,
      theme: "grid",
      head: [[
        "Live samples",
        "Synthetic records",
        "Average score",
        "CO2 saved (kg)",
        "Water saved (L)",
        "Landfill diverted (kg)",
      ]],
      body: [[
        totalUploads,
        summary?.total_records || 0,
        averageScore.toFixed(1),
        Number(summary?.total_co2_saved_kg || 0).toFixed(2),
        Number(summary?.total_water_saved_liters || 0).toFixed(2),
        Number(summary?.total_landfill_diverted_kg || 0).toFixed(2),
      ]],
      headStyles: { fillColor: [15, 118, 110] },
    });

    const addDistributionTable = (title, data) => {
      if (!data?.length) return;

      autoTable(pdf, {
        startY: pdf.lastAutoTable.finalY + 8,
        theme: "striped",
        head: [[title, "Records"]],
        body: data.slice(0, 10).map((item) => [
          item.name,
          formatNumber(item.value),
        ]),
        headStyles: { fillColor: [15, 118, 110] },
        styles: { fontSize: 8, cellPadding: 3 },
        margin: { left: 14, right: 14 },
      });
    };

    addDistributionTable("Material distribution", materialData);
    addDistributionTable("Condition distribution", conditionData);
    addDistributionTable(
      "Recommendation distribution",
      recommendationData,
    );
    addDistributionTable("Circularity distribution", circularityData);
    addDistributionTable(
      "Environmental impact categories",
      environmentalData,
    );

    autoTable(pdf, {
      startY: pdf.lastAutoTable.finalY + 10,
      theme: "striped",
      head: [[
        "ID",
        "Fabric class",
        "Material",
        "Condition",
        "Recommendation",
        "Score",
        "Status",
      ]],
      body: recentRecords.map((item) => [
        item.id,
        `${item.fabricName} (${item.classId})`,
        item.material,
        item.condition,
        item.recommendation,
        item.sustainabilityScore ?? "—",
        item.assessmentStatus,
      ]),
      headStyles: { fillColor: [15, 23, 42] },
      styles: { fontSize: 8, cellPadding: 3 },
    });

    pdf.save("AI_Textile_Analytics_Report.pdf");
  };

  if (loading) {
    return (
      <main className="an-page an-loading">
        <div className="an-loader" />
        <h2>Building textile intelligence</h2>
        <p>Preparing trends, impact metrics and circularity outcomes.</p>
      </main>
    );
  }

  return (
    <main className="an-page">
      <section className="an-hero">
        <div>
          <span className="an-eyebrow">
            Circular intelligence workspace
          </span>
          <h1>Decisions become clearer when the data connects.</h1>
          <p>
            Compare live textile analyses with synthetic sustainability
            scenarios, environmental estimates, circularity patterns and
            recovery outcomes.
          </p>
        </div>

        <button
          type="button"
          className="an-report-button"
          onClick={downloadReport}
          disabled={!records.length && !summary?.total_records}
        >
          <span>↓</span>
          Export analytics PDF
        </button>
      </section>

      {error && (
        <div className="an-alert">
          <span>i</span>
          <p>{error}</p>
        </div>
      )}

      <section className="an-kpi-grid">
        <article className="an-kpi an-kpi-primary">
          <div className="an-kpi-top">
            <span>01</span>
            <small>Synthetic scenario dataset</small>
          </div>
          <strong>{formatNumber(summary?.total_records)}</strong>
          <h2>Generated assessment records</h2>
          <p>Rule-generated sustainability scenarios</p>
        </article>

        <article className="an-kpi">
          <div className="an-kpi-top">
            <span>02</span>
            <small>Climate benefit</small>
          </div>
          <strong>
            {formatNumber(summary?.total_co2_saved_kg, 1)}
          </strong>
          <h2>CO₂ saved (kg)</h2>
          <p>Estimated emissions avoided</p>
        </article>

        <article className="an-kpi">
          <div className="an-kpi-top">
            <span>03</span>
            <small>Water benefit</small>
          </div>
          <strong>
            {formatNumber(summary?.total_water_saved_liters)}
          </strong>
          <h2>Water saved (L)</h2>
          <p>Estimated water conservation</p>
        </article>

        <article className="an-kpi">
          <div className="an-kpi-top">
            <span>04</span>
            <small>Waste diversion</small>
          </div>
          <strong>
            {formatNumber(summary?.total_landfill_diverted_kg, 1)}
          </strong>
          <h2>Landfill diverted (kg)</h2>
          <p>Estimated textile mass redirected</p>
        </article>
      </section>

      <section className="an-kpi-grid">
        <article className="an-kpi">
          <div className="an-kpi-top">
            <span>05</span>
            <small>Energy benefit</small>
          </div>
          <strong>
            {formatNumber(summary?.total_energy_saved_kwh, 1)}
          </strong>
          <h2>Energy saved (kWh)</h2>
          <p>Estimated energy conservation</p>
        </article>

        <article className="an-kpi">
          <div className="an-kpi-top">
            <span>06</span>
            <small>Average outcome</small>
          </div>
          <strong>{averageScore.toFixed(1)}</strong>
          <h2>Sustainability score</h2>
          <p>Average explainable score</p>
        </article>

        <article className="an-kpi">
          <div className="an-kpi-top">
            <span>07</span>
            <small>Completed decisions</small>
          </div>
          <strong>
            {formatNumber(summary?.completed_assessments)}
          </strong>
          <h2>Completed assessments</h2>
          <p>Records with completed pathways</p>
        </article>

        <article className="an-kpi">
          <div className="an-kpi-top">
            <span>08</span>
            <small>Human oversight</small>
          </div>
          <strong>
            {formatNumber(summary?.manual_review_assessments)}
          </strong>
          <h2>Manual review cases</h2>
          <p>Records needing additional inspection</p>
        </article>
      </section>

      <section className="an-dashboard-grid">
        <article className="an-panel">
          <div className="an-panel-heading">
            <div>
              <span className="an-section-label">Processing activity</span>
              <h2>Textile analysis trend</h2>
            </div>
            <span className="an-live-pill">
              {wasteTrend.length} active days
            </span>
          </div>

          <div className="an-chart-height">
            {wasteTrend.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={wasteTrend}>
                  <CartesianGrid
                    stroke="#dce9e6"
                    strokeDasharray="4 7"
                    vertical={false}
                  />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} />
                  <YAxis
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="samples"
                    stroke="#0f766e"
                    strokeWidth={4}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="Analyse samples to generate a trend." />
            )}
          </div>
        </article>

        <article className="an-panel an-score-panel">
          <span className="an-section-label">Circularity pulse</span>
          <h2>Average sustainability</h2>
          <div
            className="an-score-ring"
            style={{ "--score": `${Math.round(averageScore) * 3.6}deg` }}
          >
            <div>
              <strong>{Math.round(averageScore)}</strong>
              <span>/100</span>
            </div>
          </div>
          <p>Average score across the synthetic sustainability dataset.</p>
          <div className="an-score-foot">
            <span>
              {formatNumber(summary?.completed_assessments)} completed
            </span>
            <span>
              {formatNumber(summary?.manual_review_assessments)} review
            </span>
          </div>
        </article>
      </section>

      <section className="an-two-column">
        <article className="an-panel">
          <div className="an-panel-heading">
            <div>
              <span className="an-section-label">
                Synthetic material intelligence
              </span>
              <h2>Dataset material distribution</h2>
            </div>
          </div>

          <div className="an-donut-layout">
            <div className="an-donut">
              {materialData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={materialData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={64}
                      outerRadius={96}
                      paddingAngle={4}
                    >
                      {materialData.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No synthetic material data." />
              )}
            </div>

            <div className="an-legend">
              {materialData.slice(0, 10).map((item, index) => (
                <div key={item.name}>
                  <span
                    style={{ background: COLORS[index % COLORS.length] }}
                  />
                  <p>{item.name}</p>
                  <strong>{formatNumber(item.value)}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="an-panel">
          <div className="an-panel-heading">
            <div>
              <span className="an-section-label">Circularity profile</span>
              <h2>Circularity levels</h2>
            </div>
          </div>

          <div className="an-donut-layout">
            <div className="an-donut">
              {circularityData.length ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={circularityData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={64}
                      outerRadius={96}
                      paddingAngle={5}
                    >
                      {circularityData.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={COLORS[(index + 2) % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <EmptyChart message="No circularity data." />
              )}
            </div>

            <div className="an-legend">
              {circularityData.map((item, index) => (
                <div key={item.name}>
                  <span
                    style={{
                      background: COLORS[(index + 2) % COLORS.length],
                    }}
                  />
                  <p>{item.name}</p>
                  <strong>{formatNumber(item.value)}</strong>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>

      <section className="an-panel an-records-panel">
        <div className="an-panel-heading">
          <div>
            <span className="an-section-label">
              Recovery pathways
            </span>
            <h2>Recommended recovery pathways</h2>
          </div>
          <span className="an-live-pill">
            {recommendationData.length} pathways
          </span>
        </div>

        <div className="an-chart-height an-recovery-chart">
          {recommendationData.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={recommendationData.slice(0, 10)}
                layout="vertical"
                margin={{ top: 8, right: 18, left: 8, bottom: 8 }}
              >
                <CartesianGrid
                  stroke="#dce9e6"
                  strokeDasharray="4 7"
                  horizontal={false}
                />
                <XAxis
                  type="number"
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="shortName"
                  width={138}
                  interval={0}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value) => [formatNumber(value), "Records"]}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.name || "Recovery pathway"
                  }
                />
                <Bar
                  dataKey="value"
                  name="Records"
                  fill="#0f766e"
                  radius={[0, 8, 8, 0]}
                  maxBarSize={28}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChart message="No recovery pathway data available." />
          )}
        </div>
      </section>

      <section className="an-two-column">
        <article className="an-panel">
          <div className="an-panel-heading">
            <div>
              <span className="an-section-label">Textile condition</span>
              <h2>Condition distribution</h2>
            </div>
          </div>

          <div className="an-chart-height">
            {conditionData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={conditionData}>
                  <CartesianGrid
                    stroke="#dce9e6"
                    strokeDasharray="4 7"
                    vertical={false}
                  />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    name="Records"
                    fill="#2f80ed"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No condition data." />
            )}
          </div>
        </article>

        <article className="an-panel">
          <div className="an-panel-heading">
            <div>
              <span className="an-section-label">Contamination risk</span>
              <h2>Contamination distribution</h2>
            </div>
          </div>

          <div className="an-chart-height">
            {contaminationData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={contaminationData}>
                  <CartesianGrid
                    stroke="#dce9e6"
                    strokeDasharray="4 7"
                    vertical={false}
                  />
                  <XAxis dataKey="name" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Bar
                    dataKey="value"
                    name="Records"
                    fill="#f59e0b"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart message="No contamination data." />
            )}
          </div>
        </article>
      </section>

      <section className="an-intelligence-grid">
        <article className="an-panel">
          <div className="an-panel-heading">
            <div>
              <span className="an-section-label">
                Live portfolio composition
              </span>
              <h2>Leading uploaded materials</h2>
            </div>
          </div>

          <div className="an-ranking">
            {liveMaterialRanking.length ? (
              liveMaterialRanking.slice(0, 7).map((item, index) => (
                <div className="an-rank-row" key={item.name}>
                  <div className="an-rank-title">
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <p>{item.name}</p>
                    <strong>{item.percentage}%</strong>
                  </div>
                  <div className="an-progress">
                    <span style={{ width: `${item.percentage}%` }} />
                  </div>
                </div>
              ))
            ) : (
              <EmptyChart message="Analyse uploads to create rankings." />
            )}
          </div>
        </article>

        <article className="an-panel">
          <div className="an-panel-heading">
            <div>
              <span className="an-section-label">
                Live knowledge profile
              </span>
              <h2>Environmental impact categories</h2>
            </div>
          </div>

          <div className="an-impact-list">
            {environmentalData.length ? (
              environmentalData.map((item, index) => (
                <div key={item.name}>
                  <span
                    style={{
                      background: COLORS[(index + 3) % COLORS.length],
                    }}
                  />
                  <p>{item.name}</p>
                  <strong>{item.value}</strong>
                </div>
              ))
            ) : (
              <EmptyChart message="No environmental profiles yet." />
            )}
          </div>

          {unavailableEnvironmentalCount > 0 && (
            <div className="an-method-note">
              <span>i</span>
              <p>
                Environmental profile unavailable for{" "}
                <strong>{unavailableEnvironmentalCount}</strong>{" "}
                live records because the material was unverified,
                pending assessment or not mapped to a valid impact category.
              </p>
            </div>
          )}

          <div className="an-method-note">
            <span>i</span>
            <p>
              Synthetic environmental values are educational estimates
              generated from the platform's explainable recommendation and
              sustainability rules.
            </p>
          </div>
        </article>
      </section>

      <section className="an-panel an-records-panel">
        <div className="an-panel-heading">
          <div>
            <span className="an-section-label">Latest intelligence</span>
            <h2>Recent textile analyses</h2>
          </div>
          <span className="an-live-pill">
            Showing {recentRecords.length}
          </span>
        </div>

        {recentRecords.length ? (
          <div className="an-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Visual fabric class</th>
                  <th>Material</th>
                  <th>Condition</th>
                  <th>Decision</th>
                  <th>Confidence</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Report</th>
                </tr>
              </thead>
              <tbody>
                {recentRecords.map((item) => (
                  <tr key={`${item.id}-${item.classId}`}>
                    <td>
                      <strong>{item.fabricName}</strong>
                      <small>
                        Class {item.classId} Â· {item.construction}
                      </small>
                    </td>
                    <td>
                      <strong>{item.material}</strong>
                      <small>
                        {item.materialVerified
                          ? "User verified"
                          : item.materialSource ===
                              "application_class_mapping"
                            ? "Application assigned"
                            : item.material === "Unverified"
                              ? "Unverified"
                              : "Legacy record"}
                      </small>
                    </td>
                    <td>
                      <span
                        className={`an-condition an-condition-${String(
                          item.condition,
                        ).toLowerCase()}`}
                      >
                        {item.condition}
                      </span>
                    </td>
                    <td>
                      <strong className="an-decision">
                        {item.recommendation}
                      </strong>
                      <small>{item.recoveryCategory}</small>
                    </td>
                    <td>{item.confidence.toFixed(1)}%</td>
                    <td>
                      <strong>{item.sustainabilityScore ?? "—"}</strong>
                    </td>
                    <td>
                      <span
                        className={`an-status ${
                          String(item.assessmentStatus).toLowerCase() ===
                          "provisional"
                            ? "is-provisional"
                            : "is-complete"
                        }`}
                      >
                        {item.assessmentStatus}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="an-view-report-button"
                        onClick={() => setSelectedRecord(item)}
                      >
                        View report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyChart message="No textile analyses have been recorded." />
        )}
      </section>

      {selectedRecord && (
        <div
          className="an-report-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRecord(null);
            }
          }}
        >
          <aside
            className="an-report-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="an-report-title"
          >
            <div className="an-report-drawer-head">
              <div>
                <span className="an-section-label">Textile report</span>
                <h2 id="an-report-title">{selectedRecord.fabricName}</h2>
                <p>
                  Upload {selectedRecord.id} Â· Class {selectedRecord.classId}
                </p>
              </div>

              <button
                type="button"
                className="an-report-close"
                onClick={() => setSelectedRecord(null)}
                aria-label="Close report"
              >
                Ã—
              </button>
            </div>

            <div className="an-report-grid">
              <article>
                <span>Material</span>
                <strong>{selectedRecord.material}</strong>
                <small>
                  {selectedRecord.materialVerified
                    ? "User verified"
                    : selectedRecord.materialSource ===
                        "application_class_mapping"
                      ? "Application assigned"
                      : "Legacy or unverified record"}
                </small>
              </article>

              <article>
                <span>Confidence</span>
                <strong>{selectedRecord.confidence.toFixed(1)}%</strong>
                <small>Visual fabric prediction confidence</small>
              </article>

              <article>
                <span>Condition</span>
                <strong>{selectedRecord.condition}</strong>
                <small>Detected textile condition</small>
              </article>

              <article>
                <span>Sustainability score</span>
                <strong>
                  {selectedRecord.sustainabilityScore ?? "—"}
                </strong>
                <small>{selectedRecord.assessmentStatus}</small>
              </article>
            </div>

            {String(
              selectedRecord.assessmentStatus,
            ).toLowerCase() === "provisional" && (
              <section className="an-report-section">
                <span className="an-section-label">
                  Provisional assessment
                </span>
                <h3>Material composition is not user verified</h3>
                <p>
                  The material was assigned through the application's
                  class-to-material mapping. Sustainability results should be
                  treated as provisional until the fibre composition is
                  verified.
                </p>
              </section>
            )}

            <section className="an-report-section">
              <span className="an-section-label">Recovery decision</span>
              <h3>{selectedRecord.recommendation}</h3>
              <p>{selectedRecord.recoveryCategory}</p>
            </section>

            <section className="an-report-section">
              <span className="an-section-label">Environmental profile</span>
              <h3>{selectedRecord.environmentalImpact}</h3>
              <p>
                This value is based on the platform's educational,
                explainable rule engine.
              </p>
            </section>

            <section className="an-report-section">
              <span className="an-section-label">Construction</span>
              <h3>{selectedRecord.construction}</h3>
              <p>
                Visual class: {selectedRecord.fabricName} Â· Class{" "}
                {selectedRecord.classId}
              </p>
            </section>
          </aside>
        </div>
      )}

      <p className="an-disclaimer">
        Synthetic sustainability values are educational estimates generated
        from rule-based scenarios. Application-assigned materials are
        representative academic-prototype assumptions and are not
        fibre-composition labels supplied by the Ten Fabrics Dataset.
      </p>
    </main>
  );
}

export default Analytics;