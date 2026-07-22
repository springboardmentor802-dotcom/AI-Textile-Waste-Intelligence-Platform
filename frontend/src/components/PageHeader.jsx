import React from "react";

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div style={S.header}>
      <div>
        <h2 style={S.title}>{title}</h2>
        {subtitle && <p style={S.subtitle}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

const S = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  title: { fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 },
  subtitle: { fontSize: 13, color: "#6b7280", margin: "4px 0 0" },
};