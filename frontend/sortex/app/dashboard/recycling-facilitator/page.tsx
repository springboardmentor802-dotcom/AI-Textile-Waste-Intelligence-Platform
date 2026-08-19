"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import NotificationIconToggle from "@/app/components/NotificationIconToggle";
import {
  LogOut,
  UploadCloud,
  Recycle,
  Activity,
  TrendingUp,
  BarChart3,
  Plus,
  X,
  Loader2,
  Boxes,
  AlertTriangle,
  FileDown,
  FileSpreadsheet,
  Shirt,
  Layers,
  Droplets,
  Palette,
  Gauge,
  Leaf,
  Scale,
  RefreshCw,
  Package,
  PieChart,
  ImageIcon,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Trash2,
  Wind,
  Search,
  LayoutGrid,
  List,
} from "lucide-react";

interface BatchItem {
  batch_id: string;
  fabric_type: string;
  source: string;
  quantity_kg: number;
  color?: string;
  condition: string;
  collection_date: string;
  notes?: string;
  reference_label?: string | null;
}

interface ClassificationResult {
  label: string | null;
  confidence: number | null;
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

interface ColorSwatch {
  rgb: [number, number, number];
  percentage: number;
  color_name: string;
}

interface AnalysisPayload {
  garment_type: ClassificationResult | null;
  material_type: ClassificationResult | null;
  waste_status: ClassificationResult | null;
  visual_features: {
    color_analysis: {
      primary_color: string;
      dominant_palette: ColorSwatch[];
    };
    texture: TextureResult | null;
    pattern: PatternResult | null;
  };
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
  inputs_used: {
    garment_type: string | null;
    material_type: string | null;
    waste_status: string | null;
  };
}

interface AnalyzeResponse {
  scan_id: string | null;
  filename: string;
  analysis: AnalysisPayload;
  recyclability: RecyclabilityPayload;
  detail?: string;
}

interface BatchSummary {
  total_processed: number;
  average_circularity_score: number;
  dominant_material: string;
  material_breakdown: Record<string, number>;
}

interface BatchAnalyzeResponse {
  batch_id: string | null;
  batch_label?: string | null;
  results: AnalyzeResponse[];
  summary: BatchSummary;
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
  scans: unknown[];
}

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

const COMPONENT_SCORE_LABELS: Record<string, string> = {
  recyclability_score: "Recyclability Score",
  reuse_score: "Reuse Score",
  sustainability_score: "Sustainability Score",
  material_recovery_score: "Material Recovery Score",
};

const MATERIAL_RECYCLABILITY: Record<string, number> = {
  Cotton: 85, Linen: 80, Denim: 78, Polyester: 75, Wool: 70, Nylon: 65,
  Viscose: 60, Silk: 55, Leather: 40, Acrylic: 65, "Mixed Fabrics": 45, "Mixed/Unknown": 30,
};

const MATERIAL_ENVIRONMENTAL_BENEFIT: Record<string, number> = {
  Polyester: 80, Nylon: 78, Denim: 72, Cotton: 70, Linen: 68, Wool: 65,
  Viscose: 60, Silk: 50, Leather: 45, Acrylic: 65, "Mixed Fabrics": 50, "Mixed/Unknown": 40,
};

const MATERIAL_PROCESSING_FEASIBILITY: Record<string, number> = {
  Polyester: 80, Cotton: 78, Denim: 75, Linen: 72, Wool: 70, Nylon: 68,
  Viscose: 60, Silk: 55, Leather: 35, Acrylic: 65, "Mixed Fabrics": 45, "Mixed/Unknown": 25,
};

const WASTE_CONDITION_SCORE: Record<string, number> = {
  Reusable: 90, Repairable: 80, Upcyclable: 70, Recyclable: 75,
  Compostable: 50, Hazardous: 10, Degraded: 35,
};

const CIRCULARITY_CATEGORIES: Array<[number, string]> = [
  [85, "Excellent Recovery Potential"],
  [70, "High Recovery Potential"],
  [50, "Moderate Recovery Potential"],
  [30, "Limited Recovery Potential"],
  [0, "Disposal Recommended"],
];

const RECYCLABILITY_WEIGHTS = {
  recyclability: 0.35,
  condition: 0.2,
  reuse: 0.2,
  sustainability: 0.15,
  materialRecovery: 0.1,
};

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

function categoryForCircularityScore(score: number): string {
  for (const [threshold, label] of CIRCULARITY_CATEGORIES) {
    if (score >= threshold) return label;
  }
  return CIRCULARITY_CATEGORIES[CIRCULARITY_CATEGORIES.length - 1][1];
}

function determineRecyclingOption(materialLabel: string, wasteStatus: string): string {
  if (wasteStatus === "Reusable") return "Donation";
  if (wasteStatus === "Repairable") return "Fabric Reuse";
  if (wasteStatus === "Upcyclable") return "Upcycling";
  if (wasteStatus === "Compostable") return "Fiber Recycling";
  if (wasteStatus === "Hazardous") return "Industrial Recovery";

  const mechanical = ["Cotton", "Linen", "Denim"];
  const chemical = ["Polyester", "Nylon", "Acrylic"];
  const fiber = ["Wool", "Viscose"];

  if (mechanical.includes(materialLabel)) return "Mechanical Recycling";
  if (chemical.includes(materialLabel)) return "Chemical Recycling";
  if (fiber.includes(materialLabel)) return "Fiber Recycling";
  if (materialLabel === "Silk") return "Fabric Reuse";
  if (materialLabel === "Leather") return "Industrial Recovery";
  return "Fiber Recycling";
}

interface LocalBatchScoring {
  recyclabilityScore: number;
  sustainabilityScore: number;
  materialRecoveryScore: number;
  conditionScore: number;
  circularityScore: number;
  category: string;
  recommendedOption: string;
}

function assessBatch(batch: BatchItem): LocalBatchScoring {
  const material = batch.fabric_type;
  const condition = batch.condition;

  const recyclabilityScore = MATERIAL_RECYCLABILITY[material] ?? MATERIAL_RECYCLABILITY["Mixed/Unknown"];
  const sustainabilityScore = MATERIAL_ENVIRONMENTAL_BENEFIT[material] ?? MATERIAL_ENVIRONMENTAL_BENEFIT["Mixed/Unknown"];
  const materialRecoveryScore = MATERIAL_PROCESSING_FEASIBILITY[material] ?? MATERIAL_PROCESSING_FEASIBILITY["Mixed/Unknown"];
  const conditionScore = WASTE_CONDITION_SCORE[condition] ?? WASTE_CONDITION_SCORE["Recyclable"];
  const reuseScore = conditionScore;

  const circularityScore = Math.round(
    (recyclabilityScore * RECYCLABILITY_WEIGHTS.recyclability +
      conditionScore * RECYCLABILITY_WEIGHTS.condition +
      reuseScore * RECYCLABILITY_WEIGHTS.reuse +
      sustainabilityScore * RECYCLABILITY_WEIGHTS.sustainability +
      materialRecoveryScore * RECYCLABILITY_WEIGHTS.materialRecovery) * 10
  ) / 10;

  return {
    recyclabilityScore,
    sustainabilityScore,
    materialRecoveryScore,
    conditionScore,
    circularityScore,
    category: categoryForCircularityScore(circularityScore),
    recommendedOption: determineRecyclingOption(material, condition),
  };
}

const CONDITION_BADGE_STYLES: Record<string, string> = {
  Reusable: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Repairable: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  Upcyclable: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  Recyclable: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  Compostable: "bg-lime-500/10 text-lime-400 border-lime-500/20",
  Hazardous: "bg-red-500/10 text-red-400 border-red-500/20",
  Degraded: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000";

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
      <div className="bg-neutral-900 rounded-2xl border border-white/5 shadow-sm p-6 flex flex-col items-center justify-center text-center">
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
    <div className="bg-neutral-900 rounded-2xl border border-white/5 shadow-sm p-6 flex flex-col justify-between">
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

export default function RecyclingFacilitatorDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Batch Hub State
  const [batches, setBatches] = useState<BatchItem[]>([]);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [fabricType, setFabricType] = useState("Cotton");
  const [source, setSource] = useState("Collection Bin");
  const [quantityKg, setQuantityKg] = useState("");
  const [condition, setCondition] = useState("Recyclable");
  const [batchColor, setBatchColor] = useState("");
  const [batchNotes, setBatchNotes] = useState("");
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [batchSearchQuery, setBatchSearchQuery] = useState("");
  const [batchConditionFilter, setBatchConditionFilter] = useState("All");
  const [deletingBatchId, setDeletingBatchId] = useState<string | null>(null);

  // AI Scanning State
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [batchAnalysisResult, setBatchAnalysisResult] = useState<BatchAnalyzeResponse | null>(null);
  const [analysisError, setAnalysisError] = useState("");
  const [targetBatchId, setTargetBatchId] = useState<string | null>(null);
  const [expandedResultIdx, setExpandedResultIdx] = useState<number | null>(null);
  const [isDownloadingScanReport, setIsDownloadingScanReport] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-analysis "batch details" modal state (asked before we actually run the scan)
  const [showBatchDetailsModal, setShowBatchDetailsModal] = useState(false);
  const [batchLinkMode, setBatchLinkMode] = useState<"new" | "existing">("new");
  const [newBatchIdInput, setNewBatchIdInput] = useState("");
  const [batchSourceInput, setBatchSourceInput] = useState("");
  const [batchQuantityInput, setBatchQuantityInput] = useState("");
  const [batchNotesInput, setBatchNotesInput] = useState("");

  // Scan History & Reports Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyItems, setHistoryItems] = useState<HistoryGroup[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [isExporting, setIsExporting] = useState<"pdf" | "excel" | null>(null);
  const [downloadingHistoryId, setDownloadingHistoryId] = useState<string | null>(null);
  const [downloadingBatchId, setDownloadingBatchId] = useState<string | null>(null);
  const [expandedHistoryGroup, setExpandedHistoryGroup] = useState<string | null>(null);
  const [expandedHistoryScanId, setExpandedHistoryScanId] = useState<string | null>(null);

  // Batch Assessment & Inventory View State
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedBatchAssessment, setSelectedBatchAssessment] = useState<BatchAssessment | null>(null);
  const [isAssessmentLoading, setIsAssessmentLoading] = useState(false);
  const [isExportingReport, setIsExportingReport] = useState(false);
  const [inventoryViewMode, setInventoryViewMode] = useState<"grid" | "table">("grid");

