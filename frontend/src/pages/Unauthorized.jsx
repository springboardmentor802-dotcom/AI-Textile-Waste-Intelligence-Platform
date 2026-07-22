import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiShieldOff } from "react-icons/fi";
import Button from "../components/Button";

export default function Unauthorized() {
  const navigate = useNavigate();
  const { user, getDashboardPath, logout } = useAuth();

  return (
    <div style={S.page}>
      <div style={S.card}>
        <div style={S.iconWrap}>
          <FiShieldOff size={32} color="#dc2626" />
        </div>
        <h1 style={S.title}>Access Denied</h1>
        <p style={S.message}>
          You do not have permission to access this page.
        </p>
        {user && (
          <div style={S.roleBox}>
            <span style={S.roleLabel}>Your Role</span>
            <span style={S.roleValue}>{user.role}</span>
          </div>
        )}
        <div style={S.actions}>
          {user && (
            <Button onClick={() => navigate(getDashboardPath())}>
              Go to My Dashboard
            </Button>
          )}
          <Button variant="ghost" onClick={logout}>
            Back to Login
          </Button>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    minHeight: "100vh", backgroundColor: "#f8fafc",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "'Inter','Segoe UI',sans-serif", padding: 24,
  },
  card: {
    backgroundColor: "#fff", borderRadius: 12,
    padding: "48px 40px", textAlign: "center",
    maxWidth: 420, width: "100%",
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    border: "1px solid #f1f5f9",
  },
  iconWrap: {
    width: 64, height: 64, borderRadius: "50%",
    backgroundColor: "#fef2f2", display: "flex",
    alignItems: "center", justifyContent: "center",
    margin: "0 auto 20px",
  },
  title: { fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 10px" },
  message: { fontSize: 14, color: "#6b7280", margin: "0 0 20px", lineHeight: 1.6 },
  roleBox: {
    backgroundColor: "#f9fafb", border: "1px solid #e5e7eb",
    borderRadius: 8, padding: "10px 16px", marginBottom: 24,
    display: "flex", justifyContent: "space-between", alignItems: "center",
  },
  roleLabel: { fontSize: 12, color: "#6b7280", fontWeight: 500 },
  roleValue: { fontSize: 13, color: "#111827", fontWeight: 600 },
  actions: { display: "flex", flexDirection: "column", gap: 10 },
};