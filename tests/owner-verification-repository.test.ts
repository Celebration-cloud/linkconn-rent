import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    verificationSubmission: { findFirst: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn() },
    verificationDocument: { updateMany: vi.fn() },
    adminAuditEvent: { create: vi.fn() },
    notification: { create: vi.fn() },
  };
  return {
    tx,
    transaction: vi.fn(),
    profileFindUnique: vi.fn(),
    submissionFindFirst: vi.fn(),
    auditFindMany: vi.fn(),
    notificationFindMany: vi.fn(),
    storageConfigured: vi.fn(),
  };
});

vi.mock("@/lib/db/client", () => ({
  prisma: {
    $transaction: mocks.transaction,
    profile: { findUnique: mocks.profileFindUnique },
    verificationSubmission: { findFirst: mocks.submissionFindFirst },
    adminAuditEvent: { findMany: mocks.auditFindMany },
    notification: { findMany: mocks.notificationFindMany },
  },
}));

vi.mock("@/services/storage/document-storage", () => ({
  getDocumentStorage: () => ({ configured: mocks.storageConfigured() }),
}));

import { VerificationRepository } from "@/repositories/verification.repository";

const activeDocuments = [
  { id: "gov", kind: "GovernmentId", storageKey: "private/gov", uploadIntentId: null, deletedAt: null, supersededAt: null, revision: 1, createdAt: new Date("2026-08-01") },
  { id: "selfie", kind: "Selfie", storageKey: "private/selfie", uploadIntentId: null, deletedAt: null, supersededAt: null, revision: 1, createdAt: new Date("2026-08-01") },
  { id: "address", kind: "ProofOfAddress", storageKey: "private/address", uploadIntentId: null, deletedAt: null, supersededAt: null, revision: 1, createdAt: new Date("2026-08-01") },
  { id: "ownership", kind: "ManagementAuthority", storageKey: "private/authority", uploadIntentId: null, deletedAt: null, supersededAt: null, revision: 1, createdAt: new Date("2026-08-01") },
  { id: "payout", kind: "PayoutAccountEvidence", storageKey: "private/payout", uploadIntentId: null, deletedAt: null, supersededAt: null, revision: 2, createdAt: new Date("2026-08-02") },
];

const current = {
  id: "submission-1",
  ownerId: "owner-1",
  type: "Identity",
  status: "NeedsChanges",
  reviewRound: 2,
  decisionReason: "Replace payout evidence.",
  correctionInstructions: "Upload a readable statement.",
  documents: activeDocuments,
};

