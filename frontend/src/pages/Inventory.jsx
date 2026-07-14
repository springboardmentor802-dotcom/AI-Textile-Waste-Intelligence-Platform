import React, { useState, useEffect, useCallback } from "react";
import {
  getAllBatches,
  createBatch,
  updateBatch,
  deleteBatch,
} from "../services/textileService";

const FABRIC_TYPES = [
  "Cotton", "Polyester", "Wool", "Silk",
  "Linen", "Denim", "Nylon", "Rayon", "Acrylic", "Mixed Fabrics",
];
const CONDITIONS = ["Good", "Fair", "Poor"];

const EMPTY_FORM = {
  batch_id: "", fabric_type: "", source: "",
  quantity: "", color: "", condition: "", collection_date: "",
};

export default function Inventory() {
  const [batches, setBatches] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [formError, setFormError] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllBatches(search);
      setBatches(data.items);
      setTotal(data.total);
    } catch {
      showToast("Failed to load inventory.", "error");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(fetchBatches, 300);
    return () => clearTimeout(timer);
  }, [fetchBatches]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setShowForm(true);
  };

  const openEdit = (batch) => {
    setEditTarget(batch.batch_id);
    setForm({
      batch_id: batch.batch_id,
      fabric_type: batch.fabric_type,
      source: batch.source,
      quantity: String(batch.quantity),
      color: batch.color,
      condition: batch.condition,
      collection_date: batch.collection_date,
    });
    setFormError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormError("");
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!form.batch_id || !form.fabric_type || !form.source ||
        !form.quantity || !form.color || !form.condition || !form.collection_date) {
      setFormError("All fields are required.");
      return;
    }
    if (parseFloat(form.quantity) <= 0) {
      setFormError("Quantity must be greater than 0.");
      return;
    }
    setFormLoading(true);
    try {
      const payload = { ...form, quantity: parseFloat(form.quantity) };
      if (editTarget) {
        const { batch_id, ...updatePayload } = payload;
        await updateBatch(editTarget, updatePayload);
        showToast("Batch updated successfully.");
      } else {
        await createBatch(payload);
        showToast("Batch added successfully.");
      }
      closeForm();
      fetchBatches();
    } catch (err) {
      const msg = err?.response?.data?.detail || "Operation failed.";
      setFormError(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteBatch(deleteTarget);
      showToast("Batch deleted successfully.");
      setDeleteTarget(null);
      fetchBatches();
    } catch {
      showToast("Failed to delete batch.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const conditionColor = (c) => ({
    Good: "#059669", Fair: "#d97706", Poor: "#dc2626"
  }[c] || "#6b7280");

  const mlBadge = (status) => ({
    pending: { bg:"#fef3c7", color:"#d97706", label:"Pending ML" },
    completed: { bg:"#d1fae5", color:"#059669", label:"ML Done" },
  }[status] || { bg:"#f3f4f6", color:"#6b7280", label: status || "—" });

  return (
    <div style={S.page}>
      {/* Toast */}
      {toast && (
        <div style={{
          ...S.toast,
          backgroundColor: toast.type === "error" ? "#fef2f2" : "#f0fdf4",
          border: `1px solid ${toast.type === "error" ? "#fecaca" : "#bbf7d0"}`,
          color: toast.type === "error" ? "#dc2626" : "#059669",
        }}>
          {toast.type === "error" ? "❌" : "✅"} {toast.message}
        </div>
      )}

      {/* Header */}
      <div style={S.header}>
        <div>
          <h2 style={S.title}>Textile Inventory</h2>
          <p style={S.subtitle}>{total} total batch{total !== 1 ? "es" : ""}</p>
        </div>
        <button style={S.addBtn} onClick={openAdd}>+ Add Batch</button>
      </div>

      {/* Search */}
      <div style={S.searchBar}>
        <input
          type="text"
          placeholder="Search by Batch ID, Source, or Color..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={S.searchInput}
        />
      </div>

      {/* Table */}
      <div style={S.tableWrap}>
        {loading ? (
          <div style={S.loadingBox}>Loading inventory...</div>
        ) : batches.length === 0 ? (
          <div style={S.emptyBox}>
            <div style={S.emptyIcon}>📦</div>
            <p>No batches found. Add your first textile batch.</p>
          </div>
        ) : (
          <table style={S.table}>
            <thead>
              <tr style={S.thead}>
                {["Batch ID","Fabric Type","Source","Qty (kg)",
                  "Color","Condition","Collection Date","ML Status","Actions"
                ].map((h) => (
                  <th key={h} style={S.th}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {batches.map((b, i) => {
                const ml = mlBadge(b.ml_analyzed);
                return (
                  <tr key={b.batch_id} style={{
                    ...S.tr,
                    backgroundColor: i % 2 === 0 ? "#fff" : "#f9fafb"
                  }}>
                    <td style={{ ...S.td, fontWeight:700, color:"#065f46" }}>{b.batch_id}</td>
                    <td style={S.td}>{b.fabric_type}</td>
                    <td style={S.td}>{b.source}</td>
                    <td style={S.td}>{b.quantity}</td>
                    <td style={S.td}>
                      <div style={S.colorCell}>
                        <div style={{
                          ...S.colorDot,
                          backgroundColor: b.color.toLowerCase(),
                          border: "1px solid #e5e7eb"
                        }} />
                        {b.color}
                      </div>
                    </td>
                    <td style={S.td}>
                      <span style={{
                        ...S.condBadge,
                        color: conditionColor(b.condition),
                        backgroundColor: `${conditionColor(b.condition)}18`,
                      }}>
                        {b.condition}
                      </span>
                    </td>
                    <td style={S.td}>{b.collection_date}</td>
                    <td style={S.td}>
                      <span style={{ ...S.mlBadge, backgroundColor: ml.bg, color: ml.color }}>
                        {ml.label}
                      </span>
                    </td>
                    <td style={S.td}>
                      <div style={S.actions}>
                        <button style={S.editBtn} onClick={() => openEdit(b)}>Edit</button>
                        <button style={S.deleteBtn} onClick={() => setDeleteTarget(b.batch_id)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showForm && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={S.modalHeader}>
              <h3 style={S.modalTitle}>
                {editTarget ? "Edit Batch" : "Add New Batch"}
              </h3>
              <button style={S.closeBtn} onClick={closeForm}>✕</button>
            </div>

            {formError && <div style={S.formError}>{formError}</div>}

            <form onSubmit={handleFormSubmit} style={S.form}>
              <div style={S.formGrid}>
                <div style={S.field}>
                  <label style={S.label}>Batch ID *</label>
                  <input
                    name="batch_id"
                    value={form.batch_id}
                    onChange={handleFormChange}
                    placeholder="e.g. WB-001"
                    style={S.input}
                    disabled={!!editTarget}
                    required
                  />
                </div>

                <div style={S.field}>
                  <label style={S.label}>Fabric Type *</label>
                  <select
                    name="fabric_type"
                    value={form.fabric_type}
                    onChange={handleFormChange}
                    style={S.input}
                    required
                  >
                    <option value="">Select fabric type</option>
                    {FABRIC_TYPES.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div style={S.field}>
                  <label style={S.label}>Source *</label>
                  <input
                    name="source"
                    value={form.source}
                    onChange={handleFormChange}
                    placeholder="e.g. Factory A"
                    style={S.input}
                    required
                  />
                </div>

                <div style={S.field}>
                  <label style={S.label}>Quantity (kg) *</label>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleFormChange}
                    placeholder="e.g. 12.5"
                    style={S.input}
                    min="0.01"
                    step="0.01"
                    required
                  />
                </div>

                <div style={S.field}>
                  <label style={S.label}>Color *</label>
                  <input
                    name="color"
                    value={form.color}
                    onChange={handleFormChange}
                    placeholder="e.g. Blue"
                    style={S.input}
                    required
                  />
                </div>

                <div style={S.field}>
                  <label style={S.label}>Condition *</label>
                  <select
                    name="condition"
                    value={form.condition}
                    onChange={handleFormChange}
                    style={S.input}
                    required
                  >
                    <option value="">Select condition</option>
                    {CONDITIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div style={{ ...S.field, gridColumn:"1 / -1" }}>
                  <label style={S.label}>Collection Date *</label>
                  <input
                    type="date"
                    name="collection_date"
                    value={form.collection_date}
                    onChange={handleFormChange}
                    style={S.input}
                    required
                  />
                </div>
              </div>

              <div style={S.modalActions}>
                <button type="button" style={S.cancelBtn} onClick={closeForm}>
                  Cancel
                </button>
                <button type="submit" style={S.submitBtn} disabled={formLoading}>
                  {formLoading
                    ? editTarget ? "Saving..." : "Adding..."
                    : editTarget ? "Save Changes" : "Add Batch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div style={S.overlay}>
          <div style={S.confirmModal}>
            <div style={S.confirmIcon}>⚠️</div>
            <h3 style={S.confirmTitle}>Delete Batch</h3>
            <p style={S.confirmMsg}>
              Are you sure you want to delete batch{" "}
              <strong>{deleteTarget}</strong>? This action cannot be undone.
            </p>
            <div style={S.modalActions}>
              <button
                style={S.cancelBtn}
                onClick={() => setDeleteTarget(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                style={S.dangerBtn}
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const S = {
  page: {
    padding: "0",
    fontFamily: "'Segoe UI', sans-serif",
    position: "relative",
  },
  toast: {
    position: "fixed", top: 20, right: 24, zIndex: 9999,
    padding: "14px 20px", borderRadius: 10,
    fontSize: 14, fontWeight: 600,
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    minWidth: 280,
  },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "flex-start", marginBottom: 20,
  },
  title: { fontSize: 22, fontWeight: 700, color: "#111827", margin: 0 },
  subtitle: { fontSize: 13, color: "#6b7280", margin: "4px 0 0" },
  addBtn: {
    backgroundColor: "#059669", color: "#fff", border: "none",
    borderRadius: 8, padding: "10px 20px", fontSize: 14,
    fontWeight: 600, cursor: "pointer",
  },
  searchBar: { marginBottom: 16 },
  searchInput: {
    width: "100%", padding: "11px 16px", borderRadius: 8,
    border: "1.5px solid #d1d5db", fontSize: 14,
    backgroundColor: "#fff", outline: "none",
    boxSizing: "border-box",
  },
  tableWrap: {
    backgroundColor: "#fff", borderRadius: 14,
    boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    overflow: "auto",
  },
  loadingBox: {
    padding: "60px 20px", textAlign: "center",
    color: "#6b7280", fontSize: 15,
  },
  emptyBox: {
    padding: "60px 20px", textAlign: "center",
    color: "#9ca3af", fontSize: 15,
    display: "flex", flexDirection: "column",
    alignItems: "center", gap: 12,
  },
  emptyIcon: { fontSize: 48 },
  table: { width: "100%", borderCollapse: "collapse", minWidth: 900 },
  thead: { backgroundColor: "#f9fafb" },
  th: {
    padding: "13px 16px", textAlign: "left",
    fontSize: 12, fontWeight: 700, color: "#6b7280",
    textTransform: "uppercase", letterSpacing: "0.5px",
    borderBottom: "1px solid #f3f4f6", whiteSpace: "nowrap",
  },
  tr: { borderBottom: "1px solid #f3f4f6", transition: "background 0.1s" },
  td: { padding: "12px 16px", fontSize: 14, color: "#374151" },
  colorCell: { display: "flex", alignItems: "center", gap: 8 },
  colorDot: { width: 16, height: 16, borderRadius: "50%", flexShrink: 0 },
  condBadge: {
    padding: "3px 10px", borderRadius: 20,
    fontSize: 12, fontWeight: 600,
  },
  mlBadge: {
    padding: "3px 10px", borderRadius: 20,
    fontSize: 11, fontWeight: 600,
  },
  actions: { display: "flex", gap: 8 },
  editBtn: {
    backgroundColor: "#eff6ff", color: "#2563eb",
    border: "none", borderRadius: 6,
    padding: "6px 12px", fontSize: 12,
    fontWeight: 600, cursor: "pointer",
  },
  deleteBtn: {
    backgroundColor: "#fef2f2", color: "#dc2626",
    border: "none", borderRadius: 6,
    padding: "6px 12px", fontSize: 12,
    fontWeight: 600, cursor: "pointer",
  },
  overlay: {
    position: "fixed", inset: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 1000,
    padding: 16,
  },
  modal: {
    backgroundColor: "#fff", borderRadius: 16,
    padding: "32px", width: "100%",
    maxWidth: 600, maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  modalHeader: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", marginBottom: 24,
  },
  modalTitle: { fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 },
  closeBtn: {
    background: "none", border: "none",
    fontSize: 20, cursor: "pointer", color: "#6b7280",
  },
  formError: {
    backgroundColor: "#fef2f2", border: "1px solid #fecaca",
    color: "#dc2626", borderRadius: 8,
    padding: "10px 14px", fontSize: 13,
    marginBottom: 16,
  },
  form: {},
  formGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16,
    marginBottom: 24,
  },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  input: {
    padding: "10px 12px", borderRadius: 8,
    border: "1.5px solid #d1d5db", fontSize: 14,
    color: "#111827", backgroundColor: "#f9fafb",
    outline: "none", width: "100%",
  },
  modalActions: { display: "flex", gap: 12, justifyContent: "flex-end" },
  cancelBtn: {
    backgroundColor: "#f3f4f6", color: "#374151",
    border: "none", borderRadius: 8,
    padding: "10px 20px", fontSize: 14,
    fontWeight: 600, cursor: "pointer",
  },
  submitBtn: {
    backgroundColor: "#059669", color: "#fff",
    border: "none", borderRadius: 8,
    padding: "10px 24px", fontSize: 14,
    fontWeight: 600, cursor: "pointer",
  },
  confirmModal: {
    backgroundColor: "#fff", borderRadius: 16,
    padding: "40px 32px", width: "100%",
    maxWidth: 420, textAlign: "center",
    boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
  },
  confirmIcon: { fontSize: 48, marginBottom: 12 },
  confirmTitle: { fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 8px" },
  confirmMsg: { fontSize: 15, color: "#6b7280", margin: "0 0 28px", lineHeight: 1.6 },
  dangerBtn: {
    backgroundColor: "#dc2626", color: "#fff",
    border: "none", borderRadius: 8,
    padding: "10px 24px", fontSize: 14,
    fontWeight: 600, cursor: "pointer",
  },
};