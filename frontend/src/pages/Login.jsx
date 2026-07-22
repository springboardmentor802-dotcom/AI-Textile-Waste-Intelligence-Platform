import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiAlertCircle } from "react-icons/fi";

const ROLE_DASHBOARD_MAP = {
  "Administrator": "/admin/home",
  "Recycling Facility Operator": "/operator/home",
  "Sustainability Manager": "/sustainability/home",
  "Textile Manufacturer": "/manufacturer/home",
};

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Redirect already-logged-in users
  useEffect(() => {
    if (user && user.role) {
      const path = ROLE_DASHBOARD_MAP[user.role] || "/login";
      navigate(path, { replace: true });
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email.trim() || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await login({ email: form.email.trim(), password: form.password });
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.message ||
        "Login failed. Please check your credentials.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.left}>
        <div style={S.brand}>
          <div style={S.brandMark}>TW</div>
          <h1 style={S.brandName}>TextileWaste AI</h1>
          <p style={S.brandDesc}>
            Intelligent Textile Waste Management Platform
          </p>
          <div style={S.features}>
            {[
              "AI-Powered Material Analysis",
              "Real-Time Inventory Tracking",
              "Sustainability Reporting",
              "Role-Based Access Control",
            ].map((f) => (
              <div key={f} style={S.featureItem}>
                <div style={S.featureDot} />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={S.right}>
        <div style={S.card}>
          <div style={S.cardHeader}>
            <h2 style={S.cardTitle}>Sign In</h2>
            <p style={S.cardSubtitle}>Enter your credentials to continue</p>
          </div>

          {error && (
            <div style={S.errorBox}>
              <FiAlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={S.form}>
            <div style={S.field}>
              <label style={S.label}>
                Email Address <span style={S.req}>*</span>
              </label>
              <div style={S.inputWrap}>
                <FiMail size={15} style={S.inputIcon} />
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  style={S.input}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div style={S.field}>
              <label style={S.label}>
                Password <span style={S.req}>*</span>
              </label>
              <div style={S.inputWrap}>
                <FiLock size={15} style={S.inputIcon} />
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  style={S.input}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button type="submit" style={S.btn} disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p style={S.foot}>
            Don't have an account?{" "}
            <Link to="/register" style={S.link}>Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "'Inter','Segoe UI',sans-serif",
  },
  left: {
    flex: 1,
    background: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
  },
  brand: { color: "#fff", maxWidth: 380 },
  brandMark: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 14,
    fontWeight: 800,
    color: "#fff",
    marginBottom: 20,
    letterSpacing: "0.5px",
  },
  brandName: { fontSize: 26, fontWeight: 800, margin: "0 0 10px", color: "#f1f5f9" },
  brandDesc: { fontSize: 15, opacity: 0.75, lineHeight: 1.6, marginBottom: 32, color: "#cbd5e1" },
  features: { display: "flex", flexDirection: "column", gap: 12 },
  featureItem: { display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#cbd5e1" },
  featureDot: { width: 6, height: 6, borderRadius: "50%", backgroundColor: "#60a5fa", flexShrink: 0 },
  right: {
    flex: 1,
    backgroundColor: "#f8fafc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "48px 24px",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: "40px",
    width: "100%",
    maxWidth: 420,
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    border: "1px solid #f1f5f9",
  },
  cardHeader: { marginBottom: 28 },
  cardTitle: { fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 6px" },
  cardSubtitle: { fontSize: 14, color: "#6b7280", margin: 0 },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#dc2626",
    borderRadius: 7,
    padding: "10px 14px",
    fontSize: 13,
    marginBottom: 18,
  },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  req: { color: "#dc2626" },
  inputWrap: { position: "relative" },
  inputIcon: {
    position: "absolute",
    left: 11,
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    pointerEvents: "none",
  },
  input: {
    width: "100%",
    padding: "10px 12px 10px 36px",
    borderRadius: 7,
    border: "1.5px solid #d1d5db",
    fontSize: 14,
    color: "#111827",
    outline: "none",
    fontFamily: "inherit",
    boxSizing: "border-box",
    backgroundColor: "#fafafa",
  },
  btn: {
    backgroundColor: "#1d4ed8",
    color: "#fff",
    border: "none",
    borderRadius: 7,
    padding: "11px",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    width: "100%",
    marginTop: 4,
    fontFamily: "inherit",
  },
  foot: { textAlign: "center", fontSize: 13, color: "#6b7280", marginTop: 24 },
  link: { color: "#1d4ed8", fontWeight: 600, textDecoration: "none" },
};