describe("owner verification repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.storageConfigured.mockReturnValue(true);
    mocks.transaction.mockImplementation(async (callback: (client: typeof mocks.tx) => Promise<unknown>) => callback(mocks.tx));
    mocks.tx.verificationSubmission.findFirst.mockResolvedValue(current);
    mocks.tx.verificationSubmission.updateMany.mockResolvedValue({ count: 1 });
    mocks.tx.verificationSubmission.findUnique.mockResolvedValue({
      ...current,
      status: "Pending",
      reviewRound: 3,
      storageKey: "private/should-not-leak",
      reviewedById: "admin-secret",
      assignedToId: "admin-secret",
      correctionInstructions: "old private instruction",
      owner: { ninNumber: "12345678901" },
      submittedAt: new Date("2026-08-13T10:00:00.000Z"),
      updatedAt: new Date("2026-08-13T10:00:00.000Z"),
    });
    mocks.tx.verificationDocument.updateMany.mockResolvedValue({ count: 0 });
    mocks.tx.adminAuditEvent.create.mockResolvedValue({});
    mocks.tx.notification.create.mockResolvedValue({});
  });

  it("atomically resubmits an owned NeedsChanges round and preserves history", async () => {
    const result = await VerificationRepository.resubmit("owner-1", "Landlord", {
      submissionId: "11111111-1111-4111-8111-111111111111",
      reviewRound: 2,
    });

    expect(mocks.tx.verificationSubmission.findFirst).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ ownerId: "owner-1", status: "NeedsChanges", reviewRound: 2 }),
    }));
    expect(mocks.tx.verificationSubmission.updateMany).toHaveBeenCalledWith({
      where: expect.objectContaining({ ownerId: "owner-1", status: "NeedsChanges", reviewRound: 2 }),
      data: expect.objectContaining({
        status: "Pending",
        reviewRound: 3,
        assignedToId: null,
        reviewedById: null,
        reviewedAt: null,
        decisionReason: null,
        correctionInstructions: null,
      }),
    });
    expect(mocks.tx.adminAuditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "owner-1",
        action: "verification.resubmitted",
        previousState: expect.objectContaining({ correctionInstructions: "Upload a readable statement." }),
      }),
    });
    expect(mocks.tx.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        profileId: "owner-1",
        idempotencyKey: "verification:submission-1:round:3:resubmitted",
      }),
    });
    expect(result).toEqual(expect.objectContaining({ status: "Pending", reviewRound: 3 }));
    expect(result).toEqual({
      id: "submission-1",
      type: "Identity",
      status: "Pending",
      reviewRound: 3,
      submittedAt: expect.any(Date),
      updatedAt: expect.any(Date),
    });
    const serialized = JSON.stringify(result);
    expect(serialized).not.toContain("storageKey");
    expect(serialized).not.toContain("reviewedById");
    expect(serialized).not.toContain("assignedToId");
    expect(serialized).not.toContain("12345678901");
  });

  it("rejects a stale or double resubmission before durable side effects", async () => {
    mocks.tx.verificationSubmission.updateMany.mockResolvedValue({ count: 0 });

    await expect(VerificationRepository.resubmit("owner-1", "Landlord", {
      submissionId: "11111111-1111-4111-8111-111111111111",
      reviewRound: 2,
    })).rejects.toThrow("RESUBMIT_CONFLICT");

    expect(mocks.tx.adminAuditEvent.create).not.toHaveBeenCalled();
    expect(mocks.tx.notification.create).not.toHaveBeenCalled();
  });

  it("requires every current role-specific document but never requires CAC from a landlord", async () => {
    mocks.tx.verificationSubmission.findFirst.mockResolvedValue({
      ...current,
      documents: activeDocuments.filter((document) => document.kind !== "PayoutAccountEvidence"),
    });

    await expect(VerificationRepository.resubmit("owner-1", "Landlord", {
      submissionId: "11111111-1111-4111-8111-111111111111",
      reviewRound: 2,
    })).rejects.toThrow("DOCUMENTS_INCOMPLETE:Payout account confirmation");

    expect(mocks.tx.verificationSubmission.updateMany).not.toHaveBeenCalled();
  });

  it("projects prior-round findings into a round-three owner workspace without reviewer fields", async () => {
    mocks.profileFindUnique.mockResolvedValue({
      id: "owner-1", email: "ada@example.com", firstName: "Ada", lastName: "Okafor", phone: null, location: null,
      role: "Landlord", accountStatus: "Active", verificationLevel: "Unverified", emailVerified: true, onboardingComplete: true,
      tenantProfile: null,
      landlordProfile: { businessName: null, propertyCount: 0, propertyTypesOffered: [], ninStatus: "Pending", ninNumber: "12345678901", bankName: null, accountNumber: "0123456789", accountName: null },
    });
    mocks.submissionFindFirst.mockResolvedValue({
      id: "submission-1", type: "Identity", status: "Pending", documentType: "Role documents", reviewRound: 3,
      decisionReason: null, correctionInstructions: null, submittedAt: new Date("2026-08-13"), reviewedAt: null,
      createdAt: new Date("2026-08-10"), updatedAt: new Date("2026-08-13"), documents: [],
      findings: [{ reviewRound: 2, key: "document_validity", label: "Evidence readability", status: "NeedsChanges", note: "Blurred scan", createdAt: new Date("2026-08-12"), reviewerId: "admin-secret", submissionId: "submission-1" }],
    });
    mocks.auditFindMany.mockResolvedValue([]);
    mocks.notificationFindMany.mockResolvedValue([]);

    const result = await VerificationRepository.getOwnerWorkspace("owner-1", "Landlord");

    expect(result.current?.reviewRound).toBe(3);
    expect(result.current?.findings).toEqual([expect.objectContaining({ reviewRound: 2, label: "Evidence readability", status: "NeedsChanges", note: "Blurred scan" })]);
    expect(JSON.stringify(result.current?.findings)).not.toContain("admin-secret");
    expect(JSON.stringify(result.current?.findings)).not.toContain("submissionId");
  });
});
