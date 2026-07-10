import React from "react";
import { useAuth } from "../context/AuthContext";

const OperatorDashboard = () => {
  const { user, logout } = useAuth();

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Recycling Facility Operator Dashboard</h1>
        <div style={styles.headerRight}>
          <span style={styles.userName}>{user?.full_name}</span>
          <button style={styles.logoutBtn} onClick={logout}>
            Logout
          </button>
        </div>
      </div>
      <div style={styles.content}>
        <h2 style={styles.welcome}>Welcome, {user?.full_name}!</h2>
        <p style={styles.roleTag}>Role: {user?.role}</p>
        <p style={styles.note}>
          Textile inventory and batch management features coming soon.
        </p>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f0fdf4",
    fontFamily: "'Segoe UI', sans-serif",
  },
  header: {
    backgroundColor: "#059669",
    padding: "16px 32px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: { color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0 },
  headerRight: { display: "flex", alignItems: "center", gap: "16px" },
  userName: { color: "#d1fae5", fontSize: "14px" },
  logoutBtn: {
    backgroundColor: "#065f46",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 16px",
    cursor: "pointer",
    fontSize: "14px",
  },
  content: { padding: "48px 32px" },
  welcome: { fontSize: "24px", fontWeight: "700", color: "#065f46" },
  roleTag: { fontSize: "16px", color: "#374151", margin: "8px 0" },
  note: { fontSize: "14px", color: "#6b7280", marginTop: "24px" },
};

export default OperatorDashboard;