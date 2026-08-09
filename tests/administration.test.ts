import { describe, expect, it } from "vitest";
import {
  canReviewVerification,
  canTransitionDispute,
  isListingDecision,
  paystackAmountMatches,
} from "@/lib/admin-lifecycle";
import {
  canAccessPrivateVerificationDocuments,
  canReviewQueues,
  canSanctionUsers,
} from "@/lib/admin-permissions";
import {
  disputeActionSchema,
  listingModerationSchema,
  userModerationSchema,
  verificationReviewSchema,
} from "@/schemas/administration";
import {
  maintenanceUpdateSchema,
  paymentVerifySchema,
  propertyActionSchema,
} from "@/schemas/tenant-operations";

describe("administrative permissions", () => {
  it("allows moderators to review but not sanction accounts", () => {
    expect(canReviewQueues("Moderator")).toBe(true);
    expect(canSanctionUsers("Moderator")).toBe(false);
    expect(canSanctionUsers("Admin")).toBe(true);
    expect(canSanctionUsers("SuperAdmin")).toBe(true);
    expect(canReviewQueues("Tenant")).toBe(false);
    expect(canAccessPrivateVerificationDocuments("Moderator")).toBe(false);
    expect(canAccessPrivateVerificationDocuments("Admin")).toBe(true);
    expect(canAccessPrivateVerificationDocuments("SuperAdmin")).toBe(true);
  });
});

describe("moderation and dispute transitions", () => {
  it("keeps resolved cases final", () => {
    expect(canTransitionDispute("Open", "Investigating")).toBe(true);
    expect(canTransitionDispute("Investigating", "Resolved")).toBe(true);
    expect(canTransitionDispute("Resolved", "Open")).toBe(false);
  });

  it("requires pending verification and valid listing decisions", () => {
    expect(canReviewVerification("Pending")).toBe(true);
    expect(canReviewVerification("Draft")).toBe(false);
    expect(isListingDecision("Removed")).toBe(true);
    expect(isListingDecision("PendingReview")).toBe(false);
  });

  it("requires reasons for decisions and rejects partial actions", () => {
    expect(() => verificationReviewSchema.parse({ action: "reject", reason: "short" })).toThrow();
    expect(() => disputeActionSchema.parse({ action: "resolve" })).toThrow();
    expect(() => userModerationSchema.parse({ status: "Suspended", reason: "bad" })).toThrow();
    expect(listingModerationSchema.parse({ status: "Approved", reason: "Evidence reviewed" }).status).toBe("Approved");
  });
});

describe("payment, maintenance, and listing safety", () => {
  it("compares Paystack kobo amounts exactly", () => {
    expect(paystackAmountMatches(3_000_000, 300_000_000)).toBe(true);
    expect(paystackAmountMatches(3_000_000, 299_999_900)).toBe(false);
  });

  it("validates references, history updates, and listing actions", () => {
    expect(() => paymentVerifySchema.parse({ reference: "tiny" })).toThrow();
    expect(() => maintenanceUpdateSchema.parse({})).toThrow();
    expect(maintenanceUpdateSchema.parse({ status: "InProgress" }).status).toBe("InProgress");
    expect(propertyActionSchema.parse({ action: "duplicate" }).action).toBe("duplicate");
  });
});
