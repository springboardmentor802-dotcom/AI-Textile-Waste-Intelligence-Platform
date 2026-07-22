import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { updateMyProfile } from "../services/userService";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import { ToastContainer, useToast } from "../components/Toast";
import PageHeader from "../components/PageHeader";
import { FiEdit2, FiSave, FiX } from "react-icons/fi";
import { ROLE_CONFIG } from "../styles/theme";

export default function Profile() {
  const { user, token } = useAuth();
  const { toasts, add, remove } = useToast();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ full_name: "" });
  const [loading, setLoading] = useState(false);
  const cfg = ROLE_CONFIG[user?.role] || {};

  useEffect(() => {
    if (user) setForm({ full_name: user.full_name || "" });
  }, [user]);

  const handleSave = async () => {
    if (!form.full_name.trim()) {
      add("Name cannot be empty.", "error");
      return;
    }
    setLoading(true);
    try {
      await updateMyProfile({ full_name: form.full_name.trim() });
      add("Profile updated successfully.");
      setEditing(false);
    } catch (err) {
      add(err?.response?.data?.detail || "Update failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <ToastContainer toasts={toasts} onClose={remove} />
      <PageHeader title="My Profile" subtitle="View and manage your account details" />

      <div style={S.layout}>
        <Card style={S.leftCard} padding="32px">
          <div style={{ ...S.avatarLarge, backgroundColor: cfg.color || "#1d4ed8" }}>
            {user?.full_name?.charAt(0)?.toUpperCase()}
          </div>
          <div style={S.profileName}>{user?.full_name}</div>
          <div style={S.profileEmail}>{user?.email}</div>
          <div style={{
            ...S.roleBadge,
            backgroundColor: cfg.badge || "#dbeafe",
            color: cfg.color || "#1d4ed8",
          }}>
            {user?.role}
          </div>
          <div style={S.statusRow}>
            <span style={S.statusDot} />
            <span style={S.statusText}>Active Account</span>
          </div>
        </Card>

        <Card style={{ flex: 1 }} padding="32px">
          <div style={S.cardHeader}>
            <h3 style={S.sectionTitle}>Account Information</h3>
            {!editing ? (
              <Button icon={FiEdit2} variant="secondary" size="sm" onClick={() => setEditing(true)}>
                Edit
              </Button>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <Button icon={FiX} variant="ghost" size="sm" onClick={() => { setEditing(false); setForm({ full_name: user?.full_name || "" }); }}>
                  Cancel
                </Button>
                <Button icon={FiSave} size="sm" onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            )}
          </div>

          <div style={S.fields}>
            <div style={S.fieldRow}>
              <div style={S.fieldLabel}>Full Name</div>
              {editing ? (
                <Input
                  name="full_name"
                  value={form.full_name}
                  onChange={(e) => setForm({ full_name: e.target.value })}
                  placeholder="Your full name"
                />
              ) : (
                <div style={S.fieldValue}>{user?.full_name}</div>
              )}
            </div>
            <div style={S.fieldRow}>
              <div style={S.fieldLabel}>Email Address</div>
              <div style={S.fieldValue}>{user?.email}</div>
            </div>
            <div style={S.fieldRow}>
              <div style={S.fieldLabel}>Role</div>
              <div style={S.fieldValue}>{user?.role}</div>
            </div>
            <div style={S.fieldRow}>
              <div style={S.fieldLabel}>Account ID</div>
              <div style={S.fieldValue}>#{user?.id}</div>
            </div>
            <div style={S.fieldRow}>
              <div style={S.fieldLabel}>Account Status</div>
              <div style={{ ...S.fieldValue, color: "#16a34a", fontWeight: 600 }}>Active</div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}

const S = {
  layout: { display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" },
  leftCard: { width: 260, flexShrink: 0, textAlign: "center" },
  avatarLarge: {
    width: 80, height: 80, borderRadius: "50%",
    display: "flex", alignItems: "center", justifyContent: "center",
    color: "#fff", fontSize: 32, fontWeight: 700, margin: "0 auto 16px",
  },
  profileName: { fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 4 },
  profileEmail: { fontSize: 13, color: "#6b7280", marginBottom: 12 },
  roleBadge: {
    display: "inline-block", padding: "4px 12px",
    borderRadius: 999, fontSize: 12, fontWeight: 600, marginBottom: 12,
  },
  statusRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: "50%", backgroundColor: "#16a34a" },
  statusText: { fontSize: 12, color: "#16a34a", fontWeight: 500 },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: 700, color: "#111827", margin: 0 },
  fields: { display: "flex", flexDirection: "column", gap: 0 },
  fieldRow: {
    display: "flex", alignItems: "center", gap: 24,
    padding: "14px 0", borderBottom: "1px solid #f3f4f6",
  },
  fieldLabel: { fontSize: 13, color: "#6b7280", fontWeight: 500, width: 140, flexShrink: 0 },
  fieldValue: { fontSize: 14, color: "#111827", fontWeight: 500 },
};