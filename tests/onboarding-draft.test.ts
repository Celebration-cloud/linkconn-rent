import { describe, expect, it } from "vitest";
import { onboardingDraftSchema } from "@/schemas/onboarding";

describe("onboarding drafts", () => {
  it("accepts incomplete tenant fields for Save and Exit", () => {
    const draft = onboardingDraftSchema.parse({
      role: "Tenant",
      currentStep: 0,
      personal: {
        firstName: "A",
        lastName: "",
        phone: "080",
        nin: "123",
      },
      preferences: {
        preferredLocations: [],
        preferredTypes: [],
      },
    });
    expect(draft.currentStep).toBe(0);
    expect(draft.personal?.nin).toBe("123");
  });

  it("still rejects unsafe draft values", () => {
    expect(() =>
      onboardingDraftSchema.parse({
        role: "Landlord",
        currentStep: 7,
        personal: { nin: "not-a-number" },
      }),
    ).toThrow();
  });
});
