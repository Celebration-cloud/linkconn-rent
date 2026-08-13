import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    verificationSubmission: { findUnique: vi.fn(), update: vi.fn(), updateMany: vi.fn() },
    verificationReviewFinding: { upsert: vi.fn() },
    verificationDocument: { updateMany: vi.fn() },
    profile: { findFirst: vi.fn(), update: vi.fn() },
    adminAuditEvent: { create: vi.fn() },
    notification: { create: vi.fn() },
  };
  return {
    tx,
    transaction: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    auditFindMany: vi.fn(),
    auditCreate: vi.fn(),
  };
});

vi.mock("@/lib/db/client", () => ({
  prisma: {
    $transaction: mocks.transaction,
    verificationSubmission: {
      findMany: mocks.findMany,
      findUnique: mocks.findUnique,
      count: mocks.count,
    },
    adminAuditEvent: {
      findMany: mocks.auditFindMany,
      create: mocks.auditCreate,
    },
  },
}));

import { AdministrationRepository } from "@/repositories/administration.repository";
import { requiredVerificationFindingKeys } from "@/features/verifications/review-contracts";

const source = {
  id: "submission-1",
  ownerId: "owner-1",
  type: "Identity",
  status: "Pending",
  reviewRound: 1,
  correctionInstructions: null,
  submittedAt: new Date("2026-08-12T08:00:00.000Z"),
  reviewedAt: null,
  createdAt: new Date("2026-08-12T08:00:00.000Z"),
  updatedAt: new Date("2026-08-12T08:00:00.000Z"),
  assignedToId: null,
  owner: {
    id: "owner-1",
    firstName: "Ada",
    lastName: "Okafor",
    email: "ada@example.com",
    phone: "+2348012345678",
    role: "Tenant",
    accountStatus: "Active",
    verificationLevel: "Unverified",
    emailVerified: true,
    onboardingComplete: true,
    tenantProfile: {
      employmentType: "Employed",
      employerName: "Northstar",
      jobTitle: "Analyst",
      incomeRange: "From200kTo500k",
      preferredLocations: ["Yaba"],
      preferredTypes: ["Flat"],
      budgetMin: 1_200_000,
      budgetMax: 2_400_000,
      moveInDate: null,
      ninStatus: "Pending",
      ninNumber: "12345678901",
    },
    landlordProfile: null,
    _count: { properties: 0, applications: 0, payments: 0, maintenance: 0 },
  },
  property: null,
  assignedTo: null,
  reviewedBy: null,
  documents: [{
    id: "document-1",
    kind: "GovernmentId",
    fileName: "private.pdf",
    storageKey: "private-verifications/secret.pdf",
    mimeType: "application/pdf",
    size: 1200,
    revision: 1,
    supersededAt: null,
    deletedAt: null,
    createdAt: new Date("2026-08-12T08:00:00.000Z"),
  }],
  findings: [],
  linked: { properties: 0, applications: 0, payments: 0, maintenance: 0 },
  auditHistory: [],
};

