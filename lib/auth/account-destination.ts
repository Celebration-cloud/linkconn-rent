import type { AppRole } from "@prisma/client";

export const ADMIN_WORKSPACE_ROLES: readonly AppRole[] = ["Moderator", "Admin", "SuperAdmin"];

export function isAdminWorkspaceRole(role: AppRole | string | null | undefined) {
  return Boolean(role && ADMIN_WORKSPACE_ROLES.includes(role as AppRole));
}

export function getAccountDestination(role: AppRole | string | null | undefined, tab = "overview") {
  if (isAdminWorkspaceRole(role)) {
    return tab === "profile" || tab === "security" ? "/admin/account" : "/admin";
  }
  return `/dashboard?tab=${encodeURIComponent(tab)}`;
}
