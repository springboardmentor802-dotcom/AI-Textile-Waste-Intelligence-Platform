import React from "react";

export default function StatCard({ icon, label, value, color, bg }) {
  return (
    <div style={{ ...S.card, borderLeft:`4px solid ${color}`, backgroundColor: bg || "#fff" }}>
      <div style={{ ...S.iconWrap, backgroundColor:`${color}18` }}>
        <span style={S.icon}>{icon}</span>
      </div>
      <div style={S.info}>
        <div style={S.value}>{value}</div>
        <div style={S.label}>{label}</div>
      </div>
    </div>
  );
}

const S = {
  card: {
    display:"flex", alignItems:"center", gap:16,
    padding:"24px 20px", borderRadius:12,
    boxShadow:"0 2px 12px rgba(0,0,0,0.05)",
    backgroundColor:"#fff",
  },
  iconWrap: {
    width:52, height:52, borderRadius:12,
    display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
  },
  icon: { fontSize:26 },
  info: {},
  value: { fontSize:28, fontWeight:800, color:"#111827", lineHeight:1 },
  label: { fontSize:13, color:"#6b7280", marginTop:4, fontWeight:500 },
};