import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import { StatCard } from "../../components/Card";
import { ToastContainer, useToast } from "../../components/Toast";
import Button from "../../components/Button";
import Badge from "../../components/Badge";
import {
  getSustainabilityOverview,
  getSustainabilityByMaterial,
  getCircularEconomy,
  getSustainabilityRecent,
} from "../../services/analysisService";
import BarChart from "../../components/charts/BarChart";
import DoughnutChart from "../../components/charts/DoughnutChart";
import RadarChart from "../../components/charts/RadarChart";
import { FiTrendingUp, FiRefreshCw, FiWind, FiDroplet } from "react-icons/fi";

export default function ManufacturerDashboard() {
  const { toasts, add, remove } = useToast();
  const [overview, setOverview] = useState(null);
  const [byMaterial, setByMaterial] = useState(null);
  const [circular, setCircular] = useState(null);
  const [recent, setRecent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [ov, mat, circ, rec] = await Promise.all([
        getSustainabilityOverview(),
        getSustainabilityByMaterial(),
        getCircularEconomy(),
        getSustainabilityRecent(5),
      ]);
      setOverview(ov);
      setByMaterial(mat);
      setCircular(circ);
      setRecent(rec);
    } catch {
      add("Failed to load dashboard data.", "error");
    } finally {
      setLoading(false);
    }
  };

  const matLabels = byMaterial?.materials?.map((m) => m.material) || [];
  const matCircularity = byMaterial?.materials?.map((m) => m.avg_circularity_score || 0) || [];
  const matSustainability = byMaterial?.materials?.map((m) => m.avg_sustainability_score || 0) || [];
  const circCatLabels = Object.keys(circular?.circularity_category_distribution || {});
  const circCatValues = Object.values(circular?.circularity_category_distribution || {});

  return (
    <Layout title="Manufacturer Dashboard">
      <ToastContainer toasts={toasts} onClose={remove} />
      <PageHeader
        title="Manufacturer Sustainability Dashboard"
        subtitle="Production waste analysis and circular economy performance"
        action={<Button icon={FiRefreshCw} variant="secondary" onClick={load}>Refresh</Button>}
      />

      {loading ? (
        <Card padding="48px" style={{ textAlign: "center" }}>
          <p style={{ color: "#6b7280" }}>Loading...</p>
        </Card>
      ) : !overview || overview.total_analyses === 0 ? (
        <Card padding="48px" style={{ textAlign: "center" }}>
          <p style={{ color: "#6b7280" }}>No analysis data yet. Run full analyses to populate.</p>
        </Card>
      ) : (
        <>
          <div style={S.grid4}>
            <StatCard label="Total Analyses" value={overview.total_analyses} icon={FiTrendingUp} color="#d97706" />
            <StatCard label="Avg Circularity" value={overview.avg_circularity_score ? `${overview.avg_circularity_score}/100` : "—"} icon={FiRefreshCw} color="#1d4ed8" />
            <StatCard label="CO₂ Saved (kg)" value={overview.total_co2_saved_kg} icon={FiWind} color="#16a34a" />
            <StatCard label="Water Saved (L)" value={overview.total_water_saved_liters?.toLocaleString()} icon={FiDroplet} color="#0891b2" />
          </div>

          <div style={S.twoCol}>
            <Card padding="24px" style={{ flex: 1 }}>
              <h3 style={S.cardTitle}>Sustainability Performance Radar</h3>
              <RadarChart
                labels={["Sustainability","Circularity","Recyclability","Reuse","Recovery"]}
                datasets={[{
                  label: "Avg Score",
                  data: [
                    overview.avg_sustainability_score || 0,
                    overview.avg_circularity_score || 0,
                    overview.avg_recyclability_score || 0,
                    overview.avg_reuse_score || 0,
                    overview.avg_material_recovery_score || 0,
                  ],
                  backgroundColor: "#d9780620",
                  borderColor: "#d97706",
                  borderWidth: 2,
                  pointBackgroundColor: "#d97706",
                  pointRadius: 4,
                }]}
              />
            </Card>

            <Card padding="24px" style={{ flex: 1 }}>
              <h3 style={S.cardTitle}>Circularity Category Distribution</h3>
              {circCatLabels.length > 0 ? (
                <DoughnutChart
                  labels={circCatLabels}
                  data={circCatValues}
                  colors={["#16a34a","#1d4ed8","#d97706","#dc2626","#6b7280"]}
                />
              ) : <Empty />}
            </Card>
          </div>

          {matLabels.length > 0 && (
            <div style={S.twoCol}>
              <Card padding="24px" style={{ flex: 1 }}>
                <h3 style={S.cardTitle}>Circularity by Material</h3>
                <BarChart
                  labels={matLabels}
                  datasets={[{
                    label: "Avg Circularity Score",
                    data: matCircularity,
                    backgroundColor: "#d97706cc",
                    borderColor: "#d97706",
                    borderWidth: 1,
                    borderRadius: 4,
                  }]}
                  showLegend={false}
                  horizontal
                />
              </Card>

              <Card padding="24px" style={{ flex: 1 }}>
                <h3 style={S.cardTitle}>Sustainability by Material</h3>
                <BarChart
                  labels={matLabels}
                  datasets={[{
                    label: "Avg Sustainability Score",
                    data: matSustainability,
                    backgroundColor: "#1d4ed8cc",
                    borderColor: "#1d4ed8",
                    borderWidth: 1,
                    borderRadius: 4,
                  }]}
                  showLegend={false}
                  horizontal
                />
              </Card>
            </div>
          )}

          {recent?.records?.length > 0 && (
            <Card padding="24px">
              <h3 style={S.cardTitle}>Recent Production Analyses</h3>
              {recent.records.map((r, i) => (
                <div key={r.session_id} style={{ ...S.recentRow, backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{r.predicted_material || "—"}</div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{r.filename} — {r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}</div>
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <Badge label={`Circularity: ${r.overall_circularity_score ?? "—"}`} preset="info" />
                    <Badge label={r.waste_category || "—"} preset="gray" />
                  </div>
                </div>
              ))}
            </Card>
          )}
        </>
      )}
    </Layout>
  );
}

function Empty() {
  return <div style={{ fontSize: 13, color: "#9ca3af", padding: "24px 0", textAlign: "center" }}>No data yet.</div>;
}

const S = {
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 24 },
  twoCol: { display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 16px" },
  recentRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid #f3f4f6" },
};