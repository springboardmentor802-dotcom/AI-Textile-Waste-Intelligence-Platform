import React from "react";
import { FiX } from "react-icons/fi";
import Button from "./Button";

export default function Modal({ open, title, onClose, children, width = 520 }) {
  if (!open) return null;
  return (
    <div style={S.overlay} onClick={onClose}>
      <div
        style={{ ...S.modal, maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={S.header}>
          <h3 style={S.title}>{title}</h3>
          <button style={S.closeBtn} onClick={onClose}>
            <FiX size={18} />
          </button>
        </div>
        <div style={S.body}>{children}</div>
      </div>
    </div>
  );
}

export function ConfirmModal({ open, title, message, onConfirm, onCancel, danger = false, loading }) {
  if (!open) return null;
  return (
    <div style={S.overlay}>
      <div style={{ ...S.modal, maxWidth: 420 }}>
        <div style={S.header}>
          <h3 style={S.title}>{title}</h3>
        </div>
        <div style={S.body}>
          <p style={S.confirmMsg}>{message}</p>
          <div style={S.confirmActions}>
            <Button variant="ghost" onClick={onCancel} disabled={loading}>Cancel</Button>
            <Button
              variant={danger ? "danger" : "primary"}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Processing..." : "Confirm"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

const S = {
  overlay: {
    position: "fixed", inset: 0,
    backgroundColor: "rgba(0,0,0,0.45)",
    display: "flex", alignItems: "center",
    justifyContent: "center", zIndex: 1000, padding: 16,
  },
  modal: {
    backgroundColor: "#fff", borderRadius: 12,
    width: "100%", boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
    overflow: "hidden",
  },
  header: {
    display: "flex", justifyContent: "space-between",
    alignItems: "center", padding: "18px 24px",
    borderBottom: "1px solid #f3f4f6",
  },
  title: { fontSize: 16, fontWeight: 700, color: "#111827", margin: 0 },
  closeBtn: {
    background: "none", border: "none",
    cursor: "pointer", color: "#6b7280",
    display: "flex", padding: 4,
  },
  body: { padding: "24px" },
  confirmMsg: { fontSize: 14, color: "#4b5563", lineHeight: 1.6, margin: "0 0 24px" },
  confirmActions: { display: "flex", gap: 10, justifyContent: "flex-end" },
};