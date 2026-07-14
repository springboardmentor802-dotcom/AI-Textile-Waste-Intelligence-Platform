import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getAllBatches } from "../services/textileService";

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [inventoryCount, setInventoryCount] = useState("—");

  useEffect(() => {
    getAllBatches().then((d) => setInventoryCount(d.total)).catch(() => {});
  }, []);

  const CARDS = [
    { icon: "👥", label: "Total Users", value: "—", color: "#7c3aed" },
    { icon: "📦", label: "Textile Batches", value: inventoryCount, color: "#059669" },
    { icon: "🏭", label: "Recycling Facilities", value: "—", color: "#0891b2" },
    { icon: "✅", label: "Active Users", value: "—", color: "#d97706" },
  ];

  return (
    <div style={S.layout}>
      <Sidebar />
      <div style={S.main}>
        <Navbar title="Administrator Dashboard" />
        <div style={S.content}>
          <div style={S.welcome}>
            <h2 style={S.welcomeTitle}>Welcome back, {user?.full_name}! 👋</h2>
            <p style={S.welcomeText}>
              Platform overview. Manage inventory and users from here.
            </p>
          </div>
          <div style={S.grid}>
            {CARDS.map((c) => <StatCard key={c.label} {...c} />)}
          </div>
          <div style={S.quickActions}>
            <h3 style={S.sectionTitle}>Quick Actions</h3>
            <div style={S.actionRow}>
              <button style={S.actionBtn} onClick={() => navigate("/admin/inventory")}>
                📦 Manage Inventory
              </button>
            </div>
          </div>
          <div style={S.infoCard}>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Logged in as</span>
              <span style={S.infoValue}>{user?.full_name}</span>
            </div>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Role</span>
              <span style={{ ...S.infoValue, ...S.roleBadge, backgroundColor: "#7c3aed" }}>
                {user?.role}
              </span>
            </div>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Email</span>
              <span style={S.infoValue}>{user?.email}</span>
            </div>
            <div style={S.infoRow}>
              <span style={S.infoLabel}>Status</span>
              <span style={{ ...S.infoValue, ...S.activeBadge }}>Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  layout: { display: "flex", minHeight: "100vh", backgroundColor: "#faf5ff", fontFamily: "'Segoe UI',sans-serif" },
  main: { flex: 1, display: "flex", flexDirection: "column", overflow: "auto" },
  content: { padding: "32px", display: "flex", flexDirection: "column", gap: 28 },
  welcome: { backgroundColor: "#fff", borderRadius: 14, padding: "28px 32px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" },
  welcomeTitle: { fontSize: 24, fontWeight: 700, color: "#111827", margin: "0 0 6px" },
  welcomeText: { fontSize: 15, color: "#6b7280", margin: 0 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 20 },
  quickActions: { backgroundColor: "#fff", borderRadius: 14, padding: "24px 28px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)" },
  sectionTitle: { fontSize: 17, fontWeight: 700, color: "#111827", margin: "0 0 16px" },
  actionRow: { display: "flex", gap: 12 },
  actionBtn: {
    backgroundColor: "#059669", color: "#fff", border: "none",
    borderRadius: 8, padding: "11px 20px", fontSize: 14,
    fontWeight: 600, cursor: "pointer",
  },
  infoCard: { backgroundColor: "#fff", borderRadius: 14, padding: "24px 28px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)", display: "flex", flexDirection: "column", gap: 14 },
  infoRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f3f4f6" },
  infoLabel: { fontSize: 14, color: "#6b7280", fontWeight: 500 },
  infoValue: { fontSize: 14, color: "#111827", fontWeight: 600 },
  roleBadge: { color: "#fff", padding: "4px 12px", borderRadius: 20, fontSize: 12 },
  activeBadge: { color: "#059669", backgroundColor: "#f0fdf4", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700 },
};