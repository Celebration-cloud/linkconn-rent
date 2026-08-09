import type { Role } from "@/domain/types/auth";

const TENANT_STEP_BY_SECTION = {
  personal: 0,
  preferences: 1,
  employment: 2,
  documents: 3,
} as const;

const LANDLORD_STEP_BY_SECTION = {
  personal: 0,
  business: 1,
  payout: 2,
  documents: 3,
} as const;

export function getFirstInvalidOnboardingStep(
  role: Extract<Role, "Tenant" | "Landlord">,
  errors: Record<string, unknown>,
) {
  const sections = role === "Tenant" ? TENANT_STEP_BY_SECTION : LANDLORD_STEP_BY_SECTION;
  for (const [section, step] of Object.entries(sections)) {
    if (errors[section]) return step;
  }
  return 0;
}
