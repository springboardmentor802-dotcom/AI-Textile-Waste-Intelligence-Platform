"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, LogOut, Factory, RefreshCw, Package, BarChart } from "lucide-react";

export default function ManufacturerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("production-waste");

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

  return (
    <div className="flex h-screen bg-stone-100 font-sans">
      {/* SIDEBAR */}
      <div className="w-64 bg-stone-950 text-white flex flex-col shadow-xl z-10">
        <div className="p-6 flex items-center gap-3 border-b border-stone-800/80">
          <div className="p-2 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg shadow-md">
            <Factory className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Sortex<span className="text-amber-400">Mfg</span></h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: "production-waste", label: "Production Waste", icon: Factory },
            { id: "circular-economy", label: "Circular Economy", icon: RefreshCw },
            { id: "material-recovery", label: "Material Recovery", icon: Package },
            { id: "sustainability-perf", label: "Sustainability Perf.", icon: BarChart },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isSelected ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md" : "text-stone-400 hover:bg-stone-800/60 hover:text-stone-100"
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
            <h2 className="text-2xl font-bold text-stone-800">Manufacturer Portal</h2>
            <p className="text-sm text-stone-500">Logged in as • <span className="font-semibold text-amber-600">Manufacturer</span></p>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
              <p className="text-sm font-medium text-stone-500">Reclaimed Fiber</p>
              <h3 className="text-3xl font-bold text-stone-800 mt-1">12.5k kg</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
              <p className="text-sm font-medium text-stone-500">Feedstock Quality (AI)</p>
              <h3 className="text-3xl font-bold text-stone-800 mt-1">Grade A</h3>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
              <p className="text-sm font-medium text-stone-500">Circularity Index</p>
              <h3 className="text-3xl font-bold text-stone-800 mt-1">68%</h3>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-stone-800">Raw Material Feedstock Supply</h3>
            <p className="text-sm text-stone-500">Live feeds and incoming reclaimed textile stock updates for production processing.</p>
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-sm text-stone-600">
              All production feeds currently running at target throughput efficiency levels.
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}