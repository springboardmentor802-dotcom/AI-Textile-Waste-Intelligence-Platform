import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ROLE_MAP = {
  Administrator: "/admin/dashboard",
  "Recycling Facility Operator": "/operator/dashboard",
  "Sustainability Manager": "/sustainability/dashboard",
  "Textile Manufacturer": "/manufacturer/dashboard",
};

export default function Login() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) navigate(ROLE_MAP[user.role] || "/login", { replace: true });
  }, [user, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please enter your email and password.");
      return;
    }
    setLoading(true);
    try {
      await login(form);
    } catch (err) {
      setError(err?.response?.data?.detail || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.left}>
        <div style={S.brand}>
          <span style={S.brandIcon}>♻</span>
          <h1 style={S.brandName}>TextileWaste AI</h1>
          <p style={S.brandDesc}>
            Intelligent Waste Management Platform for a sustainable future
          </p>
          <div style={S.features}>
            {["AI-Powered Analysis", "Real-Time Monitoring",
              "Sustainability Insights", "Role-Based Access"].map((f) => (
              <div key={f} style={S.featureItem}>
                <span style={S.featureDot}>✓</span> {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={S.right}>
        <div style={S.card}>
          <h2 style={S.title}>Welcome Back</h2>
          <p style={S.subtitle}>Sign in to your account</p>

          {error && <div style={S.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={S.form}>
            <div style={S.field}>
              <label style={S.label}>Email Address</label>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="you@example.com"
                style={S.input} required
              />
            </div>
            <div style={S.field}>
              <label style={S.label}>Password</label>
              <input
                type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="Enter your password"
                style={S.input} required
              />
            </div>
            <button type="submit" style={S.btn} disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <p style={S.foot}>
            No account?{" "}
            <Link to="/register" style={S.link}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const S = {
  page: { display:"flex", minHeight:"100vh", fontFamily:"'Segoe UI',sans-serif" },
  left: {
    flex:1, background:"linear-gradient(135deg,#065f46 0%,#0891b2 100%)",
    display:"flex", alignItems:"center", justifyContent:"center", padding:"48px",
  },
  brand: { color:"#fff", maxWidth:400 },
  brandIcon: { fontSize:56 },
  brandName: { fontSize:32, fontWeight:800, margin:"16px 0 8px" },
  brandDesc: { fontSize:16, opacity:0.85, lineHeight:1.6, marginBottom:32 },
  features: { display:"flex", flexDirection:"column", gap:12 },
  featureItem: { display:"flex", alignItems:"center", gap:10, fontSize:15, opacity:0.9 },
  featureDot: { color:"#6ee7b7", fontWeight:700 },
  right: {
    flex:1, backgroundColor:"#f0fdf4",
    display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 24px",
  },
  card: {
    backgroundColor:"#fff", borderRadius:20, padding:"48px 40px",
    width:"100%", maxWidth:440, boxShadow:"0 8px 40px rgba(0,0,0,0.08)",
  },
  title: { fontSize:28, fontWeight:700, color:"#111827", margin:"0 0 6px" },
  subtitle: { fontSize:15, color:"#6b7280", margin:"0 0 28px" },
  errorBox: {
    backgroundColor:"#fef2f2", border:"1px solid #fecaca",
    color:"#dc2626", borderRadius:8, padding:"12px 16px",
    fontSize:14, marginBottom:20,
  },
  form: { display:"flex", flexDirection:"column", gap:18 },
  field: { display:"flex", flexDirection:"column", gap:6 },
  label: { fontSize:14, fontWeight:600, color:"#374151" },
  input: {
    padding:"12px 14px", borderRadius:8, border:"1.5px solid #d1d5db",
    fontSize:15, color:"#111827", backgroundColor:"#f9fafb",
    outline:"none", width:"100%",
  },
  btn: {
    backgroundColor:"#059669", color:"#fff", border:"none",
    borderRadius:8, padding:14, fontSize:16, fontWeight:600,
    cursor:"pointer", width:"100%", marginTop:4,
  },
  foot: { textAlign:"center", fontSize:14, color:"#6b7280", marginTop:24 },
  link: { color:"#059669", fontWeight:600, textDecoration:"none" },
};