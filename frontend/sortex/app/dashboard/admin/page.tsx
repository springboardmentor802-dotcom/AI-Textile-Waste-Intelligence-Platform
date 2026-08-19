"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut, Users, BarChart3, Server, FileText, ShieldAlert,
  CheckCircle2, XCircle, RefreshCw, Download, FileSpreadsheet, Boxes,
  PackageSearch, Bell, Layers,
} from "lucide-react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import NotificationIconToggle from "@/app/components/NotificationIconToggle";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ---------- Types ----------
interface PlatformStats {
  active_users: number;
  users_by_role: Record<string, number>;
  total_reports_generated: number;
  total_scans: number;
  total_batches: number;
  total_inventory_items: number;
  total_waste_batches: number;
  total_notifications_sent: number;
  scans_by_material: Record<string, number>;
}

interface SystemHealth {
  database: { connected: boolean; error: string | null };
  scheduler: { running: boolean };
  ml_models: Record<string, { loaded: boolean }>;
}

interface ScanRow {
  scan_id: string;
  filename: string;
  user_email: string;
  created_at: number;
  batch_id: string | null;
  material: string | null;
  condition: string | null;
}

interface BatchRow {
  batch_id: string;
  scan_count: number;
  user_email: string;
  latest_created_at: number;
  label: string;
}

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  severity: string;
  read: boolean;
  created_at: string;
  link?: string;
}

// ---------- Helpers ----------
const RING_COLORS = ["#10b981", "#f97316", "#ef4444", "#3b82f6", "#a855f7", "#eab308", "#ec4899", "#14b8a6"];

