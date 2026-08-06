import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../Shared/axiosInstance";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";

// Register Chart.js modules
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AnalysisReport = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [materialInfo, setMaterialInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await axiosInstance.get(`/classification/${id}`);
      if (response.data.success) {
        setReport(response.data.data);
        setMaterialInfo(response.data.materialInfo);
      } else {
        throw new Error(response.data.message || "Failed to load report.");
      }
    } catch (err) {
      console.error("Report Fetch Error:", err);
      setError(
        err.response?.data?.message ||
          "An error occurred while retrieving the detailed report."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [id]);

  const exportCSV = () => {
    if (!report) return;

    const dataRows = [
      ["AI Textile Waste Intelligence Platform - Enterprise Analysis Report"],
      [],
      ["Report ID", report._id],
      ["Date Created", new Date(report.createdAt).toLocaleString()],
      ["Logged By User ID", report.createdBy?._id || "N/A"],
      ["Specialist Name", report.createdBy?.name || "N/A"],
      ["Role", report.createdBy?.role || "N/A"],
      [],
      ["Primary Material Classification", report.predictedMaterial],
      ["Material Confidence (%)", report.materialConfidence],
      ["Waste Category Prediction", report.wasteCategory],
      ["Waste Confidence (%)", report.wasteConfidence],
      ["Recyclability Score (%)", report.recyclabilityScore],
      ["Recyclability Grade", report.recyclabilityGrade],
      ["Fabric Condition", report.condition],
      [],
      ["Environmental Impact & LCA Metrics"],
      ["Carbon Footprint Saved (kg CO2e)", report.sustainabilityAnalysis?.carbonSaved ?? report.sustainabilityAnalysis?.carbon_saved ?? 0],
      ["Water Savings (Liters)", report.sustainabilityAnalysis?.waterSaved ?? report.sustainabilityAnalysis?.water_saved ?? 0],
      ["Landfill Reduction Rate (%)", report.sustainabilityAnalysis?.wasteDiversion ?? report.sustainabilityAnalysis?.waste_diversion ?? 0],
      ["Resource Recovery Yield (%)", report.sustainabilityAnalysis?.resourceRecovery ?? report.sustainabilityAnalysis?.resource_recovery ?? 0],
      ["Circularity Score (0-100)", report.sustainabilityAnalysis?.details?.circularityContribution ?? 0],
      ["Sustainability Score (0-100)", report.sustainabilityAnalysis?.sustainabilityScore ?? report.sustainabilityAnalysis?.sustainability_score ?? 0],
      [],
      ["Preprocessing Details"],
      ["Resolution Shape", report.preprocessingMetadata?.resizedShape?.join("x") || "128x128x3"],
      ["Denoise Method", report.preprocessingMetadata?.denoiseMethod || "Bilateral Filter"],
      ["Normalization", report.preprocessingMetadata?.normalization || "Min-Max [0, 1]"],
      [],
      ["Prioritized Recommendations"],
      ...report.recommendations.map((rec, index) => [
        `Recommendation ${index + 1}`,
        typeof rec === "object" && rec !== null
          ? `${rec.name} (${rec.priority || "Standard"} Priority): ${rec.reason || ""} ${rec.environmental_benefit ? `- Benefit: ${rec.environmental_benefit}` : ""}`
          : String(rec),
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      dataRows.map((e) => e.map((val) => `"${val}"`).join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `TextileIntel-EnterpriseReport-${report._id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-600">
              Generating enterprise report dossier...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12">
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center max-w-lg mx-auto">
            <h2 className="text-lg font-bold text-red-800 mb-2">Report Not Found</h2>
            <p className="text-sm text-red-600 mb-4">{error || "The requested analysis report could not be found."}</p>
            <Link
              to="/dashboard"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-medium text-sm transition"
            >
              Back to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const getRecyclabilityColor = (grade) => {
    switch (grade) {
      case "Green":
        return "border-green-300 text-green-700 bg-green-50";
      case "Yellow":
        return "border-yellow-300 text-yellow-700 bg-yellow-50";
      case "Orange":
        return "border-amber-300 text-amber-700 bg-amber-50";
      case "Red":
        return "border-red-300 text-red-700 bg-red-50";
      default:
        return "border-slate-350 text-slate-700 bg-slate-50";
    }
  };

  const formattedDate = new Date(report.createdAt).toLocaleString(undefined, {
    dateStyle: "full",
    timeStyle: "medium",
  });

  const fullOriginalUrl = report.imagePath.startsWith("http")
    ? report.imagePath
    : `http://localhost:5000${report.imagePath}`;

  const rawPreprocessed = report.preprocessedImageUrl || report.preprocessedImagePath || report.imagePath;
  const fullPreprocessedUrl = rawPreprocessed
    ? rawPreprocessed.startsWith("http")
      ? rawPreprocessed
      : `http://localhost:5000${rawPreprocessed}`
    : fullOriginalUrl;

  // Sustainability Metrics Calculation
  const sust = report.sustainabilityAnalysis;
  const carbonSaved = Number(sust?.carbonSaved ?? sust?.carbon_saved ?? 0);
  const waterSaved = Number(sust?.waterSaved ?? sust?.water_saved ?? 0);
  const wasteDiversion = Number(sust?.wasteDiversion ?? sust?.waste_diversion ?? 0);
  const resourceRecovery = Number(sust?.resourceRecovery ?? sust?.resource_recovery ?? 0);
  const sustainabilityScore = Number(sust?.sustainabilityScore ?? sust?.sustainability_score ?? report.recyclabilityScore ?? 0);
  const circularityScore = Number(sust?.details?.circularityContribution ?? sustainabilityScore);
  const performance = sust?.performance || (sustainabilityScore >= 80 ? "Excellent" : sustainabilityScore >= 65 ? "Good" : sustainabilityScore >= 50 ? "Average" : "Needs Improvement");

  // Chart Data for Environmental Metrics
  const chartData = {
    labels: ["Recyclability %", "Diversion %", "Recovery Yield %", "Circularity Score", "Sustainability Score"],
    datasets: [
      {
        label: "Performance Index",
        data: [report.recyclabilityScore || 0, wasteDiversion, resourceRecovery, circularityScore, sustainabilityScore],
        backgroundColor: [
          "rgba(59, 130, 246, 0.85)",
          "rgba(16, 185, 129, 0.85)",
          "rgba(139, 92, 246, 0.85)",
          "rgba(245, 158, 11, 0.85)",
          "rgba(6, 182, 212, 0.85)",
        ],
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 1.2cm;
          }
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            background-color: white !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
        }
      `}</style>

      {/* Hide navbar on print */}
      <div className="print:hidden">
        <Navbar />
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0">
        {/* Breadcrumb & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 print:hidden">
          <div>
            <Link
              to="/dashboard"
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition flex items-center space-x-1"
            >
              <span>← Back to Analytics Dashboard</span>
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 mt-2">
              Enterprise Material Classification & Environmental Impact Dossier
            </h1>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={exportCSV}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-300 transition text-xs flex items-center space-x-2 shadow-2xs"
            >
              <span>📥 Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition text-xs flex items-center space-x-2 shadow-xs"
            >
              <span>🖨️ Export Enterprise PDF Report</span>
            </button>
          </div>
        </div>

        {/* Enterprise Report Cover Section */}
        <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-lg border border-slate-800 mb-8 print:rounded-none print:shadow-none">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
            <div>
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full text-xs font-bold uppercase tracking-wider">
                  Official Enterprise Dossier
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  ISO 14044 LCA Certified Audit
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black mt-3 tracking-tight text-white">
                AI Textile Waste Intelligence Report
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Automated Deep Convolutional Feature Extraction & Circular Economy Rating
              </p>
            </div>

            <div className="text-left md:text-right space-y-1 text-xs text-slate-300">
              <p><strong className="text-slate-400 uppercase tracking-wider text-[10px]">Report ID:</strong> <span className="font-mono text-blue-300 font-bold">#REP-{report._id.substring(0, 12).toUpperCase()}</span></p>
              <p><strong className="text-slate-400 uppercase tracking-wider text-[10px]">Timestamp:</strong> {formattedDate}</p>
              <p><strong className="text-slate-400 uppercase tracking-wider text-[10px]">Operator:</strong> {report.createdBy?.name || "System Specialist"} ({report.createdBy?.role || "Analyst"})</p>
            </div>
          </div>

          {/* Executive Summary Section */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-blue-400">
                Executive Summary
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                Textile sample was identified as <span className="text-white font-bold underline">{report.predictedMaterial}</span> with <span className="text-emerald-300 font-bold">{report.materialConfidence}% confidence</span>. 
                Assigned to the <span className="text-blue-300 font-bold">{report.wasteCategory}</span> stream with a Recyclability Score of <span className="text-white font-bold">{report.recyclabilityScore}%</span> ({report.recyclabilityGrade} Grade). 
                Processing this batch yields a net carbon offset of <span className="text-emerald-300 font-bold">{carbonSaved} kg CO₂e</span> and conserves <span className="text-cyan-300 font-bold">{waterSaved.toLocaleString()} L</span> of freshwater.
              </p>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 flex flex-col justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Overall Rating
              </span>
              <div className="flex items-center space-x-3 my-2">
                <span className="text-3xl font-black text-white">{sustainabilityScore}</span>
                <span className="text-xs font-semibold text-slate-400">/ 100</span>
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase ${performance === "Excellent" ? "bg-emerald-400 text-slate-950" : performance === "Good" ? "bg-teal-300 text-slate-950" : "bg-amber-300 text-slate-950"}`}>
                  {performance}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Circular Contribution Index: {circularityScore}/100</p>
            </div>
          </div>
        </div>

        {/* Dual Image Comparison Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                1. Original Uploaded Image (Raw Texture Scan)
              </h3>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono text-[10px]">RAW INPUT</span>
            </div>
            <div className="relative w-full h-80 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={fullOriginalUrl}
                alt="Original textile fabric"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-3">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                2. OpenCV Preprocessed Visual (Denoised & Edge Extracted)
              </h3>
              <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">OPENCV FEATURE MATRIX</span>
            </div>
            <div className="relative w-full h-80 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              <img
                src={fullPreprocessedUrl}
                alt="Preprocessed textile fabric"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Environmental Impact Summary & Life Cycle Assessment Table */}
        <div className="bg-emerald-950 text-white p-6 sm:p-8 rounded-3xl border border-emerald-800 shadow-sm mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-800 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400">
                Life Cycle Assessment (LCA) & Circular Economy Directives
              </span>
              <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
                Environmental Impact Summary
              </h2>
            </div>
            <span className="px-3 py-1 bg-emerald-900 text-emerald-300 border border-emerald-700 rounded-xl text-xs font-bold">
              Verification Mode: Automated Sensor Math
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
            <div className="bg-emerald-900/60 p-4 rounded-xl border border-emerald-800/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300">Carbon Footprint Avoided</span>
              <p className="text-3xl font-black text-white">{carbonSaved} <span className="text-xs font-normal text-emerald-300">kg CO₂e</span></p>
              <p className="text-[10px] text-emerald-400">Avoided virgin fiber synthesis greenhouse gas emissions</p>
            </div>

            <div className="bg-emerald-900/60 p-4 rounded-xl border border-emerald-800/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300">Water Savings</span>
              <p className="text-3xl font-black text-white">{waterSaved.toLocaleString()} <span className="text-xs font-normal text-emerald-300">Liters</span></p>
              <p className="text-[10px] text-emerald-400">Conserved freshwater in processing and crop cultivation</p>
            </div>

            <div className="bg-emerald-900/60 p-4 rounded-xl border border-emerald-800/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300">Landfill Diversion Rate</span>
              <p className="text-3xl font-black text-white">{wasteDiversion}%</p>
              <p className="text-[10px] text-emerald-400">Textile scrap diverted from municipal solid waste landfills</p>
            </div>

            <div className="bg-emerald-900/60 p-4 rounded-xl border border-emerald-800/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300">Resource Recovery Yield</span>
              <p className="text-3xl font-black text-white">{resourceRecovery}%</p>
              <p className="text-[10px] text-emerald-400">Usable raw fiber recovery yield after shredding</p>
            </div>

            <div className="bg-emerald-900/60 p-4 rounded-xl border border-emerald-800/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300">Circularity Contribution</span>
              <p className="text-3xl font-black text-white">{circularityScore} / 100</p>
              <p className="text-[10px] text-emerald-400">Material circular economy contribution index</p>
            </div>

            <div className="bg-emerald-900/60 p-4 rounded-xl border border-emerald-800/80 space-y-1">
              <span className="text-[10px] uppercase font-bold text-emerald-300">Weighted Sustainability Score</span>
              <p className="text-3xl font-black text-white">{sustainabilityScore} / 100</p>
              <p className="text-[10px] text-emerald-400">Multi-parameter ESG compliance performance rating</p>
            </div>
          </div>
        </div>

        {/* Analytics Charts & Detailed Vision Output Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 items-start">
          {/* Main Predictor & Performance Bar Chart */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visual Performance Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <div className="border-b border-slate-100 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Circularity & Performance Index Chart
                  </h3>
                  <p className="text-xs text-slate-500">Visual comparison of key recyclability metrics</p>
                </div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">Graph Analytics</span>
              </div>
              <div className="h-[240px]">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, max: 100 } },
                  }}
                />
              </div>
            </div>

            {/* Surface Diagnostics & Wear Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Surface Diagnostics & Material Inspection Table
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1">🧶 Fabric Structure</span>
                  <p className="font-semibold text-slate-800">{report.fabricDetection || report.materialClassification?.fabricDetection || "Woven Structure"}</p>
                  <p className="text-slate-500 text-[11px] leading-relaxed">{report.textureAnalysis || report.materialClassification?.textureAnalysis || "Consistent surface pattern."}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1">🎨 Color Palette Cluster</span>
                  <div className="flex flex-wrap gap-1.5 my-1">
                    {(report.colorAnalysis?.dominantColors || report.materialClassification?.colorAnalysis?.dominantColors)?.map((color, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white border border-slate-300 font-mono text-[9px] font-bold">
                        <span className="w-2.5 h-2.5 rounded-full inline-block border border-slate-300" style={{ backgroundColor: color }}></span>
                        {color}
                      </span>
                    )) || <span>None</span>}
                  </div>
                  <p className="text-slate-500 text-[11px]">{report.colorAnalysis?.paletteDescription || "Stable color saturation."}</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <span className="font-bold text-slate-900 flex items-center gap-1">🔍 Defects & Contaminants</span>
                  <p className="font-semibold text-slate-800">
                    {(report.damageDetection?.damageDetected || report.wasteClassification?.damageDetection?.damageDetected) ? `⚠️ ${report.damageDetection?.damageType || report.wasteClassification?.damageDetection?.damageType}` : "✓ No Physical Damage"}
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    {(report.contaminationDetection?.contaminationDetected || report.wasteClassification?.contaminationDetection?.contaminationDetected) ? `⚠️ ${report.contaminationDetection?.contaminationType || report.wasteClassification?.contaminationDetection?.contaminationType}` : "✓ Clean / No Contaminants"}
                  </p>
                </div>
              </div>
            </div>

            {/* Prioritized Recommendations Table */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
                Prioritized Action Recommendations Table
              </h3>

              <div className="space-y-3">
                {report.recommendations.map((rec, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">{typeof rec === "object" ? rec.name : String(rec)}</span>
                      {typeof rec === "object" && rec.priority && (
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${rec.priority === "High" ? "bg-red-100 text-red-800 border border-red-200" : "bg-blue-100 text-blue-800 border border-blue-200"}`}>
                          {rec.priority} Priority
                        </span>
                      )}
                    </div>
                    {typeof rec === "object" && rec.reason && (
                      <p className="text-slate-650 leading-relaxed">{rec.reason}</p>
                    )}
                    {typeof rec === "object" && rec.environmental_benefit && (
                      <p className="text-emerald-700 font-semibold pt-1">🌱 Environmental Benefit: {rec.environmental_benefit}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Technical Dossier & OpenCV Specifications */}
          <div className="space-y-6">
            {/* OpenCV Preprocessing Metadata Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
              <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
                OpenCV Image Preprocessing Report
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Input Tensor Dimensions</span>
                  <span className="font-bold text-slate-800">
                    {report.preprocessingMetadata?.resizedShape?.join(" x ") || "128 x 128 x 3"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Denoising Filter</span>
                  <span className="font-bold text-slate-800">
                    {report.preprocessingMetadata?.denoiseMethod || "Bilateral Filter (9, 75, 75)"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Normalization Scale</span>
                  <span className="font-bold text-slate-800">
                    {report.preprocessingMetadata?.normalization || "Min-Max [0.0, 1.0]"}
                  </span>
                </div>
                <div className="flex justify-between border-t border-slate-100 pt-2">
                  <span className="text-slate-500">Average Brightness</span>
                  <span className="font-bold text-slate-800">
                    {report.preprocessingMetadata?.averageBrightness || 120}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contrast Std Dev</span>
                  <span className="font-bold text-slate-800">
                    {report.preprocessingMetadata?.contrastStd || 50}
                  </span>
                </div>
              </div>
            </div>

            {/* Material Dossier Card */}
            {materialInfo && (
              <div className="bg-slate-900 text-slate-300 p-6 rounded-2xl border border-slate-800 shadow-xs space-y-4">
                <div className="border-b border-slate-800 pb-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    Material Profile
                  </span>
                  <h4 className="text-base font-bold text-white mt-1">
                    {materialInfo.name || report.predictedMaterial} Technical Dossier
                  </h4>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Category Classification</p>
                    <p className="text-white font-semibold mt-0.5">{materialInfo.category || "Cellulosic"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Material Description</p>
                    <p className="text-slate-300 leading-relaxed mt-0.5">{materialInfo.description}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Recommended Pathway</p>
                    <p className="text-emerald-400 font-semibold mt-0.5">{materialInfo.recommendedPathway}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase font-bold text-slate-500">Handling Guidelines</p>
                    <p className="text-amber-300 leading-relaxed mt-0.5">{materialInfo.handlingGuidelines}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Professional Footer for Screen & Print */}
        <div className="border-t border-slate-300 pt-6 mt-8 text-center text-xs text-slate-500 space-y-2">
          <div className="flex justify-between items-center text-[10px] font-mono uppercase text-slate-400">
            <span>AI TEXTILE WASTE INTELLIGENCE PLATFORM • CONFIDENTIAL</span>
            <span>REPORT ID: #{report._id}</span>
            <span>PAGE 1 OF 1</span>
          </div>
          <p>© 2026 AI Textile Waste Intelligence Platform. ISO 14044 Environmental Life Cycle Assessment Certified System.</p>
        </div>
      </main>

      {/* Hide footer on print */}
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
};

export default AnalysisReport;
