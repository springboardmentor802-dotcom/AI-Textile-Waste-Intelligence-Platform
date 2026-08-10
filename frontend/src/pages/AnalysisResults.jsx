import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import { ToastContainer, useToast } from "../components/Toast";
import { downloadPdfReport } from "../services/analysisService";
import BarChart from "../components/charts/BarChart";
import DoughnutChart from "../components/charts/DoughnutChart";
import RadarChart from "../components/charts/RadarChart";
import ColorPaletteChart from "../components/charts/ColorPaletteChart";
import { FiDownload, FiArrowLeft, FiChevronDown } from "react-icons/fi";

// ── Section definitions ───────────────────────────────────────────
const SECTIONS = [
  { key: "overview",        label: "Overview" },
  { key: "material",        label: "Material Recognition" },
  { key: "defect",          label: "Defect Detection" },
  { key: "color",           label: "Color Analysis" },
  { key: "texture",         label: "Texture Analysis" },
  { key: "pattern",         label: "Pattern Analysis" },
  { key: "waste",           label: "Waste Classification" },
  { key: "recycling",       label: "Recycling Recommendation" },
  { key: "sustainability",  label: "Sustainability Intelligence" },
  { key: "scores",          label: "Waste Scoring" },
  { key: "recommendation",  label: "Final Recommendation" },
];

