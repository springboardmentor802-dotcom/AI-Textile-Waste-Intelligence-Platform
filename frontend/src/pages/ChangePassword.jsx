import React, { useState } from "react";
import { changeMyPassword } from "../services/userService";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import { ToastContainer, useToast } from "../components/Toast";
import PageHeader from "../components/PageHeader";
import { FiLock } from "react-icons/fi";

export default function ChangePassword() {
  const { toasts, add, remove } = useToast();
  const [form, setForm] = useState({
    current_password: "", new_password: "", confirm_password: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const err = {};
    if (!form.current_password) err.current_password = "Current password is required.";
    if (!form.new_password) err.new_password = "New password is required.";
    else if (form.new_password.length < 8) err.new_password = "Must be at least 8 characters.";
    if (!form.confirm_password) err.confirm_password = "Please confirm your new password.";
    else if (form.new_password !== form.confirm_password) err.confirm_password = "Passwords do not match.";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) { setErrors(err); return; }
    setLoading(true);
    try {
      await changeMyPassword({
        current_password: form.current_password,
        new_password: form.new_password,
      });
      add("Password changed successfully.");
      setForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      add(err?.response?.data?.detail || "Password change failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={remove} />
      <PageHeader title="Change Password" subtitle="Update your account password" />

      <div style={S.wrap}>
        <Card padding="32px">
          <div style={S.iconRow}>
            <div style={S.iconBox}><FiLock size={24} color="#1d4ed8" /></div>
            <div>
              <div style={S.label}>Password Security</div>
              <div style={S.hint}>Use a strong password with at least 8 characters.</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} style={S.form}>
            <Input
              label="Current Password"
              name="current_password"
              type="password"
              value={form.current_password}
              onChange={handleChange}
              placeholder="Enter your current password"
              error={errors.current_password}
              required
            />
            <Input
              label="New Password"
              name="new_password"
              type="password"
              value={form.new_password}
              onChange={handleChange}
              placeholder="Minimum 8 characters"
              error={errors.new_password}
              required
            />
            <Input
              label="Confirm New Password"
              name="confirm_password"
              type="password"
              value={form.confirm_password}
              onChange={handleChange}
              placeholder="Re-enter new password"
              error={errors.confirm_password}
              required
            />
            <div style={S.actions}>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </>
  );
}

const S = {
  wrap: { maxWidth: 520 },
  iconRow: {
    display: "flex", alignItems: "center", gap: 16,
    marginBottom: 28, padding: "16px",
    backgroundColor: "#dbeafe", borderRadius: 8,
  },
  iconBox: {
    width: 48, height: 48, borderRadius: 10,
    backgroundColor: "#fff", display: "flex",
    alignItems: "center", justifyContent: "center", flexShrink: 0,
  },
  label: { fontSize: 14, fontWeight: 600, color: "#1e3a8a" },
  hint: { fontSize: 13, color: "#3b82f6", marginTop: 2 },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  actions: { paddingTop: 8 },
};