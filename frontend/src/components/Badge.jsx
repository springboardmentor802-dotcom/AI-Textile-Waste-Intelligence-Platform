import React from "react";

const PRESETS = {
  success: { bg: "#dcfce7", color: "#16a34a" },
  warning: { bg: "#fef3c7", color: "#d97706" },
  danger: { bg: "#fee2e2", color: "#dc2626" },
  info: { bg: "#dbeafe", color: "#1d4ed8" },
  gray: { bg: "#f3f4f6", color: "#6b7280" },
  purple: { bg: "#ede9fe", color: "#7c3aed" },
};

export default function Badge({ label, preset = "gray", style = {} }) {
  const cfg = PRESETS[preset] || PRESETS.gray;
  return (
    <span style={{
      ...S.badge,
      backgroundColor: cfg.bg,
      color: cfg.color,
      ...style,
    }}>
      {label}
    </span>
  );
}

const S = {
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 9px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: "nowrap",
  },
};