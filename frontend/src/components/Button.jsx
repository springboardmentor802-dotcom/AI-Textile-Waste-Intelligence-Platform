import React from "react";

const VARIANTS = {
  primary: {
    backgroundColor: "#1d4ed8",
    color: "#fff",
    border: "none",
  },
  secondary: {
    backgroundColor: "#f3f4f6",
    color: "#374151",
    border: "1px solid #e5e7eb",
  },
  danger: {
    backgroundColor: "#dc2626",
    color: "#fff",
    border: "none",
  },
  success: {
    backgroundColor: "#16a34a",
    color: "#fff",
    border: "none",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "#6b7280",
    border: "1px solid #e5e7eb",
  },
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  type = "button",
  style = {},
  icon: Icon,
}) {
  const variantStyle = VARIANTS[variant] || VARIANTS.primary;
  const padding = size === "sm" ? "6px 12px" : size === "lg" ? "12px 24px" : "9px 18px";
  const fontSize = size === "sm" ? 12 : size === "lg" ? 15 : 13;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        ...variantStyle,
        padding,
        fontSize,
        fontWeight: 600,
        borderRadius: 7,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        transition: "opacity 0.15s",
        fontFamily: "inherit",
        ...style,
      }}
    >
      {Icon && <Icon size={fontSize + 2} />}
      {children}
    </button>
  );
}