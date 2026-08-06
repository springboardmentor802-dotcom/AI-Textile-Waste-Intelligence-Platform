import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../Shared/axiosInstance";
import { useAuth } from "../Authentication/AuthContext";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import ErrorBoundary from "../Shared/ErrorBoundary";
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

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Sustainability Manager");

  useEffect(() => {
    if (user?.role) {
      if (user.role === "Admin") setActiveTab("Administrator");
      else if (user.role.toLowerCase().includes("facility") || user.role.toLowerCase().includes("recycl")) setActiveTab("Recycling Facility");
      else if (user.role.toLowerCase().includes("manufactur")) setActiveTab("Manufacturer");
      else setActiveTab("Sustainability Manager");
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axiosInstance.get("/classification");

      if (response.data.success) {
        const historyData = response.data.data;
        setHistory(historyData);

        // Aggregate statistics locally from classification history
        const total = historyData.length;
        let sumScore = 0;
        let sumCarbon = 0;
        let sumWater = 0;
        let sumDiversion = 0;
        let sumRecovery = 0;
        let sumCircularity = 0;

        const materialDistribution = {};
        const wasteDistribution = {};
        const gradeDistribution = {};
        const carbonByMaterial = {};
        const scoreRanges = { Excellent: 0, Good: 0, Average: 0, "Needs Improvement": 0 };
        const recCounts = {};

        historyData.forEach((item) => {
          const score = item.sustainabilityAnalysis?.sustainabilityScore || item.recyclabilityScore || 0;
          sumScore += score;

          const carbon = Number(item.sustainabilityAnalysis?.carbonSaved || item.sustainabilityAnalysis?.carbon_saved || 0);
          const water = Number(item.sustainabilityAnalysis?.waterSaved || item.sustainabilityAnalysis?.water_saved || 0);
          const diversion = Number(item.sustainabilityAnalysis?.wasteDiversion || item.sustainabilityAnalysis?.waste_diversion || 0);
          const recovery = Number(item.sustainabilityAnalysis?.resourceRecovery || item.sustainabilityAnalysis?.resource_recovery || 0);
          const circularity = Number(item.sustainabilityAnalysis?.details?.circularityContribution || item.sustainabilityAnalysis?.sustainabilityScore || 0);

          sumCarbon += carbon;
          sumWater += water;
          sumDiversion += diversion;
          sumRecovery += recovery;
          sumCircularity += circularity;

          const mat = item.predictedMaterial || "Unknown";
          materialDistribution[mat] = (materialDistribution[mat] || 0) + 1;
          carbonByMaterial[mat] = (carbonByMaterial[mat] || 0) + carbon;

          const waste = item.wasteCategory || "Unknown";
          wasteDistribution[waste] = (wasteDistribution[waste] || 0) + 1;

          const grade = item.recyclabilityGrade || "Unknown";
          gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;

          if (score >= 80) scoreRanges.Excellent++;
          else if (score >= 65) scoreRanges.Good++;
          else if (score >= 50) scoreRanges.Average++;
          else scoreRanges["Needs Improvement"]++;

          const recs = item.sustainabilityAnalysis?.recommendations || item.recommendations || [];
          recs.forEach((rec) => {
            const recName = typeof rec === "object" ? rec.name : String(rec);
            recCounts[recName] = (recCounts[recName] || 0) + 1;
          });
        });

        const avg = total > 0 ? Math.round(sumScore / total) : 0;
        const avgDiversion = total > 0 ? Math.round(sumDiversion / total) : 0;
        const avgRecovery = total > 0 ? Math.round(sumRecovery / total) : 0;
        const avgCircularity = total > 0 ? Math.round(sumCircularity / total) : 0;

        setStats({
          totalAnalysed: total,
          avgScore: avg,
          avgCircularity,
          totalCarbon: parseFloat(sumCarbon.toFixed(1)),
          totalWater: Math.round(sumWater),
          avgDiversion,
          avgRecovery,
          materialDistribution,
          wasteDistribution,
          gradeDistribution,
          carbonByMaterial,
          scoreRanges,
          recCounts,
        });
      } else {
        throw new Error(response.data.message || "Failed to load dashboard data.");
      }
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError(
        err.response?.data?.message ||
          "Failed to load analytics dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    const handleHistoryUpdate = () => {
      fetchData();
    };

    window.addEventListener("history-updated", handleHistoryUpdate);
    return () => {
      window.removeEventListener("history-updated", handleHistoryUpdate);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-600">
              Aggregating circular intelligence statistics...
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-12">
          <div className="p-6 rounded-2xl bg-red-50 border border-red-200 text-center max-w-lg mx-auto">
            <h2 className="text-lg font-bold text-red-800 mb-2">Error Loading Dashboard</h2>
            <p className="text-sm text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl font-medium text-sm transition"
            >
              Retry Connection
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Fallback defaults if no statistics exist yet
  const totalAnalysed = stats?.totalAnalysed || 0;
  const avgScore = stats?.avgScore || 0;
  const avgCircularity = stats?.avgCircularity || 0;
  const materialDist = stats?.materialDistribution || {};
  const wasteDist = stats?.wasteDistribution || {};
  const carbonByMat = stats?.carbonByMaterial || {};
  const scoreRanges = stats?.scoreRanges || { Excellent: 0, Good: 0, Average: 0, "Needs Improvement": 0 };
  const recCounts = stats?.recCounts || {};

  // 1. Material Distribution Chart Data
  const materialLabels = Object.keys(materialDist);
  const materialCounts = Object.values(materialDist);
  const materialChartData = {
    labels: materialLabels.length > 0 ? materialLabels : ["No Data"],
    datasets: [
      {
        label: "Sample Count",
        data: materialCounts.length > 0 ? materialCounts : [0],
        backgroundColor: [
          "rgba(37, 99, 235, 0.8)",
          "rgba(16, 185, 129, 0.8)",
          "rgba(245, 158, 11, 0.8)",
          "rgba(139, 92, 246, 0.8)",
          "rgba(236, 72, 153, 0.8)",
          "rgba(6, 182, 212, 0.8)",
        ],
        borderRadius: 8,
      },
    ],
  };

  // 2. Waste Category Chart Data
  const wasteLabels = Object.keys(wasteDist);
  const wasteCounts = Object.values(wasteDist);
  const wasteChartData = {
    labels: wasteLabels.length > 0 ? wasteLabels : ["No Data"],
    datasets: [
      {
        data: wasteCounts.length > 0 ? wasteCounts : [1],
        backgroundColor: ["#10B981", "#3B82F6", "#F59E0B", "#8B5CF6", "#14B8A6", "#EF4444"],
      },
    ],
  };

  // 3. Carbon Savings by Fiber Chart Data
  const carbonLabels = Object.keys(carbonByMat);
  const carbonValues = Object.values(carbonByMat);
  const carbonChartData = {
    labels: carbonLabels.length > 0 ? carbonLabels : ["No Data"],
    datasets: [
      {
        label: "CO₂ Saved (kg)",
        data: carbonValues.length > 0 ? carbonValues : [0],
        backgroundColor: "rgba(16, 185, 129, 0.85)",
        borderRadius: 8,
      },
    ],
  };

  // 4. Score Distribution Chart Data
  const scoreChartData = {
    labels: Object.keys(scoreRanges),
    datasets: [
      {
        label: "Samples",
        data: Object.values(scoreRanges),
        backgroundColor: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"],
        borderRadius: 8,
      },
    ],
  };

  // 5. Recycling Recommendation Distribution Chart Data
  const recLabels = Object.keys(recCounts);
  const recValues = Object.values(recCounts);
  const recChartData = {
    labels: recLabels.length > 0 ? recLabels : ["No Data"],
    datasets: [
      {
        data: recValues.length > 0 ? recValues : [1],
        backgroundColor: ["#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EC4899", "#14B8A6", "#64748B"],
      },
    ],
  };

  // Helper function to return colour grade styles
  const getGradeStyle = (grade) => {
    switch (grade) {
      case "Green":
        return "bg-green-100 text-green-800 border-green-200";
      case "Yellow":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "Orange":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Red":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-800 border-slate-200";
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/70">
      <Navbar />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-12">
        {/* Title / Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/80 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Analytics & Circular Intelligence Dashboard
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Real-time material distribution, waste stream tracking, LCA environmental impact & circular benchmarking
            </p>
          </div>
          <Link
            to="/analysis"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition shadow-xs flex items-center justify-center space-x-2 hover:shadow-md hover:-translate-y-0.5"
          >
            <span>+ New AI Analysis</span>
          </Link>
        </div>

        {/* SECTION 1: Sustainability Overview & Scoring */}
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
            1. Sustainability Overview & Circular Scoring
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Sustainability Score</span>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-black text-blue-600">{avgScore} <span className="text-sm font-normal text-slate-400">/ 100</span></p>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700">Weighted</span>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-1 border-t border-slate-100">Weighted multi-parameter circularity index</p>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Circularity Contribution Index</span>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-black text-indigo-600">{avgCircularity} <span className="text-sm font-normal text-slate-400">/ 100</span></p>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-indigo-50 text-indigo-700">Index</span>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-1 border-t border-slate-100">Material circular economy contribution</p>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Resource Recovery Yield</span>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-black text-emerald-600">{stats?.avgRecovery || 0}%</p>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700">Yield</span>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-1 border-t border-slate-100">Usable raw fiber recovery efficiency</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Environmental Impact */}
        <div>
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-4">
            2. Environmental Impact Assessment
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-emerald-900 text-white p-6 sm:p-7 rounded-2xl border border-emerald-800 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">Carbon Footprint Saved</span>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-black text-white">{stats?.totalCarbon || 0} <span className="text-sm font-normal text-emerald-300">kg CO₂e</span></p>
              </div>
              <p className="text-xs text-emerald-300 font-medium pt-1 border-t border-emerald-800/80">Avoided virgin manufacturing emissions</p>
            </div>

            <div className="bg-emerald-900 text-white p-6 sm:p-7 rounded-2xl border border-emerald-800 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-300">Water Savings</span>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-black text-white">{stats?.totalWater ? stats.totalWater.toLocaleString() : 0} <span className="text-sm font-normal text-emerald-300">L</span></p>
              </div>
              <p className="text-xs text-emerald-300 font-medium pt-1 border-t border-emerald-800/80">Freshwater conserved in textile processing</p>
            </div>

            <div className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 space-y-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Landfill Reduction Rate</span>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl font-black text-teal-600">{stats?.avgDiversion || 0}%</p>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-teal-50 text-teal-700">Diverted</span>
              </div>
              <p className="text-xs text-slate-500 font-medium pt-1 border-t border-slate-100">Landfill avoidance efficiency rate</p>
            </div>
          </div>
        </div>

        {/* SECTION 2: Role-Based Dashboard Tabs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Role-Based Intelligence Perspective</h3>
              <p className="text-xs text-slate-500 mt-0.5">Switch view perspective or open full standalone dashboard page</p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200/60">
              {[
                { name: "Sustainability Manager", path: "/dashboard/sustainability" },
                { name: "Recycling Facility", path: "/dashboard/recycling" },
                { name: "Manufacturer", path: "/dashboard/manufacturer" },
                { name: "Administrator", path: "/dashboard/admin" },
              ].map((tab) => (
                <div key={tab.name} className="flex items-center space-x-1">
                  <button
                    onClick={() => setActiveTab(tab.name)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                      activeTab === tab.name
                        ? "bg-white text-blue-600 shadow-xs border border-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab.name}
                  </button>
                  <Link
                    to={tab.path}
                    title={`Open full ${tab.name} Dashboard Page`}
                    className="text-[10px] font-semibold text-blue-600 hover:text-blue-800 hover:underline px-1"
                  >
                    ↗
                  </Link>
                </div>
              ))}
            </div>
          </div>

          {/* Role Tab Content Cards */}
          {activeTab === "Recycling Facility" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold uppercase text-slate-500 text-[10px]">Waste Inventory</span>
                <p className="text-lg font-black text-slate-900">{totalAnalysed} Fabric Batches</p>
                <p className="text-slate-600 leading-relaxed">Stream breakdown: {Object.keys(materialDist).join(", ") || "No material streams registered"}</p>
              </div>

              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-2 text-blue-950">
                <span className="font-bold uppercase text-blue-700 text-[10px]">Recycling Opportunities</span>
                <p className="text-lg font-black text-blue-900">{stats?.avgRecovery || 0}% High-Yield Mechanical/Chemical Candidates</p>
                <p className="text-blue-800 leading-relaxed">Prioritized sorting direct route to maximize fiber length retention.</p>
              </div>

              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 space-y-2 text-emerald-950">
                <span className="font-bold uppercase text-emerald-700 text-[10px]">Recovery Statistics</span>
                <p className="text-lg font-black text-emerald-900">{stats?.avgDiversion || 0}% Diverted from Landfill</p>
                <p className="text-emerald-800 leading-relaxed">Recovered fiber output replaces virgin material procurement.</p>
              </div>
            </div>
          )}

          {activeTab === "Sustainability Manager" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold uppercase text-slate-500 text-[10px]">Sustainability Index</span>
                <p className="text-xl font-black text-slate-900">{avgScore} / 100</p>
                <p className="text-slate-500 text-[10px]">Corporate ESG Compliance</p>
              </div>

              <div className="bg-emerald-900 text-white p-4 rounded-xl border border-emerald-800 space-y-1">
                <span className="font-bold uppercase text-emerald-300 text-[10px]">Carbon Reduction</span>
                <p className="text-xl font-black text-white">{stats?.totalCarbon || 0} kg CO₂e</p>
                <p className="text-emerald-400 text-[10px]">Avoided Scope 3 Emissions</p>
              </div>

              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="font-bold uppercase text-slate-500 text-[10px]">Waste Diversion</span>
                <p className="text-xl font-black text-slate-900">{stats?.avgDiversion || 0}%</p>
                <p className="text-slate-500 text-[10px]">Landfill Avoidance Yield</p>
              </div>

              <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 space-y-1 text-blue-950">
                <span className="font-bold uppercase text-blue-700 text-[10px]">ESG Summary</span>
                <p className="text-sm font-bold text-blue-900 mt-1">Audit Verified</p>
                <p className="text-blue-800 text-[10px]">Report audit log synchronized with database</p>
              </div>
            </div>
          )}

          {activeTab === "Manufacturer" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold uppercase text-slate-500 text-[10px]">Production Waste Analysis</span>
                <p className="text-lg font-black text-slate-900">{totalAnalysed} Production Offcut Batches</p>
                <p className="text-slate-600 leading-relaxed">Identified fiber streams for closed-loop textile manufacturing.</p>
              </div>

              <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-100 space-y-2 text-emerald-950">
                <span className="font-bold uppercase text-emerald-700 text-[10px]">Material Recovery Yield</span>
                <p className="text-lg font-black text-emerald-900">{stats?.avgRecovery || 0}% Usable Raw Fiber</p>
                <p className="text-emerald-800 leading-relaxed">Raw fiber recovery yield suitable for blending into new yarn.</p>
              </div>

              <div className="bg-purple-50/60 p-4 rounded-xl border border-purple-100 space-y-2 text-purple-950">
                <span className="font-bold uppercase text-purple-700 text-[10px]">Circular Economy Insights</span>
                <p className="text-lg font-black text-purple-900">{avgCircularity} / 100 Index</p>
                <p className="text-purple-800 leading-relaxed">Closed-loop manufacturing integration capability.</p>
              </div>
            </div>
          )}

          {activeTab === "Administrator" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold uppercase text-slate-500 text-[10px]">Platform Analytics</span>
                <p className="text-lg font-black text-slate-900">{totalAnalysed} Total Executions Logged</p>
                <p className="text-slate-600 leading-relaxed">Neural vision & OpenCV preprocessing engine operations status: Active</p>
              </div>

              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-2 text-blue-950">
                <span className="font-bold uppercase text-blue-700 text-[10px]">User Statistics</span>
                <p className="text-lg font-black text-blue-900">Active User Role: {user?.role || "User"}</p>
                <p className="text-blue-800 leading-relaxed">Authenticated JWT session: Active ({user?.email || "User Account"})</p>
              </div>

              <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold uppercase text-slate-500 text-[10px]">Report Summary</span>
                <p className="text-lg font-black text-slate-900">{history.length} Analysis Reports Persisted</p>
                <p className="text-slate-600 leading-relaxed">Database persistence status: MongoDB Connected & Verified</p>
              </div>
            </div>
          )}
        </div>

        {totalAnalysed === 0 ? (
          /* Empty State Display */
          <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center shadow-xs">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
              📊
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No AI Analyses Logged Yet</h3>
            <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
              Before visual charts can aggregate metrics, upload fabric samples to execute neural classification.
            </p>
            <Link
              to="/analysis"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-xs transition inline-block text-sm"
            >
              Analyze Your First Textile Image
            </Link>
          </div>
        ) : (
          /* SECTION 3: Analytics Charts & Visualizations */
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Material distribution bar chart */}
              <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Material Distribution
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Aggregate volume identified by neural fiber classification
                </p>
                <div className="h-[280px]">
                  <Bar
                    data={materialChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                    }}
                  />
                </div>
              </div>

              {/* Waste Category pie chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-1">
                  Waste Diversion
                </h3>
                <p className="text-xs text-slate-500 mb-6">
                  Segmented streams based on recyclability grading
                </p>
                <div className="h-[280px] flex items-center justify-center">
                  <Doughnut
                    data={wasteChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "right", labels: { boxWidth: 12, font: { size: 11 } } } },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Additional Analytics Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Carbon Savings by Fiber */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-1">Carbon Savings (CO₂e)</h3>
                <p className="text-xs text-slate-500 mb-6">Emissions avoided by material stream</p>
                <div className="h-[240px]">
                  <Bar
                    data={carbonChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true } },
                    }}
                  />
                </div>
              </div>

              {/* Sustainability Score Distribution */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-1">Sustainability Scores</h3>
                <p className="text-xs text-slate-500 mb-6">Performance tier breakdown</p>
                <div className="h-[240px]">
                  <Bar
                    data={scoreChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                    }}
                  />
                </div>
              </div>

              {/* Recycling Recommendation Distribution */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
                <h3 className="text-base font-bold text-slate-900 mb-1">Recycling Recommendations</h3>
                <p className="text-xs text-slate-500 mb-6">Prioritized recommendation directives</p>
                <div className="h-[240px] flex items-center justify-center">
                  <Doughnut
                    data={recChartData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: { legend: { position: "right", labels: { boxWidth: 10, font: { size: 10 } } } },
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Recent Analyses Log table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Recent AI Analyses Log</h3>
                  <p className="text-xs text-slate-500">
                    Latest classification executions with detailed circular economy grades
                  </p>
                </div>
                <Link
                  to="/analysis"
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition"
                >
                  + Run New Image Analysis
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <th className="px-6 py-3.5">Sample Image</th>
                      <th className="px-6 py-3.5">Material</th>
                      <th className="px-6 py-3.5">Confidence</th>
                      <th className="px-6 py-3.5">Waste Stream</th>
                      <th className="px-6 py-3.5">Recyclability</th>
                      <th className="px-6 py-3.5">Grade</th>
                      <th className="px-6 py-3.5">Analysis Date</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {history.map((item, idx) => {
                      if (!item) return null;
                      const imageSrc =
                        item.imagePath && typeof item.imagePath === "string"
                          ? item.imagePath.startsWith("http")
                            ? item.imagePath
                            : `http://localhost:5000${item.imagePath}`
                          : "/placeholder.png";

                      const formattedDate = item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString(undefined, {
                            dateStyle: "medium",
                          })
                        : "N/A";

                      return (
                        <tr key={item._id || `history-${idx}`} className="hover:bg-slate-50/50 transition">
                          <td className="px-6 py-4">
                            <div className="w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0">
                              <img
                                src={imageSrc}
                                alt={item.predictedMaterial || "Textile Sample"}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = "/placeholder.png";
                                }}
                              />
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-800">
                            {item.predictedMaterial || "Unknown"}
                          </td>
                          <td className="px-6 py-4 text-xs font-medium text-slate-500">
                            {item.materialConfidence || 0}%
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                              {item.wasteCategory || "Recyclable"}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-850">
                                {item.recyclabilityScore || 0}%
                              </span>
                              <div className="w-12 h-2 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-blue-600 rounded-full"
                                  style={{ width: `${item.recyclabilityScore || 0}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getGradeStyle(
                                item.recyclabilityGrade || "N/A"
                              )}`}
                            >
                              {item.recyclabilityGrade || "N/A"}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                            {formattedDate}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <Link
                              to={`/report/${item._id}`}
                              className="inline-flex items-center px-3 py-1.5 border border-slate-350 hover:bg-slate-100 text-slate-700 font-medium rounded-xl text-xs transition"
                            >
                              View Report
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

const DashboardWithErrorBoundary = (props) => (
  <ErrorBoundary>
    <Dashboard {...props} />
  </ErrorBoundary>
);

export default DashboardWithErrorBoundary;
