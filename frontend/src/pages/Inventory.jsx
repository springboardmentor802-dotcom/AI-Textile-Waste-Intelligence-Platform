import React, { useState, useEffect, useCallback } from "react";
import {
  getAllBatches, createBatch, updateBatch, deleteBatch,
} from "../services/textileService";
import Table from "../components/Table";
import Button from "../components/Button";
import Input, { Select } from "../components/Input";
import { ToastContainer, useToast } from "../components/Toast";
import Modal, { ConfirmModal } from "../components/Modal";
import Badge from "../components/Badge";
import PageHeader from "../components/PageHeader";
import Card from "../components/Card";
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from "react-icons/fi";

const FABRIC_TYPES = [
  "Cotton", "Polyester", "Wool", "Silk",
  "Linen", "Denim", "Nylon", "Rayon", "Acrylic", "Mixed Fabrics",
];
const CONDITIONS = ["Good", "Fair", "Poor"];

const CONDITION_PRESET = { Good: "success", Fair: "warning", Poor: "danger" };

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
  const [formErrors, setFormErrors] = useState({});
  const [formLoading, setFormLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const { toasts, add, remove } = useToast();

  const fetchBatches = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllBatches(search);
      setBatches(data.items);
      setTotal(data.total);
    } catch {
      add("Failed to load inventory.", "error");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchBatches, 300);
    return () => clearTimeout(t);
  }, [fetchBatches]);

  const openAdd = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
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
    setFormErrors({});
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormErrors({ ...formErrors, [e.target.name]: "" });
  };

  const validate = () => {
    const err = {};
    if (!form.batch_id.trim()) err.batch_id = "Batch ID is required.";
    if (!form.fabric_type) err.fabric_type = "Fabric type is required.";
    if (!form.source.trim()) err.source = "Source is required.";
    if (!form.quantity || parseFloat(form.quantity) <= 0) err.quantity = "Quantity must be > 0.";
    if (!form.color.trim()) err.color = "Color is required.";
    if (!form.condition) err.condition = "Condition is required.";
    if (!form.collection_date) err.collection_date = "Collection date is required.";
    return err;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) { setFormErrors(err); return; }
    setFormLoading(true);
    try {
      const payload = { ...form, quantity: parseFloat(form.quantity) };
      if (editTarget) {
        const { batch_id, ...updatePayload } = payload;
        await updateBatch(editTarget, updatePayload);
        add("Batch updated successfully.");
      } else {
        await createBatch(payload);
        add("Batch created successfully.");
      }
      closeForm();
      fetchBatches();
    } catch (err) {
      const msg = err?.response?.data?.detail || "Operation failed.";
      add(msg, "error");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await deleteBatch(deleteTarget);
      add("Batch deleted.");
      setDeleteTarget(null);
      fetchBatches();
    } catch {
      add("Failed to delete batch.", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    { key: "batch_id", label: "Batch ID", render: (v) => <span style={{ fontWeight: 600, color: "#1d4ed8" }}>{v}</span> },
    { key: "fabric_type", label: "Fabric Type" },
    { key: "source", label: "Source" },
    { key: "quantity", label: "Qty (kg)", render: (v) => `${v} kg` },
    { key: "color", label: "Color" },
    {
      key: "condition", label: "Condition",
      render: (v) => <Badge label={v} preset={CONDITION_PRESET[v] || "gray"} />,
    },
    { key: "collection_date", label: "Date" },
    {
      key: "ml_analyzed", label: "ML Status",
      render: (v) => <Badge label={v === "pending" ? "Pending" : v || "—"} preset="gray" />,
    },
    {
      key: "_actions", label: "Actions",
      render: (_, row) => (
        <div style={{ display: "flex", gap: 6 }}>
          <Button size="sm" variant="ghost" icon={FiEdit2} onClick={() => openEdit(row)} />
          <Button size="sm" variant="danger" icon={FiTrash2} onClick={() => setDeleteTarget(row.batch_id)} />
        </div>
      ),
    },
  ];

  return (
    <>
      <ToastContainer toasts={toasts} onClose={remove} />

      <PageHeader
        title="Textile Inventory"
        subtitle={`${total} batch${total !== 1 ? "es" : ""} in inventory`}
        action={
          <Button icon={FiPlus} onClick={openAdd}>Add Batch</Button>
        }
      />

      <Card padding="14px 18px" style={{ marginBottom: 16 }}>
        <div style={S.searchRow}>
          <FiSearch size={14} color="#9ca3af" />
          <input
            style={S.searchInput}
            placeholder="Search by Batch ID, Source, or Color..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      <Table
        columns={columns}
        data={batches}
        loading={loading}
        emptyMessage="No batches found. Add your first textile batch."
      />

      {/* Add/Edit Modal */}
      <Modal
        open={showForm}
        title={editTarget ? "Edit Batch" : "Add New Batch"}
        onClose={closeForm}
        width={600}
      >
        <form onSubmit={handleSubmit}>
          <div style={S.formGrid}>
            <Input
              label="Batch ID"
              name="batch_id"
              value={form.batch_id}
              onChange={handleChange}
              placeholder="e.g. WB-001"
              disabled={!!editTarget}
              error={formErrors.batch_id}
              required
            />
            <Select
              label="Fabric Type"
              name="fabric_type"
              value={form.fabric_type}
              onChange={handleChange}
              error={formErrors.fabric_type}
              required
            >
              <option value="">Select fabric type</option>
              {FABRIC_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </Select>
            <Input
              label="Source"
              name="source"
              value={form.source}
              onChange={handleChange}
              placeholder="e.g. Factory A"
              error={formErrors.source}
              required
            />
            <Input
              label="Quantity (kg)"
              name="quantity"
              type="number"
              value={form.quantity}
              onChange={handleChange}
              placeholder="e.g. 12.5"
              error={formErrors.quantity}
              required
            />
            <Input
              label="Color"
              name="color"
              value={form.color}
              onChange={handleChange}
              placeholder="e.g. Blue"
              error={formErrors.color}
              required
            />
            <Select
              label="Condition"
              name="condition"
              value={form.condition}
              onChange={handleChange}
              error={formErrors.condition}
              required
            >
              <option value="">Select condition</option>
              {CONDITIONS.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <div style={{ gridColumn: "1 / -1" }}>
              <Input
                label="Collection Date"
                name="collection_date"
                type="date"
                value={form.collection_date}
                onChange={handleChange}
                error={formErrors.collection_date}
                required
              />
            </div>
          </div>
          <div style={S.formActions}>
            <Button type="button" variant="ghost" onClick={closeForm}>Cancel</Button>
            <Button type="submit" disabled={formLoading}>
              {formLoading ? (editTarget ? "Saving..." : "Adding...") : (editTarget ? "Save Changes" : "Add Batch")}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Batch"
        message={`Delete batch "${deleteTarget}"? This cannot be undone.`}
        danger
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </>
  );
}

const S = {
  searchRow: { display: "flex", alignItems: "center", gap: 8 },
  searchInput: { flex: 1, border: "none", outline: "none", fontSize: 14, color: "#374151", backgroundColor: "transparent", fontFamily: "inherit" },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 },
  formActions: { display: "flex", gap: 10, justifyContent: "flex-end", paddingTop: 8, borderTop: "1px solid #f3f4f6" },
};