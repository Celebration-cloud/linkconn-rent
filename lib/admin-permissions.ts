import type { AppRole } from "@prisma/client";

export const REVIEWER_ROLES: readonly AppRole[] = ["Moderator", "Admin", "SuperAdmin"];
export const SANCTION_ROLES: readonly AppRole[] = ["Admin", "SuperAdmin"];

export function canReviewQueues(role: AppRole) {
  return REVIEWER_ROLES.includes(role);
}

export function canSanctionUsers(role: AppRole) {
  return SANCTION_ROLES.includes(role);
}

export function canAccessPrivateVerificationDocuments(role: AppRole) {
  return role === "Admin" || role === "SuperAdmin";
}
