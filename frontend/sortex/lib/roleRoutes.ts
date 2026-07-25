export type PlatformRole = "Admin" | "Recycling Facilitator" | "Sustainability Manager" | "Manufacturer";

export const ROLE_ROUTES: Record<PlatformRole, string> = {
  "Admin": "/dashboard/admin",
  "Recycling Facilitator": "/dashboard/recycling-facilitator",
  "Sustainability Manager": "/dashboard/sustainability-manager",
  "Manufacturer": "/dashboard/manufacturer",
};

const VALID_ROLES: readonly PlatformRole[] = [
  "Admin",
  "Recycling Facilitator",
  "Sustainability Manager",
  "Manufacturer",
];

export function isPlatformRole(value: string | null | undefined): value is PlatformRole {
  return VALID_ROLES.includes(value as PlatformRole);
}

export function routeForRole(role: string | null): string {
  if (role && role in ROLE_ROUTES) {
    return ROLE_ROUTES[role as PlatformRole];
  }
  return "/login";
}