import React from "react";
import { useAuth } from "../context/AuthContext";

const ROLE_COLORS = {
  Administrator: "#7c3aed",
  "Recycling Facility Operator": "#059669",
  "Sustainability Manager": "#0891b2",
  "Textile Manufacturer": "#d97706",
};

const ROLE_BG = {
  Administrator: "#f5f3ff",
  "Recycling Facility Operator": "#f0fdf4",
  "Sustainability Manager": "#ecfeff",
  "Textile Manufacturer": "#fffbeb",
};

export default function Navbar({ title }) {
  const { user } = useAuth();
  const color = ROLE_COLORS[user?.role] || "#059669";
  const bg = ROLE_BG[user?.role] || "#f0fdf4";

  return (
    <header style={{ ...S.navbar, backgroundColor: bg, borderBottom:`2px solid ${color}20` }}>
      <div style={S.left}>
        <h1 style={{ ...S.title, color }}>{title}</h1>
      </div>
      <div style={S.right}>
        <div style={S.notif}>🔔</div>
        <div style={S.userPill}>
          <div style={{ ...S.dot, backgroundColor: color }} />
          <span style={S.name}>{user?.full_name}</span>
          <span style={{ ...S.badge, backgroundColor: color }}>
            {user?.role?.split(" ")[0]}
          </span>
        </div>
      </div>
    </header>
  );
}

const S = {
  navbar: {
    height:64, display:"flex", alignItems:"center",
    justifyContent:"space-between", padding:"0 32px",
    position:"sticky", top:0, zIndex:100,
  },
  left: {},
  title: { fontSize:20, fontWeight:700, margin:0 },
  right: { display:"flex", alignItems:"center", gap:16 },
  notif: { fontSize:20, cursor:"pointer" },
  userPill: {
    display:"flex", alignItems:"center", gap:8,
    backgroundColor:"#fff", borderRadius:24,
    padding:"6px 14px", boxShadow:"0 2px 8px rgba(0,0,0,0.06)",
  },
  dot: { width:8, height:8, borderRadius:"50%" },
  name: { fontSize:14, fontWeight:600, color:"#374151" },
  badge: {
    color:"#fff", fontSize:11, fontWeight:700,
    padding:"2px 8px", borderRadius:10,
  },
};