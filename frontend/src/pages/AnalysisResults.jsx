import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import { ToastContainer, useToast } from "../components/Toast";
import { downloadPdfReport } from "../services/analysisService";
import { FiDownload, FiArrowLeft, FiCheck, FiX } from "react-icons/fi";

export default function AnalysisResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toasts, add, remove } = useToast();

  const sessionId = searchParams.get("sessionId");
  const analysisData = searchParams.get("data")
    ? JSON.parse(decodeURIComponent(searchParams.get("data")))
    : null;

  const [downloading, setDownloading] = useState(false);

  if (!analysisData) {
    return (
      <Layout title="Analysis Results">
        <PageHeader title="No Analysis Data" subtitle="Return to upload to analyze an image." />
        <Card padding="40px" style={{ textAlign: "center", maxWidth: 500, margin: "0 auto" }}>
          <p style={{ color: "#6b7280", marginBottom: 16 }}>
            No analysis results found. Please upload an image first.
          </p>
          <Button onClick={() => navigate("/admin/analysis")}>
            Return to Upload
          </Button>
        </Card>
      </Layout>
    );
  }

  const material = analysisData.pipeline_result?.material_recognition || {};
  const defects = analysisData.pipeline_result?.defect_detection || {};
  const colors = analysisData.pipeline_result?.color_analysis || {};
  const texture = analysisData.pipeline_result?.texture_analysis || {};
  const pattern = analysisData.pipeline_result?.pattern_analysis || {};
  const waste = analysisData.pipeline_result?.waste_categorization || {};
  const recyclability = analysisData.pipeline_result?.recyclability_assessment || {};
  const sustainability = analysisData.pipeline_result?.sustainability_intelligence || {};
  const scores = analysisData.pipeline_result?.waste_scores || {};

  const handleDownloadPdf = async () => {
    if (!sessionId) {
      add("Session ID not found.", "error");
      return;
    }
    setDownloading(true);
    try {
      const pdfBlob = await downloadPdfReport(sessionId);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `textile_report_${sessionId.slice(0, 8)}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
      add("PDF downloaded successfully.");
    } catch (err) {
      add("Failed to download PDF.", "error");
    } finally {
      setDownloading(false);
    }
  };

  const CONDITION_COLOR = {
    Good: "#059669",
    Fair: "#d97706",
    Poor: "#dc2626",
  };

  const CATEGORY_PRESET = {
    Reusable: "success",
    Recyclable: "info",
    Repairable: "warning",
    Upcyclable: "warning",
    Compostable: "success",
  };

  const scoreBgColor = (score) => {
    if (score >= 75) return "#d1fae5";
    if (score >= 50) return "#fef3c7";
    return "#fee2e2";
  };

  const scoreTextColor = (score) => {
    if (score >= 75) return "#059669";
    if (score >= 50) return "#d97706";
    return "#dc2626";
  };

  return (
    <Layout title="Analysis Results">
      <ToastContainer toasts={toasts} onClose={remove} />

      <PageHeader
        title="Textile Image Analysis Results"
        subtitle={analysisData.filename || "Analysis Complete"}
        action={
          <Button icon={FiDownload} onClick={handleDownloadPdf} disabled={downloading}>
            {downloading ? "Downloading..." : "Download PDF Report"}
          </Button>
        }
      />

      {/* Section 1: Material Recognition */}
      <Card padding="24px" style={{ marginBottom: 20 }}>
        <h3 style={S.sectionTitle}>1. Material Recognition</h3>
        <div style={S.row}>
          <div style={S.col}>
            <div style={S.field}>
              <span style={S.label}>Predicted Material</span>
              <div style={S.value}>{material.predicted_material}</div>
            </div>
            <div style={S.field}>
              <span style={S.label}>Confidence</span>
              <div style={{ ...S.value, color: "#059669", fontSize: 18, fontWeight: 700 }}>
                {material.confidence}%
              </div>
            </div>
          </div>
          <div style={S.col}>
            <div style={S.label}>Top 3 Predictions</div>
            {material.all_predictions?.slice(0, 3).map((pred) => (
              <div key={pred.material} style={S.predRow}>
                <span>{pred.material}</span>
                <span style={S.predConf}>{pred.confidence}%</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Section 2: Defect Detection */}
      <Card padding="24px" style={{ marginBottom: 20 }}>
        <h3 style={S.sectionTitle}>2. Defect Detection</h3>
        <div style={S.row}>
          <div style={S.col}>
            <div style={S.field}>
              <span style={S.label}>Material Condition</span>
              <Badge
                label={defects.condition}
                preset={
                  defects.condition === "Good"
                    ? "success"
                    : defects.condition === "Fair"
                    ? "warning"
                    : "danger"
                }
              />
            </div>
            <div style={S.field}>
              <span style={S.label}>Defects Detected</span>
              <div style={S.value}>{defects.defect_count || 0}</div>
            </div>
          </div>
          {defects.defects?.length > 0 && (
            <div style={S.col}>
              <div style={S.label}>Detected Defects</div>
              {defects.defects.slice(0, 3).map((d, i) => (
                <div key={i} style={{ fontSize: 13, padding: "6px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <strong>{d.class_name}</strong> ({d.confidence}%)
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      {/* Section 3: Visual Analysis */}
      <Card padding="24px" style={{ marginBottom: 20 }}>
        <h3 style={S.sectionTitle}>3. Visual Analysis</h3>

        <div style={S.visualGrid}>
          <Card padding="16px" style={{ backgroundColor: "#f9fafb" }}>
            <div style={S.visualLabel}>Color Analysis</div>
            <div style={S.colorDots}>
              {colors.hex_colors?.slice(0, 5).map((hex) => (
                <div
                  key={hex}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: "50%",
                    backgroundColor: hex,
                    border: "1px solid #d1d5db",
                  }}
                  title={hex}
                />
              ))}
            </div>
            <div style={{ fontSize: 12, marginTop: 8, color: "#6b7280" }}>
              {colors.color_category}
            </div>
          </Card>

          <Card padding="16px" style={{ backgroundColor: "#f9fafb" }}>
            <div style={S.visualLabel}>Texture Analysis</div>
            <div style={S.field}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>Type</span>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                {texture.texture_type}
              </div>
            </div>
            <div style={S.field}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>Detail</span>
              <div style={{ fontSize: 12, marginTop: 4 }}>{texture.texture_detail}</div>
            </div>
          </Card>

          <Card padding="16px" style={{ backgroundColor: "#f9fafb" }}>
            <div style={S.visualLabel}>Pattern Analysis</div>
            <div style={S.field}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>Surface Pattern</span>
              <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>
                {pattern.surface_pattern}
              </div>
            </div>
            <div style={S.field}>
              <span style={{ fontSize: 11, color: "#6b7280" }}>Lines Detected</span>
              <div style={{ fontSize: 12, marginTop: 4 }}>
                {pattern.total_lines || 0} total
              </div>
            </div>
          </Card>
        </div>
      </Card>

      {/* Section 4: Waste Assessment */}
      <Card padding="24px" style={{ marginBottom: 20 }}>
        <h3 style={S.sectionTitle}>4. Waste Categorization</h3>
        <div style={S.row}>
          <div style={S.col}>
            <div style={S.field}>
              <span style={S.label}>Waste Category</span>
              <Badge
                label={waste.waste_category}
                preset={CATEGORY_PRESET[waste.waste_category] || "gray"}
                style={{ marginTop: 6 }}
              />
            </div>
            <div style={S.field}>
              <span style={S.label}>Justification</span>
              <div style={{ fontSize: 13, color: "#4b5563", marginTop: 6, lineHeight: 1.5 }}>
                {waste.justification}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 5: Recyclability */}
      <Card padding="24px" style={{ marginBottom: 20 }}>
        <h3 style={S.sectionTitle}>5. Recyclability Assessment</h3>
        <div style={S.row}>
          <div style={S.col}>
            <div style={S.field}>
              <span style={S.label}>Primary Strategy</span>
              <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6 }}>
                {recyclability.primary_recycling_strategy}
              </div>
            </div>
            <div style={S.field}>
              <span style={S.label}>Reuse Opportunity</span>
              <div style={{ fontSize: 13, color: "#4b5563", marginTop: 6 }}>
                {recyclability.reuse_opportunity}
              </div>
            </div>
          </div>
          <div style={S.col}>
            <div style={S.field}>
              <span style={S.label}>Upcycling Suggestion</span>
              <div style={{ fontSize: 13, color: "#4b5563", marginTop: 6, lineHeight: 1.5 }}>
                {recyclability.upcycling_suggestion}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Section 6: Sustainability */}
      <Card padding="24px" style={{ marginBottom: 20 }}>
        <h3 style={S.sectionTitle}>6. Sustainability Intelligence</h3>
        <div style={S.sustainGrid}>
          <div style={S.sustainCard}>
            <div style={S.sustainValue}>
              {sustainability.carbon_footprint_estimation?.co2_saved_kg || "—"}
            </div>
            <div style={S.sustainLabel}>CO₂ Saved (kg)</div>
          </div>
          <div style={S.sustainCard}>
            <div style={S.sustainValue}>
              {sustainability.water_savings?.liters_saved?.toLocaleString() || "—"}
            </div>
            <div style={S.sustainLabel}>Water Saved (L)</div>
          </div>
          <div style={S.sustainCard}>
            <div style={S.sustainValue}>
              {sustainability.waste_diversion_analysis?.diversion_rate}
            </div>
            <div style={S.sustainLabel}>Landfill Diversion</div>
          </div>
          <div style={S.sustainCard}>
            <div style={S.sustainValue}>
              {sustainability.circular_economy_analysis?.score}
            </div>
            <div style={S.sustainLabel}>Circular Score</div>
          </div>
        </div>
      </Card>

      {/* Section 7: Waste Scores */}
      <Card padding="24px" style={{ marginBottom: 20 }}>
        <h3 style={S.sectionTitle}>7. Waste Scoring</h3>
        <div style={S.scoresGrid}>
          {[
            { label: "Recyclability", value: scores.recyclability_score },
            { label: "Reuse", value: scores.reuse_score },
            { label: "Sustainability", value: scores.sustainability_score },
            { label: "Material Recovery", value: scores.material_recovery_score },
            { label: "Overall Circularity", value: scores.overall_circularity_score },
          ].map((score) => (
            <div key={score.label} style={S.scoreCard}>
              <div
                style={{
                  ...S.scoreValue,
                  backgroundColor: scoreBgColor(score.value),
                  color: scoreTextColor(score.value),
                }}
              >
                {score.value}
              </div>
              <div style={S.scoreLabel}>{score.label}</div>
            </div>
          ))}
        </div>
        <div style={S.circularityCategory}>
          <span style={S.categoryLabel}>Circularity Category</span>
          <span style={S.categoryValue}>{scores.circularity_category}</span>
        </div>
      </Card>

      {/* Section 8: Final Recommendation */}
      <Card padding="24px" style={{ backgroundColor: "#f0f9ff", borderLeft: "4px solid #1d4ed8" }}>
        <h3 style={S.sectionTitle}>8. Final Recommendation</h3>
        <p style={{ fontSize: 14, color: "#1e3a8a", lineHeight: 1.6, margin: 0 }}>
          {analysisData.waste_classification?.final_recommendation}
        </p>
      </Card>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
        <Button icon={FiArrowLeft} variant="secondary" onClick={() => navigate("/admin/analysis")}>
          Analyze Another Image
        </Button>
        <Button icon={FiDownload} onClick={handleDownloadPdf} disabled={downloading}>
          {downloading ? "Downloading..." : "Download PDF Report"}
        </Button>
      </div>
    </Layout>
  );
}

const S = {
  sectionTitle: { fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 16px" },
  row: { display: "flex", gap: 24, flexWrap: "wrap" },
  col: { flex: 1, minWidth: 250 },
  field: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase" },
  value: { fontSize: 16, fontWeight: 700, color: "#111827", marginTop: 6 },
  predRow: { display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0" },
  predConf: { fontWeight: 600, color: "#1d4ed8" },
  visualGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: 16,
  },
  visualLabel: { fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 8 },
  colorDots: { display: "flex", gap: 8 },
  sustainGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 16 },
  sustainCard: { textAlign: "center", padding: "16px", backgroundColor: "#f9fafb", borderRadius: 8 },
  sustainValue: { fontSize: 20, fontWeight: 700, color: "#1d4ed8" },
  sustainLabel: { fontSize: 11, color: "#6b7280", marginTop: 6 },
  scoresGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 16, marginBottom: 16 },
  scoreCard: { textAlign: "center" },
  scoreValue: { fontSize: 24, fontWeight: 800, padding: "20px", borderRadius: 10 },
  scoreLabel: { fontSize: 12, fontWeight: 600, color: "#6b7280", marginTop: 8 },
  circularityCategory: {
    display: "flex",
    justifyContent: "space-between",
    padding: "12px 16px",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  categoryLabel: { fontSize: 13, fontWeight: 600, color: "#6b7280" },
  categoryValue: { fontSize: 14, fontWeight: 700, color: "#1d4ed8" },
};