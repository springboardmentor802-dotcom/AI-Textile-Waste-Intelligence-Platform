export const PERMISSIONS = {
  VIEW_DASHBOARD: "VIEW_DASHBOARD",
  VIEW_INVENTORY: "VIEW_INVENTORY",
  UPLOAD_WASTE: "UPLOAD_WASTE",
  VIEW_ANALYTICS: "VIEW_ANALYTICS",
  VIEW_RECOMMENDATIONS: "VIEW_RECOMMENDATIONS",
  VIEW_NOTIFICATIONS: "VIEW_NOTIFICATIONS",
  VIEW_PROFILE: "VIEW_PROFILE",
  VIEW_SETTINGS: "VIEW_SETTINGS",
  VIEW_USERS: "VIEW_USERS",
};

export const permissions = {
  ADMIN: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.UPLOAD_WASTE,
    PERMISSIONS.VIEW_ANALYTICS,
    PERMISSIONS.VIEW_RECOMMENDATIONS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.VIEW_PROFILE,
    PERMISSIONS.VIEW_SETTINGS,
    PERMISSIONS.VIEW_USERS,
  ],

  INDUSTRY: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.UPLOAD_WASTE,
    PERMISSIONS.VIEW_RECOMMENDATIONS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.VIEW_PROFILE,
  ],

  RECYCLER: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_INVENTORY,
    PERMISSIONS.UPLOAD_WASTE,
    PERMISSIONS.VIEW_RECOMMENDATIONS,
    PERMISSIONS.VIEW_NOTIFICATIONS,
    PERMISSIONS.VIEW_PROFILE,
  ],

  NGO: [
  PERMISSIONS.VIEW_DASHBOARD,
  PERMISSIONS.VIEW_INVENTORY,
  PERMISSIONS.UPLOAD_WASTE,

  // NGO needs sustainability/circularity analytics
  PERMISSIONS.VIEW_ANALYTICS,

  PERMISSIONS.VIEW_RECOMMENDATIONS,
  PERMISSIONS.VIEW_NOTIFICATIONS,
  PERMISSIONS.VIEW_PROFILE,
],
};

export function normalizeRole(role) {
  if (!role) {
    return "";
  }

  return String(role)
    .trim()
    .toUpperCase();
}

export function hasPermission(
  role,
  permission,
) {
  if (!role || !permission) {
    return false;
  }

  const normalizedRole =
    normalizeRole(role);

  const rolePermissions =
    permissions[normalizedRole];

  if (!rolePermissions) {
    return false;
  }

  return rolePermissions.includes(
    permission,
  );
}

export function getRolePermissions(role) {
  const normalizedRole =
    normalizeRole(role);

  return (
    permissions[normalizedRole] || []
  );
}