export const permissions = {

  Admin: [
    "VIEW_INVENTORY",
    "UPLOAD_WASTE",
    "VIEW_ANALYTICS",
    "VIEW_RECOMMENDATIONS",
    "VIEW_USERS",
    "VIEW_SETTINGS",
    "VIEW_PROFILE"
  ],


  Industry: [
    "VIEW_INVENTORY",
    "UPLOAD_WASTE",
    "VIEW_RECOMMENDATIONS",
    "VIEW_PROFILE"
  ],


  Recycler: [
    "VIEW_INVENTORY",
    "UPLOAD_WASTE",
    "VIEW_RECOMMENDATIONS",
    "VIEW_PROFILE"
  ],


  NGO: [
    "UPLOAD_WASTE",
    "VIEW_RECOMMENDATIONS",
    "VIEW_PROFILE"
  ]

};


export function hasPermission(role, permission) {

  if (!role) {
    return false;
  }

  return permissions[role]?.includes(permission);

}