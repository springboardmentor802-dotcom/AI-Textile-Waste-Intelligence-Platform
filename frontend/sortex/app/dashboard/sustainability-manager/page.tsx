"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import NotificationIconToggle from "@/app/components/NotificationIconToggle";
import {
  LogOut,
  UploadCloud,
  Recycle,
  Activity,
  BarChart3,
  FileDown,
  Wind,
  PieChart,
  FileText,
  Package,
  Leaf,
  Droplets,
  ShieldCheck,
  Loader2,
  Trash2,
  CheckCircle2,
  Image as ImageIcon,
  AlertCircle,
  Boxes,
  Scale,
  Tag,
  MapPin,
  StickyNote,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  TrendingUp,
  Layers,
  FileSpreadsheet,
  History,
  X,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────

interface ScanHistoryItem {
  _id: string;
  filename: string;
  created_at: number;
  batch_id?: string | null;
  analysis: AnalysisPayload;
  recyclability: RecyclabilityPayload;
}

interface BatchMeta {
  source?: string | null;
  quantity_kg?: number | null;
  notes?: string | null;
  label?: string | null;
}

interface HistoryGroup {
  batch_id: string | null;
  batch_meta: BatchMeta | null;
  is_batch: boolean;
  count: number;
  average_circularity_score: number;
  dominant_material: string;
  earliest_created_at: number | null;
  latest_created_at: number | null;
  scans: ScanHistoryItem[];
}

interface ClassificationResult {
  label: string | null;
  confidence: number | null;
}

interface ColorAnalysis {
  primary_color?: string;
  secondary_color?: string;
  dominant_hex?: string;
  [key: string]: unknown;
}

interface TextureResult {
  label: string;
  laplacian_variance?: number;
}

interface PatternResult {
  label: string;
  mean_edge_energy?: number;
  dominant_orientation_ratio?: number;
}

interface VisualFeatures {
  color_analysis?: ColorAnalysis;
  texture?: TextureResult;
  pattern?: PatternResult;
}

interface DefectInfo {
  label: string;
  confidence: number;
}

interface RecyclabilityPayload {
  circularity_score: number;
  circularity_category: string;
  waste_category: string;
  recommended_recycling_option: string;
  waste_reduction_tips: string[];
  component_scores: {
    recyclability_score: number;
    reuse_score: number;
    sustainability_score: number;
    material_recovery_score: number;
  };
  inputs_used?: Record<string, unknown>;
  defect_detected?: DefectInfo | null;
  inspection_flag?: string;
}

interface AnalysisPayload {
  garment_type?: ClassificationResult | null;
  material_type?: ClassificationResult | null;
  waste_status?: ClassificationResult | null;
  visual_features?: VisualFeatures;
}

interface SingleResult {
  scan_id?: string | null;
  _id?: string | null;
  filename: string;
  analysis: AnalysisPayload;
  recyclability: RecyclabilityPayload;
  impact?: {
    co2e_avoided_kg: number;
    water_saved_l: number;
    landfill_diverted_kg: number;
    weight_kg: number;
  };
}

interface BatchSummary {
  total_processed: number;
  average_circularity_score: number;
  dominant_material: string;
  material_breakdown: Record<string, number>;
}

interface BatchResult {
  batch_id: string | null;
  batch_label: string | null;
  results: SingleResult[];
  summary: BatchSummary;
}

interface PlatformBatch {
  _id: string;
  batch_id: string;
  fabric_type: string;
  source: string;
  quantity_kg: number;
  color?: string;
  condition: string;
  collection_date?: string;
  notes?: string;
  created_at?: string;
}

interface BatchAssessment {
  batch_id: string;
  batch_meta: {
    batch_id: string;
    fabric_type: string;
    condition: string;
    quantity_kg: number;
    source?: string;
    color?: string;
    notes?: string;
    created_at?: string;
  } | null;
  recyclability: RecyclabilityPayload;
  impact: {
    co2e_avoided_kg: number;
    water_saved_l: number;
    landfill_diverted_kg: number;
    weight_kg: number;
  };
  scan_count: number;
  scans: SingleResult[];
}

interface MaterialImpactBucket {
  material_type: string;
  item_count: number;
  weight_kg: number;
  co2e_avoided_kg: number;
  water_saved_l: number;
  landfill_diverted_kg: number;
}

interface DashboardSummaryData {
  period_days: number;
  impact_summary: {
    item_count: number;
    total_weight_kg: number;
    total_co2e_avoided_kg: number;
    total_water_saved_l: number;
    total_landfill_diverted_kg: number;
    by_material: MaterialImpactBucket[];
  };
  circular_economy: {
    item_count: number;
    average_circularity_score: number;
    fleet_circularity_index: number;
    loop_tier_breakdown: Array<{ tier: string; item_count: number; percentage: number }>;
    recycling_option_breakdown: Array<{ recycling_option: string; item_count: number; percentage: number }>;
  };
  waste_diversion: {
    item_count: number;
    diversion_rate_pct: number;
    diverted_count: number;
    non_diverted_count: number;
    by_material: Array<{ material_type: string; total: number; diverted: number; diversion_rate_pct: number }>;
  };
  benchmark: {
    co2e_avoided_kg: { current: number; previous: number; change_pct: number | null };
    water_saved_l: { current: number; previous: number; change_pct: number | null };
    landfill_diverted_kg: { current: number; previous: number; change_pct: number | null };
    item_count: { current: number; previous: number; change_pct: number | null };
  };
}

interface ApiError {
  detail?: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

const GARMENT_AVERAGE_WEIGHT_KG: Record<string, number> = {
  Dress: 0.40, Shorts: 0.25, Skirt: 0.30, "T-Shirt": 0.20, Shirt: 0.25,
  Sweater: 0.45, Jacket: 0.70, Jeans: 0.60, Pants: 0.45, Blouse: 0.20,
  "Tank Top": 0.15, Cardigan: 0.40, Top: 0.20, "Jumpsuit/Romper": 0.50,
  Leggings: 0.20, Joggers: 0.40, Hoodie: 0.60, Other: 0.35,
};

const MATERIAL_WEIGHT_MULTIPLIER: Record<string, number> = {
  Leather: 1.50, Denim: 1.30, Wool: 1.20, Cotton: 1.00, Polyester: 1.00,
  Nylon: 0.90, Acrylic: 0.95, Linen: 0.85, Viscose: 0.85, Silk: 0.70,
  "Mixed Fabrics": 1.00, "Mixed/Unknown": 1.00,
};

function getItemWeightKg(garmentLabel?: string | null, materialLabel?: string | null): number {
  const base = GARMENT_AVERAGE_WEIGHT_KG[garmentLabel || "Other"] ?? 0.35;
  const mult = MATERIAL_WEIGHT_MULTIPLIER[materialLabel || "Mixed/Unknown"] ?? 1.0;
  return Math.round(base * mult * 100) / 100;
}

interface PieChartItem {
  label: string;
  value: number;
  color: string;
}

interface PieChartWidgetProps {
  data: PieChartItem[];
  title: string;
  subtitle?: string;
  unit?: string;
  centerText?: string;
  centerSubtext?: string;
}

function PieChartWidget({ data, title, subtitle, unit = "", centerText, centerSubtext }: PieChartWidgetProps) {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const total = data.reduce((sum, item) => sum + item.value, 0);

  if (total === 0 || data.length === 0) {
    return (
      <div className="bg-neutral-900 rounded-3xl border border-white/5 shadow-sm p-6 flex flex-col items-center justify-center text-center">
        <h4 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
          <PieChart className="w-4 h-4 text-orange-400" /> {title}
        </h4>
        {subtitle && <p className="text-xs text-neutral-500 mb-4">{subtitle}</p>}
        <div className="w-32 h-32 rounded-full border border-dashed border-white/10 flex items-center justify-center text-xs text-neutral-500">
          No Data Available
        </div>
      </div>
    );
  }

  const cx = 100;
  const cy = 100;
  const R = 80;
  const r = 52;

  let currentAngle = -Math.PI / 2;

  const slices = [];
  for (let idx = 0; idx < data.length; idx++) {
    const item = data[idx];
    const sliceAngle = (item.value / total) * 2 * Math.PI;
    const startAngle = currentAngle;
    const endAngle = startAngle + sliceAngle;
    currentAngle = endAngle;

    const x1o = cx + R * Math.cos(startAngle);
    const y1o = cy + R * Math.sin(startAngle);
    const x2o = cx + R * Math.cos(endAngle);
    const y2o = cy + R * Math.sin(endAngle);

    const x2i = cx + r * Math.cos(endAngle);
    const y2i = cy + r * Math.sin(endAngle);
    const x1i = cx + r * Math.cos(startAngle);
    const y1i = cy + r * Math.sin(startAngle);

    const largeArc = sliceAngle > Math.PI ? 1 : 0;

    let pathData = "";
    if (sliceAngle >= 2 * Math.PI - 0.0001) {
      pathData = `M ${cx} ${cy - R} A ${R} ${R} 0 1 1 ${cx - 0.001} ${cy - R} Z M ${cx} ${cy - r} A ${r} ${r} 0 1 0 ${cx - 0.001} ${cy - r} Z`;
    } else {
      pathData = `M ${x1o} ${y1o} A ${R} ${R} 0 ${largeArc} 1 ${x2o} ${y2o} L ${x2i} ${y2i} A ${r} ${r} 0 ${largeArc} 0 ${x1i} ${y1i} Z`;
    }

    const pct = Math.round((item.value / total) * 100);

    slices.push({
      ...item,
      pathData,
      pct,
      idx,
    });
  }

  const activeSlice = hoveredIdx !== null ? slices[hoveredIdx] : null;

  return (
    <div className="bg-neutral-900 rounded-3xl border border-white/5 shadow-sm p-6 flex flex-col justify-between">
      <div>
        <h4 className="text-sm font-bold text-white flex items-center gap-2">
          <PieChart className="w-4 h-4 text-orange-400" />
          {title}
        </h4>
        {subtitle && <p className="text-xs font-semibold text-neutral-500 mb-4">{subtitle}</p>}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 my-2">
        <div className="relative w-44 h-44 flex-shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full filter drop-shadow-md overflow-visible">
            <defs>
              <radialGradient id={`glow-${title.replace(/\s+/g, "-")}`} cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#000000" stopOpacity="0" />
              </radialGradient>
            </defs>

            <circle cx="100" cy="100" r="82" fill={`url(#glow-${title.replace(/\s+/g, "-")})`} />

            {slices.map((slice) => {
              const isHovered = hoveredIdx === slice.idx;
              return (
                <path
                  key={slice.idx}
                  d={slice.pathData}
                  fill={slice.color}
                  className="transition-all duration-300 cursor-pointer stroke-neutral-950"
                  strokeWidth="3"
                  style={{
                    transform: isHovered ? "scale(1.06)" : "scale(1)",
                    transformOrigin: `${cx}px ${cy}px`,
                    opacity: hoveredIdx !== null && !isHovered ? 0.55 : 1,
                  }}
                  onMouseEnter={() => setHoveredIdx(slice.idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-2">
            {activeSlice ? (
              <>
                <span className="text-[11px] font-bold text-neutral-400 truncate max-w-[100px]">{activeSlice.label}</span>
                <span className="text-xl font-extrabold text-white">{activeSlice.pct}%</span>
                <span className="text-[10px] font-semibold text-neutral-400">{activeSlice.value} {unit}</span>
              </>
            ) : (
              <>
                <span className="text-xl font-extrabold text-white">{centerText ?? (typeof total === "number" ? total.toFixed(0) : total)}</span>
                <span className="text-xs font-semibold text-neutral-400">{centerSubtext ?? (unit || "Total")}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex-1 w-full space-y-2 max-h-48 overflow-y-auto pr-1">
          {slices.map((slice) => (
            <div
              key={slice.idx}
              className={`flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer border ${
                hoveredIdx === slice.idx
                  ? "bg-white/10 border-white/20 text-white"
                  : "bg-neutral-950/50 border-white/5 text-neutral-300 hover:bg-neutral-800"
              }`}
              onMouseEnter={() => setHoveredIdx(slice.idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: slice.color }} />
                <span className="font-semibold truncate">{slice.label}</span>
              </div>
              <div className="flex items-center gap-2 font-bold text-right flex-shrink-0">
                <span>{slice.value} {unit}</span>
                <span className="text-neutral-400 font-normal text-[11px]">({slice.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────

export default function SustainabilityManagerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("sustainability-metrics");

  // Filter & period state
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [summaryData, setSummaryData] = useState<DashboardSummaryData | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Platform batches (Recycling Facilitator & cross-role batches)
  const [platformBatches, setPlatformBatches] = useState<PlatformBatch[]>([]);
  const [isBatchesLoading, setIsBatchesLoading] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedBatchAssessment, setSelectedBatchAssessment] = useState<BatchAssessment | null>(null);
  const [isAssessmentLoading, setIsAssessmentLoading] = useState(false);
  const [batchSearchQuery, setBatchSearchQuery] = useState("");

  // Mode for Tab 1: "upload" or "browse-batches"
  const [tab1Mode, setTab1Mode] = useState<"upload" | "browse-batches">("upload");

  // Upload & Analysis State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload Results state
  const [singleResult, setSingleResult] = useState<SingleResult | null>(null);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const [expandedBatchItems, setExpandedBatchItems] = useState<Set<number>>(new Set());

  // Batch registration form (for local multi-upload)
  const [showBatchForm, setShowBatchForm] = useState(false);
  const [batchMeta, setBatchMeta] = useState({
    label: "",
    source: "",
    quantityKg: "",
    notes: "",
  });

  // Export report status
  const [isExporting, setIsExporting] = useState(false);
  const [expandedScanIdx, setExpandedScanIdx] = useState<number | null>(null);

  // Scan History & Reports Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryGroup[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [downloadingHistoryId, setDownloadingHistoryId] = useState<string | null>(null);
  const [downloadingBatchId, setDownloadingBatchId] = useState<string | null>(null);
  const [expandedHistoryGroup, setExpandedHistoryGroup] = useState<string | null>(null);
  const [expandedHistoryScanId, setExpandedHistoryScanId] = useState<string | null>(null);

  const _downloadBlob = async (url: string, fallbackFilename: string) => {
    const token = localStorage.getItem("access_token");
    const res = await fetch(url, {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || "Could not generate report.");
    }
    const blob = await res.blob();
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = fallbackFilename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(objectUrl);
  };

  const fetchHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    setHistoryError("");
    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch(`${API_BASE_URL}/api/ml/history/batches`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error("Could not load scan history.");
      const data = await res.json();
      setHistoryItems(data);
    } catch (error: unknown) {
      setHistoryError(error instanceof Error ? error.message : "Could not load history.");
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  const handleOpenHistory = () => {
    setShowHistoryModal(true);
    setExpandedHistoryGroup(null);
    setExpandedHistoryScanId(null);
    fetchHistory();
  };

  const handleDownloadScanReport = async (scanId: string) => {
    setDownloadingHistoryId(scanId);
    try {
      await _downloadBlob(`${API_BASE_URL}/api/ml/export/pdf/${scanId}`, `scan_report_${scanId}.pdf`);
    } catch (error: unknown) {
      setHistoryError(error instanceof Error ? error.message : "Could not download report.");
    } finally {
      setDownloadingHistoryId(null);
    }
  };

  const handleDownloadBatchReport = async (batchId: string, reportTitle: string = "batch_sustainability_report") => {
    setDownloadingBatchId(batchId);
    try {
      await _downloadBlob(
        `${API_BASE_URL}/api/ml/export/pdf/batch/${batchId}?report_type=${reportTitle}`,
        `${reportTitle}_${batchId}.pdf`
      );
    } catch (error: unknown) {
      setHistoryError(error instanceof Error ? error.message : "Could not download batch report.");
    } finally {
      setDownloadingBatchId(null);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    if (!token || role !== "Sustainability Manager") {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/login");
  };

  // ─── Data Fetchers ─────────────────────────────────────────────────

  const fetchDashboardSummary = useCallback(async (days: number) => {
    setIsSummaryLoading(true);
    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${API_BASE_URL}/api/sustainability/dashboard-summary?days=${days}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: DashboardSummaryData = await res.json();
        setSummaryData(data);
      }
    } catch (err) {
      console.error("Failed to fetch sustainability dashboard summary:", err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  const fetchPlatformBatches = useCallback(async () => {
    setIsBatchesLoading(true);
    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${API_BASE_URL}/api/inventory/batches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: PlatformBatch[] = await res.json();
        setPlatformBatches(data);
      }
    } catch (err) {
      console.error("Failed to fetch platform batches:", err);
    } finally {
      setIsBatchesLoading(false);
    }
  }, []);

  const fetchBatchAssessment = useCallback(async (batchId: string) => {
    setIsAssessmentLoading(true);
    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${API_BASE_URL}/api/sustainability/batch/${batchId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: BatchAssessment = await res.json();
        setSelectedBatchAssessment(data);
        setSelectedBatchId(batchId);
      }
    } catch (err) {
      console.error("Failed to fetch batch assessment:", err);
    } finally {
      setIsAssessmentLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchDashboardSummary(periodDays);
      fetchPlatformBatches();
    });
  }, [periodDays, fetchDashboardSummary, fetchPlatformBatches]);

  // Download Report Helper
  const downloadReport = async (type: "pdf" | "excel", reportTitle: string = "sustainability_report", batchId?: string) => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("access_token") || "";
      let url = `${API_BASE_URL}/api/ml/export/${type}?report_type=${reportTitle}`;
      if (batchId && type === "pdf") {
        url = `${API_BASE_URL}/api/ml/export/pdf/batch/${batchId}?report_type=${reportTitle}`;
      }
      const filename = `${reportTitle}_${periodDays}d.${type === "pdf" ? "pdf" : "xlsx"}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Report export failed");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  const downloadSingleScanReport = async (scanId: string) => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("access_token") || "";
      const url = `${API_BASE_URL}/api/ml/export/pdf/${scanId}`;
      const filename = `scan_report_${scanId}.pdf`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Single scan report export failed");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setIsExporting(false);
    }
  };

  // ─── Upload Handlers ───────────────────────────────────────────────

  const handleFilesSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      setAnalysisError("Please select valid image files (JPEG, PNG, WEBP, BMP).");
      return;
    }
    if (fileArray.length > 30) {
      setAnalysisError("Maximum 30 images allowed per upload.");
      return;
    }
    setSelectedFiles(fileArray);
    setAnalysisComplete(false);
    setAnalysisError(null);
    setSingleResult(null);
    setBatchResult(null);
    setShowBatchForm(false);
    setBatchMeta({ label: "", source: "", quantityKg: "", notes: "" });
  };

  const clearUpload = () => {
    setSelectedFiles([]);
    setAnalysisComplete(false);
    setAnalysisError(null);
    setSingleResult(null);
    setBatchResult(null);
    setShowBatchForm(false);
    setExpandedBatchItems(new Set());
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleBatchItem = (index: number) => {
    setExpandedBatchItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const runSingleAnalysis = async () => {
    if (selectedFiles.length !== 1) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    const file = selectedFiles[0];
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${API_BASE_URL}/api/ml/analyze/detailed`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as ApiError;
        throw new Error(err.detail || `Analysis failed (${res.status})`);
      }

      const data = (await res.json()) as SingleResult;
      setSingleResult({
        ...data,
        filename: data.filename || file.name,
      });
      setAnalysisComplete(true);
      fetchDashboardSummary(periodDays);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to analyze image.";
      setAnalysisError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runBatchAnalysis = async () => {
    if (selectedFiles.length <= 1) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append("files", file));
    if (batchMeta.label) formData.append("label", batchMeta.label);
    if (batchMeta.source) formData.append("source", batchMeta.source);
    if (batchMeta.quantityKg) formData.append("quantity_kg", batchMeta.quantityKg);
    if (batchMeta.notes) formData.append("notes", batchMeta.notes);

    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${API_BASE_URL}/api/ml/analyze/batch`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!res.ok) {
        const err = (await res.json().catch(() => ({}))) as ApiError;
        throw new Error(err.detail || `Batch analysis failed (${res.status})`);
      }

      const data = (await res.json()) as BatchResult;
      setBatchResult(data);
      setAnalysisComplete(true);
      fetchDashboardSummary(periodDays);
      fetchPlatformBatches();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to analyze batch.";
      setAnalysisError(message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const runAnalysis = () => {
    if (selectedFiles.length === 0) return;
    if (selectedFiles.length === 1) {
      runSingleAnalysis();
    } else {
      setShowBatchForm(true);
    }
  };

  // ─── Rendering Helpers ──────────────────────────────────────────────

  const getCategoryBadge = (category: string) => {
    const base = "px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border";
    if (category.includes("Excellent"))
      return `${base} bg-emerald-500/10 text-emerald-400 border-emerald-500/20`;
    if (category.includes("High"))
      return `${base} bg-blue-500/10 text-blue-400 border-blue-500/20`;
    if (category.includes("Moderate"))
      return `${base} bg-yellow-500/10 text-yellow-400 border-yellow-500/20`;
    if (category.includes("Limited"))
      return `${base} bg-orange-500/10 text-orange-400 border-orange-500/20`;
    return `${base} bg-red-500/10 text-red-400 border-red-500/20`;
  };

  const circularityDashOffset = (score: number, radius = 54) => {
    const circumference = 2 * Math.PI * radius;
    return circumference - (score / 100) * circumference;
  };

  const filteredPlatformBatches = platformBatches.filter((b) => {
    const q = batchSearchQuery.toLowerCase();
    return (
      b.fabric_type.toLowerCase().includes(q) ||
      b.condition.toLowerCase().includes(q) ||
      (b.source && b.source.toLowerCase().includes(q)) ||
      b._id.toLowerCase().includes(q)
    );
  });

  // Derived pie chart datasets
  const LOOP_TIER_COLORS: Record<string, string> = {
    Reuse: "#10b981",
    "Repair/Refurbish": "#a855f7",
    Recycling: "#f97316",
    "Disposal/Recovery": "#ef4444",
  };

  const PATHWAY_COLORS: Record<string, string> = {
    "Mechanical Recycling": "#f97316",
    "Chemical Recycling": "#38bdf8",
    "Fiber Recycling": "#eab308",
    "Fabric Reuse": "#10b981",
    Upcycling: "#a855f7",
    Donation: "#3b82f6",
    "Industrial Recovery": "#ef4444",
  };

  const MATERIAL_COLORS: Record<string, string> = {
    Cotton: "#10b981",
    Polyester: "#38bdf8",
    Denim: "#6366f1",
    Wool: "#f59e0b",
    Linen: "#a855f7",
    Nylon: "#06b6d4",
    Viscose: "#ec4899",
    Leather: "#b45309",
    "Mixed Fabrics": "#84cc16",
    "Mixed/Unknown": "#6b7280",
  };

  const loopTierPieData: PieChartItem[] = (summaryData?.circular_economy?.loop_tier_breakdown || []).map((b) => ({
    label: b.tier,
    value: b.item_count,
    color: LOOP_TIER_COLORS[b.tier] ?? "#f97316",
  }));

  const recyclingPathwayPieData: PieChartItem[] = (summaryData?.circular_economy?.recycling_option_breakdown || []).map((b) => ({
    label: b.recycling_option,
    value: b.item_count,
    color: PATHWAY_COLORS[b.recycling_option] ?? "#3b82f6",
  }));

  const carbonMaterialPieData: PieChartItem[] = (summaryData?.impact_summary?.by_material || []).map((b) => ({
    label: b.material_type,
    value: Math.round(b.co2e_avoided_kg * 10) / 10,
    color: MATERIAL_COLORS[b.material_type] ?? "#10b981",
  }));

  const diversionStatusPieData: PieChartItem[] = summaryData?.waste_diversion ? [
    { label: "Diverted Waste", value: summaryData.waste_diversion.diverted_count, color: "#10b981" },
    { label: "Non-Diverted (Hazardous)", value: summaryData.waste_diversion.non_diverted_count, color: "#ef4444" },
  ] : [];

  const diversionMaterialPieData: PieChartItem[] = (summaryData?.waste_diversion?.by_material || []).map((b) => ({
    label: b.material_type,
    value: b.diverted,
    color: MATERIAL_COLORS[b.material_type] ?? "#38bdf8",
  }));

  // ─── Render ────────────────────────────────────────────────────────

  return (
    <div className="relative flex h-screen bg-neutral-950 font-sans overflow-hidden text-neutral-200">
      {/* SOFT CENTER ORANGE GLOW ACCENT */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-orange-500/15 rounded-full blur-[160px] pointer-events-none flex items-center justify-center z-0" />

      {/* SIDEBAR */}
      <div className="w-64 bg-black text-white flex flex-col shadow-xl z-40 relative border-r border-white/5 flex-shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="p-2 bg-orange-500 rounded-lg shadow-md shadow-orange-900/30">
            <Recycle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Sortex<span className="text-orange-400">AI</span></h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: "sustainability-metrics", label: "Sustainability Metrics", icon: Activity },
            { id: "carbon-reduction", label: "Carbon Reduction", icon: Wind },
            { id: "waste-diversion", label: "Waste Diversion", icon: PieChart },
            { id: "esg", label: "ESG Reporting", icon: FileText },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isSelected
                    ? "bg-orange-600/90 text-white shadow-md shadow-orange-900/20"
                    : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2 relative z-50">
          <button
            onClick={() => downloadReport("pdf")}
            disabled={isExporting}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 bg-neutral-900 border border-white/5 hover:bg-neutral-800 transition-all"
          >
            <FileDown className="w-4 h-4 text-orange-400" />
            <span>Export ESG Report (PDF)</span>
          </button>
          <NotificationIconToggle />
          <ThemeToggle variant="sidebar" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Log out</span>
          </button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden z-10">
        <header className="h-20 bg-neutral-950 border-b border-white/5 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white">Sustainability Manager Dashboard</h2>
            <p className="text-sm text-neutral-500">Logged in as • <span className="font-semibold text-orange-400">Sustainability Manager</span></p>
          </div>

          <div className="flex items-center gap-3">
            {/* Global Period Filter Selector */}
            <div className="flex items-center bg-neutral-900 border border-white/5 rounded-xl p-1">
              {[30, 60, 90, 365].map((days) => (
                <button
                  key={days}
                  onClick={() => setPeriodDays(days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    periodDays === days
                      ? "bg-orange-600 text-white shadow-sm"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {days === 365 ? "1 Year" : `${days}d`}
                </button>
              ))}
            </div>

            <button
              onClick={() => fetchDashboardSummary(periodDays)}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl border border-white/5 transition-all"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isSummaryLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => downloadReport("pdf")}
              disabled={isExporting}
              className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-semibold text-sm rounded-xl border border-orange-500/20 transition-all shadow-sm flex items-center gap-2"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              Export ESG Summary
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8">
          
          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 1: SUSTAINABILITY METRICS & BATCH LINKING              */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === "sustainability-metrics" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              
              {/* TAB 1 SUB-NAVIGATION BAND */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-neutral-900 border border-white/5 rounded-2xl p-2">
                <button
                  onClick={() => setTab1Mode("upload")}
                  className={`w-full justify-center px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    tab1Mode === "upload"
                      ? "bg-orange-600 text-white shadow-md shadow-orange-900/30"
                      : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <UploadCloud className={`w-4 h-4 ${tab1Mode === "upload" ? "text-white" : "text-orange-400"}`} />
                  <span>AI Upload & Intelligence Engine</span>
                </button>

                <button
                  onClick={() => {
                    setTab1Mode("browse-batches");
                    fetchPlatformBatches();
                  }}
                  className={`w-full justify-center px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    tab1Mode === "browse-batches"
                      ? "bg-orange-600 text-white shadow-md shadow-orange-900/30"
                      : "text-neutral-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Boxes className={`w-4 h-4 ${tab1Mode === "browse-batches" ? "text-white" : "text-orange-400"}`} />
                  <span>Platform Inventory Batches ({platformBatches.length})</span>
                </button>

                <button
                  onClick={handleOpenHistory}
                  className="w-full justify-center px-4 py-3 rounded-xl text-xs font-bold text-neutral-400 hover:text-white hover:bg-white/5 flex items-center gap-2 transition-all"
                >
                  <History className="w-4 h-4 text-orange-400" />
                  <span>Scan History & Reports</span>
                </button>
              </div>

              {/* Circular Economy Overview Pie Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PieChartWidget
                  data={loopTierPieData}
                  title="Circular Economy Loop Tiers"
                  subtitle="Proportion of items across circularity hierarchy tiers"
                  unit="items"
                  centerText={`${summaryData?.circular_economy?.fleet_circularity_index ?? 0}`}
                  centerSubtext="Fleet Index"
                />
                <PieChartWidget
                  data={recyclingPathwayPieData}
                  title="Recycling Recommendation Streams"
                  subtitle="Distribution of items by assigned recycling pathway"
                  unit="items"
                  centerText={`${summaryData?.circular_economy?.item_count ?? 0}`}
                  centerSubtext="Total Scanned"
                />
              </div>

              {/* ── MODE 1: AI UPLOAD WIDGET ── */}
              {tab1Mode === "upload" && (
                <div className="bg-neutral-900 rounded-3xl border border-white/5 shadow-sm overflow-hidden p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">Sustainability Intelligence Engine</h3>
                      <p className="text-sm text-neutral-400">Upload textile waste images to generate circular economy analytics and environmental impact assessments.</p>
                    </div>
                  </div>

                  <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFilesSelect(e.target.files)} />
                  
                  {/* Empty State */}
                  {!analysisComplete && selectedFiles.length === 0 && (
                    <div onClick={() => fileInputRef.current?.click()} className="p-12 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer bg-neutral-950 border-white/10 hover:bg-neutral-900/50 transition-colors">
                      <UploadCloud className="w-10 h-10 text-orange-400 mb-2" />
                      <p className="text-white font-bold text-base">Click or drag image(s) here for automated AI sorting</p>
                      <p className="text-neutral-500 font-medium text-xs mt-1">Supports JPEG, JPG, PNG, WEBP, BMP (Max 30 at a time)</p>
                    </div>
                  )}

                  {/* File Selected State */}
                  {!analysisComplete && selectedFiles.length > 0 && (
                    <div className="p-6 flex flex-col items-center justify-center border border-white/10 rounded-2xl bg-neutral-950 space-y-4">
                      <div className="w-full max-h-48 overflow-y-auto space-y-2 pr-2">
                        <div className="flex items-center justify-between mb-2">
                          <p className="text-white font-bold">{selectedFiles.length} file(s) selected</p>
                          <button onClick={clearUpload} className="text-xs text-red-400 hover:text-red-300 font-semibold">Clear all</button>
                        </div>
                        {selectedFiles.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-2 bg-neutral-900 rounded-lg border border-white/5">
                            <ImageIcon className="w-4 h-4 text-orange-400" />
                            <span className="text-sm text-neutral-300 truncate flex-1">{file.name}</span>
                            <span className="text-xs text-neutral-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                          </div>
                        ))}
                      </div>

                      {analysisError && (
                        <div className="w-full p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 text-red-400 text-sm">
                          <AlertCircle className="w-4 h-4 flex-shrink-0" />
                          {analysisError}
                        </div>
                      )}

                      {showBatchForm && selectedFiles.length > 1 && (
                        <div className="w-full bg-neutral-900 border border-orange-500/20 rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Boxes className="w-4 h-4 text-orange-400" />
                            <h4 className="text-sm font-bold text-white">Batch Registration</h4>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-400 flex items-center gap-1"><Tag className="w-3 h-3"/> Label</label>
                              <input
                                type="text"
                                value={batchMeta.label}
                                onChange={(e) => setBatchMeta((m) => ({ ...m, label: e.target.value }))}
                                placeholder="e.g. Summer Collection Returns"
                                className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500/50"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-400 flex items-center gap-1"><MapPin className="w-3 h-3"/> Source</label>
                              <input
                                type="text"
                                value={batchMeta.source}
                                onChange={(e) => setBatchMeta((m) => ({ ...m, source: e.target.value }))}
                                placeholder="e.g. Store #42, Online Returns"
                                className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500/50"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-400 flex items-center gap-1"><Scale className="w-3 h-3"/> Est. Quantity (kg)</label>
                              <input
                                type="number"
                                value={batchMeta.quantityKg}
                                onChange={(e) => setBatchMeta((m) => ({ ...m, quantityKg: e.target.value }))}
                                placeholder="e.g. 12.5"
                                className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500/50"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-neutral-400 flex items-center gap-1"><StickyNote className="w-3 h-3"/> Notes</label>
                              <input
                                type="text"
                                value={batchMeta.notes}
                                onChange={(e) => setBatchMeta((m) => ({ ...m, notes: e.target.value }))}
                                placeholder="Optional notes..."
                                className="w-full bg-neutral-950 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-orange-500/50"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3">
                        {selectedFiles.length > 1 && showBatchForm ? (
                          <>
                            <button
                              onClick={runBatchAnalysis}
                              disabled={isAnalyzing}
                              className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm flex items-center gap-2"
                            >
                              {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
                              {isAnalyzing ? "Processing Batch..." : "Confirm & Analyze Batch"}
                            </button>
                            <button
                              onClick={() => setShowBatchForm(false)}
                              disabled={isAnalyzing}
                              className="border border-white/10 px-4 py-2.5 rounded-xl font-bold text-neutral-300 hover:bg-neutral-800"
                            >
                              Back
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={runAnalysis}
                              disabled={isAnalyzing}
                              className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold shadow-sm flex items-center gap-2"
                            >
                              {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
                              {isAnalyzing ? "Processing..." : selectedFiles.length > 1 ? "Register Batch & Analyze" : "Run Intelligence Analysis"}
                            </button>
                            <button
                              onClick={clearUpload}
                              disabled={isAnalyzing}
                              className="border border-white/10 px-4 py-2.5 rounded-xl font-bold text-neutral-300 hover:bg-neutral-800"
                            >
                              Clear
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {/* POST-ANALYSIS RESULTS */}
                  {analysisComplete && (
                    <div className="mt-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
                        <div>
                          <h4 className="text-xl font-bold text-white">
                            {batchResult ? "Batch Intelligence Report" : "Sustainability Intelligence Report"}
                          </h4>
                          {batchResult?.batch_label && (
                            <p className="text-sm text-neutral-400 mt-1">Batch: <span className="text-orange-400 font-semibold">{batchResult.batch_label}</span></p>
                          )}
                          {batchResult?.batch_id && (
                            <p className="text-xs text-neutral-500 font-mono mt-0.5">ID: {batchResult.batch_id}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          {batchResult?.batch_id && (
                            <button
                              onClick={() => handleDownloadBatchReport(batchResult.batch_id!)}
                              disabled={downloadingBatchId === batchResult.batch_id}
                              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all border border-orange-500/20 disabled:opacity-50"
                            >
                              {downloadingBatchId === batchResult.batch_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                              Download Full Batch Report (PDF)
                            </button>
                          )}
                          {singleResult?.scan_id && (
                            <button
                              onClick={() => downloadSingleScanReport(singleResult.scan_id!)}
                              disabled={isExporting}
                              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all border border-orange-500/20 disabled:opacity-50"
                            >
                              {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                              Download Scan Report (PDF)
                            </button>
                          )}
                          <button
                            onClick={() => downloadReport("excel", "analysis_summary_report")}
                            disabled={isExporting}
                            className="flex items-center gap-2 bg-neutral-900 border border-white/10 text-emerald-400 hover:bg-neutral-800 px-4 py-2 rounded-xl font-bold text-xs shadow-sm transition-all"
                          >
                            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
                            Export Excel
                          </button>
                          <button onClick={clearUpload} className="text-xs font-bold text-neutral-300 bg-neutral-900 border border-white/10 px-4 py-2 rounded-xl hover:bg-neutral-800">
                            Analyze New Batch
                          </button>
                        </div>
                      </div>

                      {batchResult && batchResult.summary && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-neutral-950 border border-white/5 rounded-xl p-4">
                            <p className="text-xs font-bold text-neutral-500 uppercase">Total Processed</p>
                            <p className="text-2xl font-extrabold text-white mt-1">{batchResult.summary.total_processed}</p>
                          </div>
                          <div className="bg-neutral-950 border border-white/5 rounded-xl p-4">
                            <p className="text-xs font-bold text-neutral-500 uppercase">Avg. Circularity</p>
                            <p className="text-2xl font-extrabold text-orange-400 mt-1">{batchResult.summary.average_circularity_score}</p>
                          </div>
                          <div className="bg-neutral-950 border border-white/5 rounded-xl p-4">
                            <p className="text-xs font-bold text-neutral-500 uppercase">Dominant Material</p>
                            <p className="text-2xl font-extrabold text-white mt-1">{batchResult.summary.dominant_material}</p>
                          </div>
                          <div className="bg-neutral-950 border border-white/5 rounded-xl p-4">
                            <p className="text-xs font-bold text-neutral-500 uppercase">Material Breakdown</p>
                            <div className="mt-2 space-y-1">
                              {Object.entries(batchResult.summary.material_breakdown).map(([mat, count]) => (
                                <div key={mat} className="flex justify-between text-xs">
                                  <span className="text-neutral-400">{mat}</span>
                                  <span className="text-white font-bold">{count}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* INDIVIDUAL / SINGLE RESULT CARDS */}
                      <div className="grid grid-cols-1 gap-6">
                        {(batchResult ? batchResult.results : singleResult ? [singleResult] : []).map((result, idx) => {
                          const r = result.recyclability;
                          const a = result.analysis;
                          const scores = r.component_scores || { recyclability_score: 0, reuse_score: 0, sustainability_score: 0, material_recovery_score: 0 };
                          const tips = r.waste_reduction_tips || [];
                          const isExpanded = batchResult ? expandedBatchItems.has(idx) : true;
                          const targetScanId = result.scan_id || (result as { _id?: string })._id;

                          return (
                            <div key={idx} className="bg-neutral-950 rounded-2xl border border-white/5 p-6 space-y-5">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-orange-500/10 rounded-lg">
                                    <ImageIcon className="w-5 h-5 text-orange-400" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-white">{result.filename}</p>
                                    {targetScanId && <p className="text-xs text-neutral-500 font-mono">{targetScanId}</p>}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className={getCategoryBadge(r.circularity_category)}>
                                    <CheckCircle2 className="w-3.5 h-3.5" /> {r.circularity_category}
                                  </span>
                                  {targetScanId && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        downloadSingleScanReport(targetScanId);
                                      }}
                                      disabled={isExporting}
                                      className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-300 bg-neutral-900 border border-white/10 hover:bg-neutral-800 px-3 py-1.5 rounded-xl transition-all disabled:opacity-50"
                                    >
                                      <FileDown className="w-3.5 h-3.5 text-orange-400" />
                                      <span>PDF Report</span>
                                    </button>
                                  )}
                                  {batchResult && (
                                    <button onClick={() => toggleBatchItem(idx)} className="p-1.5 hover:bg-white/5 rounded-lg transition-colors">
                                      {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-400"/> : <ChevronDown className="w-4 h-4 text-neutral-400"/>}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {isExpanded && (
                                <>
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Environmental Impact Assessment Engine */}
                                    {(() => {
                                      const gLabel = a.garment_type?.label || "Garment";
                                      const mLabel = a.material_type?.label || "Material";
                                      const itemWeightKg = result.impact?.weight_kg ?? getItemWeightKg(gLabel, mLabel);
                                      const co2Val = result.impact?.co2e_avoided_kg ?? Math.round(itemWeightKg * 5.5 * 10) / 10;
                                      const waterVal = result.impact?.water_saved_l ?? Math.round(itemWeightKg * 400);
                                      const landfillVal = result.impact?.landfill_diverted_kg ?? Math.round(itemWeightKg * 0.95 * 10) / 10;

                                      return (
                                        <div className="space-y-5">
                                          <div className="flex items-center justify-between">
                                            <h5 className="font-bold text-white flex items-center gap-2">
                                              <Leaf className="w-5 h-5 text-emerald-400" /> Environmental Impact Assessment Engine
                                            </h5>
                                            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
                                              Weight: {itemWeightKg} kg
                                            </span>
                                          </div>
                                          <p className="text-xs text-neutral-400">
                                            Item weight calculated from <strong className="text-white">{gLabel}</strong> + <strong className="text-white">{mLabel}</strong> density model.
                                          </p>
                                          <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 bg-neutral-900 border border-white/5 rounded-xl">
                                              <p className="text-xs font-bold text-neutral-500 uppercase">CO₂ Savings Est.</p>
                                              <p className="text-2xl font-extrabold text-white mt-1">{co2Val} kg</p>
                                            </div>
                                            <div className="p-4 bg-neutral-900 border border-white/5 rounded-xl">
                                              <p className="text-xs font-bold text-neutral-500 uppercase">Water Savings Est.</p>
                                              <p className="text-2xl font-extrabold text-white mt-1">{waterVal} L</p>
                                            </div>
                                            <div className="p-4 bg-neutral-900 border border-white/5 rounded-xl">
                                              <p className="text-xs font-bold text-neutral-500 uppercase">Landfill Reduction</p>
                                              <p className="text-2xl font-extrabold text-white mt-1">{landfillVal} kg</p>
                                            </div>
                                            <div className="p-4 bg-neutral-900 border border-white/5 rounded-xl">
                                              <p className="text-xs font-bold text-neutral-500 uppercase">Calculated Weight</p>
                                              <p className="text-2xl font-extrabold text-orange-400 mt-1">{itemWeightKg} kg</p>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })()}

                                    {/* Waste Scoring Engine */}
                                    <div className="flex flex-col sm:flex-row items-center gap-8">
                                      <div className="relative w-40 h-40 flex-shrink-0">
                                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                                          <circle cx="60" cy="60" r="54" className="fill-none stroke-neutral-900" strokeWidth="12" />
                                          <circle cx="60" cy="60" r="54" className="fill-none stroke-orange-500" strokeWidth="12" strokeLinecap="round"
                                            strokeDasharray={2 * Math.PI * 54}
                                            strokeDashoffset={circularityDashOffset(r.circularity_score)}
                                          />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                          <span className="text-3xl font-extrabold text-white">{r.circularity_score}</span>
                                          <span className="text-xs font-semibold text-neutral-500 text-center px-2">Overall Circularity Score</span>
                                        </div>
                                      </div>
                                      <div className="flex-1 w-full space-y-3">
                                        <h5 className="font-bold text-white mb-2">Waste Scoring Engine Breakdown</h5>
                                        {[
                                          { label: "Material Recyclability", w: "35%", s: scores.recyclability_score },
                                          { label: "Material Condition", w: "20%", s: a.waste_status?.confidence ? Math.round(a.waste_status.confidence * 100) : 80 },
                                          { label: "Reuse Potential", w: "20%", s: scores.reuse_score },
                                          { label: "Environmental Benefit", w: "15%", s: scores.sustainability_score },
                                          { label: "Processing Feasibility", w: "10%", s: scores.material_recovery_score },
                                        ].map((score) => (
                                          <div key={score.label}>
                                            <div className="flex justify-between text-xs mb-1">
                                              <span className="font-semibold text-neutral-400">{score.label} ({score.w})</span>
                                              <span className="font-bold text-white">{score.s}</span>
                                            </div>
                                            <div className="w-full h-1.5 rounded-full bg-neutral-900 overflow-hidden border border-white/5">
                                              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(score.s, 100)}%` }} />
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Circularity & Recommendations */}
                                  <div className="bg-neutral-900 rounded-2xl border border-white/5 p-6">
                                    <div className="flex flex-col md:flex-row items-center justify-between mb-4 border-b border-white/5 pb-4">
                                      <div>
                                        <h5 className="font-bold text-white flex items-center gap-2"><Recycle className="w-5 h-5 text-orange-400" /> Circular Economy Analytics</h5>
                                        <p className="text-xs text-neutral-400 mt-1">Classification and routing recommendations.</p>
                                      </div>
                                      <div className="mt-4 md:mt-0 flex items-center gap-2">
                                        <span className="text-xs text-neutral-400">Circularity Category:</span>
                                        <span className={getCategoryBadge(r.circularity_category)}>
                                          <CheckCircle2 className="w-3.5 h-3.5" /> {r.circularity_category}
                                        </span>
                                      </div>
                                    </div>

                                    <div className="flex flex-col lg:flex-row gap-4">
                                      <div className="bg-neutral-950 border border-white/5 rounded-xl p-4 flex-1">
                                        <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Waste Status Score</p>
                                        <p className="text-lg font-bold text-white">{r.waste_category}</p>
                                      </div>
                                      <div className="bg-neutral-950 border border-white/5 rounded-xl p-4 flex-1">
                                        <p className="text-xs font-bold text-neutral-500 uppercase mb-1">Material Composition</p>
                                        <p className="text-lg font-bold text-white">{a.material_type?.label || "Unknown"}</p>
                                      </div>
                                      <div className="bg-neutral-950 border border-orange-500/20 rounded-xl p-4 flex-[2] relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-2xl rounded-full pointer-events-none" />
                                        <p className="text-xs font-bold text-orange-400 uppercase mb-1">Recycling Recommendation Workflow</p>
                                        <p className="text-xl font-extrabold text-white flex items-center gap-2">{r.recommended_recycling_option}</p>
                                        <p className="text-xs text-neutral-400 mt-1">Route according to confidence and material purity.</p>
                                      </div>
                                    </div>

                                    {tips.length > 0 && (
                                      <div className="mt-4 pt-4 border-t border-white/5">
                                        <h6 className="text-xs font-bold text-neutral-400 uppercase mb-2 flex items-center gap-2">
                                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Waste Reduction Tips
                                        </h6>
                                        <ul className="space-y-2">
                                          {tips.map((tip, tIdx) => (
                                            <li key={tIdx} className="flex items-start gap-2 text-sm text-neutral-300">
                                              <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1.5 flex-shrink-0" />
                                              {tip}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    {r.defect_detected && (
                                      <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                                        <p className="text-xs font-bold text-yellow-400 uppercase mb-1">Defect Detected</p>
                                        <p className="text-sm text-yellow-200/80">{r.defect_detected.label} (confidence: {Math.round((r.defect_detected.confidence || 0) * 100)}%)</p>
                                      </div>
                                    )}
                                    {r.inspection_flag && (
                                      <div className="mt-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                                        <p className="text-xs font-bold text-red-400 uppercase mb-1">Inspection Flag</p>
                                        <p className="text-sm text-red-200/80">{r.inspection_flag}</p>
                                      </div>
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── MODE 2: PLATFORM INVENTORY BATCH LINKING & LOOKUP ── */}
              {tab1Mode === "browse-batches" && (
                <div className="space-y-6">
                  <div className="bg-neutral-900 rounded-3xl border border-white/5 p-6 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <Boxes className="w-5 h-5 text-orange-400" /> Platform Waste Batches
                        </h3>
                        <p className="text-sm text-neutral-400">Browse batches created across Recycling Facilitators and platform operators to view live sustainability assessments.</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-3" />
                          <input
                            type="text"
                            value={batchSearchQuery}
                            onChange={(e) => setBatchSearchQuery(e.target.value)}
                            placeholder="Filter by fabric, condition, source..."
                            className="bg-neutral-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500/50 w-64"
                          />
                        </div>
                        <button
                          onClick={fetchPlatformBatches}
                          className="p-2 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl border border-white/5 transition-all"
                        >
                          <RefreshCw className={`w-4 h-4 ${isBatchesLoading ? "animate-spin" : ""}`} />
                        </button>
                      </div>
                    </div>

                    {isBatchesLoading ? (
                      <div className="p-12 flex justify-center items-center text-neutral-500 gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-orange-400" /> Loading platform inventory batches...
                      </div>
                    ) : filteredPlatformBatches.length === 0 ? (
                      <div className="p-8 text-center text-neutral-500 border border-dashed border-white/10 rounded-2xl">
                        No batches found matching query. Register batches via Recycling Facilitator dashboard or the AI Batch Uploader.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-72 overflow-y-auto pr-2">
                        {filteredPlatformBatches.map((batch) => {
                          const isSelected = selectedBatchId === batch._id;
                          return (
                            <div
                              key={batch._id}
                              onClick={() => fetchBatchAssessment(batch._id)}
                              className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                                isSelected
                                  ? "bg-orange-950/30 border-orange-500 shadow-md shadow-orange-950/50"
                                  : "bg-neutral-950 border-white/5 hover:border-white/20 hover:bg-neutral-900"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-bold text-white text-sm">{batch.fabric_type} Batch</span>
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900 border border-white/10 text-orange-400">
                                  {batch.condition}
                                </span>
                              </div>
                              <div className="space-y-1 text-xs text-neutral-400">
                                <p><span className="text-neutral-500">Weight:</span> <strong className="text-white">{batch.quantity_kg} kg</strong></p>
                                {batch.source && <p><span className="text-neutral-500">Source:</span> {batch.source}</p>}
                                <p className="text-[10px] text-neutral-600 font-mono truncate">ID: {batch._id}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Batch Assessment Detail Drawer */}
                  {isAssessmentLoading && (
                    <div className="p-12 bg-neutral-900 rounded-3xl border border-white/5 flex justify-center items-center gap-3 text-white font-bold">
                      <Loader2 className="w-6 h-6 animate-spin text-orange-400" /> Calculating cross-role sustainability assessment...
                    </div>
                  )}

                  {!isAssessmentLoading && selectedBatchAssessment && (
                    <div className="bg-neutral-900 rounded-3xl border border-white/5 p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-xl font-bold text-white">Sustainability Assessment: {selectedBatchAssessment.batch_meta?.fabric_type || "Batch"}</h4>
                            <span className={getCategoryBadge(selectedBatchAssessment.recyclability.circularity_category)}>
                              {selectedBatchAssessment.recyclability.circularity_category}
                            </span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-1">
                            Batch ID: <span className="font-mono text-orange-400">{selectedBatchAssessment.batch_id}</span> • Quantity: <strong className="text-white">{selectedBatchAssessment.batch_meta?.quantity_kg || selectedBatchAssessment.impact.weight_kg} kg</strong>
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => downloadReport("pdf", "sustainability_report", selectedBatchAssessment.batch_id)}
                            disabled={isExporting}
                            className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                          >
                            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                            Sustainability Report (PDF)
                          </button>
                          <button
                            onClick={() => downloadReport("pdf", "environmental_impact_report", selectedBatchAssessment.batch_id)}
                            disabled={isExporting}
                            className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-xs font-bold text-neutral-200 border border-white/10 rounded-xl flex items-center gap-1.5 transition-all"
                          >
                            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5 text-orange-400" />}
                            Environmental Impact (PDF)
                          </button>
                          <button
                            onClick={() => downloadReport("pdf", "circular_economy_report", selectedBatchAssessment.batch_id)}
                            disabled={isExporting}
                            className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-xs font-bold text-neutral-200 border border-white/10 rounded-xl flex items-center gap-1.5 transition-all"
                          >
                            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5 text-orange-400" />}
                            Circular Economy (PDF)
                          </button>
                          <button
                            onClick={() => downloadReport("pdf", "waste_classification_report", selectedBatchAssessment.batch_id)}
                            disabled={isExporting}
                            className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-xs font-bold text-neutral-200 border border-white/10 rounded-xl flex items-center gap-1.5 transition-all"
                          >
                            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5 text-orange-400" />}
                            Waste Classification (PDF)
                          </button>
                          <button
                            onClick={() => downloadReport("pdf", "recycling_report", selectedBatchAssessment.batch_id)}
                            disabled={isExporting}
                            className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-xs font-bold text-neutral-200 border border-white/10 rounded-xl flex items-center gap-1.5 transition-all"
                          >
                            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5 text-orange-400" />}
                            Recycling Pathway (PDF)
                          </button>
                          <button
                            onClick={() => downloadReport("excel", "waste_classification_report", selectedBatchAssessment.batch_id)}
                            disabled={isExporting}
                            className="px-3 py-1.5 bg-neutral-950 hover:bg-neutral-800 text-xs font-bold text-emerald-400 border border-white/10 rounded-xl flex items-center gap-1.5 transition-all"
                          >
                            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
                            Batch Excel
                          </button>
                        </div>
                      </div>

                      {/* Top Metrics Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-neutral-950 p-4 rounded-2xl border border-white/5">
                          <p className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-1"><Wind className="w-3.5 h-3.5 text-orange-400" /> CO₂ Savings Est.</p>
                          <p className="text-2xl font-extrabold text-white mt-1">{selectedBatchAssessment.impact.co2e_avoided_kg} kg</p>
                        </div>
                        <div className="bg-neutral-950 p-4 rounded-2xl border border-white/5">
                          <p className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-1"><Droplets className="w-3.5 h-3.5 text-blue-400" /> Water Saved</p>
                          <p className="text-2xl font-extrabold text-white mt-1">{selectedBatchAssessment.impact.water_saved_l} L</p>
                        </div>
                        <div className="bg-neutral-950 p-4 rounded-2xl border border-white/5">
                          <p className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-1"><Package className="w-3.5 h-3.5 text-emerald-400" /> Landfill Reduction</p>
                          <p className="text-2xl font-extrabold text-white mt-1">{selectedBatchAssessment.impact.landfill_diverted_kg} kg</p>
                        </div>
                        <div className="bg-neutral-950 p-4 rounded-2xl border border-white/5">
                          <p className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-1"><Activity className="w-3.5 h-3.5 text-amber-400" /> Overall Circularity</p>
                          <p className="text-2xl font-extrabold text-orange-400 mt-1">{selectedBatchAssessment.recyclability.circularity_score} / 100</p>
                        </div>
                      </div>

                      {/* Waste Scoring Engine Breakdown */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-neutral-950 p-6 rounded-2xl border border-white/5 space-y-4">
                          <h5 className="font-bold text-white flex items-center gap-2">
                            <Activity className="w-4 h-4 text-orange-400" /> Waste Scoring Engine Breakdown
                          </h5>
                          {[
                            { label: "Material Recyclability", w: "35%", s: selectedBatchAssessment.recyclability.component_scores.recyclability_score },
                            { label: "Material Condition", w: "20%", s: selectedBatchAssessment.recyclability.component_scores.reuse_score },
                            { label: "Reuse Potential", w: "20%", s: selectedBatchAssessment.recyclability.component_scores.reuse_score },
                            { label: "Environmental Benefit", w: "15%", s: selectedBatchAssessment.recyclability.component_scores.sustainability_score },
                            { label: "Processing Feasibility", w: "10%", s: selectedBatchAssessment.recyclability.component_scores.material_recovery_score },
                          ].map((sc) => (
                            <div key={sc.label}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-neutral-400 font-medium">{sc.label} ({sc.w})</span>
                                <span className="text-white font-bold">{sc.s}</span>
                              </div>
                              <div className="w-full h-2 rounded-full bg-neutral-900 overflow-hidden border border-white/5">
                                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(sc.s, 100)}%` }} />
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="bg-neutral-950 p-6 rounded-2xl border border-white/5 space-y-4">
                          <h5 className="font-bold text-white flex items-center gap-2">
                            <Recycle className="w-4 h-4 text-emerald-400" /> Circular Routing & Recommendations
                          </h5>
                          <div className="space-y-3">
                            <div className="p-3 bg-neutral-900 rounded-xl border border-white/5">
                              <p className="text-xs font-bold text-neutral-500 uppercase">Recommended Recycling Workflow</p>
                              <p className="text-lg font-extrabold text-white mt-0.5">{selectedBatchAssessment.recyclability.recommended_recycling_option}</p>
                            </div>
                            <div className="p-3 bg-neutral-900 rounded-xl border border-white/5">
                              <p className="text-xs font-bold text-neutral-500 uppercase">Waste Status</p>
                              <p className="text-sm font-bold text-emerald-400 mt-0.5">{selectedBatchAssessment.recyclability.waste_category}</p>
                            </div>
                            {selectedBatchAssessment.recyclability.waste_reduction_tips?.length > 0 && (
                              <div className="pt-2">
                                <p className="text-xs font-bold text-neutral-400 uppercase mb-2">Reduction Tips</p>
                                <ul className="space-y-1">
                                  {selectedBatchAssessment.recyclability.waste_reduction_tips.map((tip, idx) => (
                                    <li key={idx} className="text-xs text-neutral-300 flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 bg-orange-400 rounded-full mt-1 flex-shrink-0" /> {tip}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Individual Scans Breakdown & Per-Scan PDF Export Section */}
                      {selectedBatchAssessment.scans && selectedBatchAssessment.scans.length > 0 && (
                        <div className="bg-neutral-950 rounded-2xl border border-white/5 overflow-hidden space-y-0">
                          <div className="p-4 border-b border-white/5 bg-neutral-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <h5 className="font-bold text-white text-sm flex items-center gap-2">
                                <Layers className="w-4 h-4 text-orange-400" /> Individual Scans in this Batch ({selectedBatchAssessment.scans.length})
                              </h5>
                              <p className="text-xs text-neutral-400">View individual item analyses and download single-scan PDF reports for specific items.</p>
                            </div>
                          </div>

                          <div className="divide-y divide-white/5">
                            {selectedBatchAssessment.scans.map((scan: SingleResult, idx: number) => {
                              const scanId = scan.scan_id || scan._id;
                              const isExpanded = expandedScanIdx === idx;
                              const analysis = scan.analysis || {};
                              const recyclability = scan.recyclability || {};
                              const garment = analysis.garment_type?.label || "Scrap/Garment";
                              const material = analysis.material_type?.label || "Mixed Material";
                              const condition = analysis.waste_status?.label || "Recyclable";
                              const circularityScore = recyclability.circularity_score ?? "—";
                              const pathway = recyclability.recommended_recycling_option || "Processing";

                              return (
                                <div key={scanId || idx} className="flex flex-col">
                                  <div
                                    onClick={() => setExpandedScanIdx(isExpanded ? null : idx)}
                                    className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer transition-colors ${
                                      isExpanded ? "bg-white/5" : "hover:bg-white/5"
                                    }`}
                                  >
                                    <div className="flex-1 min-w-0">
                                      <p className="font-bold text-white text-sm truncate">{scan.filename || `Scan #${idx + 1}`}</p>
                                      <p className="text-xs text-neutral-400 mt-0.5">
                                        {garment} &middot; <strong className="text-neutral-200">{material}</strong> &middot; {condition}
                                      </p>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                      <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400">
                                        Score: {circularityScore}
                                      </span>
                                      <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-300 hidden sm:inline-block">
                                        {pathway}
                                      </span>
                                      {scanId && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            downloadSingleScanReport(scanId);
                                          }}
                                          disabled={isExporting}
                                          className="flex items-center gap-1 text-xs font-bold text-neutral-200 bg-neutral-900 hover:bg-neutral-800 border border-white/10 px-3 py-1.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
                                          title="Download Individual Scan PDF Report"
                                        >
                                          <FileDown className="w-3.5 h-3.5 text-orange-400" />
                                          <span>Single Scan PDF</span>
                                        </button>
                                      )}
                                      {isExpanded ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                                    </div>
                                  </div>

                                  {isExpanded && (
                                    <div className="p-4 bg-black/40 border-t border-white/5 space-y-3 animate-in fade-in duration-200">
                                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                        <div className="bg-neutral-900 p-3 rounded-xl border border-white/5">
                                          <p className="text-neutral-500 font-bold uppercase text-[10px]">Garment Classification</p>
                                          <p className="font-bold text-white mt-1">{garment} ({analysis.garment_type?.confidence ? Math.round(analysis.garment_type.confidence * 100) : "—"}%)</p>
                                        </div>
                                        <div className="bg-neutral-900 p-3 rounded-xl border border-white/5">
                                          <p className="text-neutral-500 font-bold uppercase text-[10px]">Material Fiber</p>
                                          <p className="font-bold text-white mt-1">{material} ({analysis.material_type?.confidence ? Math.round(analysis.material_type.confidence * 100) : "—"}%)</p>
                                        </div>
                                        <div className="bg-neutral-900 p-3 rounded-xl border border-white/5">
                                          <p className="text-neutral-500 font-bold uppercase text-[10px]">Condition & Pathway</p>
                                          <p className="font-bold text-white mt-1">{condition} &rarr; <span className="text-orange-400">{pathway}</span></p>
                                        </div>
                                      </div>

                                      {scanId && (
                                        <div className="pt-1 flex justify-end">
                                          <button
                                            onClick={() => downloadSingleScanReport(scanId)}
                                            disabled={isExporting}
                                            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-sm transition-all"
                                          >
                                            {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                                            Download Detailed Scan PDF Report ({scan.filename || scanId})
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 2: CARBON REDUCTION REPORTS                            */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === "carbon-reduction" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Wind className="w-5 h-5 text-orange-400" /> Carbon Footprint & Environmental Impact Assessment Engine
                  </h3>
                  <p className="text-sm text-neutral-400">Aggregate estimations derived from real-time footprint models over the selected {periodDays}-day window.</p>
                </div>

                <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-xl border border-white/5">
                  {[30, 60, 90, 365].map((days) => (
                    <button
                      key={days}
                      onClick={() => setPeriodDays(days)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        periodDays === days ? "bg-orange-600 text-white" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {days === 365 ? "1 Year" : `${days} Days`}
                    </button>
                  ))}
                </div>
              </div>

              {isSummaryLoading ? (
                <div className="p-16 bg-neutral-900 rounded-3xl border border-white/5 flex justify-center items-center gap-3 text-neutral-400">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-400" /> Computing carbon reduction models...
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Summary Stats */}
                    <div className="bg-neutral-900 rounded-3xl border border-white/5 shadow-sm p-6 flex flex-col justify-center">
                      <div className="space-y-6">
                        <div>
                          <p className="text-xs font-bold text-neutral-500 flex items-center gap-2 uppercase tracking-wide mb-1"><Wind className="w-4 h-4 text-orange-400"/> Total CO₂ Savings</p>
                          <h3 className="text-4xl font-extrabold text-white">
                            {(summaryData?.impact_summary?.total_co2e_avoided_kg ?? 0).toLocaleString()} <span className="text-lg text-neutral-500">kg</span>
                          </h3>
                        </div>
                        <div className="h-px w-full bg-white/5" />
                        <div>
                          <p className="text-xs font-bold text-neutral-500 flex items-center gap-2 uppercase tracking-wide mb-1"><Droplets className="w-4 h-4 text-blue-400"/> Water Savings</p>
                          <h3 className="text-4xl font-extrabold text-white">
                            {(summaryData?.impact_summary?.total_water_saved_l ?? 0).toLocaleString()} <span className="text-lg text-neutral-500">L</span>
                          </h3>
                        </div>
                        <div className="h-px w-full bg-white/5" />
                        <div>
                          <p className="text-xs font-bold text-neutral-500 flex items-center gap-2 uppercase tracking-wide mb-1"><Package className="w-4 h-4 text-emerald-400"/> Landfill Reduction</p>
                          <h3 className="text-4xl font-extrabold text-white">
                            {(summaryData?.impact_summary?.total_landfill_diverted_kg ?? 0).toLocaleString()} <span className="text-lg text-neutral-500">kg</span>
                          </h3>
                        </div>
                      </div>
                    </div>

                    {/* Material Carbon Breakdown Table */}
                    <div className="lg:col-span-2 bg-neutral-900 rounded-3xl border border-white/5 shadow-sm p-6 overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-white">Carbon Footprint Estimation by Material</h3>
                        <span className="text-xs text-neutral-500 font-semibold">{summaryData?.impact_summary?.by_material?.length || 0} Materials Tracked</span>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-neutral-950 text-neutral-400 font-bold border-b border-white/5">
                            <tr>
                              <th className="px-4 py-3">Material Type</th>
                              <th className="px-4 py-3">Items</th>
                              <th className="px-4 py-3">Weight (kg)</th>
                              <th className="px-4 py-3">CO₂e Avoided</th>
                              <th className="px-4 py-3">Water Saved</th>
                              <th className="px-4 py-3 text-right">Landfill Diverted</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5">
                            {(summaryData?.impact_summary?.by_material || []).length === 0 ? (
                              <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                                  No material data logged for this period. Run AI scans or register batches to populate.
                                </td>
                              </tr>
                            ) : (
                              (summaryData?.impact_summary?.by_material || []).map((row) => (
                                <tr key={row.material_type} className="hover:bg-white/5 transition-colors">
                                  <td className="px-4 py-3 font-bold text-white">{row.material_type}</td>
                                  <td className="px-4 py-3 text-neutral-400">{row.item_count}</td>
                                  <td className="px-4 py-3 text-neutral-300 font-semibold">{row.weight_kg} kg</td>
                                  <td className="px-4 py-3 text-orange-400 font-bold">{row.co2e_avoided_kg} kg</td>
                                  <td className="px-4 py-3 text-blue-400 font-semibold">{row.water_saved_l} L</td>
                                  <td className="px-4 py-3 text-right text-emerald-400 font-bold">{row.landfill_diverted_kg} kg</td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Carbon Reduction Pie Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PieChartWidget
                      data={carbonMaterialPieData}
                      title="CO₂ Savings Contribution by Material"
                      subtitle="Avoided carbon emissions contribution per fiber type"
                      unit="kg"
                      centerText={`${(summaryData?.impact_summary?.total_co2e_avoided_kg ?? 0).toFixed(0)}`}
                      centerSubtext="CO₂e kg Saved"
                    />
                    <PieChartWidget
                      data={loopTierPieData}
                      title="Circularity Hierarchy for Offset Analysis"
                      subtitle="Loop tier breakdown mapping carbon reduction efficiency"
                      unit="items"
                      centerText={`${summaryData?.impact_summary?.item_count ?? 0}`}
                      centerSubtext="Items Analyzed"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 3: WASTE DIVERSION ANALYTICS                           */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === "waste-diversion" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-orange-400" /> Waste Diversion & Circular Economy Analytics
                  </h3>
                  <p className="text-sm text-neutral-400">Resource recovery estimation and diversion rates mapped to circular economy tiers over {periodDays} days.</p>
                </div>

                <div className="flex items-center gap-2 bg-neutral-900 p-1.5 rounded-xl border border-white/5">
                  {[30, 60, 90, 365].map((days) => (
                    <button
                      key={days}
                      onClick={() => setPeriodDays(days)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        periodDays === days ? "bg-orange-600 text-white" : "text-neutral-400 hover:text-white"
                      }`}
                    >
                      {days === 365 ? "1 Year" : `${days} Days`}
                    </button>
                  ))}
                </div>
              </div>

              {isSummaryLoading ? (
                <div className="p-16 bg-neutral-900 rounded-3xl border border-white/5 flex justify-center items-center gap-3 text-neutral-400">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-400" /> Analyzing waste diversion streams...
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Waste Diversion Pie Charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PieChartWidget
                      data={diversionStatusPieData}
                      title="Landfill Diversion Ratio"
                      subtitle="Proportion of diverted textiles vs non-diverted waste"
                      unit="items"
                      centerText={`${summaryData?.waste_diversion?.diversion_rate_pct ?? 0}%`}
                      centerSubtext="Diversion Rate"
                    />
                    <PieChartWidget
                      data={diversionMaterialPieData}
                      title="Diversion Volume by Fiber Material"
                      subtitle="Diverted item volume per textile fiber classification"
                      unit="items"
                      centerText={`${summaryData?.waste_diversion?.diverted_count ?? 0}`}
                      centerSubtext="Diverted Items"
                    />
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Diversion Status Gauge */}
                  <div className="bg-neutral-900 rounded-3xl border border-white/5 shadow-sm p-6 space-y-6">
                    <h4 className="font-bold text-white">Waste Diversion Analysis</h4>
                    
                    <div className="flex items-center gap-6">
                      <div className="relative w-28 h-28 flex-shrink-0">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90 drop-shadow-lg">
                          <circle cx="60" cy="60" r="50" className="fill-none stroke-neutral-950" strokeWidth="12" />
                          <circle
                            cx="60"
                            cy="60"
                            r="50"
                            className="fill-none stroke-orange-500"
                            strokeWidth="12"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 50}
                            strokeDashoffset={2 * Math.PI * 50 - ((summaryData?.waste_diversion?.diversion_rate_pct ?? 0) / 100) * (2 * Math.PI * 50)}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xl font-extrabold text-white">
                            {summaryData?.waste_diversion?.diversion_rate_pct ?? 0}%
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-neutral-400 uppercase">Diversion Rate</p>
                        <p className="text-xs text-neutral-500 mt-1">Non-diverted items restricted to Hazardous status.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="p-4 bg-neutral-950 border border-white/5 rounded-xl flex justify-between items-center">
                        <span className="font-semibold text-white text-xs flex items-center gap-2"><Recycle className="w-4 h-4 text-emerald-400"/> Diverted</span>
                        <span className="font-bold text-emerald-400 text-sm">{summaryData?.waste_diversion?.diverted_count ?? 0} items</span>
                      </div>
                      <div className="p-4 bg-neutral-950 border border-white/5 rounded-xl flex justify-between items-center">
                        <span className="font-semibold text-white text-xs flex items-center gap-2"><Trash2 className="w-4 h-4 text-red-400"/> Non-Diverted</span>
                        <span className="font-bold text-red-400 text-sm">{summaryData?.waste_diversion?.non_diverted_count ?? 0} items</span>
                      </div>
                    </div>
                  </div>

                  {/* Circular Economy Analytics & Loop Tiers */}
                  <div className="lg:col-span-2 bg-neutral-900 rounded-3xl border border-white/5 shadow-sm p-6 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-orange-400" />
                        <h4 className="font-bold text-white">Circular Economy Analytics</h4>
                      </div>
                      <div className="flex items-center gap-4 text-xs font-semibold text-neutral-400">
                        <span>Fleet Circularity Index: <strong className="text-orange-400">{summaryData?.circular_economy?.fleet_circularity_index ?? 0}</strong></span>
                        <span>Avg Circularity: <strong className="text-white">{summaryData?.circular_economy?.average_circularity_score ?? 0}</strong></span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      {(summaryData?.circular_economy?.loop_tier_breakdown || []).length === 0 ? (
                        <p className="text-xs text-neutral-500 text-center py-8">No loop tier analytics logged for this period.</p>
                      ) : (
                        (summaryData?.circular_economy?.loop_tier_breakdown || []).map((tier) => (
                          <div key={tier.tier}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-xs font-semibold text-neutral-200">{tier.tier}</span>
                              <span className="text-xs font-bold text-neutral-400">{tier.item_count} items ({tier.percentage}%)</span>
                            </div>
                            <div className="w-full h-3 rounded-full bg-neutral-950 border border-white/5 overflow-hidden">
                              <div className="h-full bg-orange-500 rounded-full" style={{ width: `${Math.min(tier.percentage, 100)}%` }} />
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 4: ESG REPORTING & BENCHMARKING                        */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === "esg" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-neutral-900 rounded-3xl p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6 border border-white/5">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-400" /> Sustainability Benchmarking & ESG Reporting
                  </h3>
                  <p className="text-neutral-400 text-sm max-w-xl">
                    Compare current period metrics ({periodDays}d) to previous periods and generate standardized ESG compliance reports in PDF and Excel formats.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button
                    onClick={() => downloadReport("pdf")}
                    disabled={isExporting}
                    className="flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-5 py-3 rounded-xl font-bold shadow-sm transition-all text-xs"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
                    Export PDF Report
                  </button>
                  <button
                    onClick={() => downloadReport("excel")}
                    disabled={isExporting}
                    className="flex items-center justify-center gap-2 bg-neutral-950 hover:bg-neutral-800 border border-white/10 text-neutral-200 px-5 py-3 rounded-xl font-bold transition-all text-xs"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4 text-emerald-400" />}
                    Export Excel Sheet
                  </button>
                </div>
              </div>

              {isSummaryLoading ? (
                <div className="p-16 bg-neutral-900 rounded-3xl border border-white/5 flex justify-center items-center gap-3 text-neutral-400">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-400" /> Computing period-over-period benchmark comparisons...
                </div>
              ) : (
                <div className="bg-neutral-900 rounded-3xl border border-white/5 shadow-sm p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-orange-400" /> Period-over-Period Benchmarks ({periodDays} Days vs Previous {periodDays} Days)
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      {
                        metric: "CO2e Avoided (kg)",
                        current: summaryData?.benchmark?.co2e_avoided_kg?.current ?? 0,
                        prev: summaryData?.benchmark?.co2e_avoided_kg?.previous ?? 0,
                        change: summaryData?.benchmark?.co2e_avoided_kg?.change_pct,
                      },
                      {
                        metric: "Water Saved (L)",
                        current: summaryData?.benchmark?.water_saved_l?.current ?? 0,
                        prev: summaryData?.benchmark?.water_saved_l?.previous ?? 0,
                        change: summaryData?.benchmark?.water_saved_l?.change_pct,
                      },
                      {
                        metric: "Landfill Diverted (kg)",
                        current: summaryData?.benchmark?.landfill_diverted_kg?.current ?? 0,
                        prev: summaryData?.benchmark?.landfill_diverted_kg?.previous ?? 0,
                        change: summaryData?.benchmark?.landfill_diverted_kg?.change_pct,
                      },
                      {
                        metric: "Scanned Volume (items)",
                        current: summaryData?.benchmark?.item_count?.current ?? 0,
                        prev: summaryData?.benchmark?.item_count?.previous ?? 0,
                        change: summaryData?.benchmark?.item_count?.change_pct,
                      },
                    ].map((bench, i) => {
                      const hasChange = bench.change !== null && bench.change !== undefined;
                      const isPositive = hasChange && (bench.change as number) >= 0;
                      return (
                        <div key={i} className="p-5 border border-white/5 rounded-2xl bg-neutral-950 space-y-3">
                          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">{bench.metric}</p>
                          <p className="text-2xl font-extrabold text-white">{bench.current.toLocaleString()}</p>
                          <p className="text-xs font-semibold text-neutral-500">Previous period: {bench.prev.toLocaleString()}</p>
                          
                          <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                            <span className="text-xs font-semibold text-neutral-500">Period Change</span>
                            <span
                              className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${
                                !hasChange
                                  ? "bg-neutral-800 text-neutral-400 border-white/5"
                                  : isPositive
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : "bg-red-500/10 text-red-400 border-red-500/20"
                              }`}
                            >
                              {hasChange ? `${isPositive ? "+" : ""}${bench.change}%` : "N/A"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

        </main>
      </div>

      {/* SCAN HISTORY & REPORTS MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-white/10">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-neutral-950">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-orange-400" /> Scan History & Reports
                </h3>
                <p className="text-sm text-neutral-400">Review past sustainability AI analyses, grouped by batch, and download reports.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => downloadReport("pdf", "sustainability_waste_classification_report")}
                  disabled={isExporting || historyItems.length === 0}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                  Waste Report (PDF)
                </button>
                <button
                  onClick={() => downloadReport("excel", "sustainability_waste_classification_report")}
                  disabled={isExporting || historyItems.length === 0}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-neutral-900 border border-white/10 hover:bg-neutral-800 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
                  Excel Summary
                </button>
                <button onClick={() => setShowHistoryModal(false)} className="text-neutral-400 hover:text-white p-1 rounded-lg">
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6 space-y-3">
              {isLoadingHistory ? (
                <div className="py-16 text-center text-neutral-400 font-bold">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-orange-400" />
                  Loading scan history...
                </div>
              ) : historyError ? (
                <div className="py-16 text-center text-red-400 font-bold">{historyError}</div>
              ) : historyItems.length === 0 ? (
                <div className="py-16 text-center text-neutral-500 font-semibold">No scan history found. Run an AI analysis to see it recorded here.</div>
              ) : (
                historyItems.map((group) => {
                  const groupKey = group.batch_id ?? `single-${group.scans[0]?._id}`;
                  const isGroupExpanded = expandedHistoryGroup === groupKey;

                  return (
                    <div key={groupKey} className="border border-white/5 rounded-2xl overflow-hidden bg-neutral-950/40">
                      <div
                        onClick={() => setExpandedHistoryGroup(isGroupExpanded ? null : groupKey)}
                        className={`p-4 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer transition-colors ${isGroupExpanded ? "bg-white/5" : "hover:bg-white/5"}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-white text-sm truncate">
                            {group.is_batch
                              ? `Batch: ${group.batch_meta?.label || group.batch_id}`
                              : (group.scans[0]?.filename ?? "Sustainability Scan")}
                          </p>
                          <p className="text-xs font-medium text-neutral-400 mt-1">
                            {group.count} scan{group.count !== 1 ? "s" : ""} &middot; {group.dominant_material} &middot;{" "}
                            {group.latest_created_at ? new Date(group.latest_created_at * 1000).toLocaleString() : "—"}
                          </p>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400">
                            Avg {group.average_circularity_score}
                          </span>
                          {group.is_batch && group.batch_id && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDownloadBatchReport(group.batch_id as string); }}
                              disabled={downloadingBatchId === group.batch_id}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg border border-white/5 disabled:opacity-50"
                            >
                              {downloadingBatchId === group.batch_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5 text-orange-400" />}
                              Batch Report (PDF)
                            </button>
                          )}
                          {isGroupExpanded ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
                        </div>
                      </div>

                      {isGroupExpanded && (
                        <div className="divide-y divide-white/5 bg-black/30 border-t border-white/5">
                          {group.scans.map((scan) => {
                            const isScanExpanded = expandedHistoryScanId === scan._id;
                            return (
                              <div key={scan._id}>
                                <div
                                  onClick={() => setExpandedHistoryScanId(isScanExpanded ? null : scan._id)}
                                  className={`px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 cursor-pointer transition-colors ${isScanExpanded ? "bg-white/5" : "hover:bg-white/5"}`}
                                >
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-white text-sm truncate">{scan.filename}</p>
                                    <p className="text-xs text-neutral-400 mt-0.5">
                                      {scan.analysis.material_type?.label ?? "—"} &middot; {scan.analysis.waste_status?.label ?? "—"} &middot;{" "}
                                      {new Date(scan.created_at * 1000).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="flex-shrink-0 flex items-center gap-3">
                                    <span className="text-xs font-bold px-2 py-0.5 bg-orange-500/10 text-orange-400 rounded border border-orange-500/20">
                                      {scan.recyclability.circularity_score}/100
                                    </span>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDownloadScanReport(scan._id); }}
                                      disabled={downloadingHistoryId === scan._id}
                                      className="inline-flex items-center gap-1 text-xs font-bold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg border border-white/5 disabled:opacity-50"
                                    >
                                      {downloadingHistoryId === scan._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5 text-orange-400" />}
                                      PDF
                                    </button>
                                    {isScanExpanded ? <ChevronUp className="w-4 h-4 text-neutral-500" /> : <ChevronDown className="w-4 h-4 text-neutral-500" />}
                                  </div>
                                </div>

                                {isScanExpanded && (
                                  <div className="p-5 bg-black/40 border-t border-white/5 text-xs space-y-3">
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                      <div className="p-3 bg-neutral-900 rounded-xl border border-white/5">
                                        <span className="text-neutral-500 block text-[10px]">Garment / Type</span>
                                        <span className="font-bold text-white text-sm">{scan.analysis.garment_type?.label || "Scrap / Fabric"}</span>
                                      </div>
                                      <div className="p-3 bg-neutral-900 rounded-xl border border-white/5">
                                        <span className="text-neutral-500 block text-[10px]">Material Composition</span>
                                        <span className="font-bold text-orange-400 text-sm">{scan.analysis.material_type?.label || "Mixed"}</span>
                                      </div>
                                      <div className="p-3 bg-neutral-900 rounded-xl border border-white/5">
                                        <span className="text-neutral-500 block text-[10px]">Condition Grade</span>
                                        <span className="font-bold text-emerald-400 text-sm">{scan.analysis.waste_status?.label || "Recyclable"}</span>
                                      </div>
                                    </div>
                                    <p className="text-neutral-400 text-xs">{scan.recyclability.recommended_recycling_option}</p>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}