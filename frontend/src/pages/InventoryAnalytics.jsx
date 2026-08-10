import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { StatCard } from "../components/Card";
import { ToastContainer, useToast } from "../components/Toast";
import { getInventoryAnalytics } from "../services/analysisService";
import BarChart from "../components/charts/BarChart";
import DoughnutChart from "../components/charts/DoughnutChart";
import { FiPackage, FiLayers, FiCheckSquare, FiRefreshCw } from "react-icons/fi";

export default function InventoryAnalytics() {
  const { toasts, add, remove } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getInventoryAnalytics();
      setData(res);
    } catch {
      add("Failed to load inventory analytics.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Inventory Analytics">
        <PageHeader title="Inventory Analytics" />
        <Card padding="48px" style={{ textAlign: "center" }}>
          <p style={{ color: "#6b7280" }}>Loading analytics...</p>
        </Card>
      </Layout>
    );
  }

  if (!data) return null;

  const fabricLabels = data.fabric_type_distribution?.map((r) => r.fabric_type) || [];
  const fabricCounts = data.fabric_type_distribution?.map((r) => r.count) || [];
  const fabricQty = data.fabric_type_distribution?.map((r) => r.total_quantity_kg) || [];

  const conditionLabels = data.condition_distribution?.map((r) => r.condition) || [];
  const conditionCounts = data.condition_distribution?.map((r) => r.count) || [];
  const conditionColors = { Good: "#16a34a", Fair: "#d97706", Poor: "#dc2626" };

  const mlLabels = data.ml_status_distribution?.map((r) => r.status) || [];
  const mlCounts = data.ml_status_distribution?.map((r) => r.count) || [];

  return (
    <Layout title="Inventory Analytics">
      <ToastContainer toasts={toasts} onClose={remove} />

      <PageHeader
        title="Inventory Analytics"
        subtitle="Visual breakdown of your textile inventory"
      />

      {/* KPI row */}
      <div style={S.grid4}>
        <StatCard label="Total Batches" value={data.total_batches} icon={FiPackage} color="#1d4ed8" />
        <StatCard label="Total Quantity (kg)" value={data.total_quantity_kg?.toLocaleString()} icon={FiLayers} color="#16a34a" />
        <StatCard label="Fabric Types" value={data.fabric_type_distribution?.length || 0} icon={FiCheckSquare} color="#d97706" />
        <StatCard label="ML Analyzed" value={data.ml_status_distribution?.find((r) => r.status === "completed")?.count || 0} icon={FiRefreshCw} color="#7c3aed" />
      </div>

      {/* Fabric type charts */}
      <div style={S.twoCol}>
        <Card padding="24px" style={{ flex: 2 }}>
          <h3 style={S.cardTitle}>Batch Count by Fabric Type</h3>
          {fabricLabels.length > 0 ? (
            <BarChart
              labels={fabricLabels}
              datasets={[{
                label: "Batches",
                data: fabricCounts,
                backgroundColor: "#1d4ed8cc",
                borderColor: "#1d4ed8",
                borderWidth: 1,
                borderRadius: 4,
              }]}
              showLegend={false}
              horizontal
            />
          ) : <Empty />}
        </Card>

        <Card padding="24px" style={{ flex: 1 }}>
          <h3 style={S.cardTitle}>Fabric Distribution</h3>
          {fabricLabels.length > 0 ? (
            <DoughnutChart
              labels={fabricLabels}
              data={fabricCounts}
            />
          ) : <Empty />}
        </Card>
      </div>

      {/* Quantity and condition */}
      <div style={S.twoCol}>
        <Card padding="24px" style={{ flex: 2 }}>
          <h3 style={S.cardTitle}>Total Quantity (kg) by Fabric Type</h3>
          {fabricLabels.length > 0 ? (
            <BarChart
              labels={fabricLabels}
              datasets={[{
                label: "Quantity (kg)",
                data: fabricQty,
                backgroundColor: "#16a34acc",
                borderColor: "#16a34a",
                borderWidth: 1,
                borderRadius: 4,
              }]}
              showLegend={false}
              horizontal
            />
          ) : <Empty />}
        </Card>

        <Card padding="24px" style={{ flex: 1 }}>
          <h3 style={S.cardTitle}>Condition Distribution</h3>
          {conditionLabels.length > 0 ? (
            <DoughnutChart
              labels={conditionLabels}
              data={conditionCounts}
              colors={conditionLabels.map((l) => conditionColors[l] || "#6b7280")}
            />
          ) : <Empty />}
        </Card>
      </div>

      {/* ML status */}
      {mlLabels.length > 0 && (
        <Card padding="24px">
          <h3 style={S.cardTitle}>ML Analysis Status</h3>
          <div style={{ maxWidth: 400 }}>
            <DoughnutChart
              labels={mlLabels}
              data={mlCounts}
              colors={["#d97706", "#16a34a", "#6b7280"]}
            />
          </div>
        </Card>
      )}
    </Layout>
  );
}

function Empty() {
  return <div style={{ fontSize: 13, color: "#9ca3af", padding: "32px 0", textAlign: "center" }}>No data yet. Add inventory batches to see analytics.</div>;
}

const S = {
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 24 },
  twoCol: { display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 16px" },
};