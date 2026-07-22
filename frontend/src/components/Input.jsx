import React from "react";

export default function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
  disabled,
  error,
  hint,
}) {
  return (
    <div style={S.group}>
      {label && (
        <label style={S.label}>
          {label}
          {required && <span style={S.required}> *</span>}
        </label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={{
          ...S.input,
          borderColor: error ? "#dc2626" : "#d1d5db",
          backgroundColor: disabled ? "#f9fafb" : "#fff",
        }}
      />
      {error && <div style={S.error}>{error}</div>}
      {hint && !error && <div style={S.hint}>{hint}</div>}
    </div>
  );
}

export function Select({ label, name, value, onChange, required, disabled, children, error }) {
  return (
    <div style={S.group}>
      {label && (
        <label style={S.label}>
          {label}
          {required && <span style={S.required}> *</span>}
        </label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        style={{
          ...S.input,
          borderColor: error ? "#dc2626" : "#d1d5db",
          backgroundColor: disabled ? "#f9fafb" : "#fff",
        }}
      >
        {children}
      </select>
      {error && <div style={S.error}>{error}</div>}
    </div>
  );
}

const S = {
  group: { display: "flex", flexDirection: "column", gap: 5 },
  label: { fontSize: 13, fontWeight: 600, color: "#374151" },
  required: { color: "#dc2626" },
  input: {
    padding: "9px 12px",
    borderRadius: 7,
    border: "1.5px solid #d1d5db",
    fontSize: 14,
    color: "#111827",
    outline: "none",
    width: "100%",
    fontFamily: "inherit",
    boxSizing: "border-box",
  },
  error: { fontSize: 12, color: "#dc2626", marginTop: 2 },
  hint: { fontSize: 12, color: "#6b7280", marginTop: 2 },
};