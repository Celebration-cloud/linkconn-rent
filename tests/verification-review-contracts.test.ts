import { describe, expect, it } from "vitest";
import {
  maskSensitiveValue,
  requiredVerificationFindingKeys,
  toVerificationReviewDetailDto,
  toVerificationReviewSummaryDto,
} from "@/features/verifications/review-contracts";
import { queueFiltersSchema, verificationReviewSchema } from "@/schemas/administration";

const submission = {
  id: "submission-1",
  type: "Identity" as const,
  status: "NeedsChanges" as const,
  reviewRound: 2,
  correctionInstructions: "Replace the blurred ID and confirm the legal name.",
  submittedAt: new Date("2026-08-12T08:00:00.000Z"),
  reviewedAt: new Date("2026-08-12T10:00:00.000Z"),
  createdAt: new Date("2026-08-11T08:00:00.000Z"),
  updatedAt: new Date("2026-08-12T10:00:00.000Z"),
  owner: {
    id: "owner-1",
    firstName: "Ada",
    lastName: "Okafor",
    email: "ada@example.com",
    phone: "+2348012345678",
    role: "Tenant" as const,
    accountStatus: "Active" as const,
    verificationLevel: "Unverified" as const,
    emailVerified: true,
    onboardingComplete: true,
    tenantProfile: {
      employmentType: "Employed" as const,
      employerName: "Northstar",
      jobTitle: "Analyst",
      incomeRange: "From200kTo500k" as const,
      preferredLocations: ["Yaba"],
      preferredTypes: ["Flat"],
      budgetMin: 1_200_000,
      budgetMax: 2_400_000,
      moveInDate: new Date("2026-10-01T00:00:00.000Z"),
      ninStatus: "Pending" as const,
      ninNumber: "12345678901",
    },
    landlordProfile: null,
  },
  property: null,
  assignedTo: { id: "admin-1", firstName: "Kemi", lastName: "Adeyemi" },
  reviewedBy: { id: "admin-1", firstName: "Kemi", lastName: "Adeyemi" },
  documents: [
    {
      id: "document-1",
      submissionId: "submission-1",
      kind: "GovernmentId" as const,
      fileName: "nin-card.pdf",
      storageKey: "private-verifications/secret-key.pdf",
      uploadIntentId: "private-upload-intent",
      mimeType: "application/pdf",
      size: 1024,
      deleteAfter: new Date("2026-09-12T08:00:00.000Z"),
      deletionError: "private deletion diagnostic",
      revision: 2,
      supersededAt: null,
      deletedAt: null,
      createdAt: new Date("2026-08-12T08:00:00.000Z"),
    },
  ],
  findings: [
    {
      id: "finding-1",
      submissionId: "submission-1",
      reviewRound: 2,
      reviewerId: "admin-1",
      key: "identity_match",
      label: "Identity matches the account",
      status: "NeedsChanges" as const,
      note: "Surname is unreadable.",
      createdAt: new Date("2026-08-12T10:00:00.000Z"),
      reviewer: { id: "admin-1", firstName: "Kemi", lastName: "Adeyemi" },
    },
  ],
  _count: { documents: 1, findings: 1 },
  linked: { properties: 0, applications: 2, payments: 0, maintenance: 0 },
  auditHistory: [],
};

describe("verification review DTO contracts", () => {
  it("keeps queue summaries compact and excludes sensitive or private evidence values", () => {
    const result = toVerificationReviewSummaryDto(submission);
    const serialized = JSON.stringify(result);

    expect(result).toEqual(expect.objectContaining({
      id: "submission-1",
      status: "NeedsChanges",
      reviewRound: 2,
      evidence: { total: 1, active: 1, superseded: 0, unavailable: 0 },
    }));
    expect(serialized).not.toContain("12345678901");
    expect(serialized).not.toContain("private-verifications");
    expect(serialized).not.toContain("Northstar");
    expect(serialized).not.toContain("nin-card.pdf");
  });

  it("returns a masked administrator detail without storage keys or raw sensitive values", () => {
    const result = toVerificationReviewDetailDto(submission, { canViewPrivateEvidence: true });
    const serialized = JSON.stringify(result);

    expect(result.owner.sensitive.nin).toEqual({ available: true, masked: "*******8901" });
    expect(result.documents).toEqual([
      expect.objectContaining({
        id: "document-1",
        fileName: "nin-card.pdf",
        revision: 2,
        accessHref: "/api/admin/verifications/submission-1/documents/document-1",
      }),
    ]);
    expect(serialized).not.toContain("12345678901");
    expect(serialized).not.toContain("private-verifications");
    expect(result.documents[0]).not.toHaveProperty("submissionId");
    expect(result.documents[0]).not.toHaveProperty("storageKey");
    expect(result.documents[0]).not.toHaveProperty("uploadIntentId");
    expect(result.documents[0]).not.toHaveProperty("deleteAfter");
    expect(result.documents[0]).not.toHaveProperty("deletionError");
    expect(result.findings[0]).not.toHaveProperty("submissionId");
    expect(result.findings[0]).not.toHaveProperty("reviewerId");
  });

  it("removes private document metadata from moderator detail", () => {
    const result = toVerificationReviewDetailDto(submission, { canViewPrivateEvidence: false });

    expect(result.documents).toEqual([]);
    expect(result.privateEvidenceAvailable).toBe(false);
    expect(result.owner.sensitive.nin).toEqual({ available: true, masked: null });
    expect(result.findings[0]).not.toHaveProperty("submissionId");
    expect(result.findings[0]).not.toHaveProperty("reviewerId");
  });

  it("masks values without exposing short secrets", () => {
    expect(maskSensitiveValue("12345678901")).toBe("*******8901");
    expect(maskSensitiveValue("123")).toBe("***");
    expect(maskSensitiveValue(null)).toBeNull();
  });
});

describe("verification decision contracts", () => {
  it("accepts NeedsChanges filtering", () => {
    expect(queueFiltersSchema.parse({ status: "NeedsChanges" }).status).toBe("NeedsChanges");
  });

  it("requires correction instructions and a completed fixed checklist for request changes", () => {
    const keys = requiredVerificationFindingKeys("Identity");
    const result = verificationReviewSchema.parse({
      action: "request_changes",
      reason: "The submitted identity evidence is not readable.",
      correctionInstructions: "Upload a clear uncropped government ID.",
      findings: keys.map((key) => ({ key, status: "NeedsChanges", note: "Evidence is unreadable." })),
    });

    expect(result.action).toBe("request_changes");
    expect(() => verificationReviewSchema.parse({
      action: "request_changes",
      reason: "The submitted identity evidence is not readable.",
      findings: [],
    })).toThrow();
  });
});
