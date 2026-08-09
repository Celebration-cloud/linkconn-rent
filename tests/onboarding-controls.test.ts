import { describe, expect, it } from "vitest";
import {
  completeTenantOnboardingSchema,
  landlordPayoutSchema,
  tenantEmploymentSchema,
  tenantPreferencesSchema,
} from "@/schemas/onboarding";
import {
  employmentUsesOrganizationDetails,
  normalizeOptionalNumberInput,
} from "@/features/onboarding/utils/form-values";
import { getFirstInvalidOnboardingStep } from "@/features/onboarding/utils/step-validation";

describe("onboarding control values", () => {
  it("keeps blank optional currency inputs undefined", () => {
    expect(normalizeOptionalNumberInput("")).toBeUndefined();
    expect(normalizeOptionalNumberInput(undefined)).toBeUndefined();
    expect(normalizeOptionalNumberInput("50000")).toBe(50_000);
  });

  it("accepts multiple preferences and rejects an inverted budget", () => {
    const valid = tenantPreferencesSchema.safeParse({
      preferredLocations: ["Lagos", "Abuja"],
      preferredTypes: ["Studio", "Duplex"],
      budgetMin: 100_000,
      budgetMax: 250_000,
      moveInDate: "",
    });
    expect(valid.success).toBe(true);

    const invalid = tenantPreferencesSchema.safeParse({
      preferredLocations: ["Lagos"],
      preferredTypes: ["Studio"],
      budgetMin: 250_000,
      budgetMax: 100_000,
      moveInDate: "",
    });
    expect(invalid.success).toBe(false);
  });

  it("rejects past move-in dates", () => {
    const result = tenantPreferencesSchema.safeParse({
      preferredLocations: ["Lagos"],
      preferredTypes: ["Studio"],
      moveInDate: "2020-01-01",
    });
    expect(result.success).toBe(false);
  });

  it("keeps employment and income choices exclusive", () => {
    expect(tenantEmploymentSchema.safeParse({ employmentType: "Student", incomeRange: "Below50k" }).success).toBe(true);
    expect(tenantEmploymentSchema.safeParse({ employmentType: ["Student", "Employed"], incomeRange: "Below50k" }).success).toBe(false);
    expect(employmentUsesOrganizationDetails("Employed")).toBe(true);
    expect(employmentUsesOrganizationDetails("Student")).toBe(false);
  });

  it("preserves leading zeroes in payout account numbers", () => {
    const result = landlordPayoutSchema.parse({
      bankName: "Access Bank",
      accountNumber: "0123456789",
      accountName: "Ada Okonkwo",
    });
    expect(result.accountNumber).toBe("0123456789");
  });

  it("returns final validation to the first invalid role step", () => {
    expect(getFirstInvalidOnboardingStep("Tenant", { preferences: { preferredTypes: {} }, documents: {} })).toBe(1);
    expect(getFirstInvalidOnboardingStep("Landlord", { payout: { bankName: {} } })).toBe(2);
  });

  it("normalizes phone formatting without changing the API shape", () => {
    const parsed = completeTenantOnboardingSchema.safeParse({
      role: "Tenant",
      personal: { firstName: "Ada", lastName: "Okonkwo", phone: "+234 (801) 234-5678", nin: "12345678901" },
      preferences: { preferredLocations: ["Lagos"], preferredTypes: ["Studio"], moveInDate: "" },
      employment: { employmentType: "Employed", incomeRange: "Between100kAnd250k" },
      documents: [],
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.data.personal.phone).toBe("+2348012345678");
  });
});
