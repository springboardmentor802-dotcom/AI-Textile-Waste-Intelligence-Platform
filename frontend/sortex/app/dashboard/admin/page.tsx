"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Settings, LogOut, Users, BarChart3, Server, FileText, ShieldAlert, CheckCircle2, RefreshCw } from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("user-management");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    if (!token || role !== "Admin") {
      router.replace("/login");
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/login");
  };

  return (
    <div className="flex h-screen bg-neutral-950 font-sans">
      {/* SIDEBAR */}
      <div className="w-64 bg-black text-white flex flex-col shadow-xl z-10 border-r border-white/5">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="p-2 bg-orange-500 rounded-lg shadow-md shadow-orange-900/30">
            <Server className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Sortex<span className="text-orange-400">Admin</span></h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: "user-management", label: "User Management", icon: Users },
            { id: "platform-analytics", label: "Platform Analytics", icon: BarChart3 },
            { id: "system-monitoring", label: "System Monitoring", icon: Server },
            { id: "report-management", label: "Report Management", icon: FileText },
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

        <div className="p-4 border-t border-white/5">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-neutral-950 border-b border-white/5 flex items-center justify-between px-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Control Panel</h2>
            <p className="text-sm text-neutral-500">Logged in as • <span className="font-semibold text-orange-400">Admin</span></p>
          </div>
          <div className="px-4 py-2 bg-emerald-500/10 text-emerald-400 rounded-full text-sm font-semibold border border-emerald-500/20 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            System Healthy
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5 shadow-sm">
              <p className="text-sm font-medium text-neutral-500">Total Active Users</p>
              <h3 className="text-3xl font-bold text-white mt-1">142</h3>
            </div>
            <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5 shadow-sm">
              <p className="text-sm font-medium text-neutral-500">System Uptime</p>
              <h3 className="text-3xl font-bold text-white mt-1">99.9%</h3>
            </div>
            <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5 shadow-sm">
              <p className="text-sm font-medium text-neutral-500">Reports Generated</p>
              <h3 className="text-3xl font-bold text-white mt-1">1,024</h3>
            </div>
          </div>

          <div className="bg-neutral-900 rounded-3xl border border-white/5 shadow-sm p-6 space-y-4">
            <h3 className="text-lg font-bold text-white">Recent System Activity Log</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-3 border-b border-white/5 text-sm">
                <span className="text-neutral-300 font-medium">New user registered: Sustainability Manager</span>
                <span className="text-xs text-neutral-500 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">2 mins ago</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5 text-sm">
                <span className="text-neutral-300 font-medium">YOLOv8 Model inference spike detected (Node 3)</span>
                <span className="text-xs text-neutral-500 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">14 mins ago</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5 text-sm">
                <span className="text-neutral-300 font-medium">Database automated backup completed successfully</span>
                <span className="text-xs text-neutral-500 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">1 hour ago</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}