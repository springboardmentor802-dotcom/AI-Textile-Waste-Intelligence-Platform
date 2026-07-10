import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, getDashboardPath } = useAuth();

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.icon}>🚫</div>
        <h1 style={styles.title}>Access Denied</h1>
        <p style={styles.message}>
          You do not have permission to view this page.
        </p>
        {user && (
          <p style={styles.role}>
            Your role: <strong>{user.role}</strong>
          </p>
        )}
        <button
          style={styles.button}
          onClick={() => navigate(getDashboardPath())}
        >
          Go to My Dashboard
        </button>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f0fdf4",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Segoe UI', sans-serif",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "48px 40px",
    textAlign: "center",
    maxWidth: "400px",
    width: "100%",
    boxShadow: "0 10px 40px rgba(0,0,0,0.08)",
  },
  icon: { fontSize: "64px", marginBottom: "16px" },
  title: {
    fontSize: "28px",
    fontWeight: "700",
    color: "#111827",
    margin: "0 0 12px 0",
  },
  message: { fontSize: "16px", color: "#6b7280", margin: "0 0 8px 0" },
  role: { fontSize: "14px", color: "#374151", margin: "0 0 24px 0" },
  button: {
    backgroundColor: "#059669",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "12px 24px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
};

export default Unauthorized;