describe("verification review repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findMany.mockResolvedValue([source]);
    mocks.count.mockResolvedValue(1);
    mocks.findUnique.mockResolvedValue(source);
    mocks.auditFindMany.mockResolvedValue([]);
    mocks.transaction.mockImplementation(async (callback: (tx: typeof mocks.tx) => Promise<unknown>) => callback(mocks.tx));
    mocks.tx.verificationSubmission.findUnique.mockResolvedValue(source);
    mocks.tx.verificationSubmission.update.mockResolvedValue({ ...source, status: "NeedsChanges" });
    mocks.tx.verificationSubmission.updateMany.mockResolvedValue({ count: 1 });
    mocks.tx.verificationReviewFinding.upsert.mockResolvedValue({});
    mocks.tx.verificationDocument.updateMany.mockResolvedValue({ count: 0 });
    mocks.tx.adminAuditEvent.create.mockResolvedValue({});
    mocks.tx.notification.create.mockResolvedValue({});
  });

  it("returns only compact redacted DTOs from the queue read", async () => {
    const result = await AdministrationRepository.listVerifications({ page: 1, pageSize: 20, sort: "newest" }, "Admin");
    const serialized = JSON.stringify(result);

    expect(result.items[0]).toEqual(expect.objectContaining({
      id: "submission-1",
      evidence: { total: 1, active: 1, superseded: 0, unavailable: 0 },
    }));
    expect(serialized).not.toContain("12345678901");
    expect(serialized).not.toContain("Northstar");
    expect(serialized).not.toContain("private-verifications");
    expect(serialized).not.toContain("private.pdf");
  });

  it("returns private metadata to Admin but not Moderator", async () => {
    const admin = await AdministrationRepository.getVerificationDetail("submission-1", "Admin");
    const moderator = await AdministrationRepository.getVerificationDetail("submission-1", "Moderator");

    expect(admin?.documents).toHaveLength(1);
    expect(admin?.owner.sensitive.nin.masked).toBe("*******8901");
    expect(moderator?.documents).toEqual([]);
    expect(moderator?.owner.sensitive.nin.masked).toBeNull();
    for (const detail of [admin, moderator]) {
      const serialized = JSON.stringify(detail);
      expect(serialized).not.toContain("submissionId");
      expect(serialized).not.toContain("uploadIntentId");
      expect(serialized).not.toContain("deleteAfter");
      expect(serialized).not.toContain("deletionError");
      expect(serialized).not.toContain("reviewerId");
    }
  });

  it("audits a successful sensitive reveal and returns only named sensitive fields", async () => {
    const result = await AdministrationRepository.revealVerificationSensitive(
      { id: "admin-1", role: "Admin" },
      "submission-1",
    );

    expect(result).toEqual({ nin: "12345678901", payoutAccount: null });
    expect(mocks.auditCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "admin-1",
        action: "verification.sensitive.revealed",
        targetId: "submission-1",
      }),
    });
  });

  it("persists request-changes findings, decision, audit, and owner notification without retention", async () => {
    const findings = requiredVerificationFindingKeys("Identity").map((key) => ({
      key,
      status: "NeedsChanges" as const,
      note: "Replace this evidence.",
    }));

    await AdministrationRepository.reviewVerification(
      { id: "admin-1", role: "Admin" },
      "submission-1",
      {
        action: "request_changes",
        reason: "The identity evidence cannot be verified.",
        correctionInstructions: "Upload a clear uncropped government ID.",
        findings,
      },
    );

    expect(mocks.tx.verificationReviewFinding.upsert).toHaveBeenCalledTimes(3);
    expect(mocks.tx.verificationSubmission.updateMany).toHaveBeenCalledWith({
      where: {
        id: "submission-1",
        status: "Pending",
        reviewRound: 1,
        assignedToId: null,
      },
      data: expect.objectContaining({
        status: "NeedsChanges",
        correctionInstructions: "Upload a clear uncropped government ID.",
        reviewedById: "admin-1",
      }),
    });
    expect(mocks.tx.verificationDocument.updateMany).not.toHaveBeenCalled();
    expect(mocks.tx.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        profileId: "owner-1",
        kind: "Verification",
        href: "/verification",
      }),
    });
    expect(mocks.tx.adminAuditEvent.create).toHaveBeenCalledTimes(1);
  });

  it("rejects a decision assigned to another reviewer before writing findings", async () => {
    mocks.tx.verificationSubmission.findUnique.mockResolvedValue({
      ...source,
      assignedToId: "admin-2",
    });

    await expect(AdministrationRepository.reviewVerification(
      { id: "admin-1", role: "Admin" },
      "submission-1",
      {
        action: "approve",
        reason: "All required identity evidence has been verified.",
        findings: requiredVerificationFindingKeys("Identity").map((key) => ({ key, status: "Approved" as const })),
      },
    )).rejects.toThrow("ASSIGNMENT_CONFLICT");

    expect(mocks.tx.verificationSubmission.updateMany).not.toHaveBeenCalled();
    expect(mocks.tx.verificationReviewFinding.upsert).not.toHaveBeenCalled();
    expect(mocks.tx.adminAuditEvent.create).not.toHaveBeenCalled();
    expect(mocks.tx.notification.create).not.toHaveBeenCalled();
  });

  it("fails a stale same-round decision atomically before durable side effects", async () => {
    mocks.tx.verificationSubmission.updateMany.mockResolvedValue({ count: 0 });

    await expect(AdministrationRepository.reviewVerification(
      { id: "admin-1", role: "Admin" },
      "submission-1",
      {
        action: "approve",
        reason: "All required identity evidence has been verified.",
        findings: requiredVerificationFindingKeys("Identity").map((key) => ({ key, status: "Approved" as const })),
      },
    )).rejects.toThrow("REVIEW_CONFLICT");

    expect(mocks.tx.verificationReviewFinding.upsert).not.toHaveBeenCalled();
    expect(mocks.tx.adminAuditEvent.create).not.toHaveBeenCalled();
    expect(mocks.tx.notification.create).not.toHaveBeenCalled();
  });
});