function formatDate(ts: number | undefined | null) {
  if (!ts) return "—";
  const d = new Date(ts * 1000);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

async function authedFetch(path: string, init?: RequestInit) {
  const token = localStorage.getItem("access_token");
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  return res;
}

async function downloadReport(path: string, filename: string) {
  try {
    const res = await authedFetch(path);
    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Failed to download report:", err);
    alert("Couldn't download this report. Check the console for details.");
  }
}

// ---------- Small building blocks ----------
function KpiCard({ label, value, icon: Icon }: { label: string; value: string | number; icon: React.ElementType }) {
  return (
    <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-neutral-500">{label}</p>
        <Icon className="w-4 h-4 text-orange-400" />
      </div>
      <h3 className="text-3xl font-bold text-white mt-1">{value}</h3>
    </div>
  );
}

function DonutChart({
  data,
  centerLabel,
  centerValue,
}: {
  data: { label: string; value: number }[];
  centerLabel: string;
  centerValue: string | number;
}) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const slices = data.map((d, index) => {
    const fraction = d.value / total;
    const offset = data.slice(0, index).reduce((acc, item) => acc + item.value / total, 0);
    return { ...d, fraction, offset };
  });

  return (
    <div className="flex items-center gap-8 flex-wrap">
      <div className="relative w-[160px] h-[160px] shrink-0">
        <svg viewBox="0 0 160 160" className="-rotate-90">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#262626" strokeWidth="18" />
          {slices.map((d, i) => {
            const dash = d.fraction * circumference;
            const gap = circumference - dash;
            const dashOffset = -d.offset * circumference;
            return (
              <circle
                key={d.label}
                cx="80"
                cy="80"
                r={radius}
                fill="none"
                stroke={RING_COLORS[i % RING_COLORS.length]}
                strokeWidth="18"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="butt"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{centerValue}</span>
          <span className="text-[11px] text-neutral-500 text-center px-4">{centerLabel}</span>
        </div>
      </div>
      <div className="flex-1 min-w-[200px] space-y-2.5">
        {data.length === 0 && <p className="text-sm text-neutral-500">No data yet.</p>}
        {data.map((d, i) => (
          <div key={d.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: RING_COLORS[i % RING_COLORS.length] }}
              />
              <span className="text-neutral-300 font-medium truncate">{d.label}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0 ml-3">
              <span className="font-semibold text-white">{d.value}</span>
              <span className="text-neutral-500 text-xs">({Math.round((d.value / total) * 100)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="bg-neutral-900 rounded-3xl border border-white/5 shadow-sm p-6 space-y-4">
      <div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        {subtitle && <p className="text-sm text-neutral-500">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

// ---------- Main component ----------
export default function AdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("user-management");

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [scans, setScans] = useState<ScanRow[]>([]);
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [totalScans, setTotalScans] = useState(0);
  const [reportsPage, setReportsPage] = useState(0);
  const REPORTS_PAGE_SIZE = 10;

  const [adminNotifications, setAdminNotifications] = useState<AdminNotification[]>([]);
  const [notificationFilter, setNotificationFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const role = localStorage.getItem("user_role");
    if (!token || role !== "Admin") {
      router.replace("/login");
    }
  }, [router]);

  const loadStats = useCallback(async () => {
    const res = await authedFetch("/api/admin/stats");
    setStats(await res.json());
  }, []);

  const loadHealth = useCallback(async () => {
    const res = await authedFetch("/api/admin/system-health");
    setHealth(await res.json());
  }, []);

  const loadReports = useCallback(async (page: number) => {
    const res = await authedFetch(`/api/admin/reports?limit=${REPORTS_PAGE_SIZE}&skip=${page * REPORTS_PAGE_SIZE}`);
    const data = await res.json();
    setScans(data.scans);
    setBatches(data.batches);
    setTotalScans(data.total_scans);
  }, []);

  const loadNotifications = useCallback(async () => {
    try {
      const res = await authedFetch("/api/notifications/?limit=50");
      const data = await res.json();
      setAdminNotifications(data);
    } catch (err) {
      console.error("Failed to load admin notifications:", err);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        await Promise.all([loadStats(), loadHealth(), loadReports(reportsPage), loadNotifications()]);
        if (!cancelled) setError(null);
      } catch (err: unknown) {
        if (!cancelled) setError((err as Error).message || "Failed to load admin data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadData();

    return () => {
      cancelled = true;
    };
  }, [loadHealth, loadNotifications, loadReports, loadStats, refreshTick, reportsPage]);

  const handleLogout = () => {
    localStorage.clear();
    router.replace("/login");
  };

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
    setRefreshTick((n) => n + 1);
  };

  const handlePageChange = (newPage: number) => {
    setLoading(true);
    setError(null);
    setReportsPage(newPage);
  };

  const roleData = stats
    ? Object.entries(stats.users_by_role).map(([label, value]) => ({ label, value }))
    : [];
  const materialData = stats
    ? Object.entries(stats.scans_by_material).map(([label, value]) => ({ label, value }))
    : [];

  return (
    <div className="relative flex h-screen bg-neutral-950 font-sans overflow-hidden">
      {/* AMBIENT BACKGROUND GLOW */}
      <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden flex items-center justify-center">
        <div className="w-[650px] h-[650px] rounded-full bg-orange-500/15 blur-[160px]" />
      </div>

      {/* SIDEBAR */}
      <div className="w-64 bg-black text-white flex flex-col shadow-xl z-40 relative border-r border-white/5">
        <div className="p-6 flex items-center gap-3 border-b border-white/5">
          <div className="p-2 bg-orange-500 rounded-lg shadow-md shadow-orange-900/30">
            <Server className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">Sortex<span className="text-orange-400">AI</span></h1>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {[
            { id: "user-management", label: "User Management", icon: Users },
            { id: "platform-analytics", label: "Platform Analytics", icon: BarChart3 },
            { id: "system-monitoring", label: "System Monitoring", icon: Server },
            { id: "report-management", label: "Report Management", icon: FileText },
            { id: "notifications-alerts", label: "Notifications & Alerts", icon: Bell },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = activeTab === item.id;
            return (
              <div key={item.id} className="relative">
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    isSelected ? "bg-orange-600/90 text-white shadow-md shadow-orange-900/20" : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2 relative z-50">
          <NotificationIconToggle />
          <ThemeToggle variant="sidebar" />
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Log out</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="relative z-10 flex-1 flex flex-col overflow-hidden">
        <header className="h-20 bg-neutral-950 border-b border-white/5 flex items-center justify-between px-8">
          <div>
            <h2 className="text-2xl font-bold text-white">Admin Control Panel</h2>
            <p className="text-sm text-neutral-500">Logged in as • <span className="font-semibold text-orange-400">Admin</span></p>
          </div>
          <div className="flex items-center gap-3">
            {health && (
              <div className={`px-4 py-2 rounded-full text-sm font-semibold border flex items-center gap-2 ${
                health.database.connected
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-400 border-red-500/20"
              }`}>
                {health.database.connected ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                {health.database.connected ? "System Healthy" : "DB Connection Issue"}
              </div>
            )}
            <button
              onClick={handleRefresh}
              className="p-2.5 rounded-full bg-neutral-900 border border-white/5 text-neutral-400 hover:text-white hover:bg-white/5 transition-all"
              title="Refresh"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl px-4 py-3 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* ---------------- USER MANAGEMENT ---------------- */}
          {activeTab === "user-management" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard label="Total Registered Users" value={stats?.active_users ?? "—"} icon={Users} />
                <KpiCard label="Reports Generated" value={stats?.total_reports_generated ?? "—"} icon={FileText} />
                <KpiCard label="Notifications Sent" value={stats?.total_notifications_sent ?? "—"} icon={Bell} />
              </div>

              <SectionCard
                title="Users by Role"
                subtitle="Distribution of registered accounts across the three self-signup roles and Admin"
              >
                <DonutChart data={roleData} centerLabel="Total Users" centerValue={stats?.active_users ?? 0} />
              </SectionCard>

              <div className="bg-orange-500/5 border border-orange-500/10 text-neutral-400 text-xs rounded-xl px-4 py-3">
                Note: &quot;Total Registered Users&quot; counts every account that has ever signed up. The app doesn&apos;t yet
                track last-login activity, so this isn&apos;t a live &quot;currently online&quot; count — that would need a
                last_seen timestamp updated at login.
              </div>
            </>
          )}

          {/* ---------------- PLATFORM ANALYTICS ---------------- */}
          {activeTab === "platform-analytics" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <KpiCard label="Inventory Items" value={stats?.total_inventory_items ?? "—"} icon={Boxes} />
                <KpiCard label="Waste Batches" value={stats?.total_waste_batches ?? "—"} icon={PackageSearch} />
                <KpiCard label="Total Scans" value={stats?.total_scans ?? "—"} icon={Layers} />
                <KpiCard label="Scan Batches" value={stats?.total_batches ?? "—"} icon={FileText} />
              </div>

              <SectionCard
                title="Platform-wide Material Breakdown"
                subtitle="Textile materials identified across every scan on the platform, all users combined"
              >
                <DonutChart data={materialData} centerLabel="Total Scans" centerValue={stats?.total_scans ?? 0} />
              </SectionCard>
            </>
          )}

          {/* ---------------- SYSTEM MONITORING ---------------- */}
          {activeTab === "system-monitoring" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5 shadow-sm">
                  <p className="text-sm font-medium text-neutral-500 mb-2">Database Connection</p>
                  <div className={`flex items-center gap-2 text-lg font-bold ${health?.database.connected ? "text-emerald-400" : "text-red-400"}`}>
                    {health?.database.connected ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {health ? (health.database.connected ? "Connected" : "Disconnected") : "—"}
                  </div>
                  {health?.database.error && (
                    <p className="text-xs text-neutral-500 mt-2 break-all">{health.database.error}</p>
                  )}
                </div>
                <div className="bg-neutral-900 p-6 rounded-2xl border border-white/5 shadow-sm">
                  <p className="text-sm font-medium text-neutral-500 mb-2">Notification Scheduler</p>
                  <div className={`flex items-center gap-2 text-lg font-bold ${health?.scheduler.running ? "text-emerald-400" : "text-red-400"}`}>
                    {health?.scheduler.running ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    {health ? (health.scheduler.running ? "Running" : "Stopped") : "—"}
                  </div>
                </div>
              </div>

              <SectionCard title="ML Model Status" subtitle="Load status of each model used by the scan pipeline">
                <div className="space-y-2">
                  {health && Object.keys(health.ml_models).length > 0 ? (
                    Object.entries(health.ml_models).map(([task, info]: [string, { loaded: boolean }]) => (
                      <div key={task} className="flex items-center justify-between py-2.5 border-b border-white/5 text-sm last:border-b-0">
                        <span className="text-neutral-300 font-medium capitalize">{task.replace(/_/g, " ")}</span>
                        {info.loaded ? (
                          <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Loaded
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-red-400 text-xs font-semibold bg-red-500/10 px-2.5 py-1 rounded-md border border-red-500/20">
                            <XCircle className="w-3.5 h-3.5" /> Not loaded
                          </span>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-neutral-500">No model status available.</p>
                  )}
                </div>
              </SectionCard>
            </>
          )}

          {/* ---------------- REPORT MANAGEMENT ---------------- */}
          {activeTab === "report-management" && (
            <>
              <SectionCard
                title="Batch Reports"
                subtitle="Every scan batch across all dashboards, with a combined PDF export"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-neutral-500 border-b border-white/5">
                        <th className="pb-2 font-medium">Label</th>
                        <th className="pb-2 font-medium">Submitted by</th>
                        <th className="pb-2 font-medium">Scans</th>
                        <th className="pb-2 font-medium">Latest</th>
                        <th className="pb-2 font-medium text-right">Export</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.length === 0 && (
                        <tr><td colSpan={5} className="py-4 text-neutral-500">No batches yet.</td></tr>
                      )}
                      {batches.map((b) => (
                        <tr key={b.batch_id} className="border-b border-white/5 last:border-b-0">
                          <td className="py-3 text-neutral-200 font-medium">{b.label}</td>
                          <td className="py-3 text-neutral-400">{b.user_email}</td>
                          <td className="py-3 text-neutral-400">{b.scan_count}</td>
                          <td className="py-3 text-neutral-400">{formatDate(b.latest_created_at)}</td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => downloadReport(`/api/ml/export/pdf/batch/${b.batch_id}`, `batch_report_${b.batch_id}.pdf`)}
                              className="inline-flex items-center gap-1.5 text-orange-400 hover:text-orange-300 text-xs font-semibold"
                            >
                              <Download className="w-3.5 h-3.5" /> PDF
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <SectionCard
                title="Individual Scan Reports"
                subtitle="Every single scan across all dashboards, with per-scan PDF/Excel export"
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-neutral-500 border-b border-white/5">
                        <th className="pb-2 font-medium">Filename</th>
                        <th className="pb-2 font-medium">Submitted by</th>
                        <th className="pb-2 font-medium">Material</th>
                        <th className="pb-2 font-medium">Condition</th>
                        <th className="pb-2 font-medium">Date</th>
                        <th className="pb-2 font-medium text-right">Export</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scans.length === 0 && (
                        <tr><td colSpan={6} className="py-4 text-neutral-500">No scans yet.</td></tr>
                      )}
                      {scans.map((s) => (
                        <tr key={s.scan_id} className="border-b border-white/5 last:border-b-0">
                          <td className="py-3 text-neutral-200 font-medium truncate max-w-[180px]">{s.filename}</td>
                          <td className="py-3 text-neutral-400">{s.user_email}</td>
                          <td className="py-3 text-neutral-400">{s.material || "—"}</td>
                          <td className="py-3 text-neutral-400">{s.condition || "—"}</td>
                          <td className="py-3 text-neutral-400">{formatDate(s.created_at)}</td>
                          <td className="py-3 text-right">
                            <div className="inline-flex items-center gap-3">
                              <button
                                onClick={() => downloadReport(`/api/ml/export/pdf/${s.scan_id}`, `scan_report_${s.scan_id}.pdf`)}
                                className="inline-flex items-center gap-1.5 text-orange-400 hover:text-orange-300 text-xs font-semibold"
                              >
                                <Download className="w-3.5 h-3.5" /> PDF
                              </button>
                              <button
                                onClick={() => downloadReport(`/api/ml/export/excel/${s.scan_id}`, `scan_report_${s.scan_id}.xlsx`)}
                                className="inline-flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 text-xs font-semibold"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <p className="text-xs text-neutral-500">
                    Showing {reportsPage * REPORTS_PAGE_SIZE + 1}–{Math.min((reportsPage + 1) * REPORTS_PAGE_SIZE, totalScans)} of {totalScans}
                  </p>
                  <div className="flex gap-2">
                    <button
                      disabled={reportsPage === 0}
                      onClick={() => handlePageChange(Math.max(0, reportsPage - 1))}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-700 transition-all"
                    >
                      Previous
                    </button>
                    <button
                      disabled={(reportsPage + 1) * REPORTS_PAGE_SIZE >= totalScans}
                      onClick={() => handlePageChange(reportsPage + 1)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-neutral-800 text-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-700 transition-all"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </SectionCard>
            </>
          )}

          {/* ---------------- NOTIFICATIONS & ALERTS ---------------- */}
          {activeTab === "notifications-alerts" && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KpiCard
                  label="Total Admin Notifications"
                  value={adminNotifications.length}
                  icon={Bell}
                />
                <KpiCard
                  label="Unread Alerts"
                  value={adminNotifications.filter((n) => !n.read).length}
                  icon={ShieldAlert}
                />
                <KpiCard
                  label="Latest Event Type"
                  value={adminNotifications.length > 0 ? adminNotifications[0].type.replace(/_/g, " ") : "—"}
                  icon={CheckCircle2}
                />
              </div>

              <SectionCard
                title="Admin Notifications Feed"
                subtitle="Real-time notifications for user registrations, report generation, and inventory creations"
              >
                <div className="flex gap-2 pb-2 flex-wrap">
                  {["all", "user_registered", "report_generated", "inventory_created"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setNotificationFilter(f)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                        notificationFilter === f
                          ? "bg-orange-500 text-white shadow-sm"
                          : "bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white"
                      }`}
                    >
                      {f.replace(/_/g, " ")}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {adminNotifications
                    .filter((n) => notificationFilter === "all" || n.type === notificationFilter)
                    .map((item) => {
                      let badgeColor = "bg-blue-500/10 text-blue-400 border-blue-500/20";
                      if (item.type === "user_registered") badgeColor = "bg-purple-500/10 text-purple-400 border-purple-500/20";
                      else if (item.type === "report_generated") badgeColor = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                      else if (item.type === "inventory_created") badgeColor = "bg-orange-500/10 text-orange-400 border-orange-500/20";

                      return (
                        <div
                          key={item.id}
                          className="bg-neutral-950 p-4 rounded-xl border border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${badgeColor}`}>
                                {item.type.replace(/_/g, " ")}
                              </span>
                              <h4 className="text-sm font-bold text-white">{item.title}</h4>
                            </div>
                            <p className="text-xs text-neutral-400">{item.message}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-[11px] text-neutral-500 block">
                              {new Date(item.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  {adminNotifications.length === 0 && (
                    <p className="text-sm text-neutral-500 py-4">No admin notifications recorded yet.</p>
                  )}
                </div>
              </SectionCard>
            </>
          )}
        </main>
      </div>
    </div>
  );
}