import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = {
  Administrator: [
    { label:"Dashboard", icon:"🏠", path:"/admin/dashboard" },
    { label:"Users", icon:"👥", path:"/admin/dashboard" },
    { label:"Analytics", icon:"📊", path:"/admin/dashboard" },
    { label:"Settings", icon:"⚙️", path:"/admin/dashboard" },
  ],
  "Recycling Facility Operator": [
    { label:"Dashboard", icon:"🏠", path:"/operator/dashboard" },
    { label:"Waste Items", icon:"♻", path:"/operator/dashboard" },
    { label:"Requests", icon:"📋", path:"/operator/dashboard" },
    { label:"Reports", icon:"📄", path:"/operator/dashboard" },
  ],
  "Sustainability Manager": [
    { label:"Dashboard", icon:"🏠", path:"/sustainability/dashboard" },
    { label:"Analytics", icon:"📊", path:"/sustainability/dashboard" },
    { label:"Reports", icon:"📄", path:"/sustainability/dashboard" },
    { label:"Goals", icon:"🎯", path:"/sustainability/dashboard" },
  ],
  "Textile Manufacturer": [
    { label:"Dashboard", icon:"🏠", path:"/manufacturer/dashboard" },
    { label:"Products", icon:"👕", path:"/manufacturer/dashboard" },
    { label:"Analysis", icon:"🔍", path:"/manufacturer/dashboard" },
    { label:"Recycling", icon:"♻", path:"/manufacturer/dashboard" },
  ],
};

const ROLE_COLORS = {
  Administrator: "#7c3aed",
  "Recycling Facility Operator": "#059669",
  "Sustainability Manager": "#0891b2",
  "Textile Manufacturer": "#d97706",
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const items = NAV_ITEMS[user?.role] || [];
  const color = ROLE_COLORS[user?.role] || "#059669";

  return (
    <aside style={{ ...S.sidebar, borderTop:`4px solid ${color}` }}>
      <div style={S.brand}>
        <span style={S.brandIcon}>♻</span>
        <div>
          <div style={S.brandName}>TextileWaste</div>
          <div style={S.brandSub}>AI Platform</div>
        </div>
      </div>

      <div style={S.userCard}>
        <div style={{ ...S.avatar, backgroundColor: color }}>
          {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
        </div>
        <div style={S.userInfo}>
          <div style={S.userName}>{user?.full_name}</div>
          <div style={S.userRole}>{user?.role}</div>
        </div>
      </div>

      <nav style={S.nav}>
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                ...S.navItem,
                backgroundColor: active ? color : "transparent",
                color: active ? "#fff" : "#374151",
              }}
            >
              <span style={S.navIcon}>{item.icon}</span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <button style={S.logoutBtn} onClick={logout}>
        <span>🚪</span> Logout
      </button>
    </aside>
  );
}

const S = {
  sidebar: {
    width: 260, minHeight:"100vh", backgroundColor:"#fff",
    boxShadow:"2px 0 12px rgba(0,0,0,0.06)", display:"flex",
    flexDirection:"column", padding:"0 0 24px",
  },
  brand: {
    display:"flex", alignItems:"center", gap:10,
    padding:"24px 20px", borderBottom:"1px solid #f3f4f6",
  },
  brandIcon: { fontSize:32 },
  brandName: { fontSize:16, fontWeight:700, color:"#065f46" },
  brandSub: { fontSize:11, color:"#6b7280" },
  userCard: {
    display:"flex", alignItems:"center", gap:12,
    padding:"16px 20px", backgroundColor:"#f9fafb",
    margin:"12px", borderRadius:12,
  },
  avatar: {
    width:40, height:40, borderRadius:"50%", display:"flex",
    alignItems:"center", justifyContent:"center",
    color:"#fff", fontSize:18, fontWeight:700, flexShrink:0,
  },
  userInfo: { overflow:"hidden" },
  userName: {
    fontSize:14, fontWeight:600, color:"#111827",
    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
  },
  userRole: {
    fontSize:11, color:"#6b7280",
    whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
  },
  nav: {
    flex:1, display:"flex", flexDirection:"column",
    gap:4, padding:"12px 12px",
  },
  navItem: {
    display:"flex", alignItems:"center", gap:10,
    padding:"11px 16px", borderRadius:8, border:"none",
    fontSize:14, fontWeight:500, cursor:"pointer", textAlign:"left",
    width:"100%", transition:"background 0.15s",
  },
  navIcon: { fontSize:18 },
  logoutBtn: {
    display:"flex", alignItems:"center", gap:10,
    margin:"0 12px", padding:"11px 16px", border:"none",
    borderRadius:8, backgroundColor:"#fef2f2", color:"#dc2626",
    fontSize:14, fontWeight:600, cursor:"pointer",
  },
};