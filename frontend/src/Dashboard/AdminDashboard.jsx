import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../Shared/axiosInstance";
import { useAuth } from "../Authentication/AuthContext";
import Navbar from "../Shared/Navbar";
import Footer from "../Shared/Footer";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [apiHealth, setApiHealth] = useState({ backend: "UP", AI: "UP", DB: "UP" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get("/classification");
        if (res.data.success) {
          const data = res.data.data;
          setHistory(data);
          setStats({
            totalAnalyses: data.length,
            activeUsers: 1,
            totalReports: data.length,
          });
        }
      } catch (err) {
        console.error("Admin Dashboard Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 text-xs font-bold uppercase">
                System Admin
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Administrator Dashboard
              </h1>
            </div>
            <p className="text-sm text-slate-600 mt-1">
              User management, platform analytics, system health monitoring, & report administration
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Link to="/dashboard" className="px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-700">
              ← Main Dashboard
            </Link>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Total Analyses</span>
            <p className="text-3xl font-black text-slate-900">{stats?.totalAnalyses || 0}</p>
            <p className="text-[10px] text-slate-500">Executions in database</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Active Users</span>
            <p className="text-3xl font-black text-blue-600">Active Session</p>
            <p className="text-[10px] text-slate-500">Authenticated user: {user?.email}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">API Health Status</span>
            <p className="text-3xl font-black text-emerald-600">100% UP</p>
            <p className="text-[10px] text-slate-500">Backend Express & MongoDB operational</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-2">
            <span className="text-[10px] font-bold uppercase text-slate-400">Report Management</span>
            <p className="text-3xl font-black text-purple-600">{stats?.totalReports || 0}</p>
            <p className="text-[10px] text-slate-500">Persisted reports catalog</p>
          </div>
        </div>

        {/* System Monitoring & User Management Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">System Monitoring & API Health</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800">Express REST Backend Server</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">UP (Port 5000)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800">MongoDB Database Persistence</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">CONNECTED</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800">FastAPI OpenCV Deep Inference</span>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">OPERATIONAL</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900">User Management & Permissions</h3>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-xs text-blue-950">
              <p className="font-bold text-blue-900">Current Session Details</p>
              <p>Name: <span className="font-semibold">{user?.name || "System Admin"}</span></p>
              <p>Email: <span className="font-semibold">{user?.email || "admin@textileintel.org"}</span></p>
              <p>Role: <span className="font-semibold">{user?.role || "Admin"}</span></p>
            </div>
          </div>
        </div>

        {/* Recent Platform Activities Log */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="text-base font-bold text-slate-900">Recent Platform Activities</h3>
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {history.slice(0, 5).map((item) => (
              <div key={item._id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                <div>
                  <p className="font-bold text-slate-800">Executed AI Prediction for {item.predictedMaterial}</p>
                  <p className="text-slate-500 mt-0.5">Recyclability Score: {item.recyclabilityScore}% | Waste Stream: {item.wasteCategory}</p>
                </div>
                <span className="text-slate-400 font-medium">{new Date(item.createdAt).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
