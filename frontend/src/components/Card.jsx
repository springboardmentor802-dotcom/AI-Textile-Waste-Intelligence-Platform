import React from "react";

export default function Card({ children, style = {}, padding = "24px" }) {
  return (
    <div style={{ ...S.card, padding, ...style }}>
      {children}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, color = "#1d4ed8", trend }) {
  return (
    <div style={S.statCard}>
      <div style={S.statTop}>
        <div style={S.statLabel}>{label}</div>
        <div style={{ ...S.iconBox, backgroundColor: `${color}18` }}>
          {Icon && <Icon size={18} color={color} />}
        </div>
      </div>
      <div style={{ ...S.statValue, color }}>{value ?? "—"}</div>
      {trend && <div style={S.trend}>{trend}</div>}
    </div>
  );
}

const S = {
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #f3f4f6",
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    padding: "20px 24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
    border: "1px solid #f3f4f6",
  },
  statTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  statLabel: { fontSize: 13, color: "#6b7280", fontWeight: 500 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statValue: { fontSize: 28, fontWeight: 700, color: "#111827" },
  trend: { fontSize: 12, color: "#6b7280", marginTop: 4 },
};