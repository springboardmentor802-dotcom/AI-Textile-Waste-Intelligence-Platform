"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, LogOut, Leaf, Wind, PieChart, FileText, ShieldCheck } from "lucide-react";

export default function SustainabilityManagerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("sustainability-metrics");

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

  return (
    <div className="flex h-screen bg-stone-100 font-sans">
      {/* SIDEBAR */}
      <div className="w-64 bg-stone-950 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 flex items-center gap-3 border-b border-stone-800/80">
          <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg shadow-md">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Sortex<span className="text-emerald-400">Eco</span></h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: "sustainability-metrics", label: "Sustainability Metrics", icon: Leaf },
            { id: "carbon-reduction", label: "Carbon Reduction", icon: Wind },
            { id: "waste-diversion", label: "Waste Diversion", icon: PieChart },
            { id: "esg-reporting", label: "ESG Reporting", icon: FileText },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isSelected ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md" : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-stone-800/80">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-white border-b border-stone-200 flex items-center justify-between px-8 shadow-sm">
          <div>
            <h2 className="text-2xl font-bold text-stone-800">Sustainability Control Panel</h2>
            <p className="text-sm text-stone-500">Logged in as • <span className="font-semibold text-emerald-600">Sustainability Manager</span></p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
              <p className="text-sm font-medium text-stone-500">CO2 Emissions Saved</p>
              <h3 className="text-3xl font-bold text-stone-800 mt-1">4.2 Tons</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
              <p className="text-sm font-medium text-stone-500">Overall Diversion Rate</p>
              <h3 className="text-3xl font-bold text-stone-800 mt-1">82.5%</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
              <p className="text-sm font-medium text-stone-500">ESG Compliance Score</p>
              <h3 className="text-3xl font-bold text-stone-800 mt-1">94/100</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-stone-800">ESG Impact Highlights</h3>
            <p className="text-sm text-stone-500">Real-time metrics and traceable carbon credit offsets across current operations.</p>
            <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <div>
                  <h4 className="font-semibold text-stone-800">Q2 Circular Economy Standard Met</h4>
                  <p className="text-xs text-stone-500">Fully verified tracking protocol compliance.</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-emerald-600 text-white px-3 py-1.5 rounded-xl">Verified</span>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}