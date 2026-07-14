import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";

const ROLES = [
  "Administrator",
  "Recycling Facility Operator",
  "Sustainability Manager",
  "Textile Manufacturer",
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name:"", email:"", password:"", confirmPassword:"", role:"",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name || !form.email || !form.password || !form.role) {
      setError("All fields are required."); return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters."); return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match."); return;
    }
    setLoading(true);
    try {
      await registerUser({
        full_name: form.full_name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      setSuccess("Account created! Redirecting to login...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err?.response?.data?.detail || "Registration failed.");
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
            Join the platform and start managing textile waste intelligently
          </p>
          <div style={S.roles}>
            {ROLES.map((r) => (
              <div key={r} style={S.roleChip}>{r}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={S.right}>
        <div style={S.card}>
          <h2 style={S.title}>Create Account</h2>
          <p style={S.subtitle}>Join the platform today</p>

          {error && <div style={S.errorBox}>{error}</div>}
          {success && <div style={S.successBox}>{success}</div>}

          <form onSubmit={handleSubmit} style={S.form}>
            {[
              { label:"Full Name", name:"full_name", type:"text", placeholder:"Your full name" },
              { label:"Email Address", name:"email", type:"email", placeholder:"you@example.com" },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name} style={S.field}>
                <label style={S.label}>{label}</label>
                <input
                  type={type} name={name} value={form[name]}
                  onChange={handleChange} placeholder={placeholder}
                  style={S.input} required
                />
              </div>
            ))}

            <div style={S.field}>
              <label style={S.label}>Role</label>
              <select name="role" value={form.role}
                onChange={handleChange} style={S.input} required>
                <option value="">Select your role</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {[
              { label:"Password", name:"password", placeholder:"Minimum 8 characters" },
              { label:"Confirm Password", name:"confirmPassword", placeholder:"Re-enter password" },
            ].map(({ label, name, placeholder }) => (
              <div key={name} style={S.field}>
                <label style={S.label}>{label}</label>
                <input
                  type="password" name={name} value={form[name]}
                  onChange={handleChange} placeholder={placeholder}
                  style={S.input} required
                />
              </div>
            ))}

            <button type="submit" style={S.btn} disabled={loading}>
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <p style={S.foot}>
            Already have an account?{" "}
            <Link to="/login" style={S.link}>Sign In</Link>
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
  brand: { color:"#fff", maxWidth:380 },
  brandIcon: { fontSize:56 },
  brandName: { fontSize:32, fontWeight:800, margin:"16px 0 8px" },
  brandDesc: { fontSize:16, opacity:0.85, lineHeight:1.6, marginBottom:32 },
  roles: { display:"flex", flexDirection:"column", gap:10 },
  roleChip: {
    backgroundColor:"rgba(255,255,255,0.15)", borderRadius:8,
    padding:"10px 16px", fontSize:14, fontWeight:500,
  },
  right: {
    flex:1, backgroundColor:"#f0fdf4",
    display:"flex", alignItems:"center", justifyContent:"center", padding:"48px 24px",
  },
  card: {
    backgroundColor:"#fff", borderRadius:20, padding:"40px",
    width:"100%", maxWidth:440, boxShadow:"0 8px 40px rgba(0,0,0,0.08)",
  },
  title: { fontSize:26, fontWeight:700, color:"#111827", margin:"0 0 6px" },
  subtitle: { fontSize:15, color:"#6b7280", margin:"0 0 24px" },
  errorBox: {
    backgroundColor:"#fef2f2", border:"1px solid #fecaca",
    color:"#dc2626", borderRadius:8, padding:"12px 16px",
    fontSize:14, marginBottom:16,
  },
  successBox: {
    backgroundColor:"#f0fdf4", border:"1px solid #bbf7d0",
    color:"#059669", borderRadius:8, padding:"12px 16px",
    fontSize:14, marginBottom:16,
  },
  form: { display:"flex", flexDirection:"column", gap:14 },
  field: { display:"flex", flexDirection:"column", gap:5 },
  label: { fontSize:14, fontWeight:600, color:"#374151" },
  input: {
    padding:"11px 14px", borderRadius:8, border:"1.5px solid #d1d5db",
    fontSize:15, color:"#111827", backgroundColor:"#f9fafb",
    outline:"none", width:"100%",
  },
  btn: {
    backgroundColor:"#059669", color:"#fff", border:"none",
    borderRadius:8, padding:13, fontSize:16, fontWeight:600,
    cursor:"pointer", width:"100%", marginTop:4,
  },
  foot: { textAlign:"center", fontSize:14, color:"#6b7280", marginTop:20 },
  link: { color:"#059669", fontWeight:600, textDecoration:"none" },
};