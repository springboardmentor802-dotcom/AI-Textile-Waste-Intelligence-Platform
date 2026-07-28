import React, { useState, useRef } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import { ToastContainer, useToast } from "../components/Toast";
import { uploadForMaterialRecognition } from "../services/analysisService";
import { FiUpload, FiEye } from "react-icons/fi";

export default function UploadBatch() {
  const { toasts, add, remove } = useToast();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith("image/")) {
      add("Please upload an image file (JPEG, PNG, WEBP, BMP).", "error");
      return;
    }

    // Validate file size (10 MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      add("File size must be less than 10 MB.", "error");
      return;
    }

    setFile(selectedFile);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      add("Please select a file.", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await uploadForMaterialRecognition(file);
      setResult(data);
      add("Material recognition complete.");
    } catch (err) {
      add(err?.response?.data?.detail || "Upload failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeMore = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    fileInputRef.current?.click();
  };

  return (
    <Layout title="Textile Batch Upload">
      <ToastContainer toasts={toasts} onClose={remove} />

      <PageHeader
        title="Upload Textile Batch"
        subtitle="Upload an image to identify the textile material"
      />

      <div style={S.container}>
        {!result ? (
          <Card style={{ maxWidth: 600 }} padding="40px">
            <div
              style={S.uploadZone}
              onClick={() => fileInputRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                const droppedFile = e.dataTransfer.files?.[0];
                if (droppedFile) {
                  const changeEvent = {
                    target: { files: [droppedFile] },
                  };
                  handleFileChange(changeEvent);
                }
              }}
              onDragOver={(e) => e.preventDefault()}
            >
              <FiUpload size={48} color="#1d4ed8" style={S.uploadIcon} />
              <h3 style={S.uploadTitle}>Drop image here or click to upload</h3>
              <p style={S.uploadSubtitle}>
                Supported formats: JPEG, PNG, WEBP, BMP (max 10 MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
            </div>

            {preview && (
              <>
                <div style={S.previewWrap}>
                  <img src={preview} alt="Preview" style={S.previewImg} />
                  <div style={S.fileName}>{file?.name}</div>
                </div>

                <div style={S.actions}>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setFile(null);
                      setPreview(null);
                    }}
                  >
                    Change Image
                  </Button>
                  <Button onClick={handleUpload} disabled={loading}>
                    {loading ? "Analyzing..." : "Analyze Material"}
                  </Button>
                </div>
              </>
            )}
          </Card>
        ) : (
          <Card style={{ maxWidth: 700 }} padding="32px">
            <div style={S.resultWrap}>
              <div style={S.resultLeft}>
                <img src={preview} alt="Analyzed" style={S.resultImg} />
              </div>

              <div style={S.resultRight}>
                <h3 style={S.resultTitle}>Material Recognized</h3>

                <div style={S.resultRow}>
                  <span style={S.resultLabel}>Material Type</span>
                  <span style={S.resultValue}>
                    {result.predicted_material}
                  </span>
                </div>

                <div style={S.resultRow}>
                  <span style={S.resultLabel}>Confidence</span>
                  <span style={{ ...S.resultValue, color: "#059669" }}>
                    {result.confidence}%
                  </span>
                </div>

                <div style={S.topPredictions}>
                  <div style={S.predLabel}>Top Predictions</div>
                  {result.all_predictions?.slice(0, 3).map((pred) => (
                    <div key={pred.material} style={S.predItem}>
                      <span>{pred.material}</span>
                      <span style={S.predConf}>{pred.confidence}%</span>
                    </div>
                  ))}
                </div>

                <div style={S.actions}>
                  <Button
                    variant="secondary"
                    onClick={handleAnalyzeMore}
                  >
                    Analyze Another
                  </Button>
                  <Button icon={FiEye}>View Full Report</Button>
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
    minHeight: "60vh",
  },
  uploadZone: {
    border: "2px dashed #d1d5db",
    borderRadius: 12,
    padding: "48px 32px",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: "#f9fafb",
    transition: "all 0.2s",
    ":hover": { borderColor: "#1d4ed8", backgroundColor: "#f0f9ff" },
  },
  uploadIcon: { marginBottom: 16 },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 8px",
  },
  uploadSubtitle: { fontSize: 14, color: "#6b7280", margin: 0 },
  previewWrap: { marginTop: 24, textAlign: "center" },
  previewImg: { maxWidth: "100%", maxHeight: 200, borderRadius: 8 },
  fileName: { fontSize: 12, color: "#6b7280", marginTop: 8 },
  resultWrap: { display: "flex", gap: 32, alignItems: "flex-start" },
  resultLeft: { flex: "0 0 200px" },
  resultImg: { width: "100%", borderRadius: 8 },
  resultRight: { flex: 1 },
  resultTitle: { fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 16px" },
  resultRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  resultLabel: { fontSize: 13, color: "#6b7280", fontWeight: 500 },
  resultValue: { fontSize: 14, color: "#111827", fontWeight: 600 },
  topPredictions: { marginTop: 16, padding: "12px", backgroundColor: "#f9fafb", borderRadius: 8 },
  predLabel: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#6b7280", marginBottom: 8 },
  predItem: { display: "flex", justifyContent: "space-between", fontSize: 12, padding: "6px 0" },
  predConf: { fontWeight: 600, color: "#1d4ed8" },
  actions: { display: "flex", gap: 10, marginTop: 20 },
};