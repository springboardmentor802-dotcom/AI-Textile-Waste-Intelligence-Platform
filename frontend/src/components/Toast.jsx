import React, { useEffect } from "react";
import { FiCheckCircle, FiXCircle, FiX } from "react-icons/fi";

export default function Toast({ message, type = "success", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  const config = {
    success: { bg: "#f0fdf4", border: "#86efac", color: "#16a34a", Icon: FiCheckCircle },
    error: { bg: "#fef2f2", border: "#fca5a5", color: "#dc2626", Icon: FiXCircle },
  }[type] || { bg: "#f0fdf4", border: "#86efac", color: "#16a34a", Icon: FiCheckCircle };

  return (
    <div style={{
      ...S.toast,
      backgroundColor: config.bg,
      border: `1px solid ${config.border}`,
      color: config.color,
    }}>
      <config.Icon size={16} />
      <span style={S.msg}>{message}</span>
      <button style={{ ...S.close, color: config.color }} onClick={onClose}>
        <FiX size={14} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onClose }) {
  return (
    <div style={S.container}>
      {toasts.map((t) => (
        <Toast key={t.id} {...t} onClose={() => onClose(t.id)} />
      ))}
    </div>
  );
}

export function useToast() {
  const [toasts, setToasts] = React.useState([]);
  const add = (message, type = "success") => {
    const id = Date.now();
    setToasts((p) => [...p, { id, message, type }]);
  };
  const remove = (id) => setToasts((p) => p.filter((t) => t.id !== id));
  return { toasts, add, remove };
}

const S = {
  container: {
    position: "fixed", top: 20, right: 24,
    zIndex: 9999, display: "flex",
    flexDirection: "column", gap: 8,
  },
  toast: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "12px 16px", borderRadius: 8,
    fontSize: 13, fontWeight: 500,
    boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
    minWidth: 280, maxWidth: 400,
  },
  msg: { flex: 1 },
  close: {
    background: "none", border: "none",
    cursor: "pointer", padding: 2,
    display: "flex", alignItems: "center",
  },
};