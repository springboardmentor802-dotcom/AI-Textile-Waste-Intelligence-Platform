import React from "react";

// Visual swatch display for dominant colors — not a Chart.js chart
// because actual color swatches are more meaningful than a chart here.
export default function ColorPaletteChart({ hexColors = [], percentages = [] }) {
  if (!hexColors.length) return <div style={S.empty}>No color data</div>;

  return (
    <div style={S.wrap}>
      {hexColors.map((hex, i) => (
        <div key={hex} style={S.item}>
          <div style={{ ...S.swatch, backgroundColor: hex }} />
          <div style={S.label}>{hex}</div>
          {percentages[i] != null && (
            <div style={S.pct}>{percentages[i].toFixed(1)}%</div>
          )}
          <div style={S.bar}>
            <div
              style={{
                ...S.barFill,
                width: `${percentages[i] || 0}%`,
                backgroundColor: hex,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

const S = {
  wrap: { display: "flex", flexDirection: "column", gap: 10 },
  item: { display: "flex", alignItems: "center", gap: 10 },
  swatch: {
    width: 32, height: 32, borderRadius: 6,
    border: "1px solid #e5e7eb", flexShrink: 0,
  },
  label: { fontSize: 12, fontWeight: 600, color: "#374151", width: 72 },
  pct: { fontSize: 11, color: "#6b7280", width: 36, textAlign: "right" },
  bar: {
    flex: 1, height: 8, backgroundColor: "#f3f4f6",
    borderRadius: 4, overflow: "hidden",
  },
  barFill: { height: "100%", borderRadius: 4, transition: "width 0.3s" },
  empty: { fontSize: 13, color: "#9ca3af", padding: "12px 0" },
};