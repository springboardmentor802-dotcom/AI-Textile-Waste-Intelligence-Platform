import React, { useState, useEffect } from "react";
import Layout from "../../components/Layout";
import PageHeader from "../../components/PageHeader";
import Card from "../../components/Card";
import { StatCard } from "../../components/Card";
import Badge from "../../components/Badge";
import { ToastContainer, useToast } from "../../components/Toast";
import Button from "../../components/Button";
import {
  getSustainabilityOverview,
  getSustainabilityByMaterial,
  getSustainabilityByCategory,
  getEnvironmentalImpact,
  getCircularEconomy,
  getSustainabilityRecent,
} from "../../services/analysisService";
import BarChart from "../../components/charts/BarChart";
import DoughnutChart from "../../components/charts/DoughnutChart";
import RadarChart from "../../components/charts/RadarChart";
import {
  FiDroplet, FiWind, FiTarget, FiTrendingUp, FiRefreshCw,
} from "react-icons/fi";

export default function SustainabilityDashboard() {
  const { toasts, add, remove } = useToast();
  const [overview, setOverview] = useState(null);
  const [byMaterial, setByMaterial] = useState(null);
  const [byCategory, setByCategory] = useState(null);
  const [envImpact, setEnvImpact] = useState(null);
  const [circular, setCircular] = useState(null);
  const [recent, setRecent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const [ov, mat, cat, env, circ, rec] = await Promise.all([
        getSustainabilityOverview(),
        getSustainabilityByMaterial(),
        getSustainabilityByCategory(),
        getEnvironmentalImpact(),
        getCircularEconomy(),
        getSustainabilityRecent(8),
      ]);
      setOverview(ov);
      setByMaterial(mat);
      setByCategory(cat);
      setEnvImpact(env);
      setCircular(circ);
      setRecent(rec);
    } catch {
      add("Failed to load sustainability data.", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Sustainability Dashboard">
        <PageHeader title="Sustainability Dashboard" />
        <Card padding="48px" style={{ textAlign: "center" }}>
          <p style={{ color: "#6b7280" }}>Loading sustainability data...</p>
        </Card>
      </Layout>
    );
  }

  const noData = !overview || overview.total_analyses === 0;

  // Chart data
  const matLabels = byMaterial?.materials?.map((m) => m.material) || [];
  const matCircularity = byMaterial?.materials?.map((m) => m.avg_circularity_score || 0) || [];
  const matCO2 = byMaterial?.materials?.map((m) => m.total_co2_saved_kg || 0) || [];

  const catLabels = byCategory?.categories?.map((c) => c.category) || [];
  const catCounts = byCategory?.categories?.map((c) => c.count) || [];

  const circCatLabels = Object.keys(circular?.circularity_category_distribution || {});
  const circCatValues = Object.values(circular?.circularity_category_distribution || {});

  const monthlyLabels = envImpact?.monthly_breakdown?.map((m) => m.month) || [];
  const monthlyCO2 = envImpact?.monthly_breakdown?.map((m) => m.co2_saved_kg) || [];
  const monthlyWater = envImpact?.monthly_breakdown?.map((m) => m.water_saved_liters) || [];

  const ratingPreset = { Excellent: "success", Good: "info", Fair: "warning", Poor: "danger" };

  return (
    <Layout title="Sustainability Dashboard">
      <ToastContainer toasts={toasts} onClose={remove} />

      <PageHeader
        title="Sustainability Dashboard"
        subtitle="Environmental impact and circular economy analytics"
        action={
          <Button icon={FiRefreshCw} variant="secondary" onClick={load}>
            Refresh
          </Button>
        }
      />

      {noData ? (
        <Card padding="48px" style={{ textAlign: "center" }}>
          <p style={{ color: "#6b7280" }}>
            No analysis data yet. Run full analyses to populate sustainability metrics.
          </p>
        </Card>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={S.grid4}>
            <StatCard label="Total Analyses" value={overview.total_analyses} icon={FiTarget} color="#1d4ed8" />
            <StatCard label="Avg Circularity" value={overview.avg_circularity_score ? `${overview.avg_circularity_score}/100` : "—"} icon={FiTrendingUp} color="#16a34a" />
            <StatCard label="CO₂ Saved (kg)" value={overview.total_co2_saved_kg} icon={FiWind} color="#0891b2" />
            <StatCard label="Water Saved (L)" value={overview.total_water_saved_liters?.toLocaleString()} icon={FiDroplet} color="#7c3aed" />
          </div>

          {/* Avg scores overview */}
          <div style={S.twoCol}>
            <Card padding="24px" style={{ flex: 1 }}>
              <h3 style={S.cardTitle}>Average Sustainability Scores</h3>
              {overview.avg_sustainability_score !== null && (
                <RadarChart
                  labels={["Sustainability", "Circularity", "Recyclability", "Reuse", "Material Recovery"]}
                  datasets={[{
                    label: "Average Score",
                    data: [
                      overview.avg_sustainability_score || 0,
                      overview.avg_circularity_score || 0,
                      overview.avg_recyclability_score || 0,
                      overview.avg_reuse_score || 0,
                      overview.avg_material_recovery_score || 0,
                    ],
                    backgroundColor: "#0891b220",
                    borderColor: "#0891b2",
                    borderWidth: 2,
                    pointBackgroundColor: "#0891b2",
                    pointRadius: 4,
                  }]}
                />
              )}
            </Card>

            <Card padding="24px" style={{ flex: 1 }}>
              <h3 style={S.cardTitle}>Waste Category Distribution</h3>
              {catLabels.length > 0 ? (
                <DoughnutChart
                  labels={catLabels}
                  data={catCounts}
                  colors={["#16a34a","#1d4ed8","#d97706","#0891b2","#7c3aed"]}
                />
              ) : <Empty />}
            </Card>
          </div>

          {/* Material performance */}
          {matLabels.length > 0 && (
            <div style={S.twoCol}>
              <Card padding="24px" style={{ flex: 2 }}>
                <h3 style={S.cardTitle}>Avg Circularity Score by Material</h3>
                <BarChart
                  labels={matLabels}
                  datasets={[{
                    label: "Avg Circularity Score",
                    data: matCircularity,
                    backgroundColor: "#1d4ed8cc",
                    borderColor: "#1d4ed8",
                    borderWidth: 1,
                    borderRadius: 4,
                  }]}
                  showLegend={false}
                  horizontal
                />
              </Card>

              <Card padding="24px" style={{ flex: 1 }}>
                <h3 style={S.cardTitle}>CO₂ Saved by Material (kg)</h3>
                <BarChart
                  labels={matLabels}
                  datasets={[{
                    label: "CO₂ Saved (kg)",
                    data: matCO2,
                    backgroundColor: "#16a34acc",
                    borderColor: "#16a34a",
                    borderWidth: 1,
                    borderRadius: 4,
                  }]}
                  showLegend={false}
                  horizontal
                />
              </Card>
            </div>
          )}

          {/* Monthly environmental impact */}
          {monthlyLabels.length > 0 && (
            <Card padding="24px" style={{ marginBottom: 20 }}>
              <h3 style={S.cardTitle}>Monthly Environmental Impact</h3>
              <BarChart
                labels={monthlyLabels}
                datasets={[
                  {
                    label: "CO₂ Saved (kg)",
                    data: monthlyCO2,
                    backgroundColor: "#0891b2cc",
                    borderColor: "#0891b2",
                    borderWidth: 1,
                    borderRadius: 4,
                  },
                ]}
              />
            </Card>
          )}

          {/* Circular economy */}
          <div style={S.twoCol}>
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

            {/* Rating distribution */}
            <Card padding="24px" style={{ flex: 1 }}>
              <h3 style={S.cardTitle}>Sustainability Rating Distribution</h3>
              {Object.keys(overview.sustainability_rating_distribution || {}).length > 0 ? (
                <DoughnutChart
                  labels={Object.keys(overview.sustainability_rating_distribution)}
                  data={Object.values(overview.sustainability_rating_distribution)}
                  colors={["#16a34a","#1d4ed8","#d97706","#dc2626"]}
                />
              ) : <Empty />}
            </Card>
          </div>

          {/* Recent analyses */}
          {recent?.records?.length > 0 && (
            <Card padding="24px">
              <h3 style={S.cardTitle}>Recent Analyses</h3>
              <div style={{ overflowX: "auto" }}>
                <table style={S.table}>
                  <thead>
                    <tr style={S.thead}>
                      {["Date", "File", "Material", "Condition", "Category", "Circularity", "Rating"].map((h) => (
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {recent.records.map((r, i) => (
                      <tr key={r.session_id} style={{ backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={S.td}>{r.created_at ? new Date(r.created_at).toLocaleDateString() : "—"}</td>
                        <td style={S.td}>{r.filename || "—"}</td>
                        <td style={{ ...S.td, fontWeight: 600 }}>{r.predicted_material || "—"}</td>
                        <td style={S.td}>
                          <Badge label={r.condition || "—"} preset={r.condition === "Good" ? "success" : r.condition === "Fair" ? "warning" : "danger"} />
                        </td>
                        <td style={S.td}>{r.waste_category || "—"}</td>
                        <td style={{ ...S.td, fontWeight: 700, color: "#1d4ed8" }}>{r.overall_circularity_score ?? "—"}</td>
                        <td style={S.td}>
                          <Badge label={r.sustainability_score ? `${r.sustainability_score}/100` : "—"} preset="info" />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </Layout>
  );
}

function Empty() {
  return <div style={{ fontSize: 13, color: "#9ca3af", padding: "32px 0", textAlign: "center" }}>No data yet.</div>;
}

const S = {
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 24 },
  twoCol: { display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 20 },
  cardTitle: { fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 16px" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 700 },
  thead: { backgroundColor: "#f9fafb" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "1px solid #f3f4f6" },
  td: { padding: "11px 14px", fontSize: 13, color: "#374151", borderBottom: "1px solid #f3f4f6" },
};