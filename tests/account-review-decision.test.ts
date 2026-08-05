import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    verificationSubmission: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    profile: {
      update: vi.fn(),
      findFirst: vi.fn(),
    },
    adminAuditEvent: {
      create: vi.fn(),
    },
  };
  return {
    tx,
    transaction: vi.fn(),
  };
});

vi.mock("@/lib/db/client", () => ({
  prisma: {
    $transaction: mocks.transaction,
  },
}));

import { AdministrationRepository } from "@/repositories/administration.repository";

describe("administrator account review decisions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transaction.mockImplementation(
      // eslint-disable-next-line no-unused-vars
      async (callback: (client: typeof mocks.tx) => Promise<unknown>) =>
        callback(mocks.tx),
    );
    mocks.tx.verificationSubmission.findUnique.mockResolvedValue({
      id: "review-1",
      ownerId: "tenant-1",
      type: "Identity",
      status: "Pending",
      assignedToId: "admin-1",
    });
    mocks.tx.verificationSubmission.update.mockResolvedValue({
      id: "review-1",
      status: "Approved",
    });
    mocks.tx.profile.update.mockResolvedValue({});
    mocks.tx.adminAuditEvent.create.mockResolvedValue({});
  });

  it("approves an identity review, verifies the account, and writes an audit event", async () => {
    await AdministrationRepository.reviewVerification(
      { id: "admin-1", role: "Admin" },
      "review-1",
      {
        action: "approve",
        reason: "Identity signals and submitted details were verified.",
      },
    );

    expect(mocks.tx.verificationSubmission.update).toHaveBeenCalledWith({
      where: { id: "review-1" },
      data: expect.objectContaining({
        status: "Approved",
        reviewedById: "admin-1",
      }),
    });
    expect(mocks.tx.profile.update).toHaveBeenCalledWith({
      where: { id: "tenant-1" },
      data: { verificationLevel: "FullyVerified" },
    });
    expect(mocks.tx.adminAuditEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        actorId: "admin-1",
        action: "verification.approved",
        targetType: "Verification",
        targetId: "review-1",
      }),
    });
  });
});
