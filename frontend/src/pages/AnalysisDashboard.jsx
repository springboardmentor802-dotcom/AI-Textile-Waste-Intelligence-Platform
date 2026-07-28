import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import { StatCard } from "../components/Card";
import Card from "../components/Card";
import Button from "../components/Button";
import { ToastContainer, useToast } from "../components/Toast";
import { getDashboardStats, getAnalysisStatus } from "../services/analysisService";
import {
  FiPackage,
  FiRefreshCw,
  FiTrendingUp,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";

export default function AnalysisDashboard() {
  const navigate = useNavigate();
  const { toasts, add, remove } = useToast();
  const [stats, setStats] = useState(null);
  const [serviceStatus, setServiceStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const [statsData, statusData] = await Promise.all([
        getDashboardStats(),
        getAnalysisStatus(),
      ]);
      setStats(statsData);
      setServiceStatus(statusData);
    } catch {
      add("Failed to load dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Analysis Dashboard">
        <PageHeader title="Analysis Dashboard" />
        <Card padding="40px" style={{ textAlign: "center" }}>
          <p style={{ color: "#6b7280", margin: 0 }}>Loading dashboard...</p>
        </Card>
      </Layout>
    );
  }

  const mlReady =
    serviceStatus?.material_recognition?.status === "ready";
  const yoloReady =
    serviceStatus?.defect_detection?.status === "ready";
  const serviceOk = mlReady && yoloReady;

  const STAT_CARDS = [
    {
      label: "Total Analyzed",
      value: stats?.waste_inventory?.total_analyzed ?? 0,
      icon: FiPackage,
      color: "#1d4ed8",
    },
    {
      label: "Recyclable Items",
      value: stats?.recycling_opportunities?.recyclable_count ?? 0,
      icon: FiRefreshCw,
      color: "#059669",
    },
    {
      label: "Reusable Items",
      value: stats?.recycling_opportunities?.reusable_count ?? 0,
      icon: FiCheckCircle,
      color: "#0891b2",
    },
    {
      label: "Avg Circularity",
      value: `${stats?.processing_analytics?.average_circularity_score ?? 0}/100`,
      icon: FiTrendingUp,
      color: "#d97706",
    },
  ];

  return (
    <Layout title="Analysis Dashboard">
      <ToastContainer toasts={toasts} onClose={remove} />

      <PageHeader
        title="Analysis Dashboard"
        subtitle="Textile waste analysis overview and processing analytics"
        action={
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary" onClick={loadDashboard}>
              Refresh
            </Button>
            <Button onClick={() => navigate("/admin/analysis")}>
              New Analysis
            </Button>
          </div>
        }
      />

      {/* Service Status Banner */}
      <Card
        padding="14px 18px"
        style={{
          marginBottom: 20,
          backgroundColor: serviceOk ? "#f0fdf4" : "#fef2f2",
          borderLeft: `4px solid ${serviceOk ? "#059669" : "#dc2626"}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {serviceOk ? (
            <FiCheckCircle size={18} color="#059669" />
          ) : (
            <FiAlertCircle size={18} color="#dc2626" />
          )}
          <div>
            <div style={{
              fontSize: 13,
              fontWeight: 600,
              color: serviceOk ? "#059669" : "#dc2626",
            }}>
              {serviceOk
                ? "All analysis services are operational"
                : "Some services are unavailable — check model files"}
            </div>
            <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
              Material Recognition: {mlReady ? "Ready" : "Unavailable"} &nbsp;|&nbsp;
              Defect Detection: {yoloReady ? "Ready" : "Unavailable"} &nbsp;|&nbsp;
              OpenCV Modules: Ready
            </div>
          </div>
        </div>
      </Card>

      {/* Stat Cards */}
      <div style={S.grid4}>
        {STAT_CARDS.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>

      {/* Category + Material Distribution */}
      <div style={S.row}>
        <Card style={{ flex: 1 }} padding="24px">
          <h3 style={S.cardTitle}>Waste Category Distribution</h3>
          {Object.keys(stats?.waste_inventory?.by_category || {}).length === 0 ? (
            <p style={S.emptyText}>No data yet. Run an analysis to populate.</p>
          ) : (
            <div style={S.categoryList}>
              {Object.entries(stats.waste_inventory.by_category).map(
                ([cat, count]) => (
                  <div key={cat} style={S.categoryRow}>
                    <span style={{ fontSize: 13, color: "#374151" }}>{cat}</span>
                    <span style={{ fontWeight: 700, color: "#1d4ed8", fontSize: 13 }}>
                      {count}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </Card>

        <Card style={{ flex: 1 }} padding="24px">
          <h3 style={S.cardTitle}>Material Distribution</h3>
          {Object.keys(stats?.waste_inventory?.by_material || {}).length === 0 ? (
            <p style={S.emptyText}>No data yet. Run an analysis to populate.</p>
          ) : (
            <div style={S.categoryList}>
              {Object.entries(stats.waste_inventory.by_material)
                .slice(0, 6)
                .map(([mat, count]) => (
                  <div key={mat} style={S.categoryRow}>
                    <span style={{ fontSize: 13, color: "#374151" }}>{mat}</span>
                    <span style={{ fontWeight: 700, color: "#0891b2", fontSize: 13 }}>
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </Card>
      </div>

      {/* Sustainability Impact */}
      <Card padding="24px" style={{ marginBottom: 20 }}>
        <h3 style={S.cardTitle}>Sustainability Impact</h3>
        <div style={S.sustainGrid}>
          <div style={S.sustainCard}>
            <div style={S.sustainValue}>
              {stats?.recovery_statistics?.total_co2_saved_kg ?? 0}
            </div>
            <div style={S.sustainLabel}>CO₂ Saved (kg)</div>
          </div>
          <div style={S.sustainCard}>
            <div style={S.sustainValue}>
              {stats?.processing_analytics?.average_circularity_score ?? 0}
            </div>
            <div style={S.sustainLabel}>Avg Circularity Score</div>
          </div>
          <div style={S.sustainCard}>
            <div style={S.sustainValue}>
              {stats?.processing_analytics?.sessions_in_cache ?? 0}
            </div>
            <div style={S.sustainLabel}>Sessions Analyzed</div>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card padding="24px">
        <h3 style={S.cardTitle}>Quick Actions</h3>
        <div style={S.actionGrid}>
          <Button onClick={() => navigate("/admin/analysis")}>
            Analyze Single Image
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/admin/bulk-upload")}
          >
            Bulk Upload (10 Images)
          </Button>
          <Button
            variant="secondary"
            onClick={() => navigate("/admin/inventory")}
          >
            View Inventory
          </Button>
        </div>
      </Card>
    </Layout>
  );
}

const S = {
  grid4: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))",
    gap: 16,
    marginBottom: 24,
  },
  row: {
    display: "flex",
    gap: 20,
    flexWrap: "wrap",
    marginBottom: 24,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: "#111827",
    margin: "0 0 16px",
  },
  emptyText: {
    fontSize: 13,
    color: "#9ca3af",
    margin: 0,
  },
  categoryList: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  categoryRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #f3f4f6",
  },
  sustainGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
    gap: 16,
  },
  sustainCard: {
    textAlign: "center",
    padding: "20px",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
  },
  sustainValue: {
    fontSize: 22,
    fontWeight: 800,
    color: "#1d4ed8",
  },
  sustainLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 6,
  },
  actionGrid: {
    display: "flex",
    gap: 12,
    flexWrap: "wrap",
  },
};