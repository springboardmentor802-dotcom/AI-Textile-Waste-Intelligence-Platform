import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import { StatCard } from "../../components/Card";
import { ToastContainer, useToast } from "../../components/Toast";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import {
  getSustainabilityByCategory,
  getSustainabilityRecent,
  getRecommendationsSummary,
} from "../../services/analysisService";
import { getAllBatches } from "../../services/textileService";
import DoughnutChart from "../../components/charts/DoughnutChart";
import BarChart from "../../components/charts/BarChart";
import { FiPackage, FiRefreshCw, FiCheckCircle, FiTruck } from "react-icons/fi";

export default function OperatorDashboard() {
  const { toasts, add, remove } = useToast();
  const [summary, setSummary] = useState(null);
  const [byCategory, setByCategory] = useState(null);
  const [recent, setRecent] = useState(null);
  const [batchCount, setBatchCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [rec, cat, inv, recentData] = await Promise.all([
        getRecommendationsSummary(),
        getSustainabilityByCategory(),
        getAllBatches("", 0, 1),
        getSustainabilityRecent(5),
      ]);
      setSummary(rec);
      setByCategory(cat);
      setBatchCount(inv.total || 0);
      setRecent(recentData);
    } catch {
      add("Failed to load dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const stratLabels = Object.keys(summary?.strategy_distribution || {});
  const stratValues = Object.values(summary?.strategy_distribution || {});
  const catLabels = byCategory?.categories?.map((c) => c.category) || [];
  const catCounts = byCategory?.categories?.map((c) => c.count) || [];

  return (
    <Layout title="Recycling Facility Dashboard">
      <ToastContainer toasts={toasts} onClose={remove} />
      <PageHeader
        title="Recycling Facility Dashboard"
        subtitle="Waste inventory and recycling operations overview"
        action={<Button icon={FiRefreshCw} variant="secondary" onClick={load}>Refresh</Button>}
      />

      <div style={S.grid4}>
        <StatCard label="Inventory Batches" value={batchCount} icon={FiPackage} color="#16a34a" />
        <StatCard label="Total Analyses" value={summary?.total_analyses ?? "—"} icon={FiCheckCircle} color="#1d4ed8" />
        <StatCard label="Recyclable Items" value={summary?.waste_category_distribution?.Recyclable ?? 0} icon={FiTruck} color="#0891b2" />
        <StatCard label="Reusable Items" value={summary?.waste_category_distribution?.Reusable ?? 0} icon={FiRefreshCw} color="#7c3aed" />
      </div>

      <div style={S.twoCol}>
        <Card padding="24px" style={{ flex: 1 }}>
          <h3 style={S.cardTitle}>Recycling Strategy Distribution</h3>
          {stratLabels.length > 0 ? (
            <DoughnutChart labels={stratLabels} data={stratValues} />
          ) : <Empty />}
        </Card>

        <Card padding="24px" style={{ flex: 1 }}>
          <h3 style={S.cardTitle}>Waste Category Distribution</h3>
          {catLabels.length > 0 ? (
            <DoughnutChart
              labels={catLabels}
              data={catCounts}
              colors={["#16a34a","#1d4ed8","#d97706","#dc2626","#0891b2"]}
            />
          ) : <Empty />}
        </Card>
      </div>

      {stratLabels.length > 0 && (
        <Card padding="24px" style={{ marginBottom: 20 }}>
          <h3 style={S.cardTitle}>Strategy Frequency</h3>
          <BarChart
            labels={stratLabels}
            datasets={[{
              label: "Count",
              data: stratValues,
              backgroundColor: "#16a34acc",
              borderColor: "#16a34a",
              borderWidth: 1,
              borderRadius: 4,
            }]}
            showLegend={false}
            horizontal
          />
        </Card>
      )}

      {recent?.records?.length > 0 && (
        <Card padding="24px">
          <h3 style={S.cardTitle}>Recent Collections</h3>
          {recent.records.map((r, i) => (
            <div key={r.session_id} style={{ ...S.recentRow, backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{r.predicted_material || "Unknown"}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>{r.filename} — {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}</div>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <Badge label={r.condition || "—"} preset={r.condition === "Good" ? "success" : r.condition === "Fair" ? "warning" : "danger"} />
                <Badge label={r.waste_category || "—"} preset="info" />
              </div>
            </div>
          ))}
        </Card>
      )}
    </Layout>
  );
}

function Empty() {
  return <div style={{ fontSize: 13, color: "#9ca3af", padding: "24px 0", textAlign: "center" }}>No data yet. Run analyses to populate.</div>;
}

const S = {
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 24 },
  twoCol: { display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 16px" },
  recentRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" },
};