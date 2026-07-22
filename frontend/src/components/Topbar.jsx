import React from "react";
import { FiMenu, FiBell } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { getRoleConfig } from "../styles/theme";

export default function Topbar({ title, onToggleSidebar }) {
  const { user } = useAuth();
  const cfg = getRoleConfig(user?.role);

  return (
    <header style={S.bar}>
      <div style={S.left}>
        <button style={S.iconBtn} onClick={onToggleSidebar} title="Toggle sidebar">
          <FiMenu size={19} />
        </button>
        <h1 style={S.title}>{title}</h1>
      </div>
      <div style={S.right}>
        <button style={S.iconBtn} title="Notifications">
          <FiBell size={17} />
        </button>
        <div style={S.userPill}>
          <div style={{ ...S.avatar, backgroundColor: cfg.color }}>
            {user?.full_name?.charAt(0)?.toUpperCase() || "U"}
          </div>
          <div style={S.userMeta}>
            <div style={S.userName}>{user?.full_name || "User"}</div>
            <div style={S.userRole}>{cfg.label}</div>
          </div>
        </div>
      </div>
    </header>
  );
}

const S = {
  bar: {
    height: 58,
    backgroundColor: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 24px",
    flexShrink: 0,
    zIndex: 50,
  },
  left: { display: "flex", alignItems: "center", gap: 14 },
  title: { fontSize: 16, fontWeight: 600, color: "#111827", margin: 0 },
  right: { display: "flex", alignItems: "center", gap: 10 },
  iconBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    color: "#6b7280",
    display: "flex",
    alignItems: "center",
    padding: 6,
    borderRadius: 6,
  },
  userPill: {
    display: "flex",
    alignItems: "center",
    gap: 9,
    padding: "6px 12px",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontSize: 12,
    fontWeight: 700,
    flexShrink: 0,
  },
  userMeta: {},
  userName: { fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.3 },
  userRole: { fontSize: 11, color: "#6b7280", lineHeight: 1.3 },
};