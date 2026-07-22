import React from "react";
import { StatCard } from "../../components/Card";
import Card from "../../components/Card";
import PageHeader from "../../components/PageHeader";
import Badge from "../../components/Badge";
import {
  FiDroplet, FiWind, FiTrendingUp, FiTarget,
} from "react-icons/fi";

const MOCK_METRICS = [
  { label: "Sustainability Score", value: "78/100", icon: FiTarget, color: "#059669" },
  { label: "CO2 Reduction (kg)", value: "2,450", icon: FiWind, color: "#0891b2" },
  { label: "Water Saved (L)", value: "8,200", icon: FiDroplet, color: "#7c3aed" },
  { label: "Recycling Rate", value: "67%", icon: FiTrendingUp, color: "#d97706" },
];

const MOCK_REPORT_ROWS = [
  { period: "Jan 2025", batches: 24, recycled: 18, diverted: "850 kg", co2: "320 kg", score: "82" },
  { period: "Feb 2025", batches: 31, recycled: 22, diverted: "1100 kg", co2: "415 kg", score: "79" },
  { period: "Mar 2025", batches: 28, recycled: 20, diverted: "980 kg", co2: "370 kg", score: "75" },
  { period: "Apr 2025", batches: 35, recycled: 27, diverted: "1350 kg", co2: "510 kg", score: "85" },
];

export default function Reports() {
  return (
    <>
      <PageHeader
        title="Sustainability Reports"
        subtitle="Environmental impact metrics — mock data (ML integration pending)"
      />

      <div style={S.grid4}>
        {MOCK_METRICS.map((m) => <StatCard key={m.label} {...m} />)}
      </div>

      <Card padding="24px" style={{ marginBottom: 24 }}>
        <h3 style={S.sectionTitle}>Monthly Environmental Summary</h3>
        <div style={{ overflowX: "auto" }}>
          <table style={S.table}>
            <thead>
              <tr style={S.thead}>
                {["Period", "Batches", "Recycled", "Waste Diverted", "CO2 Saved", "Score"].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MOCK_REPORT_ROWS.map((r, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f3f4f6", backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={S.td}>{r.period}</td>
                  <td style={S.td}>{r.batches}</td>
                  <td style={S.td}>{r.recycled}</td>
                  <td style={S.td}>{r.diverted}</td>
                  <td style={S.td}>{r.co2}</td>
                  <td style={S.td}>
                    <Badge
                      label={`${r.score}/100`}
                      preset={parseInt(r.score) >= 80 ? "success" : parseInt(r.score) >= 70 ? "warning" : "danger"}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card padding="24px">
        <h3 style={S.sectionTitle}>Future ML Integration Placeholders</h3>
        <div style={S.mlGrid}>
          {[
            "Textile Image Analysis Engine",
            "Material Classification Engine",
            "Waste Classification Engine",
            "Recycling Recommendation Engine",
            "Sustainability Intelligence Engine",
            "Environmental Impact Assessment",
          ].map((name) => (
            <div key={name} style={S.mlCard}>
              <Badge label="Pending Integration" preset="warning" />
              <div style={S.mlName}>{name}</div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

const S = {
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 16px" },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 500 },
  thead: { backgroundColor: "#f9fafb" },
  th: { padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.4px", borderBottom: "1px solid #f3f4f6" },
  td: { padding: "11px 14px", fontSize: 13, color: "#374151" },
  mlGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 },
  mlCard: { padding: "16px", border: "1px dashed #d1d5db", borderRadius: 8, display: "flex", flexDirection: "column", gap: 8 },
  mlName: { fontSize: 13, fontWeight: 600, color: "#374151" },
};