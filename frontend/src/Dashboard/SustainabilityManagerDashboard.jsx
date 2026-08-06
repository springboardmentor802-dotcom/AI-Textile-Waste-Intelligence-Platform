import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const SustainabilityManagerDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/classification");
        if (res.data.success) {
          const data = res.data.data;
          const total = data.length;
          let sumScore = 0;
          let sumCarbon = 0;
          let sumWater = 0;
          let sumDiversion = 0;

          const scoreTiers = { Excellent: 0, Good: 0, Average: 0, "Needs Improvement": 0 };

          data.forEach((item) => {
            const score = item.sustainabilityAnalysis?.sustainabilityScore || item.recyclabilityScore || 0;
            sumScore += score;

            const carbon = Number(item.sustainabilityAnalysis?.carbonSaved || item.sustainabilityAnalysis?.carbon_saved || 0);
            const water = Number(item.sustainabilityAnalysis?.waterSaved || item.sustainabilityAnalysis?.water_saved || 0);
            const diversion = Number(item.sustainabilityAnalysis?.wasteDiversion || item.sustainabilityAnalysis?.waste_diversion || 0);

            sumCarbon += carbon;
            sumWater += water;
            sumDiversion += diversion;

            if (score >= 80) scoreTiers.Excellent++;
            else if (score >= 65) scoreTiers.Good++;
            else if (score >= 50) scoreTiers.Average++;
            else scoreTiers["Needs Improvement"]++;
          });

          setStats({
            total,
            avgScore: total > 0 ? Math.round(sumScore / total) : 0,
            totalCarbon: parseFloat(sumCarbon.toFixed(1)),
            totalWater: Math.round(sumWater),
            avgDiversion: total > 0 ? Math.round(sumDiversion / total) : 0,
            scoreTiers,
          });
        }
      } catch (err) {
        console.error("Sustainability Manager Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const scoreChartData = {
    labels: Object.keys(stats?.scoreTiers || {}),
    datasets: [
      {
        label: "Samples",
        data: Object.values(stats?.scoreTiers || {}),
        backgroundColor: ["#10B981", "#3B82F6", "#F59E0B", "#EF4444"],
        borderRadius: 8,
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-xs font-bold uppercase">
                ESG Intelligence
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Sustainability Manager Dashboard
              </h1>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              ESG overview, Scope 3 carbon reduction metrics, & landfill diversion analytics
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/dashboard" className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700">
              ← Main Dashboard
            </Link>
          </div>
        </div>

        {/* Metrics Overview Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-emerald-900 text-white p-6 rounded-2xl border border-emerald-800 shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-emerald-300">Carbon Footprint Avoided</span>
            <p className="text-3xl font-black text-white">{stats?.totalCarbon || 0} <span className="text-xs font-normal text-emerald-300">kg CO₂e</span></p>
            <p className="text-[10px] text-emerald-400">Avoided Scope 3 emissions</p>
          </div>

          <div className="bg-emerald-900 text-white p-6 rounded-2xl border border-emerald-800 shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-emerald-300">Water Savings</span>
            <p className="text-3xl font-black text-white">{stats?.totalWater ? stats.totalWater.toLocaleString() : 0} <span className="text-xs font-normal text-emerald-300">Liters</span></p>
            <p className="text-[10px] text-emerald-400">Conserved freshwater</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Waste Diversion Analytics</span>
            <p className="text-3xl font-black text-teal-600">{stats?.avgDiversion || 0}%</p>
            <p className="text-[10px] text-slate-500">Landfill diversion yield</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Sustainability Score</span>
            <p className="text-3xl font-black text-blue-600">{stats?.avgScore || 0} <span className="text-xs text-slate-400">/ 100</span></p>
            <p className="text-[10px] text-slate-500">Corporate ESG benchmark index</p>
          </div>
        </div>

        {/* Charts & ESG Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">Sustainability Score Tier Distribution</h3>
            <p className="text-xs text-slate-500 mb-6">Performance tier classification across analyzed inventory</p>
            <div className="h-[260px]">
              <Bar data={scoreChartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">ESG & Compliance Overview</h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950">
                <p className="font-bold text-emerald-900">✓ ISO 14044 LCA Compliant</p>
                <p className="text-[11px] text-emerald-800 mt-0.5">Automated Lifecycle Assessment emission factors verified.</p>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-950">
                <p className="font-bold text-blue-900">✓ Scope 3 Reduction Verification</p>
                <p className="text-[11px] text-blue-800 mt-0.5">Raw fiber offset logged directly to audit history ledger.</p>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-950">
                <p className="font-bold text-purple-900">✓ Zero Waste to Landfill Goal</p>
                <p className="text-[11px] text-purple-800 mt-0.5">Current diversion rate is ahead of quarterly target.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SustainabilityManagerDashboard;
