import { describe, expect, it } from "vitest";
import {
  getDocumentDeletionDeadline,
  isDocumentEligibleForDeletion,
} from "@/features/verifications/document-retention";

describe("verification document retention", () => {
  const reviewedAt = new Date("2026-01-01T12:00:00.000Z");

  it("sets the deadline exactly 60 days after review", () => {
    expect(getDocumentDeletionDeadline(reviewedAt).toISOString()).toBe("2026-03-02T12:00:00.000Z");
  });

  it("becomes eligible at the deadline, not before", () => {
    const deadline = getDocumentDeletionDeadline(reviewedAt);
    expect(isDocumentEligibleForDeletion(deadline, new Date(deadline.getTime() - 1))).toBe(false);
    expect(isDocumentEligibleForDeletion(deadline, deadline)).toBe(true);
  });

  it("never deletes a document without a deadline", () => {
    expect(isDocumentEligibleForDeletion(null, new Date("2030-01-01"))).toBe(false);
  });
});
