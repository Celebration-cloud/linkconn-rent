export function isAdministratorRole(role: string | null | undefined) {
  return role === "Admin" || role === "SuperAdmin" || role === "Super Admin";
}

export const isAdminReviewExemptRole = isAdministratorRole;
