export function isAdministratorRole(role: string | null | undefined) {
  return role === "Admin" || role === "SuperAdmin" || role === "Super Admin";
}

export const isAdminReviewExemptRole = isAdministratorRole;

export function usesPublicOnboardingFlow(role: string | null | undefined) {
  return role === "Tenant" || role === "Landlord";
}

export function needsOnboarding(
  role: string | null | undefined,
  onboardingComplete: boolean,
  reviewStatus: string | null | undefined,
) {
  if (!usesPublicOnboardingFlow(role)) return false;
  return (
    !onboardingComplete ||
    reviewStatus === "Draft" ||
    reviewStatus === "NotSubmitted"
  );
}
