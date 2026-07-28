import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import { ToastContainer, useToast } from "../components/Toast";
import { uploadForFullAnalysis } from "../services/analysisService";
import { FiUpload, FiFileText, FiRefreshCw } from "react-icons/fi";

export default function UploadBatch() {
  const navigate = useNavigate();
  const { toasts, add, remove } = useToast();

  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith("image/")) {
      add("Please upload an image file (JPEG, PNG, WEBP, BMP).", "error");
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      add("File size must be less than 10 MB.", "error");
      return;
    }

    setFile(selectedFile);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (event) => setPreview(event.target.result);
    reader.readAsDataURL(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileChange({ target: { files: [droppedFile] } });
    }
  };

  const handleAnalyze = async () => {
    if (!file) { add("Please select an image file.", "error"); return; }
    setLoading(true);
    try {
      const data = await uploadForFullAnalysis(file);
      setResult(data);
      // Store full result in sessionStorage so AnalysisResults can read it
      sessionStorage.setItem("analysisResult", JSON.stringify(data));
      sessionStorage.setItem("analysisPreview", preview);
      add("Analysis complete.");
    } catch (err) {
      add(err?.response?.data?.detail || "Analysis failed. Check backend is running.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleViewReport = () => {
    if (!result?.session_id) {
      add("No session ID found. Please run analysis first.", "error");
      return;
    }
    navigate(`/analysis-results?sessionId=${result.session_id}`);
  };

  const handleReset = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <Layout title="Textile Image Analysis">
      <ToastContainer toasts={toasts} onClose={remove} />

      <PageHeader
        title="Textile Image Analysis"
        subtitle="Upload a textile image to run the complete analysis pipeline"
      />

      <div style={S.container}>
        {!result ? (
          <Card style={{ maxWidth: 600, margin: "0 auto", width: "100%" }} padding="40px">
            {/* Upload Zone */}
            <div
              style={S.uploadZone}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <FiUpload size={44} color="#1d4ed8" />
              <h3 style={S.uploadTitle}>Drop image here or click to upload</h3>
              <p style={S.uploadSubtitle}>
                JPEG, PNG, WEBP, BMP — max 10 MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            {/* Preview */}
            {preview && (
              <>
                <div style={S.previewWrap}>
                  <img src={preview} alt="Preview" style={S.previewImg} />
                  <div style={S.fileName}>{file?.name}</div>
                </div>
                <div style={S.actionRow}>
                  <Button variant="ghost" onClick={handleReset}>
                    Change Image
                  </Button>
                  <Button onClick={handleAnalyze} disabled={loading}>
                    {loading ? "Analyzing..." : "Run Full Analysis"}
                  </Button>
                </div>
              </>
            )}

            {/* Pipeline Info */}
            {!preview && (
              <div style={S.pipelineInfo}>
                <div style={S.pipelineTitle}>Analysis Pipeline</div>
                {[
                  "Material Recognition (CNN)",
                  "Defect Detection (YOLOv8)",
                  "Color Analysis (OpenCV)",
                  "Texture Analysis (GLCM)",
                  "Pattern Analysis (Hough)",
                  "Waste Categorization",
                  "Recyclability Assessment",
                  "Sustainability Intelligence",
                  "Waste Scoring",
                ].map((step) => (
                  <div key={step} style={S.pipelineStep}>
                    <div style={S.pipelineDot} />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : (
          /* Result Summary Card */
          <Card style={{ maxWidth: 700, margin: "0 auto", width: "100%" }} padding="32px">
            <div style={S.resultLayout}>
              {/* Image */}
              <div style={S.resultImageWrap}>
                <img src={preview} alt="Analyzed" style={S.resultImage} />
              </div>

              {/* Summary */}
              <div style={S.resultInfo}>
                <h3 style={S.resultTitle}>Analysis Complete</h3>

                <div style={S.resultRow}>
                  <span style={S.resultLabel}>Material</span>
                  <span style={S.resultValue}>
                    {result.pipeline_result?.material_recognition?.predicted_material || "—"}
                  </span>
                </div>

                <div style={S.resultRow}>
                  <span style={S.resultLabel}>Confidence</span>
                  <span style={{ ...S.resultValue, color: "#16a34a", fontWeight: 700 }}>
                    {result.pipeline_result?.material_recognition?.confidence || "—"}%
                  </span>
                </div>

                <div style={S.resultRow}>
                  <span style={S.resultLabel}>Condition</span>
                  <span style={S.resultValue}>
                    {result.pipeline_result?.defect_detection?.condition || "—"}
                  </span>
                </div>

                <div style={S.resultRow}>
                  <span style={S.resultLabel}>Waste Category</span>
                  <span style={S.resultValue}>
                    {result.pipeline_result?.waste_categorization?.waste_category || "—"}
                  </span>
                </div>

                <div style={S.resultRow}>
                  <span style={S.resultLabel}>Circularity Score</span>
                  <span style={{ ...S.resultValue, color: "#1d4ed8", fontWeight: 700 }}>
                    {result.pipeline_result?.waste_scores?.overall_circularity_score || "—"}/100
                  </span>
                </div>

                <div style={S.buttonRow}>
                  <Button
                    variant="secondary"
                    icon={FiRefreshCw}
                    onClick={handleReset}
                  >
                    Analyze Another
                  </Button>
                  <Button
                    icon={FiFileText}
                    onClick={handleViewReport}
                  >
                    View Full Report
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}

const S = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
  },
  uploadZone: {
    border: "2px dashed #d1d5db",
    borderRadius: 12,
    padding: "48px 32px",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: "#f8fafc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#111827",
    margin: 0,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    margin: 0,
  },
  previewWrap: {
    textAlign: "center",
    marginTop: 20,
  },
  previewImg: {
    maxWidth: "100%",
    maxHeight: 200,
    borderRadius: 8,
    objectFit: "contain",
  },
  fileName: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 8,
  },
  actionRow: {
    display: "flex",
    gap: 10,
    justifyContent: "flex-end",
    marginTop: 16,
  },
  pipelineInfo: {
    marginTop: 24,
    padding: 16,
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  pipelineTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: 10,
  },
  pipelineStep: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "#4b5563",
    padding: "4px 0",
  },
  pipelineDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "#1d4ed8",
    flexShrink: 0,
  },
  resultLayout: {
    display: "flex",
    gap: 28,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  resultImageWrap: {
    flex: "0 0 200px",
  },
  resultImage: {
    width: "100%",
    borderRadius: 8,
    objectFit: "cover",
  },
  resultInfo: {
    flex: 1,
    minWidth: 220,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 16px",
  },
  resultRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "9px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  resultLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 500,
  },
  resultValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: 600,
  },
  buttonRow: {
    display: "flex",
    gap: 10,
    marginTop: 20,
    flexWrap: "wrap",
  },
};