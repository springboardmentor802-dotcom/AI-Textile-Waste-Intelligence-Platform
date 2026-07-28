import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiHome, FiPackage, FiUsers, FiBarChart2, FiLogOut,
  FiFileText, FiTruck, FiUser, FiLock, FiChevronRight, FiSearch,
} from "react-icons/fi";
import { getRoleConfig } from "../styles/theme";

// Keys must match PostgreSQL enum values exactly
const NAV = {
  "admin": [
    { label: "Home", icon: FiHome, path: "/admin/home" },
    { label: "Dashboard", icon: FiBarChart2, path: "/admin/dashboard" },
    { label: "Inventory", icon: FiPackage, path: "/admin/inventory" },
    { label: "Analysis", icon: FiSearch, path: "/admin/analysis-dashboard" },
    { label: "User Management", icon: FiUsers, path: "/admin/users" },
    { label: "Profile", icon: FiUser, path: "/admin/profile" },
    { label: "Change Password", icon: FiLock, path: "/admin/change-password" },
  ],
  "recycling_operator": [
    { label: "Home", icon: FiHome, path: "/operator/home" },
    { label: "Dashboard", icon: FiBarChart2, path: "/operator/dashboard" },
    { label: "Inventory", icon: FiPackage, path: "/operator/inventory" },
    { label: "Analysis", icon: FiSearch, path: "/operator/analysis" },
    { label: "Collections", icon: FiTruck, path: "/operator/collections" },
    { label: "Profile", icon: FiUser, path: "/operator/profile" },
    { label: "Change Password", icon: FiLock, path: "/operator/change-password" },
  ],
  "sustainability_manager": [
    { label: "Home", icon: FiHome, path: "/sustainability/home" },
    { label: "Dashboard", icon: FiBarChart2, path: "/sustainability/dashboard" },
    { label: "Inventory", icon: FiPackage, path: "/sustainability/inventory" },
    { label: "Analysis", icon: FiSearch, path: "/sustainability/analysis" },
    { label: "Reports", icon: FiFileText, path: "/sustainability/reports" },
    { label: "Profile", icon: FiUser, path: "/sustainability/profile" },
    { label: "Change Password", icon: FiLock, path: "/sustainability/change-password" },
  ],
  "textile_manufacturer": [
    { label: "Home", icon: FiHome, path: "/manufacturer/home" },
    { label: "Dashboard", icon: FiBarChart2, path: "/manufacturer/dashboard" },
    { label: "Inventory", icon: FiPackage, path: "/manufacturer/inventory" },
    { label: "Analysis", icon: FiSearch, path: "/manufacturer/analysis" },
    { label: "Profile", icon: FiUser, path: "/manufacturer/profile" },
    { label: "Change Password", icon: FiLock, path: "/manufacturer/change-password" },
  ],
};

export default function Sidebar({ collapsed }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cfg = getRoleConfig(user?.role);
  const items = NAV[user?.role] || [];

  return (
    <aside style={{ ...S.sidebar, width: collapsed ? 64 : 240 }}>
      <div style={S.brand}>
        <div style={{ ...S.brandMark, backgroundColor: cfg.color }}>TW</div>
        {!collapsed && (
          <div>
            <div style={S.brandName}>TextileWaste AI</div>
            <div style={S.brandSub}>Platform</div>
          </div>
        )}
      </div>

      {!collapsed && (
        <div style={S.userCard}>
          <div style={{ ...S.avatar, backgroundColor: cfg.color }}>
            {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div style={S.userMeta}>
            <div style={S.userName}>{user?.full_name || "User"}</div>
            <div style={{ ...S.userRole, color: cfg.color }}>{cfg.label}</div>
          </div>
        </div>
      )}

      <nav style={S.nav}>
        {items.map((item) => {
          const active = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : ""}
              style={{
                ...S.navItem,
                backgroundColor: active ? "#1d4ed8" : "transparent",
                color: active ? "#fff" : "#94a3b8",
                justifyContent: collapsed ? "center" : "flex-start",
              }}
            >
              <item.icon size={16} />
              {!collapsed && <span style={S.navLabel}>{item.label}</span>}
              {!collapsed && active && <FiChevronRight size={13} style={{ marginLeft: "auto" }} />}
            </button>
          );
        })}
      </nav>

      <button
        style={{ ...S.logoutBtn, justifyContent: collapsed ? "center" : "flex-start" }}
        onClick={logout}
        title={collapsed ? "Logout" : ""}
      >
        <FiLogOut size={16} />
        {!collapsed && <span style={S.navLabel}>Logout</span>}
      </button>
    </aside>
  );
}

const S = {
  sidebar: {
    backgroundColor: "#0f172a", minHeight: "100vh",
    display: "flex", flexDirection: "column",
    transition: "width 0.2s ease", flexShrink: 0, overflow: "hidden",
  },
  brand: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "18px 14px", borderBottom: "1px solid #1e293b",
  },
  brandMark: {
    width: 30, height: 30, borderRadius: 6, display: "flex",
    alignItems: "center", justifyContent: "center",
    color: "#fff", fontSize: 11, fontWeight: 800, flexShrink: 0,
  },
  brandName: { fontSize: 13, fontWeight: 700, color: "#f1f5f9" },
  brandSub: { fontSize: 10, color: "#64748b" },
  userCard: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 14px", borderBottom: "1px solid #1e293b",
  },
  avatar: {
    width: 32, height: 32, borderRadius: "50%", display: "flex",
    alignItems: "center", justifyContent: "center",
    color: "#fff", fontSize: 13, fontWeight: 700, flexShrink: 0,
  },
  userMeta: { overflow: "hidden", minWidth: 0 },
  userName: {
    fontSize: 13, fontWeight: 600, color: "#f1f5f9",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },
  userRole: { fontSize: 11, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  nav: { flex: 1, display: "flex", flexDirection: "column", gap: 2, padding: "10px 8px", overflowY: "auto" },
  navItem: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 10px", borderRadius: 6, border: "none",
    fontSize: 13, fontWeight: 500, cursor: "pointer",
    textAlign: "left", width: "100%", transition: "background 0.15s", whiteSpace: "nowrap",
  },
  navLabel: { flex: 1 },
  logoutBtn: {
    display: "flex", alignItems: "center", gap: 10,
    margin: "8px", padding: "9px 10px", border: "none",
    borderRadius: 6, backgroundColor: "#1e293b",
    color: "#f87171", fontSize: 13, fontWeight: 500, cursor: "pointer", whiteSpace: "nowrap",
  },
};