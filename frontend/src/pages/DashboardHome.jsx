import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../components/Card";
import Card from "../components/Card";
import PageHeader from "../components/PageHeader";
import Button from "../components/Button";
import { getAllBatches } from "../services/textileService";
import { FiPackage, FiCheckSquare, FiClock, FiTrendingUp, FiPlus, FiList } from "react-icons/fi";
import { ROLE_CONFIG } from "../styles/theme";

const ROLE_PATHS = {
  Administrator: "/admin",
  "Recycling Facility Operator": "/operator",
  "Sustainability Manager": "/sustainability",
  "Textile Manufacturer": "/manufacturer",
};

export default function DashboardHome({ dashboardPath }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [total, setTotal] = useState("—");
  const cfg = ROLE_CONFIG[user?.role] || {};
  const base = dashboardPath || ROLE_PATHS[user?.role] || "";

  useEffect(() => {
    getAllBatches().then((d) => setTotal(d.total)).catch(() => {});
  }, []);

  const CARDS = [
    { label: "Total Batches", value: total, icon: FiPackage, color: cfg.color || "#1d4ed8" },
    { label: "Pending Analysis", value: "—", icon: FiClock, color: "#d97706" },
    { label: "Processed", value: "—", icon: FiCheckSquare, color: "#16a34a" },
    { label: "Recovery Rate", value: "—", icon: FiTrendingUp, color: "#0891b2" },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.full_name}`}
        subtitle={`${user?.role} — Platform Overview`}
      />

      <div style={S.grid4}>
        {CARDS.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      <div style={S.row}>
        <Card style={{ flex: 1 }} padding="24px">
          <h3 style={S.sectionTitle}>Quick Actions</h3>
          <div style={S.actionRow}>
            <Button icon={FiPlus} onClick={() => navigate(`${base}/inventory`)}>
              Add Batch
            </Button>
            <Button icon={FiList} variant="secondary" onClick={() => navigate(`${base}/inventory`)}>
              View Inventory
            </Button>
          </div>
        </Card>

        <Card style={{ flex: 2 }} padding="24px">
          <h3 style={S.sectionTitle}>ML Integration — Coming Soon</h3>
          <div style={S.mlList}>
            {["Textile Image Analysis", "Material Classification", "Waste Classification", "Recycling Recommendations"].map((m) => (
              <div key={m} style={S.mlItem}>
                <div style={S.mlDot} />
                <span style={S.mlText}>{m}</span>
                <span style={S.mlBadge}>Milestone 2+</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  );
}

const S = {
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 },
  row: { display: "flex", gap: 20, flexWrap: "wrap" },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 16px" },
  actionRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  mlList: { display: "flex", flexDirection: "column", gap: 10 },
  mlItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: "1px solid #f3f4f6" },
  mlDot: { width: 7, height: 7, borderRadius: "50%", backgroundColor: "#d1d5db", flexShrink: 0 },
  mlText: { flex: 1, fontSize: 13, color: "#4b5563" },
  mlBadge: { fontSize: 11, color: "#9ca3af", backgroundColor: "#f3f4f6", padding: "2px 8px", borderRadius: 999 },
};
