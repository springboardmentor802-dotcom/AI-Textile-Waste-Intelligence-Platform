import React from "react";
import { useAuth } from "../context/AuthContext";

const SustainabilityDashboard = () => {
  const { user, logout } = useAuth();
  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>Sustainability Manager Dashboard</h1>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{user?.full_name}</span>
          <button style={styles.logoutBtn} onClick={logout}>Logout</button>
        </div>
      </div>
      <div style={styles.content}>
        <p style={styles.welcome}>Welcome, {user?.full_name}!</p>
        <p style={styles.role}>Role: {user?.role}</p>
        <p style={styles.note}>Sustainability analytics and ESG reporting coming soon.</p>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: "100vh", backgroundColor: "#f0fdf4", fontFamily: "'Segoe UI', sans-serif" },
  header: { backgroundColor: "#0891b2", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  title: { color: "#fff", fontSize: "20px", fontWeight: "700", margin: 0 },
  userInfo: { display: "flex", alignItems: "center", gap: "16px" },
  userName: { color: "#e0f2fe", fontSize: "14px" },
  logoutBtn: { backgroundColor: "#0e7490", color: "#fff", border: "none", borderRadius: "6px", padding: "8px 16px", cursor: "pointer", fontSize: "14px" },
  content: { padding: "48px 32px" },
  welcome: { fontSize: "24px", fontWeight: "700", color: "#0e7490" },
  role: { fontSize: "16px", color: "#374151", margin: "8px 0" },
  note: { fontSize: "14px", color: "#6b7280", marginTop: "24px" },
};

export default SustainabilityDashboard;