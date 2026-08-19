"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import NotificationIconToggle from "@/app/components/NotificationIconToggle";
import {
  Factory,
  LogOut,
  UploadCloud,
  BarChart3,
  FileDown,
  Wind,
  PieChart,
  Package,
  Droplets,
  Loader2,
  AlertCircle,
  Boxes,
  Search,
  RefreshCw,
  Plus,
  X,
  FileSpreadsheet,
  History,
  ChevronDown,
  ChevronUp,
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

interface ColorSwatch {
  rgb: [number, number, number];
  percentage: number;
  color_name: string;
}

interface VisualFeatures {
  color_analysis?: {
    primary_color: string;
    dominant_palette: ColorSwatch[];
  };
  texture?: { label: string };
  pattern?: { label: string };
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

interface InventoryBatch {
  _id?: string;
  batch_id: string;
  fabric_type: string;
  source: string;
  quantity_kg: number;
  color?: string;
  condition: string;
  collection_date?: string;
  notes?: string;
  created_at?: string;
  reference_label?: string | null;
}

interface DashboardSummaryData {
  period_days: number;
  impact_summary: {
    item_count: number;
    total_weight_kg: number;
    total_co2e_avoided_kg: number;
    total_water_saved_l: number;
    total_landfill_diverted_kg: number;
    by_material: Array<{
      material_type: string;
      item_count: number;
      weight_kg: number;
      co2e_avoided_kg: number;
      water_saved_l: number;
      landfill_diverted_kg: number;
    }>;
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

// ─── Pie Chart Component ─────────────────────────────────────────────

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
          <PieChart className="w-4 h-4 text-amber-400" /> {title}
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
    pathData = `
        M ${cx} ${cy - R} 
        A ${R} ${R} 0 1 1 ${cx} ${cy + R} 
        A ${R} ${R} 0 1 1 ${cx} ${cy - R} 
        M ${cx} ${cy - r} 
        A ${r} ${r} 0 1 0 ${cx} ${cy + r} 
        A ${r} ${r} 0 1 0 ${cx} ${cy - r} 
        Z`;
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
          <PieChart className="w-4 h-4 text-amber-400" />
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
                  fillRule="evenodd" // <-- Add this line
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

export default function ManufacturerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("production-waste");

  // Period filter
  const [periodDays, setPeriodDays] = useState<number>(30);
  const [summaryData, setSummaryData] = useState<DashboardSummaryData | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Platform Inventory Batches
  const [inventoryBatches, setInventoryBatches] = useState<InventoryBatch[]>([]);
  const [isBatchesLoading, setIsBatchesLoading] = useState(false);
  const [batchSearchQuery, setBatchSearchQuery] = useState("");
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);

  // New Batch Form State
  const [fabricType, setFabricType] = useState("Cotton");
  const [source, setSource] = useState("Factory Cutting Line #1");
  const [quantityKg, setQuantityKg] = useState("");
  const [condition, setCondition] = useState("Recyclable");
  const [batchColor, setBatchColor] = useState("");
  const [batchNotes, setBatchNotes] = useState("");
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);

  // AI Upload State for Production Waste Analysis
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [singleResult, setSingleResult] = useState<SingleResult | null>(null);
  const [batchResult, setBatchResult] = useState<BatchResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Report Exporting State
  const [isExporting, setIsExporting] = useState(false);

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

  const handleDownloadBatchReport = async (batchId: string, reportTitle: string = "factory_inventory_batch_report") => {
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
    if (!token || role !== "Manufacturer") {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/login");
  };

  // ─── Data Fetching ─────────────────────────────────────────────────

const fetchDashboardSummary = useCallback(async (days: number) => {
    setIsSummaryLoading(true);
    try {
      const token = localStorage.getItem("access_token") || "";
      // Add &source=factory to globally filter the backend aggregations
      const res = await fetch(`${API_BASE_URL}/api/sustainability/dashboard-summary?days=${days}&source=factory`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: DashboardSummaryData = await res.json();
        setSummaryData(data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard summary:", err);
    } finally {
      setIsSummaryLoading(false);
    }
  }, []);

  const fetchInventoryBatches = useCallback(async () => {
    setIsBatchesLoading(true);
    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${API_BASE_URL}/api/inventory/batches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data: InventoryBatch[] = await res.json();
        setInventoryBatches(data);
      }
    } catch (err) {
      console.error("Failed to fetch inventory batches:", err);
    } finally {
      setIsBatchesLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      fetchDashboardSummary(periodDays);
      fetchInventoryBatches();
    });
  }, [periodDays, fetchDashboardSummary, fetchInventoryBatches]);

  // ─── Batch Creation ────────────────────────────────────────────────

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBatch(true);
    try {
      const token = localStorage.getItem("access_token") || "";
      const res = await fetch(`${API_BASE_URL}/api/inventory/batches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fabric_type: fabricType,
          source: source,
          quantity_kg: parseFloat(quantityKg),
          color: batchColor || null,
          condition: condition,
          notes: batchNotes || null,
        }),
      });

      if (res.ok) {
        setShowAddBatchModal(false);
        setQuantityKg("");
        setBatchColor("");
        setBatchNotes("");
        fetchInventoryBatches();
        fetchDashboardSummary(periodDays);
      }
    } catch (error) {
      console.error("Error registering production batch:", error);
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  // ─── Download Report Handler ───────────────────────────────────────

const downloadReport = async (type: "pdf" | "excel", reportTitle: string = "manufacturer_report") => {
    setIsExporting(true);
    try {
      const token = localStorage.getItem("access_token") || "";
      // Append report_type, source, and days to ensure downloaded reports match the filtered UI
      const url = `${API_BASE_URL}/api/ml/export/${type}?report_type=${reportTitle}&source=factory&days=${periodDays}`;
      const ext = type === "pdf" ? "pdf" : "xlsx";
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Report export failed");
      const blob = await res.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `${reportTitle}_${periodDays}d_factory.${ext}`;
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

  // ─── AI Upload Handlers ────────────────────────────────────────────

  const handleFilesSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileArray.length === 0) {
      setAnalysisError("Please select valid image files (JPEG, PNG, WEBP, BMP).");
      return;
    }
    setSelectedFiles(fileArray);
    setAnalysisComplete(false);
    setAnalysisError(null);
    setSingleResult(null);
    setBatchResult(null);
  };

  const clearUpload = () => {
    setSelectedFiles([]);
    setAnalysisComplete(false);
    setAnalysisError(null);
    setSingleResult(null);
    setBatchResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const runAnalysis = async () => {
    if (selectedFiles.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisError(null);

    const token = localStorage.getItem("access_token") || "";
    const formData = new FormData();

    if (selectedFiles.length === 1) {
      formData.append("file", selectedFiles[0]);
      try {
        const res = await fetch(`${API_BASE_URL}/api/ml/analyze/detailed`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Scrap analysis failed");
        const data = await res.json();
        setSingleResult(data);
        setAnalysisComplete(true);
        fetchDashboardSummary(periodDays);
        fetchInventoryBatches();
      } catch (err: unknown) {
        setAnalysisError(err instanceof Error ? err.message : "Analysis failed");
      } finally {
        setIsAnalyzing(false);
      }
    } else {
      selectedFiles.forEach((file) => formData.append("files", file));
      formData.append("source", "Factory Production Scrap");
      try {
        const res = await fetch(`${API_BASE_URL}/api/ml/analyze/batch`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
        if (!res.ok) throw new Error("Batch scrap analysis failed");
        const data = await res.json();
        setBatchResult(data);
        setAnalysisComplete(true);
        fetchDashboardSummary(periodDays);
        fetchInventoryBatches();
      } catch (err: unknown) {
        setAnalysisError(err instanceof Error ? err.message : "Batch analysis failed");
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  // ─── Pie Chart Datasets ───────────────────────────────────────────

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

  const factoryBatches = inventoryBatches.filter((b) => {
    if (!b.source) return true;
    const s = b.source.toLowerCase();
    return (
      s.includes("factory") ||
      s.includes("cutting") ||
      s.includes("line") ||
      s.includes("plant") ||
      s.includes("mill") ||
      s.includes("production") ||
      !s.includes("collection")
    );
  });

  const factorySourceMap = factoryBatches.reduce((acc, batch) => {
    if (batch.source) {
      acc[batch.source] = (acc[batch.source] || 0) + batch.quantity_kg;
    }
    return acc;
  }, {} as Record<string, number>);

  const SOURCE_COLORS = ["#10b981", "#38bdf8", "#f59e0b", "#a855f7", "#ec4899", "#f97316", "#84cc16"];

  const factorySourcePieData: PieChartItem[] = Object.entries(factorySourceMap).map(([source, weight], idx) => ({
    label: source,
    value: Math.round(weight * 10) / 10,
    color: SOURCE_COLORS[idx % SOURCE_COLORS.length],
  }));

  const totalFactoryScrap = Object.values(factorySourceMap).reduce((sum, val) => sum + val, 0);
  const materialScrapPieData: PieChartItem[] = (summaryData?.impact_summary?.by_material || []).map((b) => ({
    label: b.material_type,
    value: b.weight_kg,
    color: MATERIAL_COLORS[b.material_type] ?? "#amber-500",
  }));

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

  const filteredBatches = factoryBatches.filter((b) => {
    const q = batchSearchQuery.toLowerCase();
    return (
      b.fabric_type.toLowerCase().includes(q) ||
      b.condition.toLowerCase().includes(q) ||
      (b.source && b.source.toLowerCase().includes(q))
    );
  });

  return (
    <div className="relative flex h-screen bg-neutral-950 font-sans overflow-hidden text-neutral-200">
      {/* SOFT CENTER ORANGE GLOW ACCENT */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-orange-500/15 rounded-full blur-[160px] pointer-events-none flex items-center justify-center z-0" />

      {/* SIDEBAR */}
      <div className="w-64 bg-black text-white flex flex-col shadow-xl z-40 relative border-r border-white/5 flex-shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md">
            <Factory className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Sortex<span className="text-amber-400">AI</span></h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: "production-waste", label: "Production Waste", icon: Factory },
            { id: "circular-economy", label: "Circular Economy", icon: RefreshCw },
            { id: "material-recovery", label: "Material Recovery", icon: Package },
            { id: "sustainability-perf", label: "Sustainability Perf.", icon: BarChart3 },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isSelected ? "bg-amber-600 text-white shadow-md shadow-amber-900/20 font-bold" : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
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
            onClick={() => downloadReport("pdf", `${activeTab}_report`)}
            disabled={isExporting}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 bg-neutral-900 border border-white/5 hover:bg-neutral-800 transition-all"
          >
            <FileDown className="w-4 h-4 text-amber-400" />
            <span>Export Active Report (PDF)</span>
          </button>
          <NotificationIconToggle />
          <ThemeToggle variant="sidebar" />
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Log out</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden z-10">
        <header className="h-20 bg-neutral-950 border-b border-white/5 flex items-center justify-between px-8 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white">Manufacturer Portal</h2>
            <p className="text-sm text-neutral-500">Logged in as • <span className="font-semibold text-amber-400">Textile Manufacturer</span></p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-neutral-900 border border-white/5 rounded-xl p-1">
              {[30, 60, 90, 365].map((days) => (
                <button
                  key={days}
                  onClick={() => setPeriodDays(days)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    periodDays === days ? "bg-amber-600 text-white shadow-sm" : "text-neutral-400 hover:text-white"
                  }`}
                >
                  {days === 365 ? "1 Year" : `${days}d`}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                fetchDashboardSummary(periodDays);
                fetchInventoryBatches();
              }}
              className="p-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl border border-white/5 transition-all"
              title="Refresh All Data"
            >
              <RefreshCw className={`w-4 h-4 ${isSummaryLoading || isBatchesLoading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={handleOpenHistory}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-bold text-xs rounded-xl border border-white/10 shadow-sm flex items-center gap-2 transition-all"
            >
              <History className="w-4 h-4 text-amber-400" />
              <span>Scan History & Reports</span>
            </button>

            <button
              onClick={() => downloadReport("pdf", `${activeTab}_report`)}
              disabled={isExporting}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs rounded-xl border border-amber-500/20 shadow-sm flex items-center gap-2"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              Download Tab Report
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6">

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 1: PRODUCTION WASTE ANALYSIS                           */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === "production-waste" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Factory className="w-5 h-5 text-amber-400" /> Production Waste Analysis
                  </h3>
                  <p className="text-sm text-neutral-400">Scrap volume tracking, AI offcut classification, and automated batch logging into inventory.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowAddBatchModal(true)}
                    className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm"
                  >
                    <Plus className="w-4 h-4" /> Register Production Batch
                  </button>
                  <button
                    onClick={() => downloadReport("pdf", "production_waste_report")}
                    disabled={isExporting}
                    className="flex items-center gap-2 bg-neutral-900 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-neutral-800"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4 text-amber-400" />}
                    Download Production Waste Report (PDF)
                  </button>
                </div>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-neutral-900 p-6 rounded-3xl border border-white/5 shadow-sm">
                  <p className="text-xs font-bold text-neutral-500 uppercase">Total Scrap Volume</p>
                  <h3 className="text-3xl font-extrabold text-white mt-1">
                    {(summaryData?.impact_summary?.total_weight_kg ?? 0).toLocaleString()} <span className="text-sm text-neutral-500">kg</span>
                  </h3>
                </div>
                <div className="bg-neutral-900 p-6 rounded-3xl border border-white/5 shadow-sm">
                  <p className="text-xs font-bold text-neutral-500 uppercase">Scrap Recyclability</p>
                  <h3 className="text-3xl font-extrabold text-emerald-400 mt-1">
                    {summaryData?.circular_economy?.average_circularity_score ?? 0} <span className="text-sm text-neutral-500">/ 100</span>
                  </h3>
                </div>
                <div className="bg-neutral-900 p-6 rounded-3xl border border-white/5 shadow-sm">
                  <p className="text-xs font-bold text-neutral-500 uppercase">Production Scans Logged</p>
                  <h3 className="text-3xl font-extrabold text-white mt-1">{summaryData?.impact_summary?.item_count ?? 0}</h3>
                </div>
                <div className="bg-neutral-900 p-6 rounded-3xl border border-white/5 shadow-sm">
                  <p className="text-xs font-bold text-neutral-500 uppercase">Active Factory Batches</p>
                  <h3 className="text-3xl font-extrabold text-amber-400 mt-1">{factoryBatches.length}</h3>
                </div>
              </div>

              {/* Production Waste Pie Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PieChartWidget
                  data={materialScrapPieData}
                  title="Production Scrap Material Breakdown"
                  subtitle="Scrap volume by fiber material type (kg)"
                  unit="kg"
                  centerText={`${(summaryData?.impact_summary?.total_weight_kg ?? 0).toFixed(0)}`}
                  centerSubtext="Total kg Scrap"
                />
                <PieChartWidget
                  data={factorySourcePieData}
                  title="Factory Collection Sources"
                  subtitle="Total scrap volume generated by specific factory sources (kg)"
                  unit="kg"
                  centerText={`${totalFactoryScrap.toFixed(0)}`}
                  centerSubtext="Total kg"
                />
              </div>

              {/* AI Image Analyzer Widget */}
              <div className="bg-neutral-900 rounded-3xl border border-white/5 p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <UploadCloud className="w-5 h-5 text-amber-400" /> Factory Scrap AI Inspector
                    </h4>
                    <p className="text-xs text-neutral-400">Scan scrap images to register new waste logs directly into MongoDB for cross-role visibility.</p>
                  </div>
                </div>

                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFilesSelect(e.target.files)} />

                {!analysisComplete && selectedFiles.length === 0 && (
                  <div onClick={() => fileInputRef.current?.click()} className="p-10 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer bg-neutral-950 border-white/10 hover:bg-neutral-900/50 transition-colors">
                    <UploadCloud className="w-8 h-8 text-amber-400 mb-2" />
                    <p className="text-white font-bold text-sm">Click to upload factory scrap or offcut photos</p>
                    <p className="text-neutral-500 font-medium text-xs mt-1">Supports JPEG, JPG, PNG, WEBP (Single or Multi-file batch)</p>
                  </div>
                )}

                {!analysisComplete && selectedFiles.length > 0 && (
                  <div className="p-4 bg-neutral-950 border border-white/10 rounded-2xl space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-white">{selectedFiles.length} file(s) selected</span>
                      <button onClick={clearUpload} className="text-xs text-red-400 font-semibold">Clear</button>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={runAnalysis}
                        disabled={isAnalyzing}
                        className="bg-amber-600 hover:bg-amber-500 text-white px-5 py-2 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2"
                      >
                        {isAnalyzing && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {isAnalyzing ? "Analyzing Scrap..." : "Run AI Scrap Inspection"}
                      </button>
                    </div>
                  </div>
                )}

                {analysisError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {analysisError}
                  </div>
                )}

                {analysisComplete && (singleResult || batchResult) && (
                  <div className="p-4 bg-neutral-950 rounded-2xl border border-white/5 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-white text-sm">Inspection Completed & Logged to Inventory</span>
                      <button onClick={clearUpload} className="text-xs font-bold text-amber-400">Scan Next Batch</button>
                    </div>
                    {singleResult && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <div className="p-3 bg-neutral-900 rounded-xl">
                          <p className="text-neutral-500">Material</p>
                          <p className="font-bold text-white mt-0.5">{singleResult.analysis.material_type?.label || "Unknown"}</p>
                        </div>
                        <div className="p-3 bg-neutral-900 rounded-xl">
                          <p className="text-neutral-500">Recyclability Score</p>
                          <p className="font-bold text-emerald-400 mt-0.5">{singleResult.recyclability.circularity_score} / 100</p>
                        </div>
                        <div className="p-3 bg-neutral-900 rounded-xl">
                          <p className="text-neutral-500">Recommended Routing</p>
                          <p className="font-bold text-white mt-0.5">{singleResult.recyclability.recommended_recycling_option}</p>
                        </div>
                        <div className="p-3 bg-neutral-900 rounded-xl">
                          <p className="text-neutral-500">Defect Detected</p>
                          <p className="font-bold text-amber-400 mt-0.5">{singleResult.recyclability.defect_detected?.label || "None"}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 2: CIRCULAR ECONOMY INSIGHTS                           */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === "circular-economy" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-amber-400" /> Circular Economy Insights
                  </h3>
                  <p className="text-sm text-neutral-400">Fleet circularity index, loop hierarchy, and registered factory inventory streams.</p>
                </div>
                <button
                  onClick={() => downloadReport("pdf", "circular_economy_insights_report")}
                  disabled={isExporting}
                  className="flex items-center gap-2 bg-neutral-900 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-neutral-800"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4 text-amber-400" />}
                  Download Circular Economy Insights Report (PDF)
                </button>
              </div>

              {/* Circular Economy Pie Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PieChartWidget
                  data={loopTierPieData}
                  title="Manufacturing Loop Tier Hierarchy"
                  subtitle="Proportion of factory waste across loop tiers"
                  unit="items"
                  centerText={`${summaryData?.circular_economy?.fleet_circularity_index ?? 0}`}
                  centerSubtext="Circularity Index"
                />
                <PieChartWidget
                  data={recyclingPathwayPieData}
                  title="Recycling Option Streams"
                  subtitle="Pathway breakdown for manufacturing offcuts"
                  unit="items"
                  centerText={`${summaryData?.circular_economy?.item_count ?? 0}`}
                  centerSubtext="Total Scanned"
                />
              </div>

              {/* Registered Factory Inventory Batches Browser */}
              <div className="bg-neutral-900 rounded-3xl border border-white/5 p-6 space-y-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <Boxes className="w-5 h-5 text-amber-400" /> Factory Waste Inventory ({filteredBatches.length})
                    </h4>
                    <p className="text-xs text-neutral-400">Exclusive inventory batches registered from factory production cutting lines.</p>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="relative">
                      <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={batchSearchQuery}
                        onChange={(e) => setBatchSearchQuery(e.target.value)}
                        placeholder="Search fabric or source..."
                        className="bg-neutral-950 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 w-56"
                      />
                    </div>
                    <button
                      onClick={() => downloadReport("pdf", "factory_inventory_report")}
                      disabled={isExporting}
                      className="inline-flex items-center gap-1.5 bg-amber-600/20 border border-amber-500/30 text-amber-400 hover:bg-amber-600/30 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                    >
                      {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                      PDF Report
                    </button>
                    <button
                      onClick={() => downloadReport("excel", "factory_inventory_report")}
                      disabled={isExporting}
                      className="inline-flex items-center gap-1.5 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-600/30 text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
                    >
                      {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5" />}
                      Excel Report
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950 text-neutral-400 font-bold border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3">Fabric Type</th>
                        <th className="px-4 py-3">Factory Source</th>
                        <th className="px-4 py-3">Quantity (kg)</th>
                        <th className="px-4 py-3">Condition</th>
                        <th className="px-4 py-3">Date Registered</th>
                        <th className="px-4 py-3 text-right">Batch Report Export</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredBatches.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">No factory inventory batches found.</td>
                        </tr>
                      ) : (
                        filteredBatches.map((b) => (
                          <tr key={b.batch_id || b._id} className="hover:bg-white/5">
                            <td className="px-4 py-3 font-bold text-white">{b.fabric_type}</td>
                            <td className="px-4 py-3 text-neutral-300">{b.source}</td>
                            <td className="px-4 py-3 font-bold text-white">{b.quantity_kg} kg</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                {b.condition}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-neutral-500">
                              {b.collection_date ? new Date(b.collection_date).toLocaleDateString() : "Recent"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDownloadBatchReport(b.batch_id || (b._id as string))}
                                disabled={downloadingBatchId === (b.batch_id || b._id)}
                                className="inline-flex items-center gap-1.5 text-amber-400 hover:text-amber-300 text-xs font-bold bg-neutral-950 border border-white/10 px-2.5 py-1 rounded-lg disabled:opacity-50 transition-all"
                              >
                                {downloadingBatchId === (b.batch_id || b._id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                                Batch PDF
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 3: MATERIAL RECOVERY REPORTS                           */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === "material-recovery" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Package className="w-5 h-5 text-amber-400" /> Material Recovery Reports
                  </h3>
                  <p className="text-sm text-neutral-400">Recyclability, reuse, processing feasibility, and environmental benefit breakdown by material.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadReport("excel", "material_recovery_report")}
                    disabled={isExporting}
                    className="flex items-center gap-2 bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-xl text-xs font-bold hover:bg-emerald-600/30"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                    Export Excel Report
                  </button>
                  <button
                    onClick={() => downloadReport("pdf", "material_recovery_report")}
                    disabled={isExporting}
                    className="flex items-center gap-2 bg-neutral-900 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-neutral-800"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4 text-amber-400" />}
                    Download PDF Report
                  </button>
                </div>
              </div>

              {/* Material Recovery Table */}
              <div className="bg-neutral-900 rounded-3xl border border-white/5 p-6 overflow-hidden">
                <h4 className="text-base font-bold text-white mb-4">Material Recovery Performance Matrix</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-neutral-950 text-neutral-400 font-bold border-b border-white/5">
                      <tr>
                        <th className="px-4 py-3">Material Stream</th>
                        <th className="px-4 py-3">Items Logged</th>
                        <th className="px-4 py-3">Total Scrap (kg)</th>
                        <th className="px-4 py-3">CO₂ Avoided (kg)</th>
                        <th className="px-4 py-3">Water Saved (L)</th>
                        <th className="px-4 py-3 text-right">Landfill Diverted (kg)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(summaryData?.impact_summary?.by_material || []).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">No material recovery data recorded yet.</td>
                        </tr>
                      ) : (
                        (summaryData?.impact_summary?.by_material || []).map((row) => (
                          <tr key={row.material_type} className="hover:bg-white/5">
                            <td className="px-4 py-3 font-bold text-white">{row.material_type}</td>
                            <td className="px-4 py-3 text-neutral-400">{row.item_count}</td>
                            <td className="px-4 py-3 text-neutral-300 font-semibold">{row.weight_kg} kg</td>
                            <td className="px-4 py-3 text-amber-400 font-bold">{row.co2e_avoided_kg} kg</td>
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
          )}

          {/* ═══════════════════════════════════════════════════════════ */}
          {/* TAB 4: SUSTAINABILITY PERFORMANCE                         */}
          {/* ═══════════════════════════════════════════════════════════ */}
          {activeTab === "sustainability-perf" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-400" /> Sustainability Performance & ESG Reporting
                  </h3>
                  <p className="text-sm text-neutral-400">Environmental savings, CO₂ offset metrics, and period-over-period performance benchmarking.</p>
                </div>
                <button
                  onClick={() => downloadReport("pdf", "sustainability_performance_report")}
                  disabled={isExporting}
                  className="flex items-center gap-2 bg-neutral-900 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-neutral-800"
                >
                  {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4 text-amber-400" />}
                  Download Sustainability Performance Report (PDF)
                </button>
              </div>

              {/* Sustainability Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-900 p-6 rounded-3xl border border-white/5 shadow-sm">
                  <p className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-2"><Wind className="w-4 h-4 text-amber-400"/> Total CO₂ Avoided</p>
                  <h3 className="text-4xl font-extrabold text-white mt-2">
                    {(summaryData?.impact_summary?.total_co2e_avoided_kg ?? 0).toLocaleString()} <span className="text-base text-neutral-500">kg</span>
                  </h3>
                </div>
                <div className="bg-neutral-900 p-6 rounded-3xl border border-white/5 shadow-sm">
                  <p className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-2"><Droplets className="w-4 h-4 text-blue-400"/> Water Conserved</p>
                  <h3 className="text-4xl font-extrabold text-white mt-2">
                    {(summaryData?.impact_summary?.total_water_saved_l ?? 0).toLocaleString()} <span className="text-base text-neutral-500">L</span>
                  </h3>
                </div>
                <div className="bg-neutral-900 p-6 rounded-3xl border border-white/5 shadow-sm">
                  <p className="text-xs font-bold text-neutral-500 uppercase flex items-center gap-2"><Package className="w-4 h-4 text-emerald-400"/> Landfill Mass Diverted</p>
                  <h3 className="text-4xl font-extrabold text-white mt-2">
                    {(summaryData?.impact_summary?.total_landfill_diverted_kg ?? 0).toLocaleString()} <span className="text-base text-neutral-500">kg</span>
                  </h3>
                </div>
              </div>

              {/* Sustainability Performance Pie Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PieChartWidget
                  data={carbonMaterialPieData}
                  title="CO₂ Avoided Contribution by Material"
                  subtitle="Carbon offset share per textile material (kg)"
                  unit="kg"
                  centerText={`${(summaryData?.impact_summary?.total_co2e_avoided_kg ?? 0).toFixed(0)}`}
                  centerSubtext="CO₂e kg Saved"
                />
                <PieChartWidget
                  data={diversionStatusPieData}
                  title="Landfill Diversion Ratio"
                  subtitle="Diverted scrap volume vs non-diverted waste"
                  unit="items"
                  centerText={`${summaryData?.waste_diversion?.diversion_rate_pct ?? 0}%`}
                  centerSubtext="Diversion Rate"
                />
              </div>

              {/* Period Benchmarking */}
              <div className="bg-neutral-900 rounded-3xl border border-white/5 p-6 space-y-4">
                <h4 className="text-base font-bold text-white">Period-over-Period Performance Benchmarking</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: "CO₂ Avoided",
                      curr: summaryData?.benchmark?.co2e_avoided_kg?.current ?? 0,
                      prev: summaryData?.benchmark?.co2e_avoided_kg?.previous ?? 0,
                      change: summaryData?.benchmark?.co2e_avoided_kg?.change_pct,
                      unit: "kg",
                    },
                    {
                      label: "Water Saved",
                      curr: summaryData?.benchmark?.water_saved_l?.current ?? 0,
                      prev: summaryData?.benchmark?.water_saved_l?.previous ?? 0,
                      change: summaryData?.benchmark?.water_saved_l?.change_pct,
                      unit: "L",
                    },
                    {
                      label: "Landfill Diverted",
                      curr: summaryData?.benchmark?.landfill_diverted_kg?.current ?? 0,
                      prev: summaryData?.benchmark?.landfill_diverted_kg?.previous ?? 0,
                      change: summaryData?.benchmark?.landfill_diverted_kg?.change_pct,
                      unit: "kg",
                    },
                  ].map((b, idx) => (
                    <div key={idx} className="p-4 bg-neutral-950 border border-white/5 rounded-2xl space-y-2">
                      <p className="text-xs font-bold text-neutral-500 uppercase">{b.label}</p>
                      <p className="text-xl font-extrabold text-white">{b.curr.toLocaleString()} {b.unit}</p>
                      <p className="text-xs text-neutral-500">Prev period: {b.prev.toLocaleString()} {b.unit}</p>
                      {b.change !== null && b.change !== undefined && (
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${b.change >= 0 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}>
                          {b.change >= 0 ? "+" : ""}{b.change}%
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* REGISTER PRODUCTION BATCH MODAL */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-3xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-white/10">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Factory className="w-5 h-5 text-amber-400" /> Register Production Batch
              </h3>
              <button onClick={() => setShowAddBatchModal(false)} className="text-neutral-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-neutral-400">
              Register factory scrap or cutting line waste into platform inventory. Registered batches will be saved in MongoDB and instantly reflected across Recycling Facilitator & Sustainability Manager portals.
            </p>

            <form onSubmit={handleCreateBatch} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400">Fabric Type</label>
                <select
                  value={fabricType}
                  onChange={(e) => setFabricType(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {["Cotton", "Polyester", "Denim", "Wool", "Linen", "Nylon", "Viscose", "Silk", "Leather", "Mixed Fabrics"].map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400">Factory Source / Line</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Factory Cutting Line #1"
                  required
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400">Quantity (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  value={quantityKg}
                  onChange={(e) => setQuantityKg(e.target.value)}
                  placeholder="e.g. 50.0"
                  required
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400">Scrap Condition</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                >
                  {["Recyclable", "Reusable", "Repairable", "Upcyclable", "Compostable", "Hazardous", "Degraded"].map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-neutral-400">Scrap Color (Optional)</label>
                <input
                  type="text"
                  value={batchColor}
                  onChange={(e) => setBatchColor(e.target.value)}
                  placeholder="e.g. Blue"
                  className="w-full bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  disabled={isSubmittingBatch}
                  className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  {isSubmittingBatch ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Batch to Inventory"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBatchModal(false)}
                  className="px-4 border border-white/10 text-neutral-300 font-bold rounded-xl text-xs hover:bg-neutral-800"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCAN HISTORY & REPORTS MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-white/10">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-neutral-950">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-amber-400" /> Factory Scan History & Reports
                </h3>
                <p className="text-sm text-neutral-400">Review past factory scrap AI analyses, grouped by batch, and download reports.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => downloadReport("pdf", "factory_scrap_analysis_report")}
                  disabled={isExporting || historyItems.length === 0}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isExporting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                  Waste Report (PDF)
                </button>
                <button
                  onClick={() => downloadReport("excel", "factory_scrap_analysis_report")}
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
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-amber-400" />
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
                              : (group.scans[0]?.filename ?? "Factory Scan")}
                          </p>
                          <p className="text-xs font-medium text-neutral-400 mt-1">
                            {group.count} scan{group.count !== 1 ? "s" : ""} &middot; {group.dominant_material} &middot;{" "}
                            {group.latest_created_at ? new Date(group.latest_created_at * 1000).toLocaleString() : "—"}
                          </p>
                        </div>
                        <div className="flex-shrink-0 flex items-center gap-3">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-400">
                            Avg {group.average_circularity_score}
                          </span>
                          {group.is_batch && group.batch_id && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDownloadBatchReport(group.batch_id as string); }}
                              disabled={downloadingBatchId === group.batch_id}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg border border-white/5 disabled:opacity-50"
                            >
                              {downloadingBatchId === group.batch_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5 text-amber-400" />}
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
                                    <span className="text-xs font-bold px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
                                      {scan.recyclability.circularity_score}/100
                                    </span>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDownloadScanReport(scan._id); }}
                                      disabled={downloadingHistoryId === scan._id}
                                      className="inline-flex items-center gap-1 text-xs font-bold text-neutral-200 bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg border border-white/5 disabled:opacity-50"
                                    >
                                      {downloadingHistoryId === scan._id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5 text-amber-400" />}
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
                                        <span className="font-bold text-amber-400 text-sm">{scan.analysis.material_type?.label || "Mixed"}</span>
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