  const getCategoryBadge = (category?: string) => {
    switch (category) {
      case "Highly Recyclable":
        return "px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "Moderate Circularity":
        return "px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "Low Circularity":
        return "px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20";
      default:
        return "px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20";
    }
  };

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

  const downloadReport = async (
    type: "pdf" | "excel",
    reportTitle: string = "waste_classification_report",
    batchId?: string
  ) => {
    setIsExportingReport(true);
    try {
      const token = localStorage.getItem("access_token") || "";
      let url = `${API_BASE_URL}/api/ml/export/${type}?report_type=${reportTitle}`;
      if (batchId && type === "pdf") {
        url = `${API_BASE_URL}/api/ml/export/pdf/batch/${batchId}?report_type=${reportTitle}`;
      }
      const filename = `${reportTitle}.${type === "pdf" ? "pdf" : "xlsx"}`;
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
      setIsExportingReport(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    if (!token || role !== "Recycling Facilitator") {
      router.replace("/login");
    }
  }, [router]);

  const fetchBatches = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/batches`);
      if (res.ok) {
        const data = await res.json();
        setBatches(data);
      }
    } catch (error) {
      console.error("Failed to fetch batches", error);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => fetchBatches());
  }, [activeTab, fetchBatches]);

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingBatch(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/batches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        fetchBatches();
      }
    } catch (error) {
      console.error("Error creating batch", error);
    } finally {
      setIsSubmittingBatch(false);
    }
  };

  const handleDeleteBatch = async (batchId: string) => {
    if (!window.confirm("Delete this batch? This can't be undone.")) return;
    setDeletingBatchId(batchId);
    try {
      const res = await fetch(`${API_BASE_URL}/api/inventory/batches/${batchId}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Could not delete batch.");
      }
      if (targetBatchId === batchId) setTargetBatchId(null);
      fetchBatches();
    } catch (error: unknown) {
      alert(error instanceof Error ? error.message : "Could not delete batch.");
    } finally {
      setDeletingBatchId(null);
    }
  };

  const handleFilesSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const validFiles = Array.from(files).filter(f => f.type.startsWith("image/"));

    if (validFiles.length === 0) {
      setAnalysisError("Please upload valid image files (JPEG, JPG, PNG, or WEBP).");
      return;
    }

    if (validFiles.length > 30) {
      setAnalysisError("Maximum 30 files allowed per batch request.");
      return;
    }

    setAnalysisError("");
    setBatchAnalysisResult(null);
    setExpandedResultIdx(null);
    setSelectedFiles(validFiles);
    setPreviewUrl(URL.createObjectURL(validFiles[0]));

    setBatchLinkMode(targetBatchId ? "existing" : "new");
  };

  const handleAnalyzeBatch = async () => {
    if (selectedFiles.length === 0) return;
    setIsAnalyzing(true);
    setAnalysisError("");
    setExpandedResultIdx(null);

    try {
      const token = localStorage.getItem("access_token");
      const formData = new FormData();

      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      if (batchLinkMode === "existing" && targetBatchId) {
        formData.append("batch_id", targetBatchId);
      }
      if (batchSourceInput.trim()) formData.append("source", batchSourceInput.trim());
      if (batchQuantityInput.trim()) formData.append("quantity_kg", batchQuantityInput.trim());
      if (batchNotesInput.trim()) formData.append("notes", batchNotesInput.trim());

      if (batchLinkMode === "new" && newBatchIdInput.trim()) {
        formData.append("label", newBatchIdInput.trim());
      }

      const res = await fetch(`${API_BASE_URL}/api/ml/analyze/batch`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Batch analysis failed.");
      }

      const data: BatchAnalyzeResponse = await res.json();
      setBatchAnalysisResult(data);

      if (batchLinkMode === "new" && data.batch_id) {
        setTargetBatchId(data.batch_id);
        fetchBatches();
      }
    } catch (error: unknown) {
      setAnalysisError(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleResetUpload = () => {
    setSelectedFiles([]);
    setPreviewUrl(null);
    setBatchAnalysisResult(null);
    setAnalysisError("");
    setTargetBatchId(null);
    setExpandedResultIdx(null);
    setShowBatchDetailsModal(false);
    setBatchLinkMode("new");
    setNewBatchIdInput("");
    setBatchSourceInput("");
    setBatchQuantityInput("");
    setBatchNotesInput("");
    if (fileInputRef.current) fileInputRef.current.value = "";
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

  const handleExport = async (type: "pdf" | "excel", reportTitle: string = "waste_classification_report") => {
    setIsExporting(type);
    try {
      await _downloadBlob(
        `${API_BASE_URL}/api/ml/export/${type}?report_type=${reportTitle}`,
        type === "pdf" ? `${reportTitle}.pdf` : `${reportTitle}.xlsx`
      );
    } catch (error: unknown) {
      setHistoryError(error instanceof Error ? error.message : "Export failed.");
    } finally {
      setIsExporting(null);
    }
  };

  const handleDownloadScanReport = async (scanId: string) => {
    setIsDownloadingScanReport(scanId);
    try {
      await _downloadBlob(`${API_BASE_URL}/api/ml/export/pdf/${scanId}`, `waste_report_${scanId}.pdf`);
    } catch (error: unknown) {
      setAnalysisError(error instanceof Error ? error.message : "Could not download report.");
    } finally {
      setIsDownloadingScanReport(null);
    }
  };

  const handleDownloadHistoryItemReport = async (scanId: string) => {
    setDownloadingHistoryId(scanId);
    try {
      await _downloadBlob(`${API_BASE_URL}/api/ml/export/pdf/${scanId}`, "waste_report.pdf");
    } catch (error: unknown) {
      setHistoryError(error instanceof Error ? error.message : "Could not download report.");
    } finally {
      setDownloadingHistoryId(null);
    }
  };

  const handleDownloadBatchReport = async (batchId: string, reportTitle: string = "waste_classification_report") => {
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

  const batchDisplayLabel = (id: string | null | undefined): string => {
    if (!id) return "—";
    const match = batches.find((b) => b.batch_id === id);
    if (match) {
      return match.reference_label || `${match.fabric_type} · ${match.source}`;
    }
    return `Batch ID: ${id.slice(-6).toUpperCase()}`;
  };

  const filteredBatches = batches.filter((b) => {
    const matchesSearch = b.fabric_type.toLowerCase().includes(batchSearchQuery.toLowerCase()) ||
                          b.source.toLowerCase().includes(batchSearchQuery.toLowerCase());
    const matchesCondition = batchConditionFilter === "All" || b.condition === batchConditionFilter;
    return matchesSearch && matchesCondition;
  });

  const batchesWithAssessment = batches.map((b) => ({ batch: b, assessment: assessBatch(b) }));

  const recoveryByOption = batchesWithAssessment.reduce<Record<string, { kg: number; count: number }>>((acc, { batch, assessment }) => {
    const key = assessment.recommendedOption;
    if (!acc[key]) acc[key] = { kg: 0, count: 0 };
    acc[key].kg += batch.quantity_kg;
    acc[key].count += 1;
    return acc;
  }, {});
  const recoveryChartData = Object.entries(recoveryByOption)
    .map(([option, v]) => ({ option, ...v }))
    .sort((a, b) => b.kg - a.kg);
  const maxRecoveryKg = Math.max(1, ...recoveryChartData.map((d) => d.kg));

  const totalTrackedKg = batches.reduce((sum, b) => sum + b.quantity_kg, 0);
  const avgCircularityScore = batchesWithAssessment.length
    ? Math.round((batchesWithAssessment.reduce((sum, { assessment }) => sum + assessment.circularityScore, 0) / batchesWithAssessment.length) * 10) / 10
    : 0;

  const PATHWAY_COLORS: Record<string, string> = {
    "Mechanical Recycling": "#f97316",
    "Chemical Recycling": "#38bdf8",
    "Fiber Recycling": "#eab308",
    "Fabric Reuse": "#10b981",
    "Upcycling": "#a855f7",
    "Donation": "#3b82f6",
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

  const CONDITION_COLORS: Record<string, string> = {
    Reusable: "#10b981",
    Repairable: "#06b6d4",
    Upcyclable: "#a855f7",
    Recyclable: "#f97316",
    Compostable: "#84cc16",
    Hazardous: "#ef4444",
    Degraded: "#6b7280",
  };

  const pathwayPieData: PieChartItem[] = Object.entries(recoveryByOption).map(([option, v]) => ({
    label: option,
    value: Math.round(v.kg * 10) / 10,
    color: PATHWAY_COLORS[option] ?? "#f97316",
  }));

  const materialKgMap = batches.reduce<Record<string, number>>((acc, b) => {
    acc[b.fabric_type] = (acc[b.fabric_type] || 0) + b.quantity_kg;
    return acc;
  }, {});

  const materialPieData: PieChartItem[] = Object.entries(materialKgMap).map(([mat, kg]) => ({
    label: mat,
    value: Math.round(kg * 10) / 10,
    color: MATERIAL_COLORS[mat] ?? "#f59e0b",
  }));

  const conditionKgMap = batches.reduce<Record<string, number>>((acc, b) => {
    acc[b.condition] = (acc[b.condition] || 0) + b.quantity_kg;
    return acc;
  }, {});

  const conditionPieData: PieChartItem[] = Object.entries(conditionKgMap).map(([cond, kg]) => ({
    label: cond,
    value: Math.round(kg * 10) / 10,
    color: CONDITION_COLORS[cond] ?? "#6366f1",
  }));

  const renderDetailedResult = (result: AnalyzeResponse) => {
    const { analysis, recyclability } = result;
    const cardClass = "bg-neutral-900/50 p-5 rounded-2xl border border-white/5 shadow-sm";

    return (
      <div className="space-y-5 animate-in fade-in duration-300">
        {/* Circularity score card */}
        <div className="bg-neutral-900/50 rounded-2xl border border-white/5 shadow-sm p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
              <circle cx="60" cy="60" r="54" className="fill-none stroke-neutral-800" strokeWidth="10" />
              <circle
                cx="60"
                cy="60"
                r="54"
                className="fill-none stroke-orange-500 transition-all duration-700 ease-out"
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 54}
                strokeDashoffset={
                  2 * Math.PI * 54 -
                  (Math.min(Math.max(recyclability.circularity_score, 0), 100) / 100) * (2 * Math.PI * 54)
                }
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold text-white">{recyclability.circularity_score}</span>
              <span className="text-xs font-semibold text-neutral-500">/ 100</span>
            </div>
          </div>
          <div className="text-center sm:text-left">
            <span className="inline-block text-xs font-bold px-2.5 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400">
              {recyclability.circularity_category}
            </span>
            <p className="mt-2 text-lg font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
              <Recycle className="w-4 h-4 text-orange-400" />
              {recyclability.recommended_recycling_option}
            </p>
            <p className="text-sm font-medium text-neutral-400">Recommended recycling pathway</p>
          </div>
        </div>

        {/* Classification cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          {[
            { icon: Shirt, title: "Garment Type", res: analysis.garment_type },
            { icon: Layers, title: "Material Type", res: analysis.material_type },
            { icon: Droplets, title: "Waste Condition", res: analysis.waste_status },
            {
              icon: Scale,
              title: "Estimated Weight",
              customValue: `${getItemWeightKg(analysis.garment_type?.label, analysis.material_type?.label)} kg`,
            },
          ].map(({ icon: Icon, title, res, customValue }) => (
            <div key={title} className={`${cardClass} flex items-center gap-3`}>
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400 flex-shrink-0 border border-orange-500/20">
                <Icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">{title}</p>
                {customValue ? (
                  <p className="text-orange-400 font-bold truncate">{customValue}</p>
                ) : res?.label ? (
                  <p className="text-white font-bold truncate">
                    {res.label}
                    {res.confidence != null && (
                      <span className="text-xs font-semibold text-neutral-400 ml-1.5">
                        ({Math.round(res.confidence * 100)}%)
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="text-neutral-500 font-medium text-sm">Not detected</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Visual features */}
        <div className={cardClass}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-orange-400" />
              <p className="text-sm font-bold text-white">
                Dominant Colors &middot; <span className="font-semibold text-neutral-400">{analysis.visual_features.color_analysis.primary_color}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              {analysis.visual_features.texture?.label && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 text-neutral-300 border border-white/5">
                  Texture: {analysis.visual_features.texture.label}
                </span>
              )}
              {analysis.visual_features.pattern?.label && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/5 text-neutral-300 border border-white/5">
                  Pattern: {analysis.visual_features.pattern.label}
                </span>
              )}
            </div>
          </div>
          <div className="flex gap-3">
            {analysis.visual_features.color_analysis.dominant_palette.map((swatch, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div
                  className="w-10 h-10 rounded-lg border border-white/10 shadow-sm"
                  style={{ backgroundColor: `rgb(${swatch.rgb.join(",")})` }}
                />
                <span className="text-xs font-bold text-neutral-400">{swatch.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Component score breakdown */}
        <div className={cardClass}>
          <div className="flex items-center gap-2 mb-4">
            <Gauge className="w-4 h-4 text-orange-400" />
            <p className="text-sm font-bold text-white">Score Breakdown</p>
          </div>
          <div className="space-y-3">
            {Object.entries(recyclability.component_scores).map(([key, value]) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-bold text-neutral-300">{COMPONENT_SCORE_LABELS[key] ?? key}</span>
                  <span className="text-sm font-extrabold text-white">{value as number}</span>
                </div>
                <div className="h-2.5 rounded-full bg-neutral-950 overflow-hidden border border-white/5">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-500"
                    style={{ width: `${Math.min(Math.max(value as number, 0), 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Waste reduction tips */}
        {recyclability.waste_reduction_tips.length > 0 && (
          <div className={cardClass}>
            <div className="flex items-center gap-2 mb-3">
              <Leaf className="w-4 h-4 text-orange-400" />
              <p className="text-sm font-bold text-white">Waste Reduction Recommendations</p>
            </div>
            <ul className="space-y-2">
              {recyclability.waste_reduction_tips.map((tip, i) => (
                <li key={i} className="text-sm font-semibold text-neutral-300 flex gap-2">
                  <span className="text-orange-400 font-bold flex-shrink-0">&bull;</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.scan_id && (
          <button
            onClick={() => handleDownloadScanReport(result.scan_id as string)}
            disabled={isDownloadingScanReport === result.scan_id}
            className="w-full flex items-center justify-center gap-2 border border-white/10 bg-neutral-900/80 text-white py-3 px-4 rounded-xl font-bold hover:bg-neutral-800 transition-all disabled:opacity-50 shadow-sm"
          >
            {isDownloadingScanReport === result.scan_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4 text-orange-400" />}
            Download Individual Scan Report (PDF)
          </button>
        )}
      </div>
    );
  };

  const renderBatchAnalysisResult = () => {
    if (!batchAnalysisResult) return null;
    const { summary, results, batch_id, batch_label } = batchAnalysisResult;
    const cardClass = "bg-neutral-900 p-5 rounded-2xl border border-white/5 shadow-sm";

    return (
      <div className="mt-6 space-y-5 text-neutral-100">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h4 className="text-lg font-bold text-white">{batch_id ? "Batch Analysis Summary" : "Scan Summary"}</h4>
            {batch_id && (
              <p className="text-xs font-semibold text-neutral-500 mt-0.5">
                {batch_label ? (
                  <>Batch: <span className="text-neutral-300">{batch_label}</span></>
                ) : (
                  <>Batch ID: {batch_id}</>
                )}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {batch_id && (
              <button
                onClick={() => handleDownloadBatchReport(batch_id)}
                disabled={downloadingBatchId === batch_id}
                className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all border border-white/5 disabled:opacity-50"
              >
                {downloadingBatchId === batch_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4 text-orange-400" />}
                Download Full Batch Report (PDF)
              </button>
            )}
            <button
              onClick={handleResetUpload}
              className="flex items-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-sm transition-all border border-white/5"
            >
              <RefreshCw className="w-4 h-4 text-orange-400" />
              {batch_id ? "Scan Another Batch" : "Scan Another Image"}
            </button>
          </div>
        </div>

        {/* Aggregate Batch Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className={cardClass}>
             <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Files Processed</p>
             <h3 className="text-3xl font-extrabold text-white mt-2">{summary.total_processed}</h3>
          </div>
          <div className={cardClass}>
             <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Avg. Circularity Score</p>
             <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">{summary.average_circularity_score} <span className="text-lg text-neutral-500">/ 100</span></h3>
          </div>
          <div className={cardClass}>
             <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Dominant Material</p>
             <h3 className="text-3xl font-extrabold text-white mt-2">{summary.dominant_material}</h3>
          </div>
        </div>

        {/* Individual File Results List with Accordion Details */}
        <div className="bg-neutral-900 rounded-2xl border border-white/5 shadow-sm overflow-hidden">
           <div className="p-4 border-b border-white/5 bg-neutral-950 flex justify-between items-center">
             <h5 className="font-bold text-white text-sm">Individual Scan Breakdown</h5>
             <span className="text-xs text-neutral-400 font-medium">Click any row to view full AI report</span>
           </div>
           <div className="divide-y divide-white/5">
              {results.map((result, idx) => {
                const isExpanded = expandedResultIdx === idx;
                
                return (
                <div key={idx} className="flex flex-col">
                  <div 
                    onClick={() => setExpandedResultIdx(isExpanded ? null : idx)}
                    className={`p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-colors cursor-pointer ${isExpanded ? 'bg-white/5' : 'hover:bg-white/5'}`}
                  >
                     <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate">{result.filename}</p>
                        <p className="text-xs font-medium text-neutral-400 mt-1">
                           {result.analysis.material_type?.label || "Unknown Material"} &middot; {result.analysis.waste_status?.label || "Unknown Condition"}
                        </p>
                     </div>
                     <div className="flex-shrink-0 flex items-center gap-4">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-orange-500/20 bg-orange-500/10 text-orange-400">
                           {result.recyclability.circularity_score} Score
                        </span>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-white/10 bg-white/5 text-neutral-300 hidden sm:inline-block">
                           {result.recyclability.recommended_recycling_option}
                        </span>
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-neutral-500" /> : <ChevronDown className="w-5 h-5 text-neutral-500" />}
                     </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="p-5 bg-black/40 border-t border-white/5">
                      {renderDetailedResult(result)}
                    </div>
                  )}
                </div>
              )})}
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="relative flex h-screen bg-neutral-950 font-sans overflow-hidden">
      {/* SOFT CENTER ORANGE GLOW ACCENT */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] bg-orange-500/15 rounded-full blur-[160px] pointer-events-none flex items-center justify-center z-0" />

      {/* SIDEBAR */}
      <div className="w-64 bg-black text-white flex flex-col shadow-xl z-40 relative border-r border-white/5">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="p-2 bg-orange-500 rounded-lg shadow-md shadow-orange-900/30">
            <Recycle className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Sortex<span className="text-orange-400">AI</span></h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: "overview", label: "Recycling Opportunities", icon: BarChart3 },
            { id: "batch-management", label: "Waste Inventory", icon: Boxes },
            { id: "processing-analytics", label: "Processing Analytics", icon: Activity },
            { id: "recovery-statistics", label: "Recovery Statistics", icon: TrendingUp },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isSelected ? "bg-orange-600/90 text-white shadow-md shadow-orange-900/20" : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2 relative z-50">
          <NotificationIconToggle />
          <ThemeToggle variant="sidebar" />
          <button onClick={() => { localStorage.clear(); router.replace("/login"); }} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden z-10">
        <header className="h-20 bg-neutral-950 border-b border-white/5 flex items-center justify-between px-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Recycling Facility Dashboard</h2>
            <p className="text-sm text-neutral-500">Logged in as • <span className="font-semibold text-orange-400">Recycling Facility Operator</span></p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenHistory}
              className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 font-semibold text-sm rounded-xl border border-white/5 transition-all shadow-sm flex items-center gap-2"
            >
              <FileDown className="w-4 h-4 text-orange-400" />
              Scan History & Reports
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5 shadow-sm">
                  <p className="text-sm font-medium text-neutral-500">Total Batches Tracked</p>
                  <h3 className="text-3xl font-bold text-white mt-1">{batches.length}</h3>
                </div>
                <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5 shadow-sm">
                  <p className="text-sm font-medium text-neutral-500">System Processing Status</p>
                  <h3 className="text-3xl font-bold text-emerald-400 mt-1">Operational</h3>
                </div>
                <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5 shadow-sm">
                  <p className="text-sm font-medium text-neutral-500">AI Model Status</p>
                  <h3 className="text-3xl font-bold text-white mt-1">Active</h3>
                </div>
              </div>

              {/* Overview Pie Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PieChartWidget
                  data={pathwayPieData}
                  title="Recycling Recommendation Pathways"
                  subtitle="Distribution of waste by assigned recovery strategy"
                  unit="kg"
                  centerText={`${totalTrackedKg.toFixed(0)}`}
                  centerSubtext="Total kg"
                />
                <PieChartWidget
                  data={materialPieData}
                  title="Inventory Fabric Composition"
                  subtitle="Breakdown of registered inventory by fiber material"
                  unit="kg"
                  centerText={`${materialPieData.length}`}
                  centerSubtext="Materials"
                />
              </div>

              {/* AI Scanner Card */}
              <div className="bg-neutral-900 rounded-3xl border border-white/5 shadow-sm overflow-hidden p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">
                    {targetBatchId ? `Analyzing Photos for ${batchDisplayLabel(targetBatchId)}` : "New Textile Image Analysis"}
                  </h3>
                  <button onClick={handleOpenHistory} className="text-sm font-semibold text-orange-400 hover:text-orange-300">
                    View Scan History &rarr;
                  </button>
                </div>

                <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFilesSelect(e.target.files)} />
                
                {selectedFiles.length === 0 ? (
                  <div onClick={() => fileInputRef.current?.click()} className="p-12 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer bg-neutral-950 border-white/10 hover:bg-neutral-900/50 transition-colors">
                    <UploadCloud className="w-10 h-10 text-orange-400 mb-2" />
                    <p className="text-white font-bold text-base">Click or drag image(s) here for automated AI sorting</p>
                    <p className="text-neutral-500 font-medium text-xs mt-1">Supports JPEG, JPG, PNG, WEBP, BMP (Max 30 at a time)</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center p-6 border border-white/10 rounded-2xl bg-neutral-950 shadow-sm">
                      {previewUrl && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={previewUrl} alt="Preview" className="max-h-48 rounded-xl object-contain mx-auto mb-4 border border-white/10 shadow-sm" />
                      )}
                      <div className="flex items-center gap-2 text-white font-bold text-lg">
                        <ImageIcon className="w-5 h-5 text-orange-400" />
                        {selectedFiles.length} File{selectedFiles.length > 1 ? "s" : ""} Selected
                      </div>
                    </div>
                    
                    {!batchAnalysisResult && (
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() =>
                            !targetBatchId && selectedFiles.length > 1
                              ? setShowBatchDetailsModal(true)
                              : handleAnalyzeBatch()
                          }
                          disabled={isAnalyzing}
                          className="bg-orange-600 hover:bg-orange-500 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-sm"
                        >
                          {isAnalyzing && <Loader2 className="w-4 h-4 animate-spin" />}
                          {isAnalyzing ? "Processing..." : !targetBatchId && selectedFiles.length > 1 ? (
                            <>Continue <ArrowRight className="w-4 h-4" /></>
                          ) : (
                            "Run AI Analysis"
                          )}
                        </button>
                        <button onClick={handleResetUpload} className="border border-white/10 px-4 py-2.5 rounded-xl font-bold text-neutral-300 hover:bg-neutral-800">Cancel</button>
                      </div>
                    )}
                  </div>
                )}

                {analysisError && (
                  <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-sm font-semibold text-red-400 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {analysisError}
                  </div>
                )}

                {renderBatchAnalysisResult()}
              </div>
            </div>
          )}

          {activeTab === "batch-management" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-neutral-900 rounded-3xl border border-white/5 p-6 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      <Boxes className="w-5 h-5 text-orange-400" /> Waste Inventory Control Hub
                    </h3>
                    <p className="text-sm text-neutral-400">Integrated batch tracking with live sustainability assessments and 2-way PDF reports.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      onClick={() => setShowAddBatchModal(true)}
                      className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs shadow-sm transition-all"
                    >
                      <Plus className="w-4 h-4" /> Register New Batch
                    </button>
                  </div>
                </div>

                {/* Filter and View Toggle Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-white/5">
                  <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                    <div className="relative">
                      <Search className="w-4 h-4 text-neutral-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Filter by fabric, condition, source..."
                        value={batchSearchQuery}
                        onChange={(e) => setBatchSearchQuery(e.target.value)}
                        className="bg-neutral-950 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-orange-500/50 w-full sm:w-64"
                      />
                    </div>

                    <select
                      value={batchConditionFilter}
                      onChange={(e) => setBatchConditionFilter(e.target.value)}
                      className="bg-neutral-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-neutral-200 outline-none"
                    >
                      <option value="All">All Conditions</option>
                      <option value="Recyclable">Recyclable</option>
                      <option value="Reusable">Reusable</option>
                      <option value="Repairable">Repairable</option>
                      <option value="Upcyclable">Upcyclable</option>
                      <option value="Compostable">Compostable</option>
                      <option value="Hazardous">Hazardous</option>
                    </select>

                    <button
                      onClick={fetchBatches}
                      className="p-2 bg-neutral-950 hover:bg-neutral-800 text-neutral-400 hover:text-white rounded-xl border border-white/5 transition-all"
                      title="Refresh Batches"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-white/5">
                    <button
                      onClick={() => setInventoryViewMode("grid")}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all ${inventoryViewMode === "grid" ? "bg-orange-600 text-white shadow-sm" : "text-neutral-400 hover:text-white"}`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setInventoryViewMode("table")}
                      className={`p-1.5 rounded-lg text-xs font-bold transition-all ${inventoryViewMode === "table" ? "bg-orange-600 text-white shadow-sm" : "text-neutral-400 hover:text-white"}`}
                      title="Table View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {filteredBatches.length === 0 ? (
                  <div className="p-8 text-center text-neutral-500 border border-dashed border-white/10 rounded-2xl">
                    No batches found matching query. Click &quot;Register New Batch&quot; to begin.
                  </div>
                ) : inventoryViewMode === "grid" ? (
                  /* GRID CARDS VIEW (Platform Inventory Design) */
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
                    {filteredBatches.map((b) => {
                      const isSelected = selectedBatchId === b.batch_id;
                      return (
                        <div
                          key={b.batch_id}
                          onClick={() => fetchBatchAssessment(b.batch_id)}
                          className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? "bg-orange-950/30 border-orange-500 shadow-md shadow-orange-950/50"
                              : "bg-neutral-950 border-white/5 hover:border-white/20 hover:bg-neutral-900"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-white text-sm">{b.fabric_type} Batch</span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-neutral-900 border border-white/10 text-orange-400">
                              {b.condition}
                            </span>
                          </div>
                          <div className="space-y-1 text-xs text-neutral-400 mb-3">
                            <p><span className="text-neutral-500">Weight:</span> <strong className="text-white">{b.quantity_kg} kg</strong></p>
                            {b.source && <p><span className="text-neutral-500">Source:</span> {b.source}</p>}
                            {b.reference_label && <p><span className="text-neutral-500">Ref:</span> {b.reference_label}</p>}
                            <p className="text-[10px] text-neutral-600 font-mono truncate">ID: {b.batch_id}</p>
                          </div>
                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setTargetBatchId(b.batch_id);
                                setActiveTab("overview");
                              }}
                              className="text-[11px] font-bold text-neutral-300 bg-neutral-900 hover:bg-neutral-800 px-2.5 py-1 rounded-lg border border-white/10 transition-colors"
                            >
                              Analyze Photos
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteBatch(b.batch_id);
                              }}
                              disabled={deletingBatchId === b.batch_id}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 px-2.5 py-1 rounded-lg border border-red-500/20 transition-colors disabled:opacity-50"
                            >
                              {deletingBatchId === b.batch_id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                              Delete
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* TABLE VIEW */
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-neutral-950 text-neutral-400 font-bold border-b border-white/5">
                        <tr>
                          <th className="px-6 py-4">Fabric Type</th>
                          <th className="px-6 py-4">Source</th>
                          <th className="px-6 py-4">Quantity (kg)</th>
                          <th className="px-6 py-4">Condition</th>
                          <th className="px-6 py-4">Date Registered</th>
                          <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {filteredBatches.map((b) => (
                          <tr
                            key={b.batch_id}
                            onClick={() => fetchBatchAssessment(b.batch_id)}
                            className={`cursor-pointer transition-colors ${selectedBatchId === b.batch_id ? "bg-orange-950/20" : "hover:bg-white/5"}`}
                          >
                            <td className="px-6 py-4">
                              <p className="font-bold text-white">{b.fabric_type}</p>
                              {b.reference_label && (
                                <p className="text-xs font-semibold text-neutral-500 mt-0.5">{b.reference_label}</p>
                              )}
                            </td>
                            <td className="px-6 py-4 font-semibold text-neutral-300">{b.source}</td>
                            <td className="px-6 py-4 font-bold text-white">{b.quantity_kg} kg</td>
                            <td className="px-6 py-4">
                              <span className="px-2.5 py-1 bg-orange-500/10 text-orange-400 rounded-lg text-xs font-bold border border-orange-500/20">
                                {b.condition}
                              </span>
                            </td>
                            <td className="px-6 py-4 font-semibold text-neutral-400">{new Date(b.collection_date).toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => {
                                    setTargetBatchId(b.batch_id);
                                    setActiveTab("overview");
                                  }}
                                  className="text-xs font-bold text-neutral-300 bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg border border-white/10 transition-colors shadow-sm"
                                >
                                  Analyze Photos
                                </button>
                                <button
                                  onClick={() => handleDeleteBatch(b.batch_id)}
                                  disabled={deletingBatchId === b.batch_id}
                                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg border border-red-500/20 transition-colors shadow-sm disabled:opacity-50"
                                >
                                  {deletingBatchId === b.batch_id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Batch Assessment Detail Drawer */}
              {isAssessmentLoading && (
                <div className="p-12 bg-neutral-900 rounded-3xl border border-white/5 flex justify-center items-center gap-3 text-white font-bold">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-400" /> Computing batch sustainability & recycling assessment...
                </div>
              )}

              {!isAssessmentLoading && selectedBatchAssessment && (
                <div className="bg-neutral-900 rounded-3xl border border-white/5 p-6 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xl font-bold text-white">Sustainability & Recycling Assessment: {selectedBatchAssessment.batch_meta?.fabric_type || "Batch"}</h4>
                        <span className={getCategoryBadge(selectedBatchAssessment.recyclability.circularity_category)}>
                          {selectedBatchAssessment.recyclability.circularity_category}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1">
                        Batch ID: <span className="font-mono text-orange-400">{selectedBatchAssessment.batch_id}</span> • Quantity: <strong className="text-white">{selectedBatchAssessment.batch_meta?.quantity_kg || selectedBatchAssessment.impact.weight_kg} kg</strong>
                      </p>
                    </div>

                    {/* 2-WAY PDF REPORT EXPORT BUTTONS */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => downloadReport("pdf", "waste_classification_report", selectedBatchAssessment.batch_id)}
                        disabled={isExportingReport}
                        className="px-3.5 py-2 bg-orange-600 hover:bg-orange-500 text-xs font-bold text-white rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
                      >
                        {isExportingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                        Waste Classification Report (PDF)
                      </button>
                      <button
                        onClick={() => downloadReport("pdf", "recycling_report", selectedBatchAssessment.batch_id)}
                        disabled={isExportingReport}
                        className="px-3.5 py-2 bg-neutral-950 hover:bg-neutral-800 text-xs font-bold text-neutral-200 border border-white/10 rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        {isExportingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5 text-orange-400" />}
                        Recycling Pathway Report (PDF)
                      </button>
                      <button
                        onClick={() => downloadReport("excel", "waste_classification_report", selectedBatchAssessment.batch_id)}
                        disabled={isExportingReport}
                        className="px-3.5 py-2 bg-neutral-950 hover:bg-neutral-800 text-xs font-bold text-emerald-400 border border-white/10 rounded-xl flex items-center gap-1.5 transition-all"
                      >
                        {isExportingReport ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
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

                  {/* Breakdown Grid */}
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
                </div>
              )}
            </div>
          )}

          {activeTab === "processing-analytics" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Processing Analytics</h3>
                <p className="text-sm text-neutral-400">Recommended recycling process for every registered batch, based on material and condition.</p>
              </div>

              {batches.length === 0 ? (
                <div className="bg-neutral-900 rounded-2xl border border-white/5 p-12 text-center text-neutral-500 font-semibold">
                  No batches registered yet. Register a batch from the Waste Inventory tab to see processing recommendations here.
                </div>
              ) : (
                <div className="space-y-4">
                  {batchesWithAssessment.map(({ batch, assessment }) => (
                    <div
                      key={batch.batch_id}
                      className="bg-neutral-900 rounded-2xl border border-white/5 shadow-sm p-5 flex flex-col lg:flex-row lg:items-center gap-5"
                    >
                      {/* Batch identity */}
                      <div className="flex items-center gap-3 lg:w-56 flex-shrink-0">
                        <div className="w-11 h-11 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-400 border border-orange-500/20 flex-shrink-0">
                          <Package className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{batch.fabric_type}</p>
                          <p className="text-xs font-semibold text-neutral-500 truncate">{batch.source}</p>
                        </div>
                      </div>

                      {/* Condition */}
                      <div className="flex-shrink-0">
                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Condition</p>
                        <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${CONDITION_BADGE_STYLES[batch.condition] ?? CONDITION_BADGE_STYLES.Recyclable}`}>
                          {batch.condition}
                        </span>
                      </div>

                      {/* Quantity */}
                      <div className="flex-shrink-0">
                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Quantity</p>
                        <p className="font-bold text-white">{batch.quantity_kg} kg</p>
                      </div>

                      {/* Recommended process */}
                      <div className="flex-shrink-0">
                        <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Recommended Process</p>
                        <p className="font-bold text-white flex items-center gap-1.5">
                          <Recycle className="w-4 h-4 text-orange-400" />
                          {assessment.recommendedOption}
                        </p>
                      </div>

                      {/* Recyclability score */}
                      <div className="flex-1 min-w-[140px]">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide">Recyclability Score</p>
                          <span className="text-xs font-bold text-white">{assessment.recyclabilityScore}/100</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                          <div
                            className="h-full bg-orange-500 rounded-full transition-all"
                            style={{ width: `${assessment.recyclabilityScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "recovery-statistics" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold text-white">Recovery Statistics</h3>
                <p className="text-sm text-neutral-400">Circularity outlook and recovery pathway breakdown across all registered batches.</p>
              </div>

              {batches.length === 0 ? (
                <div className="bg-neutral-900 rounded-2xl border border-white/5 p-12 text-center text-neutral-500 font-semibold">
                  No batches registered yet. Register a batch from the Waste Inventory tab to see recovery statistics here.
                </div>
              ) : (
                <>
                  {/* Summary stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                    <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5 shadow-sm">
                      <p className="text-sm font-medium text-neutral-500">Total Weight Tracked</p>
                      <h3 className="text-3xl font-bold text-white mt-1">{totalTrackedKg.toFixed(1)} kg</h3>
                    </div>
                    <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5 shadow-sm">
                      <p className="text-sm font-medium text-neutral-500">Avg. Circularity Score</p>
                      <h3 className="text-3xl font-bold text-emerald-400 mt-1">{avgCircularityScore}/100</h3>
                    </div>
                    <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5 shadow-sm">
                      <p className="text-sm font-medium text-neutral-500">Recovery Pathways in Use</p>
                      <h3 className="text-3xl font-bold text-white mt-1">{recoveryChartData.length}</h3>
                    </div>
                  </div>

                  {/* Recovery statistics pie charts */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <PieChartWidget
                      data={pathwayPieData}
                      title="Recovery Pathway Share"
                      subtitle="Proportion of total tracked weight allocated per recycling stream"
                      unit="kg"
                      centerText={`${totalTrackedKg.toFixed(0)}`}
                      centerSubtext="Total kg"
                    />
                    <PieChartWidget
                      data={conditionPieData}
                      title="Waste Condition Breakdown"
                      subtitle="Distribution of inventory weight by condition quality category"
                      unit="kg"
                      centerText={`${conditionPieData.length}`}
                      centerSubtext="Conditions"
                    />
                  </div>

                  {/* Recovery pathway chart */}
                  <div className="bg-neutral-900 rounded-2xl border border-white/5 shadow-sm p-6">
                    <div className="flex items-center gap-2 mb-5">
                      <PieChart className="w-4 h-4 text-orange-400" />
                      <p className="text-sm font-bold text-white">Recovered Weight by Pathway</p>
                    </div>
                    <div className="space-y-4">
                      {recoveryChartData.map((d) => (
                        <div key={d.option}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-neutral-300">{d.option}</span>
                            <span className="text-xs font-bold text-neutral-400">{d.kg.toFixed(1)} kg &middot; {d.count} batch{d.count !== 1 ? "es" : ""}</span>
                          </div>
                          <div className="w-full h-3 rounded-full bg-neutral-800 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-600 to-amber-400 rounded-full transition-all"
                              style={{ width: `${(d.kg / maxRecoveryKg) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Per-batch recovery cards */}
                  <div className="space-y-4">
                    {batchesWithAssessment.map(({ batch, assessment }) => (
                      <div
                        key={batch.batch_id}
                        className="bg-neutral-900 rounded-2xl border border-white/5 shadow-sm p-5 flex flex-col lg:flex-row lg:items-center gap-5"
                      >
                        {/* Circularity score ring */}
                        <div className="flex items-center gap-3 lg:w-64 flex-shrink-0">
                          <div className="relative w-14 h-14 flex-shrink-0">
                            <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
                              <circle cx="30" cy="30" r="26" className="fill-none stroke-neutral-800" strokeWidth="6" />
                              <circle
                                cx="30"
                                cy="30"
                                r="26"
                                className="fill-none stroke-emerald-400 transition-all duration-700 ease-out"
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={2 * Math.PI * 26}
                                strokeDashoffset={2 * Math.PI * 26 - (Math.min(Math.max(assessment.circularityScore, 0), 100) / 100) * (2 * Math.PI * 26)}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-xs font-extrabold text-white">{assessment.circularityScore}</span>
                            </div>
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-white truncate">{batch.fabric_type}</p>
                            <p className="text-xs font-semibold text-neutral-500 truncate">{batch.source}</p>
                          </div>
                        </div>

                        {/* Category */}
                        <div className="flex-shrink-0">
                          <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide mb-1">Recovery Outlook</p>
                          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
                            {assessment.category}
                          </span>
                        </div>

                        {/* Sustainability score */}
                        <div className="flex-1 min-w-[140px]">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-1"><Leaf className="w-3.5 h-3.5" /> Sustainability</p>
                            <span className="text-xs font-bold text-white">{assessment.sustainabilityScore}/100</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${assessment.sustainabilityScore}%` }} />
                          </div>
                        </div>

                        {/* Material recovery score */}
                        <div className="flex-1 min-w-[140px]">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-bold text-neutral-500 uppercase tracking-wide flex items-center gap-1"><Gauge className="w-3.5 h-3.5" /> Material Recovery</p>
                            <span className="text-xs font-bold text-white">{assessment.materialRecoveryScore}/100</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${assessment.materialRecoveryScore}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* BATCH DETAILS MODAL */}
      {showBatchDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-white/10">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-bold text-white text-base">Batch Details</h3>
              <button onClick={() => setShowBatchDetailsModal(false)} className="text-neutral-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-neutral-400">
              {selectedFiles.length} image{selectedFiles.length > 1 ? "s" : ""} will be analyzed together as one batch.
              Confirm a few details before we run the scan — this keeps every image in the batch grouped
              together in Scan History and in the exported report. For a new batch, we&apos;ll also
              register it in Waste Inventory automatically once the scan finishes, using the material
              and condition the AI detects most often across the images.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setBatchLinkMode("new")}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${batchLinkMode === "new" ? "bg-orange-600 border-orange-500 text-white" : "border-white/10 text-neutral-300 hover:bg-white/5"}`}
              >
                New Batch
              </button>
              <button
                type="button"
                onClick={() => setBatchLinkMode("existing")}
                className={`flex-1 py-2 rounded-xl text-sm font-bold border transition-colors ${batchLinkMode === "existing" ? "bg-orange-600 border-orange-500 text-white" : "border-white/10 text-neutral-300 hover:bg-white/5"}`}
              >
                Existing Batch
              </button>
            </div>

            {batchLinkMode === "existing" ? (
              <div>
                <label className="text-xs font-bold text-neutral-400">Select Registered Batch</label>
                <select
                  value={targetBatchId ?? ""}
                  onChange={(e) => setTargetBatchId(e.target.value || null)}
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm font-semibold text-white bg-neutral-950 mt-1"
                >
                  <option value="">Select a batch...</option>
                  {batches.map((b) => (
                    <option key={b.batch_id} value={b.batch_id}>
                      {b.reference_label ? `${b.reference_label} — ` : ""}
                      {b.fabric_type} &middot; {b.source} &middot; {b.quantity_kg}kg
                    </option>
                  ))}
                </select>
                {batches.length === 0 && (
                  <p className="text-xs text-neutral-500 mt-1">
                    No registered batches yet — switch to &quot;New Batch&quot; or register one from Waste Inventory.
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold text-neutral-400">Reference / Label (optional)</label>
                <input
                  value={newBatchIdInput}
                  onChange={(e) => setNewBatchIdInput(e.target.value)}
                  placeholder="e.g. July Collection Drive"
                  className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm font-semibold text-white bg-neutral-950 mt-1"
                />
                <p className="text-xs text-neutral-500 mt-1">
                  The actual batch ID is assigned automatically when the new batch is registered.
                </p>
              </div>
            )}

            <div>
              <label className="text-xs font-bold text-neutral-400">Source</label>
              <input
                value={batchSourceInput}
                onChange={(e) => setBatchSourceInput(e.target.value)}
                placeholder="e.g. Collection Bin"
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm font-semibold text-white bg-neutral-950 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-400">Total Batch Size (kg)</label>
              <input
                type="number"
                step="0.1"
                value={batchQuantityInput}
                onChange={(e) => setBatchQuantityInput(e.target.value)}
                placeholder="e.g. 25"
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm font-semibold text-white bg-neutral-950 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-neutral-400">Notes</label>
              <textarea
                value={batchNotesInput}
                onChange={(e) => setBatchNotesInput(e.target.value)}
                rows={2}
                placeholder="Anything worth flagging about this batch..."
                className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm font-semibold text-white bg-neutral-950 mt-1"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={() => setShowBatchDetailsModal(false)}
                className="flex-1 border border-white/10 py-2.5 rounded-xl text-neutral-300 font-bold hover:bg-neutral-800"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowBatchDetailsModal(false);
                  handleAnalyzeBatch();
                }}
                disabled={batchLinkMode === "existing" && !targetBatchId}
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-2.5 rounded-xl font-bold disabled:opacity-50"
              >
                Run Full AI Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCAN HISTORY & REPORTS MODAL */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col border border-white/10">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-neutral-950">
              <div>
                <h3 className="text-lg font-bold text-white">Scan History & Reports</h3>
                <p className="text-sm text-neutral-400">Review past AI analyses, grouped by batch, and download reports.</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleExport("pdf", "waste_classification_report")}
                  disabled={isExporting !== null || historyItems.length === 0}
                  className="flex items-center gap-1.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-500 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isExporting === "pdf" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5" />}
                  Waste Classification (PDF)
                </button>
                <button
                  onClick={() => handleExport("pdf", "recycling_report")}
                  disabled={isExporting !== null || historyItems.length === 0}
                  className="flex items-center gap-1.5 text-xs font-bold text-neutral-200 bg-neutral-900 border border-white/10 hover:bg-neutral-800 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isExporting === "pdf" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileDown className="w-3.5 h-3.5 text-orange-400" />}
                  Recycling Pathway (PDF)
                </button>
                <button
                  onClick={() => handleExport("excel", "waste_classification_report")}
                  disabled={isExporting !== null || historyItems.length === 0}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-neutral-900 border border-white/10 hover:bg-neutral-800 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 shadow-sm"
                >
                  {isExporting === "excel" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />}
                  Excel Report
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
                              ? `Batch: ${group.batch_meta?.label || batchDisplayLabel(group.batch_id)}`
                              : (group.scans[0]?.filename ?? "Scan")}
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
                                      onClick={(e) => { e.stopPropagation(); handleDownloadHistoryItemReport(scan._id); }}
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
                                  <div className="p-5 bg-black/40 border-t border-white/5">
                                    {renderDetailedResult({
                                      scan_id: scan._id,
                                      filename: scan.filename,
                                      analysis: scan.analysis,
                                      recyclability: scan.recyclability,
                                    })}
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

      {/* CREATE BATCH MODAL */}
      {showAddBatchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 border border-white/10">
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="font-bold text-white text-base">Register Waste Batch</h3>
              <button onClick={() => setShowAddBatchModal(false)} className="text-neutral-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateBatch} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-400">Fabric Type</label>
                <select value={fabricType} onChange={(e) => setFabricType(e.target.value)} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm font-semibold text-white bg-neutral-950 mt-1">
                  <option value="Cotton">Cotton</option>
                  <option value="Polyester">Polyester</option>
                  <option value="Denim">Denim</option>
                  <option value="Wool">Wool</option>
                  <option value="Silk">Silk</option>
                  <option value="Nylon">Nylon</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-400">Source</label>
                <input required value={source} onChange={(e) => setSource(e.target.value)} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm font-semibold text-white bg-neutral-950 mt-1" placeholder="e.g. Collection Bin" />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-400">Quantity (kg)</label>
                <input type="number" step="0.1" required value={quantityKg} onChange={(e) => setQuantityKg(e.target.value)} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm font-semibold text-white bg-neutral-950 mt-1" placeholder="150" />
              </div>
              <div>
                <label className="text-xs font-bold text-neutral-400">Condition</label>
                <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm font-semibold text-white bg-neutral-950 mt-1">
                  <option value="Recyclable">Recyclable</option>
                  <option value="Reusable">Reusable</option>
                  <option value="Repairable">Repairable</option>
                  <option value="Upcyclable">Upcyclable</option>
                  <option value="Compostable">Compostable</option>
                  <option value="Hazardous">Hazardous</option>
                </select>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setShowAddBatchModal(false)} className="flex-1 border border-white/10 py-2.5 rounded-xl text-neutral-300 font-bold hover:bg-neutral-800">Cancel</button>
                <button type="submit" disabled={isSubmittingBatch} className="flex-1 bg-orange-600 hover:bg-orange-500 text-white py-2.5 rounded-xl font-bold flex justify-center items-center gap-2 shadow-sm">
                  {isSubmittingBatch && <Loader2 className="w-4 h-4 animate-spin" />} Save Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}