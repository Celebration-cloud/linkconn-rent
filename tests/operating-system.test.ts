import { describe, expect, it } from "vitest";
import { canTransitionApplication } from "@/lib/application-lifecycle";
import {
  messageCursorSchema,
  propertyFeesSchema,
  propertySearchSchema,
  verificationDraftSchema,
} from "@/schemas/operating-system";
import { getMoveInEstimate, getMoveInTotal } from "@/utils/map-property";

describe("property bounds and fees", () => {
  it("accepts a valid Lagos viewport and coerces URL values", () => {
    const result = propertySearchSchema.parse({
      north: "6.7",
      south: "6.3",
      east: "3.8",
      west: "3.1",
      bedrooms: "2",
    });
    expect(result).toMatchObject({ north: 6.7, south: 6.3, bedrooms: 2 });
  });

  it("rejects inverted map bounds", () => {
    expect(() =>
      propertySearchSchema.parse({ north: "5", south: "6" }),
    ).toThrow("North bound must be above south bound");
  });

  it("calculates the transparent move-in total", () => {
    const fees = propertyFeesSchema.parse({
      price: 4_000_000,
      period: "year",
      cautionFee: 400_000,
      legalFee: 200_000,
      agencyFee: 400_000,
      serviceCharge: 250_000,
    });
    expect(getMoveInTotal(fees)).toBe(5_250_000);
    expect(getMoveInEstimate(fees)).toBe(5_250_000);
  });

  it("does not calculate estimates from incomplete or inconsistent fees", () => {
    expect(
      getMoveInEstimate({
        price: 4_000_000,
        cautionFee: undefined,
        legalFee: 200_000,
        agencyFee: 400_000,
        serviceCharge: 250_000,
      }),
    ).toBeNull();
    expect(
      getMoveInEstimate({
        price: 4_000_000,
        cautionFee: -1,
        legalFee: 200_000,
        agencyFee: 400_000,
        serviceCharge: 250_000,
      }),
    ).toBeNull();
    expect(
      getMoveInEstimate({
        price: Number.NaN,
        cautionFee: 0,
        legalFee: 0,
        agencyFee: 0,
        serviceCharge: 0,
      }),
    ).toBeNull();
  });
});

describe("application lifecycle", () => {
  it("allows landlord review transitions", () => {
    expect(canTransitionApplication("Pending", "Shortlisted")).toBe(true);
    expect(canTransitionApplication("Shortlisted", "Accepted")).toBe(true);
  });

  it("keeps final decisions final", () => {
    expect(canTransitionApplication("Accepted", "Declined")).toBe(false);
    expect(canTransitionApplication("Declined", "Shortlisted")).toBe(false);
  });
});

describe("message cursors and verification drafts", () => {
  it("caps cursor page size", () => {
    expect(() => messageCursorSchema.parse({ limit: "101" })).toThrow();
    expect(messageCursorSchema.parse({ limit: "25" }).limit).toBe(25);
  });

  it("allows metadata-only verification drafts", () => {
    const draft = verificationDraftSchema.parse({
      type: "Identity",
      documentType: "National ID",
      documents: [],
    });
    expect(draft.submit).toBe(false);
    expect(draft.documents).toEqual([]);
  });
});
