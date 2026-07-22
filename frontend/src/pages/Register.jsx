import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { FiUser, FiMail, FiLock, FiAlertCircle, FiCheckCircle } from "react-icons/fi";

const ROLES = [
  "Administrator",
  "Recycling Facility Operator",
  "Sustainability Manager",
  "Textile Manufacturer",
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "", email: "", password: "",
    confirmPassword: "", role: "",
  });
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const err = {};
    if (!form.full_name.trim()) err.full_name = "Full name is required.";
    if (!form.email.trim()) err.email = "Email is required.";
    if (!form.role) err.role = "Please select a role.";
    if (!form.password) err.password = "Password is required.";
    else if (form.password.length < 8) err.password = "Must be at least 8 characters.";
    if (form.password !== form.confirmPassword)
      err.confirmPassword = "Passwords do not match.";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) { setErrors(err); return; }
    setLoading(true);
    try {
      await registerUser({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        password: form.password,
        role: form.role,
      });
      setSuccess("Account created successfully. Redirecting to login...");
      setTimeout(() => navigate("/login"), 2200);
    } catch (err) {
      const msg = err?.response?.data?.detail || "Registration failed.";
      setErrors({ submit: typeof msg === "string" ? msg : JSON.stringify(msg) });
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
          <p style={S.brandDesc}>Create your account to access the platform</p>
          <div style={S.roleList}>
            <div style={S.roleListTitle}>Available Roles</div>
            {ROLES.map((r) => (
              <div key={r} style={S.roleItem}>{r}</div>
            ))}
          </div>
        </div>
      </div>

      <div style={S.right}>
        <div style={S.card}>
          <div style={S.cardHeader}>
            <h2 style={S.cardTitle}>Create Account</h2>
            <p style={S.cardSubtitle}>Fill in the details to get started</p>
          </div>

          {errors.submit && (
            <div style={S.errorBox}>
              <FiAlertCircle size={15} />
              <span>{errors.submit}</span>
            </div>
          )}

          {success && (
            <div style={S.successBox}>
              <FiCheckCircle size={15} />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={S.form}>
            <div style={S.field}>
              <label style={S.label}>Full Name <span style={S.req}>*</span></label>
              <div style={S.inputWrap}>
                <FiUser size={14} style={S.icon} />
                <input
                  name="full_name" type="text"
                  value={form.full_name} onChange={handleChange}
                  placeholder="Your full name"
                  style={{ ...S.input, borderColor: errors.full_name ? "#dc2626" : "#d1d5db" }}
                />
              </div>
              {errors.full_name && <span style={S.err}>{errors.full_name}</span>}
            </div>

            <div style={S.field}>
              <label style={S.label}>Email Address <span style={S.req}>*</span></label>
              <div style={S.inputWrap}>
                <FiMail size={14} style={S.icon} />
                <input
                  name="email" type="email"
                  value={form.email} onChange={handleChange}
                  placeholder="you@example.com"
                  style={{ ...S.input, borderColor: errors.email ? "#dc2626" : "#d1d5db" }}
                />
              </div>
              {errors.email && <span style={S.err}>{errors.email}</span>}
            </div>

            <div style={S.field}>
              <label style={S.label}>Role <span style={S.req}>*</span></label>
              <select
                name="role" value={form.role} onChange={handleChange}
                style={{ ...S.selectInput, borderColor: errors.role ? "#dc2626" : "#d1d5db" }}
              >
                <option value="">Select your role</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              {errors.role && <span style={S.err}>{errors.role}</span>}
            </div>

            <div style={S.field}>
              <label style={S.label}>Password <span style={S.req}>*</span></label>
              <div style={S.inputWrap}>
                <FiLock size={14} style={S.icon} />
                <input
                  name="password" type="password"
                  value={form.password} onChange={handleChange}
                  placeholder="Minimum 8 characters"
                  style={{ ...S.input, borderColor: errors.password ? "#dc2626" : "#d1d5db" }}
                />
              </div>
              {errors.password && <span style={S.err}>{errors.password}</span>}
            </div>

            <div style={S.field}>
              <label style={S.label}>Confirm Password <span style={S.req}>*</span></label>
              <div style={S.inputWrap}>
                <FiLock size={14} style={S.icon} />
                <input
                  name="confirmPassword" type="password"
                  value={form.confirmPassword} onChange={handleChange}
                  placeholder="Re-enter password"
                  style={{ ...S.input, borderColor: errors.confirmPassword ? "#dc2626" : "#d1d5db" }}
                />
              </div>
              {errors.confirmPassword && <span style={S.err}>{errors.confirmPassword}</span>}
            </div>

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
  page: { display: "flex", minHeight: "100vh", fontFamily: "'Inter','Segoe UI',sans-serif" },
  left: {
    flex: 1,
    background: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 100%)",
    display: "flex", alignItems: "center",
    justifyContent: "center", padding: 48,
  },
  brand: { color: "#fff", maxWidth: 360 },
  brandMark: {
    width: 44, height: 44, borderRadius: 10,
    backgroundColor: "#1d4ed8", display: "flex",
    alignItems: "center", justifyContent: "center",
    fontSize: 14, fontWeight: 800, color: "#fff",
    marginBottom: 20, letterSpacing: "0.5px",
  },
  brandName: { fontSize: 26, fontWeight: 800, margin: "0 0 10px", color: "#f1f5f9" },
  brandDesc: { fontSize: 15, opacity: 0.75, lineHeight: 1.6, marginBottom: 28, color: "#cbd5e1" },
  roleListTitle: { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#64748b", marginBottom: 10 },
  roleList: { display: "flex", flexDirection: "column", gap: 8 },
  roleItem: {
    fontSize: 13, color: "#cbd5e1",
    padding: "8px 12px",
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 6, borderLeft: "2px solid #3b82f6",
  },
  right: {
    flex: 1, backgroundColor: "#f8fafc",
    display: "flex", alignItems: "center",
    justifyContent: "center", padding: "48px 24px",
    overflowY: "auto",
  },
  card: {
    backgroundColor: "#fff", borderRadius: 12,
    padding: "36px 40px", width: "100%", maxWidth: 440,
    boxShadow: "0 4px 24px rgba(0,0,0,0.07)",
    border: "1px solid #f1f5f9",
  },
  cardHeader: { marginBottom: 24 },
  cardTitle: { fontSize: 22, fontWeight: 700, color: "#111827", margin: "0 0 6px" },
  cardSubtitle: { fontSize: 14, color: "#6b7280", margin: 0 },
  errorBox: {
    display: "flex", alignItems: "center", gap: 8,
    backgroundColor: "#fef2f2", border: "1px solid #fca5a5",
    color: "#dc2626", borderRadius: 7, padding: "10px 14px",
    fontSize: 13, marginBottom: 16,
  },
  successBox: {
    display: "flex", alignItems: "center", gap: 8,
    backgroundColor: "#f0fdf4", border: "1px solid #86efac",
    color: "#16a34a", borderRadius: 7, padding: "10px 14px",
    fontSize: 13, marginBottom: 16,
  },
  form: { display: "flex", flexDirection: "column", gap: 14 },
  field: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  req: { color: "#dc2626" },
  inputWrap: { position: "relative" },
  icon: {
    position: "absolute", left: 10,
    top: "50%", transform: "translateY(-50%)",
    color: "#9ca3af", pointerEvents: "none",
  },
  input: {
    width: "100%", padding: "9px 12px 9px 32px",
    borderRadius: 7, border: "1.5px solid #d1d5db",
    fontSize: 14, color: "#111827", outline: "none",
    fontFamily: "inherit", boxSizing: "border-box", backgroundColor: "#fafafa",
  },
  selectInput: {
    width: "100%", padding: "9px 12px",
    borderRadius: 7, border: "1.5px solid #d1d5db",
    fontSize: 14, color: "#111827", outline: "none",
    fontFamily: "inherit", boxSizing: "border-box",
    backgroundColor: "#fafafa",
  },
  err: { fontSize: 11, color: "#dc2626" },
  btn: {
    backgroundColor: "#1d4ed8", color: "#fff",
    border: "none", borderRadius: 7, padding: "11px",
    fontSize: 14, fontWeight: 600, cursor: "pointer",
    width: "100%", marginTop: 4, fontFamily: "inherit",
  },
  foot: { textAlign: "center", fontSize: 13, color: "#6b7280", marginTop: 22 },
  link: { color: "#1d4ed8", fontWeight: 600, textDecoration: "none" },
};