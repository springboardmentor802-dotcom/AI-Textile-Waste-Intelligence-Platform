export const theme = {
  colors: {
    primary: "#1d4ed8",
    primaryDark: "#1e3a8a",
    primaryLight: "#dbeafe",
    success: "#16a34a",
    successLight: "#dcfce7",
    warning: "#d97706",
    warningLight: "#fef3c7",
    danger: "#dc2626",
    dangerLight: "#fee2e2",
    info: "#0891b2",
    infoLight: "#cffafe",
    gray50: "#f9fafb",
    gray100: "#f3f4f6",
    gray200: "#e5e7eb",
    gray300: "#d1d5db",
    gray400: "#9ca3af",
    gray500: "#6b7280",
    gray600: "#4b5563",
    gray700: "#374151",
    gray800: "#1f2937",
    gray900: "#111827",
    white: "#ffffff",
    sidebar: "#0f172a",
    sidebarHover: "#1e293b",
    sidebarActive: "#1d4ed8",
    sidebarText: "#94a3b8",
    sidebarTextActive: "#ffffff",
  },
  spacing: {
    xs: "4px", sm: "8px", md: "16px",
    lg: "24px", xl: "32px", xxl: "48px",
  },
  borderRadius: {
    sm: "4px", md: "8px", lg: "12px", xl: "16px", full: "9999px",
  },
  shadow: {
    sm: "0 1px 3px rgba(0,0,0,0.08)",
    md: "0 4px 12px rgba(0,0,0,0.08)",
    lg: "0 8px 24px rgba(0,0,0,0.10)",
  },
  font: {
    xs: "11px", sm: "12px", md: "14px",
    base: "15px", lg: "18px", xl: "22px", xxl: "28px",
  },
};

// Keys must exactly match the PostgreSQL enum values
// admin | textile_manufacturer | recycling_operator | sustainability_manager
export const ROLE_CONFIG = {
  "admin": {
    color: "#7c3aed",
    light: "#f5f3ff",
    badge: "#ede9fe",
    label: "Administrator",
    homePath: "/admin/home",
  },
  "recycling_operator": {
    color: "#16a34a",
    light: "#f0fdf4",
    badge: "#dcfce7",
    label: "Recycling Operator",
    homePath: "/operator/home",
  },
  "sustainability_manager": {
    color: "#0891b2",
    light: "#ecfeff",
    badge: "#cffafe",
    label: "Sustainability Mgr",
    homePath: "/sustainability/home",
  },
  "textile_manufacturer": {
    color: "#d97706",
    light: "#fffbeb",
    badge: "#fef3c7",
    label: "Manufacturer",
    homePath: "/manufacturer/home",
  },
};

// Safe getter — never crashes on unknown role
export const getRoleConfig = (role) => {
  return ROLE_CONFIG[role] || {
    color: "#6b7280",
    light: "#f9fafb",
    badge: "#f3f4f6",
    label: role || "Unknown",
    homePath: "/login",
  };
};