export default function AnalysisResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, add, remove } = useToast();

  const sessionId = searchParams.get("sessionId");
  const [data, setData] = useState(null);
  const [preview, setPreview] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [activeSection, setActiveSection] = useState("overview");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem("analysisResult");
    const storedPreview = sessionStorage.getItem("analysisPreview");
    if (stored) {
      try { setData(JSON.parse(stored)); } catch { add("Failed to load report.", "error"); }
    }
    if (storedPreview) setPreview(storedPreview);
  }, []);

  const handleDownloadPdf = async () => {
    if (!sessionId) { add("No session ID for PDF download.", "error"); return; }
    setDownloading(true);
    try {
      const blob = await downloadPdfReport(sessionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `textile_report_${sessionId.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      add("PDF downloaded successfully.");
    } catch { add("Failed to download PDF.", "error"); }
    finally { setDownloading(false); }
  };

  if (!data) {
    return (
      <Layout title="Analysis Results">
        <PageHeader title="Analysis Results" />
        <Card padding="48px" style={{ textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
          <p style={{ color: "#6b7280", marginBottom: 20 }}>
            No report data found. Please run an analysis first.
          </p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </Card>
      </Layout>
    );
  }

  const mat = data.pipeline_result?.material_recognition || {};
  const defect = data.pipeline_result?.defect_detection || {};
  const color = data.pipeline_result?.color_analysis || {};
  const texture = data.pipeline_result?.texture_analysis || {};
  const pattern = data.pipeline_result?.pattern_analysis || {};
  const wasteCat = data.pipeline_result?.waste_categorization || {};
  const recyclability = data.pipeline_result?.recyclability_assessment || {};
  const sustainability = data.pipeline_result?.sustainability_intelligence || {};
  const scores = data.pipeline_result?.waste_scores || {};
  const classification = data.waste_classification || {};

  const activeLabel = SECTIONS.find((s) => s.key === activeSection)?.label || "Overview";

  // ── Chart data builders ─────────────────────────────────────────

  const materialChartData = mat.all_predictions?.slice(0, 6) || [];
  const textureValues = [
    texture.contrast || 0,
    (texture.homogeneity || 0) * 100,
    (texture.energy || 0) * 100,
    (texture.correlation || 0) * 100,
  ];
  const patternValues = [
    pattern.vertical_lines || 0,
    pattern.horizontal_lines || 0,
    pattern.diagonal_lines || 0,
  ];
  const scoreValues = {
    labels: ["Recyclability", "Reuse", "Sustainability", "Material Recovery", "Circularity"],
    values: [
      scores.recyclability_score || 0,
      scores.reuse_score || 0,
      scores.sustainability_score || 0,
      scores.material_recovery_score || 0,
      scores.overall_circularity_score || 0,
    ],
  };

  const scoreColor = (v) => v >= 75 ? "#16a34a" : v >= 50 ? "#d97706" : "#dc2626";
  const scoreBg = (v) => v >= 75 ? "#dcfce7" : v >= 50 ? "#fef3c7" : "#fee2e2";
  const condPreset = { Good: "success", Fair: "warning", Poor: "danger" };
  const catPreset = { Reusable: "success", Recyclable: "info", Repairable: "warning", Upcyclable: "warning" };

  // ── Section renderers ───────────────────────────────────────────

  const renderSection = () => {
    switch (activeSection) {

      case "overview":
        return (
          <div style={S.twoCol}>
            {/* Image */}
            {preview && (
              <Card padding="20px" style={{ flex: "0 0 220px" }}>
                <img src={preview} alt="Fabric" style={S.previewImg} />
                <div style={S.caption}>{data.filename}</div>
              </Card>
            )}
            {/* Key metrics */}
            <Card padding="24px" style={{ flex: 1 }}>
              <h3 style={S.cardTitle}>Analysis Summary</h3>
              <Row label="Material" value={<strong>{mat.predicted_material}</strong>} />
              <Row label="Confidence" value={<span style={{ color: "#16a34a", fontWeight: 700 }}>{mat.confidence}%</span>} />
              <Row label="Condition" value={<Badge label={defect.condition || "—"} preset={condPreset[defect.condition] || "gray"} />} />
              <Row label="Defects" value={defect.defect_count ?? 0} />
              <Row label="Waste Category" value={<Badge label={wasteCat.waste_category || "—"} preset={catPreset[wasteCat.waste_category] || "gray"} />} />
              <Row label="Primary Strategy" value={recyclability.primary_recycling_strategy} />
              <Row label="Reuse Potential" value={recyclability.reuse_potential} />
              <Row label="Circularity Score" value={
                <span style={{ color: scoreColor(scores.overall_circularity_score), fontWeight: 700, fontSize: 16 }}>
                  {scores.overall_circularity_score}/100
                </span>
              } />
              <Row label="CO₂ Saved (kg)" value={sustainability.carbon_footprint_estimation?.co2_saved_kg} />
              <Row label="Water Saved (L)" value={sustainability.water_savings?.liters_saved?.toLocaleString()} />
            </Card>
          </div>
        );

      case "material":
        return (
          <div style={S.twoCol}>
            <Card padding="24px" style={{ flex: 1 }}>
              <h3 style={S.cardTitle}>Material Recognition</h3>
              <Row label="Predicted Material" value={<strong style={{ fontSize: 16 }}>{mat.predicted_material}</strong>} />
              <Row label="Confidence" value={<span style={{ color: "#16a34a", fontWeight: 700 }}>{mat.confidence}%</span>} />
              <Row label="Model Version" value={mat.model_version} />
              <Row label="Classes Analyzed" value={mat.classes_count} />
            </Card>
            {materialChartData.length > 0 && (
              <Card padding="24px" style={{ flex: 1 }}>
                <h3 style={S.cardTitle}>Top Predictions</h3>
                <BarChart
                  labels={materialChartData.map((p) => p.material)}
                  datasets={[{
                    label: "Confidence (%)",
                    data: materialChartData.map((p) => p.confidence),
                    backgroundColor: materialChartData.map((_, i) =>
                      i === 0 ? "#1d4ed8cc" : "#93c5fdcc"
                    ),
                    borderColor: materialChartData.map((_, i) =>
                      i === 0 ? "#1d4ed8" : "#3b82f6"
                    ),
                    borderWidth: 1,
                    borderRadius: 4,
                  }]}
                  horizontal
                  showLegend={false}
                />
              </Card>
            )}
          </div>
        );

      case "defect":
        return (
          <div style={S.twoCol}>
            <Card padding="24px" style={{ flex: 1 }}>
              <h3 style={S.cardTitle}>Defect Detection</h3>
              <Row label="Condition" value={<Badge label={defect.condition || "—"} preset={condPreset[defect.condition] || "gray"} />} />
              <Row label="Defects Found" value={defect.defect_count ?? 0} />
              <Row label="Has Defects" value={defect.has_defects ? "Yes" : "No"} />
              {defect.defects?.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div style={S.subLabel}>Detected Defects</div>
                  {defect.defects.map((d, i) => (
                    <div key={i} style={S.defectRow}>
                      <span style={{ fontWeight: 600 }}>{d.class_name}</span>
                      <span style={{ color: "#6b7280", fontSize: 12 }}>{d.confidence}% confidence</span>
                    </div>
                  ))}
                </div>
              )}
              {!defect.has_defects && (
                <div style={{ marginTop: 16, color: "#16a34a", fontWeight: 600, fontSize: 14 }}>
                  No defects detected — material is in clean condition.
                </div>
              )}
            </Card>
            <Card padding="24px" style={{ flex: 1 }}>
              <h3 style={S.cardTitle}>Condition Overview</h3>
              <DoughnutChart
                labels={["No Defects", "Defects"]}
                data={[
                  Math.max(0, 3 - (defect.defect_count || 0)),
                  Math.min(3, defect.defect_count || 0),
                ]}
                colors={["#16a34a", "#dc2626"]}
              />
            </Card>
          </div>
        );

      case "color":
        return (
          <div style={S.twoCol}>
            <Card padding="24px" style={{ flex: 1 }}>
              <h3 style={S.cardTitle}>Color Analysis</h3>
              <Row label="Color Category" value={color.color_category} />
              <Row label="Primary Color" value={color.primary_color_hex} />
              <Row label="Colors Analyzed" value={color.colors_analyzed} />
              <div style={{ marginTop: 20 }}>
                <div style={S.subLabel}>Dominant Colors</div>
                <ColorPaletteChart
                  hexColors={color.hex_colors || []}
                  percentages={color.color_percentages || []}
                />
              </div>
            </Card>
            {(color.hex_colors?.length > 0) && (
              <Card padding="24px" style={{ flex: 1 }}>
                <h3 style={S.cardTitle}>Color Distribution</h3>
                <DoughnutChart
                  labels={color.hex_colors || []}
                  data={color.color_percentages || []}
                  colors={color.hex_colors}
                />
              </Card>
            )}
          </div>
        );

      case "texture":
        return (
          <div style={S.twoCol}>
            <Card padding="24px" style={{ flex: 1 }}>
              <h3 style={S.cardTitle}>Texture Analysis</h3>
              <Row label="Texture Type" value={<Badge label={texture.texture_type || "—"} preset="info" />} />
              <Row label="Detail" value={texture.texture_detail} />
              <Row label="Contrast" value={texture.contrast} />
              <Row label="Homogeneity" value={texture.homogeneity} />
              <Row label="Energy" value={texture.energy} />
              <Row label="Correlation" value={texture.correlation} />
            </Card>
            <Card padding="24px" style={{ flex: 1 }}>
              <h3 style={S.cardTitle}>GLCM Features (scaled)</h3>
              <BarChart
                labels={["Contrast", "Homogeneity ×100", "Energy ×100", "Correlation ×100"]}
                datasets={[{
                  label: "Value",
                  data: textureValues,
                  backgroundColor: ["#1d4ed8cc", "#16a34acc", "#d97706cc", "#7c3aedcc"],
                  borderColor: ["#1d4ed8", "#16a34a", "#d97706", "#7c3aed"],
                  borderWidth: 1,
                  borderRadius: 4,
                }]}
                showLegend={false}
              />
            </Card>
          </div>
        );

      case "pattern":
        return (
          <div style={S.twoCol}>
            <Card padding="24px" style={{ flex: 1 }}>
              <h3 style={S.cardTitle}>Pattern Analysis</h3>
              <Row label="Surface Pattern" value={<Badge label={pattern.surface_pattern || "—"} preset="info" />} />
              <Row label="Total Lines" value={pattern.total_lines} />
              <Row label="Vertical Lines" value={pattern.vertical_lines} />
              <Row label="Horizontal Lines" value={pattern.horizontal_lines} />
              <Row label="Diagonal Lines" value={pattern.diagonal_lines} />
              <Row label="Edge Density" value={pattern.edge_density} />
            </Card>
            {pattern.total_lines > 0 && (
              <Card padding="24px" style={{ flex: 1 }}>
                <h3 style={S.cardTitle}>Line Orientation Distribution</h3>
                <DoughnutChart
                  labels={["Vertical", "Horizontal", "Diagonal"]}
                  data={patternValues}
                  colors={["#1d4ed8", "#16a34a", "#d97706"]}
                />
              </Card>
            )}
          </div>
        );

      case "waste":
        return (
          <Card padding="24px">
            <h3 style={S.cardTitle}>Waste Classification</h3>
            <div style={S.twoColInner}>
              <div>
                <Row label="Waste Category" value={<Badge label={wasteCat.waste_category || "—"} preset={catPreset[wasteCat.waste_category] || "gray"} />} />
                <Row label="Condition" value={wasteCat.condition} />
                <Row label="Defect Count" value={wasteCat.defect_count ?? 0} />
                <div style={{ marginTop: 16 }}>
                  <div style={S.subLabel}>Justification</div>
                  <p style={S.bodyText}>{wasteCat.justification}</p>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={S.subLabel}>Contamination Recommendation</div>
                  <p style={S.bodyText}>{classification.contamination_reduction_recommendation}</p>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={S.subLabel}>Disposal Recommendation</div>
                  <p style={S.bodyText}>{classification.disposal_recommendation}</p>
                </div>
              </div>
              <div>
                <div style={S.subLabel}>Reuse Potential Description</div>
                <p style={S.bodyText}>{classification.reuse_potential_description}</p>
              </div>
            </div>
          </Card>
        );

      case "recycling":
        return (
          <div>
            <Card padding="24px" style={{ marginBottom: 16 }}>
              <h3 style={S.cardTitle}>Recycling Recommendation</h3>
              <Row label="Primary Strategy" value={<strong>{recyclability.primary_recycling_strategy}</strong>} />
              <Row label="Strategy Description" value={recyclability.strategy_description} />
              <Row label="Reuse Potential" value={recyclability.reuse_potential} />
              <Row label="Reuse Opportunity" value={recyclability.reuse_opportunity} />
            </Card>
            <div style={S.twoCol}>
              <Card padding="24px" style={{ flex: 1 }}>
                <h3 style={S.cardTitle}>Available Options</h3>
                <div style={S.tagRow}>
                  {recyclability.recycling_options?.map((opt) => (
                    <span key={opt} style={S.tag}>{opt}</span>
                  ))}
                </div>
                <div style={{ marginTop: 16 }}>
                  <div style={S.subLabel}>Upcycling Suggestion</div>
                  <p style={S.bodyText}>{recyclability.upcycling_suggestion}</p>
                </div>
                <div style={{ marginTop: 12 }}>
                  <div style={S.subLabel}>Material Recovery</div>
                  <p style={S.bodyText}>{recyclability.material_recovery_recommendation}</p>
                </div>
              </Card>
              {recyclability.recycling_options?.length > 0 && (
                <Card padding="24px" style={{ flex: 1 }}>
                  <h3 style={S.cardTitle}>Recycling Options Count</h3>
                  <DoughnutChart
                    labels={recyclability.recycling_options}
                    data={recyclability.recycling_options.map(() => 1)}
                    colors={["#1d4ed8","#16a34a","#d97706","#7c3aed","#0891b2","#dc2626","#65a30d"]}
                  />
                </Card>
              )}
            </div>
            <Card padding="24px" style={{ marginTop: 16 }}>
              <h3 style={S.cardTitle}>Waste Reduction Strategies</h3>
              {recyclability.waste_reduction_strategies?.map((s, i) => (
                <div key={i} style={S.bulletRow}>
                  <div style={S.bullet} />
                  <span style={S.bodyText}>{s}</span>
                </div>
              ))}
            </Card>
          </div>
        );

      case "sustainability":
        return (
          <div>
            <div style={S.sustainGrid}>
              <SustainCard label="CO₂ Saved (kg)" value={sustainability.carbon_footprint_estimation?.co2_saved_kg} />
              <SustainCard label="Water Saved (L)" value={sustainability.water_savings?.liters_saved?.toLocaleString()} />
              <SustainCard label="Diversion Rate" value={sustainability.waste_diversion_analysis?.diversion_rate} />
              <SustainCard label="Circular Score" value={sustainability.circular_economy_analysis?.score} />
            </div>
            <div style={{ ...S.twoCol, marginTop: 16 }}>
              <Card padding="24px" style={{ flex: 2 }}>
                <h3 style={S.cardTitle}>Environmental Impact</h3>
                <Row label="CO₂ Factor/kg" value={sustainability.carbon_footprint_estimation?.carbon_factor_per_kg} />
                <div style={{ marginTop: 10 }}>
                  <div style={S.subLabel}>Carbon Footprint</div>
                  <p style={S.bodyText}>{sustainability.carbon_footprint_estimation?.description}</p>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={S.subLabel}>Water Conservation</div>
                  <p style={S.bodyText}>{sustainability.water_savings?.description}</p>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={S.subLabel}>Circular Economy</div>
                  <p style={S.bodyText}>{sustainability.circular_economy_analysis?.analysis}</p>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={S.subLabel}>Resource Recovery</div>
                  <p style={S.bodyText}>{sustainability.resource_recovery_estimation?.description}</p>
                </div>
              </Card>
              <Card padding="24px" style={{ flex: 1 }}>
                <h3 style={S.cardTitle}>Sustainability Benchmark</h3>
                <Row label="Rating" value={<Badge label={sustainability.sustainability_benchmarking?.rating || "—"} preset="info" />} />
                <Row label="Circularity Score" value={sustainability.circular_economy_analysis?.score} />
                <div style={{ marginTop: 10 }}>
                  <div style={S.subLabel}>Industry Comparison</div>
                  <p style={S.bodyText}>{sustainability.sustainability_benchmarking?.industry_comparison}</p>
                </div>
                <div style={{ marginTop: 10 }}>
                  <div style={S.subLabel}>ESG Relevance</div>
                  <p style={S.bodyText}>{sustainability.sustainability_benchmarking?.esg_relevance}</p>
                </div>
              </Card>
            </div>
          </div>
        );

      case "scores":
        return (
          <div>
            <div style={S.scoresGrid}>
              {scoreValues.labels.map((label, i) => (
                <div key={label} style={S.scoreCard}>
                  <div style={{
                    ...S.scoreValue,
                    backgroundColor: scoreBg(scoreValues.values[i]),
                    color: scoreColor(scoreValues.values[i]),
                  }}>
                    {scoreValues.values[i] ?? "—"}
                  </div>
                  <div style={S.scoreLabel}>{label}</div>
                </div>
              ))}
            </div>
            <div style={{ ...S.twoCol, marginTop: 20 }}>
              <Card padding="24px" style={{ flex: 1 }}>
                <h3 style={S.cardTitle}>Score Radar</h3>
                <RadarChart
                  labels={scoreValues.labels}
                  datasets={[{
                    label: "Score",
                    data: scoreValues.values,
                    backgroundColor: "#1d4ed820",
                    borderColor: "#1d4ed8",
                    borderWidth: 2,
                    pointBackgroundColor: "#1d4ed8",
                    pointRadius: 4,
                  }]}
                />
              </Card>
              <Card padding="24px" style={{ flex: 1 }}>
                <h3 style={S.cardTitle}>Circularity Category</h3>
                <div style={{ marginBottom: 16 }}>
                  <Badge label={scores.circularity_category || "—"} preset="info" />
                </div>
                {scores.score_breakdown && (
                  <>
                    <div style={S.subLabel}>Score Breakdown</div>
                    {Object.entries(scores.score_breakdown).map(([key, val]) => (
                      <div key={key} style={S.breakdownRow}>
                        <span style={S.breakdownLabel}>
                          {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                          <span style={{ color: "#9ca3af", fontSize: 10 }}> ({val.weight})</span>
                        </span>
                        <div style={S.breakdownBarWrap}>
                          <div style={{ ...S.breakdownBar, width: `${val.score}%`, backgroundColor: scoreColor(val.score) }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: scoreColor(val.score), width: 28, textAlign: "right" }}>{val.score}</span>
                      </div>
                    ))}
                  </>
                )}
              </Card>
            </div>
          </div>
        );

      case "recommendation":
        return (
          <Card padding="32px" style={{ backgroundColor: "#f0f9ff", borderLeft: "4px solid #1d4ed8" }}>
            <h3 style={{ ...S.cardTitle, color: "#1e3a8a", marginBottom: 16 }}>Final Recommendation</h3>
            <p style={{ fontSize: 15, color: "#1e3a8a", lineHeight: 1.8, margin: 0 }}>
              {classification.final_recommendation || "—"}
            </p>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <Layout title="Analysis Results">
      <ToastContainer toasts={toasts} onClose={remove} />

      <PageHeader
        title="Textile Analysis Results"
        subtitle={data.filename || "Full analysis complete"}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" icon={FiArrowLeft} onClick={() => navigate(-1)}>
              Back
            </Button>
            <Button
              icon={FiDownload}
              onClick={handleDownloadPdf}
              disabled={downloading || !sessionId}
            >
              {downloading ? "Downloading..." : "Full PDF Report"}
            </Button>
          </div>
        }
      />

      {/* Section Selector Dropdown */}
      <div style={S.selectorWrap}>
        <div style={S.selectorLabel}>View Section</div>
        <div style={{ position: "relative" }}>
          <button
            style={S.selectorBtn}
            onClick={() => setDropdownOpen((p) => !p)}
          >
            <span>{activeLabel}</span>
            <FiChevronDown size={16} style={{ transition: "transform 0.2s", transform: dropdownOpen ? "rotate(180deg)" : "none" }} />
          </button>
          {dropdownOpen && (
            <div style={S.dropdown}>
              {SECTIONS.map((sec) => (
                <button
                  key={sec.key}
                  style={{
                    ...S.dropdownItem,
                    backgroundColor: activeSection === sec.key ? "#dbeafe" : "transparent",
                    color: activeSection === sec.key ? "#1d4ed8" : "#374151",
                    fontWeight: activeSection === sec.key ? 700 : 400,
                  }}
                  onClick={() => { setActiveSection(sec.key); setDropdownOpen(false); }}
                >
                  {sec.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Section tab pills (wider screens) */}
        <div style={S.pills}>
          {SECTIONS.map((sec) => (
            <button
              key={sec.key}
              style={{
                ...S.pill,
                backgroundColor: activeSection === sec.key ? "#1d4ed8" : "#f3f4f6",
                color: activeSection === sec.key ? "#fff" : "#6b7280",
              }}
              onClick={() => setActiveSection(sec.key)}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active section content */}
      <div style={{ marginTop: 4 }}>
        {renderSection()}
      </div>

      {/* Bottom actions */}
      <div style={{ display: "flex", gap: 12, marginTop: 24, justifyContent: "flex-end" }}>
        <Button variant="secondary" icon={FiArrowLeft} onClick={() => navigate(-1)}>
          Back to Upload
        </Button>
        <Button
          icon={FiDownload}
          onClick={handleDownloadPdf}
          disabled={downloading || !sessionId}
        >
          {downloading ? "Downloading..." : "Download Full PDF Report"}
        </Button>
      </div>
    </Layout>
  );
}

// ── Helper components ─────────────────────────────────────────────

function Row({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: "1px solid #f3f4f6", gap: 16 }}>
      <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, color: "#111827", fontWeight: 500, textAlign: "right" }}>{value ?? "—"}</span>
    </div>
  );
}

function SustainCard({ label, value }) {
  return (
    <div style={{ textAlign: "center", padding: "16px", backgroundColor: "#fff", borderRadius: 8, border: "1px solid #f3f4f6", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#1d4ed8" }}>{value ?? "—"}</div>
      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────

const S = {
  twoCol: { display: "flex", gap: 20, flexWrap: "wrap", alignItems: "flex-start" },
  twoColInner: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 14px" },
  subLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", color: "#6b7280", marginBottom: 6 },
  bodyText: { fontSize: 13, color: "#4b5563", lineHeight: 1.6, margin: 0 },
  caption: { fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 8 },
  previewImg: { width: "100%", borderRadius: 8, objectFit: "cover" },
  defectRow: { display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13 },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6 },
  tag: { fontSize: 12, padding: "4px 10px", borderRadius: 999, backgroundColor: "#dbeafe", color: "#1d4ed8", fontWeight: 500 },
  bulletRow: { display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: "50%", backgroundColor: "#1d4ed8", flexShrink: 0, marginTop: 5 },
  sustainGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12 },
  scoresGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 14 },
  scoreCard: { textAlign: "center" },
  scoreValue: { fontSize: 26, fontWeight: 800, padding: "18px 12px", borderRadius: 10 },
  scoreLabel: { fontSize: 11, fontWeight: 600, color: "#6b7280", marginTop: 6 },
  breakdownRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
  breakdownLabel: { fontSize: 12, color: "#374151", width: 160, flexShrink: 0 },
  breakdownBarWrap: { flex: 1, height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden" },
  breakdownBar: { height: "100%", borderRadius: 4 },
  selectorWrap: {
    display: "flex", alignItems: "center", gap: 16,
    marginBottom: 20, flexWrap: "wrap",
  },
  selectorLabel: { fontSize: 13, fontWeight: 600, color: "#6b7280", flexShrink: 0 },
  selectorBtn: {
    display: "flex", alignItems: "center", gap: 8,
    padding: "9px 14px", backgroundColor: "#fff",
    border: "1.5px solid #d1d5db", borderRadius: 8,
    fontSize: 14, fontWeight: 600, color: "#111827",
    cursor: "pointer", minWidth: 200,
    justifyContent: "space-between",
  },
  dropdown: {
    position: "absolute", top: "calc(100% + 4px)", left: 0,
    backgroundColor: "#fff", border: "1px solid #e5e7eb",
    borderRadius: 8, zIndex: 100, minWidth: 220,
    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
    display: "flex", flexDirection: "column",
  },
  dropdownItem: {
    padding: "10px 16px", border: "none",
    textAlign: "left", cursor: "pointer",
    fontSize: 13, transition: "background 0.1s",
    borderRadius: 0,
  },
  pills: {
    display: "flex", flexWrap: "wrap", gap: 6, flex: 1,
  },
  pill: {
    padding: "5px 12px", borderRadius: 999, border: "none",
    fontSize: 12, fontWeight: 500, cursor: "pointer",
    transition: "all 0.15s", whiteSpace: "nowrap",
  },
};