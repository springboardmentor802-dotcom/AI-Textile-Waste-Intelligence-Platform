import React, { useState, useRef, useCallback } from "react";
import { recognizeMaterial } from "../services/analysisService";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import Badge from "../components/Badge";
import { ToastContainer, useToast } from "../components/Toast";
import {
  FiUpload,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiImage,
  FiZap,
  FiList,
} from "react-icons/fi";

// Accepted file types shown in the UI
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/bmp"];
const ACCEPTED_EXTENSIONS = ".jpg, .jpeg, .png, .webp, .bmp";
const MAX_SIZE_MB = 10;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

// Confidence thresholds for badge display
const getConfidenceBadgePreset = (confidence) => {
  if (confidence >= 75) return "success";
  if (confidence >= 50) return "warning";
  return "danger";
};

// Confidence thresholds for the bar color
const getBarColor = (confidence) => {
  if (confidence >= 75) return "#16a34a";
  if (confidence >= 50) return "#d97706";
  return "#dc2626";
};

export default function MaterialRecognition() {
  const { toasts, add, remove } = useToast();

  // Upload state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  // Analysis state
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  // Show all predictions toggle
  const [showAllPredictions, setShowAllPredictions] = useState(false);

  const fileInputRef = useRef(null);

  // ---------------------------------------------------------------- //
  // File validation
  // ---------------------------------------------------------------- //
  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return `Unsupported file type: ${file.type}. Please upload JPEG, PNG, WEBP, or BMP.`;
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File size exceeds ${MAX_SIZE_MB} MB limit.`;
    }
    return null;
  };

  // ---------------------------------------------------------------- //
  // File selection handler (shared by input and drag-drop)
  // ---------------------------------------------------------------- //
  const handleFileSelect = useCallback((file) => {
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      add(validationError, "error");
      return;
    }

    // Clear previous result when a new file is selected
    setSelectedFile(file);
    setResult(null);
    setError("");
    setShowAllPredictions(false);

    // Generate preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  }, [add]);

  // ---------------------------------------------------------------- //
  // Input change handler
  // ---------------------------------------------------------------- //
  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    // Reset input so the same file can be re-selected if needed
    e.target.value = "";
  };

  // ---------------------------------------------------------------- //
  // Drag and drop handlers
  // ---------------------------------------------------------------- //
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelect(file);
  };

  // ---------------------------------------------------------------- //
  // Clear selected image
  // ---------------------------------------------------------------- //
  const handleClear = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError("");
    setShowAllPredictions(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  };

  // ---------------------------------------------------------------- //
  // Submit image for analysis
  // ---------------------------------------------------------------- //
  const handleAnalyze = async () => {
    if (!selectedFile) {
      add("Please select an image before analyzing.", "error");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await recognizeMaterial(selectedFile);
      setResult(data);
      add("Analysis completed successfully.");
    } catch (err) {
      const status = err?.response?.status;
      let msg = "Analysis failed. Please try again.";

      if (status === 503) {
        msg = "ML service is currently unavailable. Please contact the administrator.";
      } else if (status === 415) {
        msg = "Unsupported image format. Please upload JPEG, PNG, WEBP, or BMP.";
      } else if (status === 413) {
        msg = "Image file is too large. Maximum allowed size is 10 MB.";
      } else if (status === 422) {
        msg = "Image could not be processed. Please try a different image.";
      } else if (err?.response?.data?.detail) {
        msg = err.response.data.detail;
      }

      setError(msg);
      add(msg, "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------------- //
  // Determine how many predictions to show
  // ---------------------------------------------------------------- //
  const predictionsToShow = result
    ? showAllPredictions
      ? result.all_predictions
      : result.all_predictions.slice(0, 5)
    : [];

  return (
    <>
      <ToastContainer toasts={toasts} onClose={remove} />

      <PageHeader
        title="Material Recognition"
        subtitle="Upload a fabric image to identify the material type using AI"
      />

      <div style={S.layout}>
        {/* -------------------------------------------------------- */}
        {/* LEFT COLUMN — Upload panel                               */}
        {/* -------------------------------------------------------- */}
        <div style={S.leftCol}>
          <Card padding="24px">
            <div style={S.sectionHeader}>
              <FiUpload size={16} color="#1d4ed8" />
              <span style={S.sectionTitle}>Upload Fabric Image</span>
            </div>

            {/* Drop zone */}
            <div
              style={{
                ...S.dropZone,
                borderColor: dragOver
                  ? "#1d4ed8"
                  : selectedFile
                  ? "#16a34a"
                  : "#d1d5db",
                backgroundColor: dragOver
                  ? "#eff6ff"
                  : selectedFile
                  ? "#f0fdf4"
                  : "#fafafa",
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !selectedFile && fileInputRef.current?.click()}
            >
              {selectedFile && previewUrl ? (
                /* Image preview */
                <div style={S.previewWrap}>
                  <img
                    src={previewUrl}
                    alt="Selected fabric"
                    style={S.previewImg}
                  />
                  <div style={S.previewMeta}>
                    <div style={S.previewName}>{selectedFile.name}</div>
                    <div style={S.previewSize}>
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
              ) : (
                /* Upload prompt */
                <div style={S.uploadPrompt}>
                  <div style={S.uploadIconWrap}>
                    <FiImage size={28} color="#9ca3af" />
                  </div>
                  <div style={S.uploadText}>
                    Drag and drop an image here, or click to browse
                  </div>
                  <div style={S.uploadHint}>
                    Supported: {ACCEPTED_EXTENSIONS} &nbsp;·&nbsp; Max {MAX_SIZE_MB} MB
                  </div>
                </div>
              )}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_EXTENSIONS}
              onChange={handleInputChange}
              style={{ display: "none" }}
            />

            {/* Action buttons */}
            <div style={S.buttonRow}>
              {!selectedFile ? (
                <Button
                  icon={FiUpload}
                  onClick={() => fileInputRef.current?.click()}
                  style={{ width: "100%" }}
                >
                  Select Image
                </Button>
              ) : (
                <>
                  <Button
                    icon={FiX}
                    variant="ghost"
                    onClick={handleClear}
                    disabled={loading}
                  >
                    Clear
                  </Button>
                  <Button
                    icon={FiZap}
                    onClick={handleAnalyze}
                    disabled={loading}
                    style={{ flex: 1 }}
                  >
                    {loading ? "Analyzing..." : "Analyze Material"}
                  </Button>
                </>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div style={S.errorBox}>
                <FiAlertCircle size={14} />
                <span>{error}</span>
              </div>
            )}
          </Card>

          {/* Information card */}
          <Card padding="20px" style={{ marginTop: 16 }}>
            <div style={S.infoTitle}>About This Module</div>
            <div style={S.infoList}>
              {[
                "CNN model trained on 5,861 fabric images",
                "Classifies 18 fabric material types",
                "Image input: 224 × 224 pixels",
                "Returns confidence score per class",
                "Future: Color, texture, damage detection",
              ].map((item) => (
                <div key={item} style={S.infoItem}>
                  <div style={S.infoDot} />
                  <span style={S.infoText}>{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* -------------------------------------------------------- */}
        {/* RIGHT COLUMN — Results panel                             */}
        {/* -------------------------------------------------------- */}
        <div style={S.rightCol}>
          {/* Loading state */}
          {loading && (
            <Card padding="32px">
              <div style={S.loadingWrap}>
                <div style={S.spinner} />
                <div style={S.loadingTitle}>Analyzing image...</div>
                <div style={S.loadingSubtitle}>
                  The model is processing your image. This may take a few seconds.
                </div>
              </div>
            </Card>
          )}

          {/* Empty state — no result yet */}
          {!loading && !result && (
            <Card padding="32px">
              <div style={S.emptyWrap}>
                <div style={S.emptyIconWrap}>
                  <FiImage size={28} color="#9ca3af" />
                </div>
                <div style={S.emptyTitle}>No Analysis Yet</div>
                <div style={S.emptySubtitle}>
                  Upload a fabric image and click Analyze Material to see the results here.
                </div>
              </div>
            </Card>
          )}

          {/* Results */}
          {!loading && result && (
            <>
              {/* Top prediction */}
              <Card padding="24px" style={{ marginBottom: 16 }}>
                <div style={S.sectionHeader}>
                  <FiCheckCircle size={16} color="#16a34a" />
                  <span style={S.sectionTitle}>Analysis Result</span>
                  <Badge
                    label="Complete"
                    preset="success"
                    style={{ marginLeft: "auto" }}
                  />
                </div>

                <div style={S.resultMain}>
                  <div style={S.resultLabel}>Predicted Material</div>
                  <div style={S.resultMaterial}>{result.predicted_material}</div>

                  <div style={S.confidenceRow}>
                    <div style={S.confidenceLabel}>Confidence</div>
                    <Badge
                      label={`${result.confidence}%`}
                      preset={getConfidenceBadgePreset(result.confidence)}
                    />
                  </div>

                  {/* Confidence bar */}
                  <div style={S.barWrap}>
                    <div style={S.barTrack}>
                      <div
                        style={{
                          ...S.barFill,
                          width: `${Math.min(result.confidence, 100)}%`,
                          backgroundColor: getBarColor(result.confidence),
                        }}
                      />
                    </div>
                    <div style={S.barPercent}>{result.confidence}%</div>
                  </div>
                </div>

                {/* Metadata */}
                <div style={S.metaGrid}>
                  <div style={S.metaItem}>
                    <div style={S.metaLabel}>File</div>
                    <div style={S.metaValue}>{result.filename || selectedFile?.name || "—"}</div>
                  </div>
                  <div style={S.metaItem}>
                    <div style={S.metaLabel}>Model Version</div>
                    <div style={S.metaValue}>{result.model_version}</div>
                  </div>
                  <div style={S.metaItem}>
                    <div style={S.metaLabel}>Classes</div>
                    <div style={S.metaValue}>{result.classes_count}</div>
                  </div>
                  <div style={S.metaItem}>
                    <div style={S.metaLabel}>Analyzed By</div>
                    <div style={S.metaValue}>{result.analyzed_by || "—"}</div>
                  </div>
                </div>
              </Card>

              {/* All predictions */}
              <Card padding="24px">
                <div style={S.sectionHeader}>
                  <FiList size={16} color="#1d4ed8" />
                  <span style={S.sectionTitle}>All Predictions</span>
                  <span style={S.predCount}>
                    Showing {predictionsToShow.length} of {result.all_predictions.length}
                  </span>
                </div>

                <div style={S.predList}>
                  {predictionsToShow.map((pred, index) => (
                    <div key={pred.material} style={S.predRow}>
                      <div style={S.predRank}>
                        {index + 1 === 1 && pred.material === result.predicted_material
                          ? <span style={S.topBadge}>Top</span>
                          : <span style={S.rankNum}>{index + 1}</span>
                        }
                      </div>
                      <div style={S.predName}>{pred.material}</div>
                      <div style={S.predBarWrap}>
                        <div style={S.predBarTrack}>
                          <div
                            style={{
                              ...S.predBarFill,
                              width: `${Math.min(pred.confidence, 100)}%`,
                              backgroundColor:
                                pred.material === result.predicted_material
                                  ? "#1d4ed8"
                                  : "#d1d5db",
                            }}
                          />
                        </div>
                      </div>
                      <div style={S.predConfidence}>{pred.confidence}%</div>
                    </div>
                  ))}
                </div>

                {result.all_predictions.length > 5 && (
                  <button
                    style={S.toggleBtn}
                    onClick={() => setShowAllPredictions((p) => !p)}
                  >
                    {showAllPredictions
                      ? "Show Less"
                      : `Show All ${result.all_predictions.length} Classes`}
                  </button>
                )}
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Inline spinner keyframe */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}

const S = {
  layout: {
    display: "flex",
    gap: 20,
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  leftCol: {
    width: 380,
    flexShrink: 0,
  },
  rightCol: {
    flex: 1,
    minWidth: 300,
  },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
  },
  // Drop zone
  dropZone: {
    border: "2px dashed",
    borderRadius: 10,
    padding: "24px 16px",
    cursor: "pointer",
    transition: "border-color 0.2s, background-color 0.2s",
    minHeight: 180,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  uploadPrompt: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    textAlign: "center",
  },
  uploadIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  uploadText: {
    fontSize: 14,
    color: "#4b5563",
    fontWeight: 500,
    lineHeight: 1.5,
  },
  uploadHint: {
    fontSize: 12,
    color: "#9ca3af",
  },
  previewWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
    width: "100%",
  },
  previewImg: {
    maxWidth: "100%",
    maxHeight: 200,
    borderRadius: 8,
    objectFit: "contain",
    border: "1px solid #e5e7eb",
  },
  previewMeta: {
    textAlign: "center",
  },
  previewName: {
    fontSize: 13,
    fontWeight: 600,
    color: "#374151",
    wordBreak: "break-all",
  },
  previewSize: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 2,
  },
  buttonRow: {
    display: "flex",
    gap: 10,
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#dc2626",
    borderRadius: 7,
    padding: "10px 14px",
    fontSize: 13,
    marginTop: 14,
  },
  // Info card
  infoTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#374151",
    marginBottom: 12,
  },
  infoList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  infoItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
  },
  infoDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    backgroundColor: "#1d4ed8",
    flexShrink: 0,
    marginTop: 5,
  },
  infoText: {
    fontSize: 13,
    color: "#6b7280",
    lineHeight: 1.5,
  },
  // Loading state
  loadingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 14,
    padding: "20px 0",
  },
  spinner: {
    width: 36,
    height: 36,
    border: "3px solid #dbeafe",
    borderTop: "3px solid #1d4ed8",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
  loadingTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#111827",
  },
  loadingSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 1.5,
  },
  // Empty state
  emptyWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: "24px 0",
  },
  emptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    backgroundColor: "#f3f4f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: "#374151",
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#9ca3af",
    textAlign: "center",
    lineHeight: 1.6,
    maxWidth: 300,
  },
  // Result — top prediction
  resultMain: {
    backgroundColor: "#f9fafb",
    border: "1px solid #f3f4f6",
    borderRadius: 10,
    padding: "20px",
    marginBottom: 20,
  },
  resultLabel: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: 6,
  },
  resultMaterial: {
    fontSize: 26,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 14,
  },
  confidenceRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  confidenceLabel: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: 500,
  },
  barWrap: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  barTrack: {
    flex: 1,
    height: 8,
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.4s ease",
  },
  barPercent: {
    fontSize: 12,
    fontWeight: 700,
    color: "#374151",
    width: 38,
    textAlign: "right",
  },
  // Metadata grid
  metaGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px 20px",
  },
  metaItem: {},
  metaLabel: {
    fontSize: 11,
    color: "#9ca3af",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 13,
    color: "#374151",
    fontWeight: 500,
    wordBreak: "break-all",
  },
  // All predictions list
  predCount: {
    marginLeft: "auto",
    fontSize: 12,
    color: "#9ca3af",
  },
  predList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  predRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  predRank: {
    width: 28,
    display: "flex",
    justifyContent: "center",
    flexShrink: 0,
  },
  topBadge: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
    fontSize: 10,
    fontWeight: 700,
    padding: "2px 6px",
    borderRadius: 999,
  },
  rankNum: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: 500,
  },
  predName: {
    width: 100,
    flexShrink: 0,
    fontSize: 13,
    color: "#374151",
    fontWeight: 500,
  },
  predBarWrap: {
    flex: 1,
  },
  predBarTrack: {
    height: 6,
    backgroundColor: "#f3f4f6",
    borderRadius: 999,
    overflow: "hidden",
  },
  predBarFill: {
    height: "100%",
    borderRadius: 999,
    transition: "width 0.3s ease",
    minWidth: 2,
  },
  predConfidence: {
    width: 44,
    textAlign: "right",
    fontSize: 12,
    color: "#6b7280",
    fontWeight: 500,
    flexShrink: 0,
  },
  toggleBtn: {
    marginTop: 14,
    width: "100%",
    padding: "8px",
    background: "none",
    border: "1px solid #e5e7eb",
    borderRadius: 7,
    fontSize: 13,
    color: "#1d4ed8",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
};