import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { StatCard } from "../../components/Card";
import PageHeader from "../../components/PageHeader";
import Button from "../../components/Button";
import Card from "../../components/Card";
import { getAllUsers } from "../../services/userService";
import { getAllBatches } from "../../services/textileService";
import {
  FiUsers, FiPackage, FiActivity, FiTrendingUp,
  FiPlus, FiList,
} from "react-icons/fi";

export default function AdminHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ users: "—", batches: "—" });

  useEffect(() => {
    getAllUsers().then((d) => setStats((p) => ({ ...p, users: d.length }))).catch(() => {});
    getAllBatches().then((d) => setStats((p) => ({ ...p, batches: d.total }))).catch(() => {});
  }, []);

  const CARDS = [
    { label: "Total Users", value: stats.users, icon: FiUsers, color: "#7c3aed" },
    { label: "Textile Batches", value: stats.batches, icon: FiPackage, color: "#059669" },
    { label: "Active Sessions", value: "1", icon: FiActivity, color: "#0891b2" },
    { label: "System Health", value: "Good", icon: FiTrendingUp, color: "#d97706" },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome, ${user?.full_name}`}
        subtitle="Administrator — System Overview"
      />

      <div style={S.grid4}>
        {CARDS.map((c) => <StatCard key={c.label} {...c} />)}
      </div>

      <div style={S.row}>
        <Card style={{ flex: 1 }} padding="24px">
          <h3 style={S.sectionTitle}>Quick Actions</h3>
          <div style={S.actionGrid}>
            <Button icon={FiPlus} onClick={() => navigate("/admin/inventory")}>Add Batch</Button>
            <Button icon={FiUsers} variant="secondary" onClick={() => navigate("/admin/users")}>Manage Users</Button>
            <Button icon={FiList} variant="secondary" onClick={() => navigate("/admin/inventory")}>View Inventory</Button>
          </div>
        </Card>

        <Card style={{ flex: 2 }} padding="24px">
          <h3 style={S.sectionTitle}>Recent Activity</h3>
          <div style={S.activityList}>
            {[
              "System initialized successfully",
              "Authentication module active",
              "Inventory module active",
              "Database connected",
            ].map((msg, i) => (
              <div key={i} style={S.activityItem}>
                <div style={S.activityDot} />
                <span style={S.activityText}>{msg}</span>
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
  actionGrid: { display: "flex", gap: 10, flexWrap: "wrap" },
  activityList: { display: "flex", flexDirection: "column", gap: 12 },
  activityItem: { display: "flex", alignItems: "center", gap: 10 },
  activityDot: { width: 7, height: 7, borderRadius: "50%", backgroundColor: "#16a34a", flexShrink: 0 },
  activityText: { fontSize: 13, color: "#4b5563" },
};
