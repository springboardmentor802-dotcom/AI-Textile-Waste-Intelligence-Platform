import React from "react";

export default function Table({ columns, data, loading, emptyMessage = "No data found." }) {
  return (
    <div style={S.wrap}>
      <table style={S.table}>
        <thead>
          <tr style={S.thead}>
            {columns.map((col) => (
              <th key={col.key} style={{ ...S.th, width: col.width }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={S.centerCell}>
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={S.centerCell}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={i} style={{ ...S.tr, backgroundColor: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                {columns.map((col) => (
                  <td key={col.key} style={S.td}>
                    {col.render ? col.render(row[col.key], row) : row[col.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

const S = {
  wrap: {
    border: "1px solid #f3f4f6",
    borderRadius: 10,
    overflow: "auto",
    backgroundColor: "#fff",
  },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 600 },
  thead: { backgroundColor: "#f9fafb" },
  th: {
    padding: "11px 16px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.4px",
    borderBottom: "1px solid #f3f4f6",
    whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #f3f4f6" },
  td: { padding: "12px 16px", fontSize: 13, color: "#374151" },
  centerCell: {
    padding: "48px 20px",
    textAlign: "center",
    color: "#9ca3af",
    fontSize: 14,
  },
};