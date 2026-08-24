import { useRef, useState, useMemo, useCallback, memo } from "react";
import {
  UploadCloud,
  X,
  Sparkles,
  Trash2,
  FileDown,
  FileStack,
  Recycle,
  Leaf,
  Droplet,
  Repeat,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { predictFabric } from "../services/api";
import { downloadPredictionPdf, downloadBatchPredictionsReport } from "../utils/pdfReport";
import { getMaterialTypeInfo } from "../data/materialInfo";
import { normalizeRecyclability } from "../utils/reportHelpers";
import "./BatchPrediction.css";

const DONUT_COLORS = ["#2e7d32", "#7c3aed", "#3b82f6", "#d6336c", "#f59e0b", "#0891b2"];
const CONCURRENCY = 3;

async function runWithConcurrency(list, worker, concurrency) {
  let nextIndex = 0;
  async function runNext() {
    while (nextIndex < list.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      // eslint-disable-next-line no-await-in-loop
      await worker(list[currentIndex], currentIndex);
    }
  }
  const runners = Array.from({ length: Math.min(concurrency, list.length) }, runNext);
  await Promise.all(runners);
}

function BatchPrediction() {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  // Each item: { id, file, previewUrl, status: "pending"|"done"|"error", result }
  const [items, setItems] = useState([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [progress, setProgress] = useState({ completed: 0, total: 0 });
  const [batchMessage, setBatchMessage] = useState(null); // { type: "success"|"partial", text }
  const [expandedIds, setExpandedIds] = useState(() => new Set());
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // --- File selection / drag & drop ---
  const addFiles = useCallback((fileList) => {
    const imageFiles = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
    const newItems = imageFiles.map((file) => ({
      id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      previewUrl: URL.createObjectURL(file),
      status: "pending",
      result: null,
    }));
    setItems((prev) => [...prev, ...newItems]);
    setBatchMessage(null);
  }, []);

  const handleFileInputChange = useCallback(
    (event) => {
      if (event.target.files?.length) {
        addFiles(event.target.files);
        event.target.value = "";
      }
    },
    [addFiles]
  );

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);
      if (event.dataTransfer.files?.length) {
        addFiles(event.dataTransfer.files);
      }
    },
    [addFiles]
  );

  const handleBrowseClick = useCallback(() => fileInputRef.current?.click(), []);

  const handleRemoveItem = useCallback((id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setExpandedIds((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const handleClearAll = useCallback(() => {
    setItems([]);
    setProgress({ completed: 0, total: 0 });
    setBatchMessage(null);
    setExpandedIds(new Set());
  }, []);

  const toggleExpanded = useCallback((id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  // --- Run predictions ---
  // Each item is predicted individually via the SAME predictFabric() call
  // used by the Single Image page (no new/changed API surface). Updating
  // state per-item as each one resolves gives live progress and lets
  // unaffected rows skip re-rendering (see BatchTableRow's React.memo below).
  const handlePredictAll = useCallback(async () => {
    if (items.length === 0 || isPredicting) return;

    setIsPredicting(true);
    setBatchMessage(null);
    setProgress({ completed: 0, total: items.length });

    let completedCount = 0;
    let failedCount = 0;
    const totalCount = items.length;

    await runWithConcurrency(
      items,
      async (item) => {
        const startTime = performance.now();
        try {
          const data = await predictFabric(item.file);
          const elapsedSeconds = (performance.now() - startTime) / 1000;
          setItems((prev) =>
            prev.map((i) =>
              i.id === item.id
                ? { ...i, status: "done", result: data, processingTimeSeconds: elapsedSeconds }
                : i
            )
          );
        } catch {
          failedCount += 1;
          setItems((prev) =>
            prev.map((i) => (i.id === item.id ? { ...i, status: "error", result: null } : i))
          );
        } finally {
          completedCount += 1;
          setProgress({ completed: completedCount, total: totalCount });
        }
      },
      CONCURRENCY
    );

    setIsPredicting(false);
    setBatchMessage(
      failedCount === 0
        ? { type: "success", text: `All ${totalCount} images processed successfully.` }
        : {
            type: "partial",
            text: `${totalCount - failedCount} of ${totalCount} images processed successfully. ${failedCount} failed.`,
          }
    );
  }, [items, isPredicting]);

  const handleRetryItem = useCallback(async (item) => {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "pending" } : i)));
    const startTime = performance.now();
    try {
      const data = await predictFabric(item.file);
      const elapsedSeconds = (performance.now() - startTime) / 1000;
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? { ...i, status: "done", result: data, processingTimeSeconds: elapsedSeconds }
            : i
        )
      );
    } catch {
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, status: "error" } : i)));
    }
  }, []);

  // --- Derived summary data (only from completed predictions) ---
  const completedItems = useMemo(
    () => items.filter((i) => i.status === "done" && i.result),
    [items]
  );

  const summary = useMemo(() => {
    const total = items.length;
    const processed = completedItems.length;
    const avgConfidence =
      processed > 0
        ? completedItems.reduce((sum, i) => sum + i.result.confidence, 0) / processed
        : 0;
    const recyclableCount = completedItems.filter(
      (i) => normalizeRecyclability(i.result.recyclability) === "High"
    ).length;

    return {
      total,
      processed,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      recyclableCount,
    };
  }, [items, completedItems]);

  const materialDistribution = useMemo(() => {
    const counts = {};
    completedItems.forEach((item) => {
      const material = item.result.material;
      counts[material] = (counts[material] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [completedItems]);

  const confidenceDistribution = useMemo(() => {
    const buckets = [
      { range: "0-20", min: 0, max: 20, count: 0 },
      { range: "20-40", min: 20, max: 40, count: 0 },
      { range: "40-60", min: 40, max: 60, count: 0 },
      { range: "60-80", min: 60, max: 80, count: 0 },
      { range: "80-100", min: 80, max: 100, count: 0 },
    ];
    completedItems.forEach((item) => {
      const c = item.result.confidence;
      const bucket = buckets.find((b) => c >= b.min && c < b.max) || buckets[buckets.length - 1];
      bucket.count += 1;
    });
    return buckets;
  }, [completedItems]);

  // --- Sustainability insight aggregates (simple, illustrative rollups) ---
  const sustainabilityInsights = useMemo(() => {
    if (completedItems.length === 0) return null;

    const highRecyclability = completedItems.filter(
      (i) => normalizeRecyclability(i.result.recyclability) === "High"
    ).length;
    const recyclabilityScore = Math.round((highRecyclability / completedItems.length) * 100);

    return {
      recyclabilityScore,
      carbonFootprintLabel: recyclabilityScore >= 60 ? "Low Impact" : "Moderate Impact",
      waterUsageLabel: recyclabilityScore >= 60 ? "Moderate" : "High",
      biodegradabilityLabel: "Varies",
    };
  }, [completedItems]);

  // --- Per-row PDF download ---
  const handleDownloadRowPdf = useCallback(async (item) => {
    if (!item.result) return;
    await downloadPredictionPdf({
      imageFile: item.file,
      material: item.result.material,
      confidence: item.result.confidence,
      defect: item.result.defect,
      defectConfidence: item.result.defect_confidence,
      wasteCategory: item.result.waste_category,
      recyclability: item.result.recyclability,
      recommendation: item.result.recommendation,
      top3Predictions: item.result.top_3_predictions,
      materialTypeInfo: getMaterialTypeInfo(item.result.material),
      processingTimeSeconds: item.processingTimeSeconds,
      sustainability: item.result.sustainability,
      fileName: `fabric_prediction_${item.file.name.split(".")[0]}.pdf`,
    });
  }, []);

  // --- Complete batch PDF report ---
  const handleDownloadBatchReport = useCallback(async () => {
    if (completedItems.length === 0) return;
    setIsGeneratingReport(true);
    try {
      const reportItems = completedItems.map((item) => ({
        imageFile: item.file,
        fileName: item.file.name,
        material: item.result.material,
        confidence: item.result.confidence,
        defect: item.result.defect,
        defectConfidence: item.result.defect_confidence,
        wasteCategory: item.result.waste_category,
        recyclability: item.result.recyclability,
        recommendation: item.result.recommendation,
        top3Predictions: item.result.top_3_predictions,
        materialTypeInfo: getMaterialTypeInfo(item.result.material),
        processingTimeSeconds: item.processingTimeSeconds,
        sustainability: item.result.sustainability,
      }));
      await downloadBatchPredictionsReport(reportItems, {
        total: summary.total,
        processed: summary.processed,
        avgConfidence: summary.avgConfidence,
        recyclableCount: summary.recyclableCount,
      });
    } finally {
      setIsGeneratingReport(false);
    }
  }, [completedItems, summary]);

  const progressPercent = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="batch-prediction">
      {/* --- Upload panel --- */}
      <div className="batch-card">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileInputChange}
          className="batch-file-input"
        />

        <div className="batch-upload-row">
          <div
            className={`batch-dropzone ${isDragging ? "batch-dropzone-active" : ""}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            role="button"
            tabIndex={0}
            aria-label="Drag and drop fabric images, or activate to browse files"
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleBrowseClick();
              }
            }}
          >
            <div className="batch-icon-circle">
              <UploadCloud size={22} />
            </div>
            <p className="batch-dropzone-title">
              {isDragging ? "Drop your images here" : "Drag & drop fabric images here"}
            </p>
            <p className="batch-dropzone-or">or</p>
            <button type="button" className="batch-btn-primary" onClick={handleBrowseClick}>
              Choose Files
            </button>
            <p className="batch-dropzone-subtitle">PNG, JPG, JPEG up to 10MB each</p>
          </div>

          {items.length > 0 && (
            <div className="batch-thumbnail-grid">
              {items.map((item) => (
                <ThumbnailItem
                  key={item.id}
                  item={item}
                  isPredicting={isPredicting}
                  onRemove={handleRemoveItem}
                />
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="batch-controls-row">
            <div className="batch-selected-count">
              {items.length} file{items.length !== 1 ? "s" : ""} selected
              {isPredicting && (
                <span className="batch-progress-text">
                  {" "}
                  · analyzing {progress.completed}/{progress.total}
                </span>
              )}
            </div>
            <button
              type="button"
              className="batch-clear-btn"
              onClick={handleClearAll}
              disabled={isPredicting}
            >
              <Trash2 size={14} />
              Clear All
            </button>
          </div>
        )}

        {items.length > 0 && (
          <>
            <button
              type="button"
              className="batch-btn-predict-all"
              onClick={handlePredictAll}
              disabled={isPredicting}
            >
              <Sparkles size={16} />
              {isPredicting
                ? `Analyzing ${progress.completed}/${progress.total}...`
                : `Predict All (${items.length} Images)`}
            </button>

            {isPredicting && (
              <div
                className="batch-progress-track"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="batch-progress-fill" style={{ width: `${progressPercent}%` }} />
              </div>
            )}

            {batchMessage && !isPredicting && (
              <div
                className={`batch-message batch-message-${batchMessage.type}`}
                role="status"
              >
                {batchMessage.type === "success" ? (
                  <CheckCircle2 size={16} />
                ) : (
                  <AlertTriangle size={16} />
                )}
                <span>{batchMessage.text}</span>
              </div>
            )}
          </>
        )}
      </div>

      {completedItems.length > 0 && (
        <>
          {/* --- Batch Summary cards --- */}
          <div className="batch-card batch-fade-in">
            <div className="batch-section-header">
              <h3 className="batch-section-title">Batch Summary</h3>
            </div>
            <div className="batch-summary-grid">
              <SummaryStat label="Total Images" value={summary.total} />
              <SummaryStat label="Processed Images" value={summary.processed} />
              <SummaryStat label="Recyclable Materials" value={summary.recyclableCount} />
              <SummaryStat
                label="Average Confidence"
                value={`${summary.avgConfidence}%`}
                highlight
              />
            </div>
          </div>

          {/* --- Analytics: Confidence Overview (gauge) + Confidence Distribution --- */}
          <div className="batch-charts-row batch-fade-in">
            <div className="batch-card batch-chart-card">
              <h3 className="batch-section-title">Confidence Overview</h3>
              <div className="batch-gauge-wrap">
                <ResponsiveContainer width="100%" height={200}>
                  <RadialBarChart
                    innerRadius="70%"
                    outerRadius="100%"
                    data={[{ name: "confidence", value: summary.avgConfidence, fill: "#2e7d32" }]}
                    startAngle={90}
                    endAngle={-270}
                  >
                    <RadialBar background dataKey="value" cornerRadius={20} />
                  </RadialBarChart>
                </ResponsiveContainer>
                <div className="batch-gauge-center">
                  <span className="batch-gauge-value">{summary.avgConfidence}%</span>
                  <span className="batch-gauge-label">Average Confidence</span>
                </div>
              </div>
            </div>

            <div className="batch-card batch-chart-card">
              <h3 className="batch-section-title">Confidence Distribution</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={confidenceDistribution} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
                  <XAxis dataKey="range" tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={{ stroke: "#eef1ee" }} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#6b7280" }} axisLine={false} tickLine={false} width={28} />
                  <Tooltip
                    cursor={{ fill: "rgba(46, 125, 50, 0.06)" }}
                    contentStyle={{ borderRadius: 8, border: "1px solid #eef1ee", fontSize: 12 }}
                    formatter={(value) => [`${value} image${value === 1 ? "" : "s"}`, "Count"]}
                    labelFormatter={(label) => `Confidence ${label}%`}
                  />
                  <Bar dataKey="count" fill="#2e7d32" radius={[6, 6, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* --- Analytics: Material Distribution donut --- */}
          <div className="batch-card batch-fade-in">
            <h3 className="batch-section-title">Material Distribution</h3>
            <div className="batch-donut-row">
              <ResponsiveContainer width={220} height={220}>
                <PieChart>
                  <Pie
                    data={materialDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={2}
                    animationDuration={600}
                  >
                    {materialDistribution.map((entry, index) => (
                      <Cell key={entry.name} fill={DONUT_COLORS[index % DONUT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: 8, border: "1px solid #eef1ee", fontSize: 12 }}
                    formatter={(value, name) => [
                      `${value} image${value === 1 ? "" : "s"} (${Math.round((value / completedItems.length) * 1000) / 10}%)`,
                      name,
                    ]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="batch-donut-legend">
                {materialDistribution.map((entry, index) => (
                  <div key={entry.name} className="batch-legend-row">
                    <span
                      className="batch-legend-dot"
                      style={{ background: DONUT_COLORS[index % DONUT_COLORS.length] }}
                    />
                    <span className="batch-legend-name">{entry.name}</span>
                    <span className="batch-legend-value">
                      {Math.round((entry.value / completedItems.length) * 1000) / 10}% ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* --- Analytics: Sustainability Insight cards --- */}
          {sustainabilityInsights && (
            <div className="batch-card batch-fade-in">
              <h3 className="batch-section-title">Sustainability Insights</h3>
              <div className="batch-sustainability-grid">
                <SustainabilityCard
                  icon={<Recycle size={16} />}
                  label="Recyclability Score"
                  value={`${sustainabilityInsights.recyclabilityScore}/100`}
                  tone="good"
                  progress={sustainabilityInsights.recyclabilityScore}
                />
                <SustainabilityCard
                  icon={<Leaf size={16} />}
                  label="Carbon Footprint"
                  value={sustainabilityInsights.carbonFootprintLabel}
                  tone="neutral"
                />
                <SustainabilityCard
                  icon={<Droplet size={16} />}
                  label="Water Usage"
                  value={sustainabilityInsights.waterUsageLabel}
                  tone="neutral"
                />
                <SustainabilityCard
                  icon={<Repeat size={16} />}
                  label="Biodegradability"
                  value={sustainabilityInsights.biodegradabilityLabel}
                  tone="neutral"
                />
              </div>
            </div>
          )}

          {/* --- Results table --- */}
          <div className="batch-card">
            <div className="batch-section-header">
              <h3 className="batch-section-title">Batch Prediction Results</h3>
              <button
                type="button"
                className="batch-report-btn"
                onClick={handleDownloadBatchReport}
                disabled={isGeneratingReport}
              >
                <FileStack size={14} />
                {isGeneratingReport ? "Generating..." : "Download Complete Batch Report"}
              </button>
            </div>
            <div className="batch-table-wrap">
              <table className="batch-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Predicted Material</th>
                    <th>Confidence</th>
                    <th>Recyclability</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <BatchTableRow
                      key={item.id}
                      item={item}
                      isPredicting={isPredicting}
                      isExpanded={expandedIds.has(item.id)}
                      onToggleExpand={toggleExpanded}
                      onDownloadPdf={handleDownloadRowPdf}
                      onRetry={handleRetryItem}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const ThumbnailItem = memo(function ThumbnailItem({ item, isPredicting, onRemove }) {
  const showLoadingShimmer = isPredicting && item.status === "pending";

  return (
    <div className="batch-thumbnail">
      <img src={item.previewUrl} alt={item.file.name} />
      {showLoadingShimmer && <div className="batch-thumbnail-shimmer" aria-hidden="true" />}
      <button
        type="button"
        className="batch-thumbnail-remove"
        onClick={() => onRemove(item.id)}
        aria-label={`Remove ${item.file.name}`}
      >
        <X size={12} />
      </button>
      {item.status === "done" && (
        <span className="batch-thumbnail-status batch-thumbnail-status-done">✓</span>
      )}
      {item.status === "error" && (
        <span className="batch-thumbnail-status batch-thumbnail-status-error">!</span>
      )}
      <p className="batch-thumbnail-name">{item.file.name}</p>
    </div>
  );
});

const BatchTableRow = memo(function BatchTableRow({
  item,
  isPredicting,
  isExpanded,
  onToggleExpand,
  onDownloadPdf,
  onRetry,
}) {
  const isSkeleton = isPredicting && item.status === "pending";

  if (isSkeleton) {
    return (
      <tr aria-hidden="true">
        <td>
          <div className="batch-table-image-cell">
            <img src={item.previewUrl} alt="" />
            <span>{item.file.name}</span>
          </div>
        </td>
        <td colSpan={4}>
          <div className="batch-skeleton-line" />
        </td>
      </tr>
    );
  }

  if (item.status === "error") {
    return (
      <tr>
        <td>
          <div className="batch-table-image-cell">
            <img src={item.previewUrl} alt={item.file.name} />
            <span>{item.file.name}</span>
          </div>
        </td>
        <td colSpan={3} className="batch-table-error">
          Prediction failed for this image.
        </td>
        <td>
          <button type="button" className="batch-retry-btn" onClick={() => onRetry(item)}>
            <RotateCcw size={13} />
            Retry
          </button>
        </td>
      </tr>
    );
  }

  if (item.status !== "done" || !item.result) {
    return (
      <tr>
        <td>
          <div className="batch-table-image-cell">
            <img src={item.previewUrl} alt={item.file.name} />
            <span>{item.file.name}</span>
          </div>
        </td>
        <td colSpan={4} className="batch-table-pending">
          Pending prediction...
        </td>
      </tr>
    );
  }

  return (
    <>
      <tr className="batch-table-row-done">
        <td>
          <div className="batch-table-image-cell">
            <img src={item.previewUrl} alt={item.file.name} />
            <span>{item.file.name}</span>
          </div>
        </td>
        <td>
          <button
            type="button"
            className="batch-table-expand-btn"
            onClick={() => onToggleExpand(item.id)}
            aria-expanded={isExpanded}
            aria-controls={`batch-top3-${item.id}`}
          >
            <span className="batch-table-material">{item.result.material}</span>
            <ChevronDown
              size={14}
              className={`batch-table-expand-icon ${isExpanded ? "batch-table-expand-icon-open" : ""}`}
            />
          </button>
        </td>
        <td>{item.result.confidence}%</td>
        <td>{item.result.recyclability}</td>
        <td>
          <button
            type="button"
            className="batch-pdf-btn"
            onClick={() => onDownloadPdf(item)}
          >
            <FileDown size={14} />
            Download PDF
          </button>
        </td>
      </tr>
      {isExpanded && (
        <tr className="batch-table-expanded-row" id={`batch-top3-${item.id}`}>
          <td colSpan={5}>
            <div className="batch-table-top3">
              <p className="batch-table-top3-heading">Top 3 Predictions</p>
              {item.result.top_3_predictions.map((p) => (
                <div key={p.material} className="batch-table-top3-row">
                  <span>{p.material}</span>
                  <div className="batch-table-top3-track">
                    <div className="batch-table-top3-fill" style={{ width: `${p.confidence}%` }} />
                  </div>
                  <span>{p.confidence}%</span>
                </div>
              ))}
            </div>
          </td>
        </tr>
      )}
    </>
  );
});

function SummaryStat({ label, value, highlight }) {
  return (
    <div className="batch-summary-stat">
      <span className="batch-summary-label">{label}</span>
      <span className={`batch-summary-value ${highlight ? "batch-summary-value-highlight" : ""}`}>
        {value}
      </span>
    </div>
  );
}

function SustainabilityCard({ icon, label, value, tone, progress }) {
  return (
    <div className="batch-sustainability-card">
      <div className={`batch-icon-circle batch-icon-circle-small batch-tone-${tone}`}>{icon}</div>
      <p className="batch-sustainability-label">{label}</p>
      <p className={`batch-sustainability-value batch-tone-text-${tone}`}>{value}</p>
      {typeof progress === "number" && (
        <div className="batch-sustainability-track">
          <div className="batch-sustainability-fill" style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
  );
}

export default BatchPrediction;