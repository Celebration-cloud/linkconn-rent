import { describe, expect, it } from "vitest";
import {
  getMissingDocumentRequirements,
  getOnboardingDocumentRequirements,
  isDocumentKindAllowedForRole,
} from "@/features/onboarding/document-requirements";

describe("onboarding document requirements", () => {
  it.each([
    ["Employed", "EmploymentEvidence"],
    ["SelfEmployed", "SelfEmploymentEvidence"],
    ["Freelancer", "SelfEmploymentEvidence"],
    ["Student", "StudentEvidence"],
    ["Retired", "RetirementEvidence"],
    ["Unemployed", "GuarantorEvidence"],
  ])("selects the correct tenant evidence for %s", (employmentType, expectedKind) => {
    const requirements = getOnboardingDocumentRequirements({ role: "Tenant", employmentType });
    expect(requirements).toHaveLength(4);
    expect(requirements.at(-1)?.acceptedKinds).toContain(expectedKind);
  });

  it("does not treat CAC registration as a landlord requirement", () => {
    const requirements = getOnboardingDocumentRequirements({ role: "Landlord" });
    expect(requirements).toHaveLength(5);
    expect(requirements.flatMap((requirement) => requirement.acceptedKinds)).not.toContain("BusinessRegistration");
    expect(isDocumentKindAllowedForRole("Landlord", "BusinessRegistration")).toBe(false);
  });

  it("accepts either ownership evidence or management authority", () => {
    const requirements = getOnboardingDocumentRequirements({ role: "Landlord" });
    const uploaded = [
      "GovernmentId",
      "Selfie",
      "ProofOfAddress",
      "ManagementAuthority",
      "PayoutAccountEvidence",
    ] as const;
    expect(getMissingDocumentRequirements(requirements, uploaded)).toEqual([]);
  });

  it.each([
    "Employed",
    "SelfEmployed",
    "Freelancer",
    "Student",
    "Retired",
    "Unemployed",
  ])("never requests a Tenant document that Tenant authorization rejects for %s", (employmentType) => {
    const requirements = getOnboardingDocumentRequirements({ role: "Tenant", employmentType });
    for (const requirement of requirements) {
      for (const kind of requirement.acceptedKinds) {
        expect(isDocumentKindAllowedForRole("Tenant", kind)).toBe(true);
      }
    }
  });

  it(
    "never requests a Landlord document that Landlord authorization rejects",
    () => {
      const requirements = getOnboardingDocumentRequirements({ role: "Landlord" });
      for (const requirement of requirements) {
        for (const kind of requirement.acceptedKinds) {
          expect(isDocumentKindAllowedForRole("Landlord", kind)).toBe(true);
        }
      }
    },
  );
});
