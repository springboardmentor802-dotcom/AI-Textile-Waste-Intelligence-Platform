import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../Shared/axiosInstance";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const ManufacturerDashboard = () => {
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
          let sumRecovery = 0;
          let sumCircularity = 0;
          const categoryDist = {};

          data.forEach((item) => {
            const recovery = Number(item.sustainabilityAnalysis?.resourceRecovery || item.sustainabilityAnalysis?.resource_recovery || 0);
            const circularity = Number(item.sustainabilityAnalysis?.details?.circularityContribution || item.sustainabilityAnalysis?.sustainabilityScore || 0);

            sumRecovery += recovery;
            sumCircularity += circularity;

            const mat = item.predictedMaterial || "Unknown";
            categoryDist[mat] = (categoryDist[mat] || 0) + 1;
          });

          setStats({
            total,
            avgRecovery: total > 0 ? Math.round(sumRecovery / total) : 0,
            avgCircularity: total > 0 ? Math.round(sumCircularity / total) : 0,
            categoryDist,
          });
        }
      } catch (err) {
        console.error("Manufacturer Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const categoryChartData = {
    labels: Object.keys(stats?.categoryDist || {}),
    datasets: [
      {
        label: "Fabric Scrap Batches",
        data: Object.values(stats?.categoryDist || {}),
        backgroundColor: ["#8B5CF6", "#3B82F6", "#10B981", "#F59E0B", "#EC4899"],
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
              <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 text-xs font-bold uppercase">
                Production & Mill
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Manufacturer Dashboard
              </h1>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              Production scrap analysis, closed-loop circular economy insights, & raw material recovery trends
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
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Production Waste Analyzed</span>
            <p className="text-3xl font-black text-slate-900">{stats?.total || 0} <span className="text-xs text-slate-500 font-normal">Offcut Batches</span></p>
            <p className="text-[10px] text-slate-500">Fabric cutting room scrap</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Material Recovery Yield</span>
            <p className="text-3xl font-black text-emerald-600">{stats?.avgRecovery || 0}%</p>
            <p className="text-[10px] text-slate-500">Usable raw fiber recovery yield</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Circular Economy Insights</span>
            <p className="text-3xl font-black text-purple-600">{stats?.avgCircularity || 0} <span className="text-xs text-slate-400">/ 100</span></p>
            <p className="text-[10px] text-slate-500">Closed-loop manufacturing integration index</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Sustainability Performance</span>
            <p className="text-3xl font-black text-blue-600">High</p>
            <p className="text-[10px] text-slate-500">Mill recycling efficiency rating</p>
          </div>
        </div>

        {/* Charts */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">Fabric Category Statistics & Volume</h3>
          <p className="text-xs text-slate-500 mb-6">Production offcuts classified by textile fiber type</p>
          <div className="h-[280px]">
            <Bar data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ManufacturerDashboard;
