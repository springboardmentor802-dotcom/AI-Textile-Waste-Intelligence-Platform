import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import { ToastContainer, useToast } from "../components/Toast";
import { downloadPdfReport } from "../services/analysisService";
import { FiDownload, FiArrowLeft } from "react-icons/fi";

export default function AnalysisResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, add, remove } = useToast();

  const sessionId = searchParams.get("sessionId");

  const [data, setData] = useState(null);
  const [preview, setPreview] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    // Read from sessionStorage — set by UploadBatch after full analysis
    const stored = sessionStorage.getItem("analysisResult");
    const storedPreview = sessionStorage.getItem("analysisPreview");

    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch {
        add("Failed to load report data.", "error");
      }
    }
    if (storedPreview) {
      setPreview(storedPreview);
    }
  }, []);

  const handleDownloadPdf = async () => {
    if (!sessionId) { add("No session ID for PDF download.", "error"); return; }
    setDownloading(true);
    try {
      const pdfBlob = await downloadPdfReport(sessionId);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `textile_report_${sessionId.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      add("PDF downloaded successfully.");
    } catch {
      add("Failed to download PDF.", "error");
    } finally {
      setDownloading(false);
    }
  };

  if (!data) {
    return (
      <Layout title="Analysis Report">
        <PageHeader title="Analysis Report" />
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

  const conditionPreset = { Good: "success", Fair: "warning", Poor: "danger" };
  const categoryPreset = {
    Reusable: "success", Recyclable: "info",
    Repairable: "warning", Upcyclable: "warning",
    Compostable: "success",
  };

  const scoreColor = (v) => {
    if (v >= 75) return "#16a34a";
    if (v >= 50) return "#d97706";
    return "#dc2626";
  };
  const scoreBg = (v) => {
    if (v >= 75) return "#dcfce7";
    if (v >= 50) return "#fef3c7";
    return "#fee2e2";
  };

  return (
    <Layout title="Analysis Report">
      <ToastContainer toasts={toasts} onClose={remove} />

      <PageHeader
        title="Textile Waste Analysis Report"
        subtitle={data.filename || "Full analysis complete"}
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Button
              variant="secondary"
              icon={FiArrowLeft}
              onClick={() => navigate(-1)}
            >
              Back
            </Button>
            <Button
              icon={FiDownload}
              onClick={handleDownloadPdf}
              disabled={downloading || !sessionId}
            >
              {downloading ? "Downloading..." : "Download PDF"}
            </Button>
          </div>
        }
      />

      {/* ── Section 1: Image + Material ─────────────────────────── */}
      <Card padding="24px" style={S.section}>
        <div style={S.imageAndMaterial}>
          {preview && (
            <div style={S.imageBox}>
              <img src={preview} alt="Analyzed fabric" style={S.image} />
              <div style={S.imageCaption}>{data.filename}</div>
            </div>
          )}
          <div style={S.materialBox}>
            <h3 style={S.sectionTitle}>1. Material Recognition</h3>
            <Row label="Predicted Material" value={mat.predicted_material} bold />
            <Row
              label="Confidence"
              value={
                <span style={{ color: "#16a34a", fontWeight: 700, fontSize: 16 }}>
                  {mat.confidence}%
                </span>
              }
            />
            <Row label="Model Version" value={mat.model_version} />
            <Row label="Classes Analyzed" value={mat.classes_count} />

            {mat.all_predictions?.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <div style={S.subLabel}>Top Predictions</div>
                {mat.all_predictions.slice(0, 4).map((p) => (
                  <div key={p.material} style={S.predRow}>
                    <span style={{ fontSize: 13 }}>{p.material}</span>
                    <div style={S.predBarWrap}>
                      <div style={{ ...S.predBar, width: `${p.confidence}%` }} />
                    </div>
                    <span style={S.predPct}>{p.confidence}%</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* ── Section 2: Defect Detection ─────────────────────────── */}
      <Card padding="24px" style={S.section}>
        <h3 style={S.sectionTitle}>2. Defect Detection</h3>
        <div style={S.grid2}>
          <div>
            <Row label="Material Condition" value={
              <Badge label={defect.condition || "—"} preset={conditionPreset[defect.condition] || "gray"} />
            } />
            <Row label="Defects Found" value={defect.defect_count ?? "0"} />
            <Row label="Has Defects" value={defect.has_defects ? "Yes" : "No"} />
          </div>
          <div>
            {defect.defects?.length > 0 ? (
              <>
                <div style={S.subLabel}>Detected Defects</div>
                {defect.defects.map((d, i) => (
                  <div key={i} style={S.defectRow}>
                    <span style={{ fontWeight: 600 }}>{d.class_name}</span>
                    <span style={{ color: "#6b7280", fontSize: 12 }}>{d.confidence}% confidence</span>
                  </div>
                ))}
              </>
            ) : (
              <div style={S.noDefects}>No defects detected</div>
            )}
          </div>
        </div>
      </Card>

      {/* ── Section 3: Visual Analysis ──────────────────────────── */}
      <Card padding="24px" style={S.section}>
        <h3 style={S.sectionTitle}>3. Visual Analysis</h3>
        <div style={S.grid3}>
          {/* Color */}
          <div style={S.analysisPanel}>
            <div style={S.panelLabel}>Color Analysis</div>
            <div style={S.colorDots}>
              {color.hex_colors?.slice(0, 5).map((hex) => (
                <div
                  key={hex}
                  title={hex}
                  style={{ ...S.colorDot, backgroundColor: hex }}
                />
              ))}
            </div>
            <div style={S.panelSub}>{color.color_category}</div>
            <div style={S.panelSub}>Primary: {color.primary_color_hex}</div>
            {color.color_percentages?.slice(0, 3).map((pct, i) => (
              <div key={i} style={{ fontSize: 12, color: "#6b7280" }}>
                {color.hex_colors?.[i]}: {pct}%
              </div>
            ))}
          </div>

          {/* Texture */}
          <div style={S.analysisPanel}>
            <div style={S.panelLabel}>Texture Analysis</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1d4ed8", marginBottom: 8 }}>
              {texture.texture_type}
            </div>
            <div style={S.panelSub}>{texture.texture_detail}</div>
            <SmallRow label="Contrast" value={texture.contrast} />
            <SmallRow label="Homogeneity" value={texture.homogeneity} />
            <SmallRow label="Energy" value={texture.energy} />
            <SmallRow label="Correlation" value={texture.correlation} />
          </div>

          {/* Pattern */}
          <div style={S.analysisPanel}>
            <div style={S.panelLabel}>Pattern Analysis</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#1d4ed8", marginBottom: 8 }}>
              {pattern.surface_pattern}
            </div>
            <SmallRow label="Total Lines" value={pattern.total_lines} />
            <SmallRow label="Vertical" value={pattern.vertical_lines} />
            <SmallRow label="Horizontal" value={pattern.horizontal_lines} />
            <SmallRow label="Diagonal" value={pattern.diagonal_lines} />
            <SmallRow label="Edge Density" value={pattern.edge_density} />
          </div>
        </div>
      </Card>

      {/* ── Section 4: Waste Categorization ─────────────────────── */}
      <Card padding="24px" style={S.section}>
        <h3 style={S.sectionTitle}>4. Waste Categorization</h3>
        <div style={S.grid2}>
          <div>
            <Row label="Waste Category" value={
              <Badge label={wasteCat.waste_category || "—"} preset={categoryPreset[wasteCat.waste_category] || "gray"} />
            } />
            <Row label="Material" value={wasteCat.material} />
            <Row label="Condition" value={wasteCat.condition} />
            <Row label="Defect Count" value={wasteCat.defect_count ?? 0} />
          </div>
          <div>
            <div style={S.subLabel}>Justification</div>
            <p style={S.bodyText}>{wasteCat.justification}</p>
          </div>
        </div>
      </Card>

      {/* ── Section 5: Recyclability Assessment ─────────────────── */}
      <Card padding="24px" style={S.section}>
        <h3 style={S.sectionTitle}>5. Recyclability Assessment</h3>
        <Row label="Primary Strategy" value={recyclability.primary_recycling_strategy} bold />
        <Row label="Strategy Description" value={recyclability.strategy_description} />
        <Row label="Reuse Potential" value={recyclability.reuse_potential} />
        <Row label="Reuse Opportunity" value={recyclability.reuse_opportunity} />
        <div style={{ marginTop: 16 }}>
          <div style={S.subLabel}>Available Recycling Options</div>
          <div style={S.tagRow}>
            {recyclability.recycling_options?.map((opt) => (
              <span key={opt} style={S.tag}>{opt}</span>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={S.subLabel}>Upcycling Suggestion</div>
          <p style={S.bodyText}>{recyclability.upcycling_suggestion}</p>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={S.subLabel}>Material Recovery Recommendation</div>
          <p style={S.bodyText}>{recyclability.material_recovery_recommendation}</p>
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={S.subLabel}>Waste Reduction Strategies</div>
          {recyclability.waste_reduction_strategies?.map((s, i) => (
            <div key={i} style={S.bulletRow}>
              <div style={S.bullet} />
              <span style={S.bodyText}>{s}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Section 6: Sustainability Intelligence ───────────────── */}
      <Card padding="24px" style={S.section}>
        <h3 style={S.sectionTitle}>6. Sustainability Intelligence</h3>
        <div style={S.sustainGrid}>
          <SustainCard
            label="CO₂ Saved (kg)"
            value={sustainability.carbon_footprint_estimation?.co2_saved_kg}
          />
          <SustainCard
            label="Water Saved (L)"
            value={sustainability.water_savings?.liters_saved?.toLocaleString()}
          />
          <SustainCard
            label="Diversion Rate"
            value={sustainability.waste_diversion_analysis?.diversion_rate}
          />
          <SustainCard
            label="Circular Score"
            value={sustainability.circular_economy_analysis?.score}
          />
        </div>
        <div style={{ marginTop: 16 }}>
          <div style={S.subLabel}>Carbon Footprint</div>
          <p style={S.bodyText}>{sustainability.carbon_footprint_estimation?.description}</p>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={S.subLabel}>Water Conservation</div>
          <p style={S.bodyText}>{sustainability.water_savings?.description}</p>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={S.subLabel}>Circular Economy Analysis</div>
          <p style={S.bodyText}>{sustainability.circular_economy_analysis?.analysis}</p>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={S.subLabel}>Resource Recovery</div>
          <p style={S.bodyText}>{sustainability.resource_recovery_estimation?.description}</p>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={S.subLabel}>Sustainability Benchmark</div>
          <Row label="Rating" value={sustainability.sustainability_benchmarking?.rating} />
          <Row label="Industry Comparison" value={sustainability.sustainability_benchmarking?.industry_comparison} />
          <p style={{ ...S.bodyText, marginTop: 8 }}>
            {sustainability.sustainability_benchmarking?.esg_relevance}
          </p>
        </div>
      </Card>

      {/* ── Section 7: Waste Classification ─────────────────────── */}
      <Card padding="24px" style={S.section}>
        <h3 style={S.sectionTitle}>7. Waste Classification</h3>
        <Row label="Category Prediction" value={classification.waste_category_prediction} bold />
        <Row label="Reuse Potential" value={classification.reuse_potential} />
        <div style={{ marginTop: 12 }}>
          <div style={S.subLabel}>Contamination Reduction Recommendation</div>
          <p style={S.bodyText}>{classification.contamination_reduction_recommendation}</p>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={S.subLabel}>Reuse Potential Description</div>
          <p style={S.bodyText}>{classification.reuse_potential_description}</p>
        </div>
        <div style={{ marginTop: 12 }}>
          <div style={S.subLabel}>Disposal Recommendation</div>
          <p style={S.bodyText}>{classification.disposal_recommendation}</p>
        </div>
      </Card>

      {/* ── Section 8: Waste Scores ──────────────────────────────── */}
      <Card padding="24px" style={S.section}>
        <h3 style={S.sectionTitle}>8. Waste Scoring</h3>
        <div style={S.scoresGrid}>
          {[
            { label: "Recyclability", value: scores.recyclability_score },
            { label: "Reuse", value: scores.reuse_score },
            { label: "Sustainability", value: scores.sustainability_score },
            { label: "Material Recovery", value: scores.material_recovery_score },
            { label: "Overall Circularity", value: scores.overall_circularity_score },
          ].map((sc) => (
            <div key={sc.label} style={S.scoreCard}>
              <div style={{
                ...S.scoreValue,
                backgroundColor: scoreBg(sc.value),
                color: scoreColor(sc.value),
              }}>
                {sc.value ?? "—"}
              </div>
              <div style={S.scoreLabel}>{sc.label}</div>
            </div>
          ))}
        </div>

        <div style={S.circularityRow}>
          <span style={S.subLabel}>Circularity Category</span>
          <Badge label={scores.circularity_category || "—"} preset="info" />
        </div>

        {/* Score Breakdown */}
        {scores.score_breakdown && (
          <div style={{ marginTop: 20 }}>
            <div style={S.subLabel}>Score Breakdown</div>
            {Object.entries(scores.score_breakdown).map(([key, val]) => (
              <div key={key} style={S.breakdownRow}>
                <span style={S.breakdownLabel}>
                  {key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                  <span style={S.breakdownWeight}> ({val.weight})</span>
                </span>
                <div style={S.breakdownBarWrap}>
                  <div style={{ ...S.breakdownBar, width: `${val.score}%`, backgroundColor: scoreColor(val.score) }} />
                </div>
                <span style={{ ...S.breakdownScore, color: scoreColor(val.score) }}>{val.score}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ── Section 9: Final Recommendation ─────────────────────── */}
      <Card padding="24px" style={{
        ...S.section,
        backgroundColor: "#f0f9ff",
        borderLeft: "4px solid #1d4ed8",
        marginBottom: 0,
      }}>
        <h3 style={{ ...S.sectionTitle, color: "#1e3a8a" }}>9. Final Recommendation</h3>
        <p style={{ fontSize: 15, color: "#1e3a8a", lineHeight: 1.7, margin: 0 }}>
          {classification.final_recommendation || "—"}
        </p>
      </Card>

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
          {downloading ? "Downloading..." : "Download PDF Report"}
        </Button>
      </div>
    </Layout>
  );
}

// ─── Helper components ───────────────────────────────────────────────────────

function Row({ label, value, bold }) {
  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "9px 0",
      borderBottom: "1px solid #f3f4f6",
      gap: 16,
    }}>
      <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: 13, color: "#111827", fontWeight: bold ? 700 : 500, textAlign: "right" }}>
        {value ?? "—"}
      </span>
    </div>
  );
}

function SmallRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "3px 0" }}>
      <span style={{ color: "#6b7280" }}>{label}</span>
      <span style={{ fontWeight: 600, color: "#374151" }}>{value ?? "—"}</span>
    </div>
  );
}

function SustainCard({ label, value }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "16px",
      backgroundColor: "#f9fafb",
      borderRadius: 8,
    }}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#1d4ed8" }}>{value ?? "—"}</div>
      <div style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>{label}</div>
    </div>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const S = {
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 16px" },
  subLabel: {
    fontSize: 11, fontWeight: 700, textTransform: "uppercase",
    letterSpacing: "0.5px", color: "#6b7280", marginBottom: 8,
  },
  bodyText: { fontSize: 13, color: "#4b5563", lineHeight: 1.6, margin: 0 },
  imageAndMaterial: { display: "flex", gap: 28, flexWrap: "wrap", alignItems: "flex-start" },
  imageBox: { flex: "0 0 200px" },
  image: { width: "100%", borderRadius: 8, objectFit: "cover" },
  imageCaption: { fontSize: 11, color: "#9ca3af", marginTop: 6, textAlign: "center" },
  materialBox: { flex: 1, minWidth: 240 },
  grid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 },
  analysisPanel: {
    padding: 16, backgroundColor: "#f9fafb", borderRadius: 8,
    display: "flex", flexDirection: "column", gap: 4,
  },
  panelLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#6b7280", marginBottom: 6 },
  panelSub: { fontSize: 12, color: "#4b5563" },
  colorDots: { display: "flex", gap: 6, marginBottom: 6 },
  colorDot: { width: 24, height: 24, borderRadius: "50%", border: "1px solid #e5e7eb" },
  predRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 6 },
  predBarWrap: { flex: 1, height: 6, backgroundColor: "#e5e7eb", borderRadius: 3, overflow: "hidden" },
  predBar: { height: "100%", backgroundColor: "#1d4ed8", borderRadius: 3 },
  predPct: { fontSize: 11, fontWeight: 600, color: "#1d4ed8", width: 36, textAlign: "right" },
  tagRow: { display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 },
  tag: {
    fontSize: 12, padding: "4px 10px", borderRadius: 999,
    backgroundColor: "#dbeafe", color: "#1d4ed8", fontWeight: 500,
  },
  bulletRow: { display: "flex", gap: 8, alignItems: "flex-start", marginBottom: 6 },
  bullet: { width: 6, height: 6, borderRadius: "50%", backgroundColor: "#1d4ed8", flexShrink: 0, marginTop: 5 },
  sustainGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 8 },
  defectRow: {
    display: "flex", justifyContent: "space-between",
    padding: "6px 0", borderBottom: "1px solid #f3f4f6", fontSize: 13,
  },
  noDefects: { fontSize: 13, color: "#16a34a", fontWeight: 600, padding: "12px 0" },
  scoresGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 14, marginBottom: 20 },
  scoreCard: { textAlign: "center" },
  scoreValue: { fontSize: 26, fontWeight: 800, padding: "18px 12px", borderRadius: 10 },
  scoreLabel: { fontSize: 11, fontWeight: 600, color: "#6b7280", marginTop: 6 },
  circularityRow: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "12px 16px",
    backgroundColor: "#f9fafb", borderRadius: 8, marginBottom: 4,
  },
  breakdownRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 8 },
  breakdownLabel: { fontSize: 12, color: "#374151", width: 180, flexShrink: 0 },
  breakdownWeight: { color: "#9ca3af", fontSize: 11 },
  breakdownBarWrap: { flex: 1, height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden" },
  breakdownBar: { height: "100%", borderRadius: 4 },
  breakdownScore: { fontSize: 13, fontWeight: 700, width: 28, textAlign: "right" },
};