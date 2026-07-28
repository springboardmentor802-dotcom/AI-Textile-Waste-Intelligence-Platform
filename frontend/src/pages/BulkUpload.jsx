import React, { useState, useRef } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import Button from "../components/Button";
import Table from "../components/Table";
import { ToastContainer, useToast } from "../components/Toast";
import Badge from "../components/Badge";
import { uploadBulkFiles, downloadPdfReport } from "../services/analysisService";
import { FiUpload, FiDownload, FiTrash2 } from "react-icons/fi";

export default function BulkUpload() {
  const { toasts, add, remove } = useToast();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const imageFiles = selectedFiles.filter((f) => f.type.startsWith("image/"));

    if (imageFiles.length === 0) {
      add("No image files selected.", "error");
      return;
    }

    if (imageFiles.length > 10) {
      add("Maximum 10 files allowed.", "error");
      return;
    }

    const validFiles = imageFiles.filter((f) => {
      if (f.size > 10 * 1024 * 1024) {
        add(`${f.name} exceeds 10 MB limit.`, "error");
        return false;
      }
      return true;
    });

    setFiles(validFiles);
    setResults(null);
  };

  const handleUpload = async () => {
    if (files.length === 0) {
      add("Please select at least 1 file.", "error");
      return;
    }

    setUploading(true);
    try {
      const data = await uploadBulkFiles(files);
      setResults(data);
      add(`Processed ${data.successful} out of ${data.total_uploaded} files.`);
    } catch (err) {
      add(err?.response?.data?.detail || "Bulk upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadPdf = async (sessionId) => {
    try {
      const pdfBlob = await downloadPdfReport(sessionId);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `textile_report_${sessionId.slice(0, 8)}.pdf`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      add("Failed to download PDF.", "error");
    }
  };

  const CATEGORY_PRESET = {
    Reusable: "success",
    Recyclable: "info",
    Repairable: "warning",
    Upcyclable: "warning",
    Compostable: "success",
  };

  const scoreColor = (score) => {
    if (score >= 75) return "#059669";
    if (score >= 50) return "#d97706";
    return "#dc2626";
  };

  return (
    <Layout title="Bulk Upload">
      <ToastContainer toasts={toasts} onClose={remove} />

      <PageHeader
        title="Bulk Image Analysis"
        subtitle="Upload up to 10 textile images at once"
      />

      {!results ? (
        <Card style={{ maxWidth: 600, margin: "0 auto" }} padding="40px">
          <div
            style={S.uploadZone}
            onClick={() => fileInputRef.current?.click()}
            onDrop={(e) => {
              e.preventDefault();
              const droppedFiles = Array.from(e.dataTransfer.files || []);
              const event = { target: { files: droppedFiles } };
              handleFileChange(event);
            }}
            onDragOver={(e) => e.preventDefault()}
          >
            <FiUpload size={48} color="#1d4ed8" style={S.uploadIcon} />
            <h3 style={S.uploadTitle}>Drop images here or click to select</h3>
            <p style={S.uploadSubtitle}>
              Multiple image upload (up to 10 files, 10 MB each)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
          </div>

          {files.length > 0 && (
            <>
              <div style={S.fileList}>
                <div style={S.fileListTitle}>Selected Files ({files.length})</div>
                {files.map((f) => (
                  <div key={f.name} style={S.fileItem}>
                    <span>{f.name}</span>
                    <span style={S.fileSize}>{(f.size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                ))}
              </div>

              <div style={S.actions}>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setFiles([]);
                    fileInputRef.current.value = "";
                  }}
                >
                  Clear Selection
                </Button>
                <Button onClick={handleUpload} disabled={uploading}>
                  {uploading ? `Processing (${files.length})...` : `Analyze ${files.length} Image${files.length !== 1 ? "s" : ""}`}
                </Button>
              </div>
            </>
          )}
        </Card>
      ) : (
        <Card padding="24px">
          <h3 style={S.resultTitle}>Bulk Analysis Results</h3>
          <div style={S.resultSummary}>
            <div style={S.summaryCard}>
              <div style={S.summaryValue}>{results.total_uploaded}</div>
              <div style={S.summaryLabel}>Total Uploaded</div>
            </div>
            <div style={S.summaryCard}>
              <div style={{ ...S.summaryValue, color: "#059669" }}>
                {results.successful}
              </div>
              <div style={S.summaryLabel}>Successful</div>
            </div>
            <div style={S.summaryCard}>
              <div style={{ ...S.summaryValue, color: "#dc2626" }}>
                {results.failed}
              </div>
              <div style={S.summaryLabel}>Failed</div>
            </div>
          </div>

          <Table
            columns={[
              {
                key: "filename",
                label: "Filename",
                render: (v) => <span style={{ fontWeight: 600 }}>{v}</span>,
              },
              { key: "status", label: "Status", render: (v) => (
                <Badge label={v === "success" ? "Processed" : "Failed"} 
                  preset={v === "success" ? "success" : "danger"} />
              ) },
              {
                key: "material",
                label: "Material",
                render: (v) => v || "—",
              },
              {
                key: "confidence",
                label: "Confidence",
                render: (v) => (v ? `${v}%` : "—"),
              },
              {
                key: "waste_category",
                label: "Category",
                render: (v) => (v ? (
                  <Badge label={v} preset={CATEGORY_PRESET[v] || "gray"} />
                ) : "—"),
              },
              {
                key: "circularity_score",
                label: "Score",
                render: (v) => (v ? (
                  <span style={{ color: scoreColor(v), fontWeight: 700 }}>
                    {v}
                  </span>
                ) : "—"),
              },
              {
                key: "_actions",
                label: "Actions",
                render: (_, row) => row.session_id ? (
                  <Button
                    size="sm"
                    variant="ghost"
                    icon={FiDownload}
                    onClick={() => handleDownloadPdf(row.session_id)}
                  >
                    PDF
                  </Button>
                ) : "—",
              },
            ]}
            data={results.results}
            emptyMessage="No results."
          />

          <div style={S.actions}>
            <Button
              variant="secondary"
              onClick={() => {
                setFiles([]);
                setResults(null);
                fileInputRef.current.value = "";
              }}
            >
              Upload More Files
            </Button>
          </div>
        </Card>
      )}
    </Layout>
  );
}

const S = {
  uploadZone: {
    border: "2px dashed #d1d5db",
    borderRadius: 12,
    padding: "48px 32px",
    textAlign: "center",
    cursor: "pointer",
    backgroundColor: "#f9fafb",
  },
  uploadIcon: { marginBottom: 16 },
  uploadTitle: { fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 8px" },
  uploadSubtitle: { fontSize: 14, color: "#6b7280", margin: 0 },
  fileList: { marginTop: 24, padding: "16px", backgroundColor: "#f9fafb", borderRadius: 8 },
  fileListTitle: { fontSize: 12, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", marginBottom: 10 },
  fileItem: { display: "flex", justifyContent: "space-between", fontSize: 13, padding: "8px 0" },
  fileSize: { color: "#6b7280", fontSize: 12 },
  actions: { display: "flex", gap: 10, marginTop: 20 },
  resultTitle: { fontSize: 18, fontWeight: 700, color: "#111827", margin: "0 0 20px" },
  resultSummary: { display: "flex", gap: 16, marginBottom: 24 },
  summaryCard: { flex: 1, textAlign: "center", padding: "16px", backgroundColor: "#f9fafb", borderRadius: 8 },
  summaryValue: { fontSize: 24, fontWeight: 800, color: "#1d4ed8" },
  summaryLabel: { fontSize: 12, color: "#6b7280", marginTop: 6 },
};