import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findMany: vi.fn(),
  updateMany: vi.fn(),
  remove: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  prisma: {
    verificationDocument: {
      findMany: mocks.findMany,
      updateMany: mocks.updateMany,
    },
  },
}));

vi.mock("@/services/storage/document-storage", () => ({
  getDocumentStorage: () => ({ configured: true, remove: mocks.remove }),
}));

import { deleteExpiredVerificationDocuments } from "@/features/verifications/server/document-retention-service";

describe("document retention cleanup", () => {
  const now = new Date("2026-03-02T12:00:00.000Z");

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.findMany.mockResolvedValue([{ id: "document-1", storageKey: "private/document-1.pdf" }]);
    mocks.remove.mockResolvedValue(undefined);
    mocks.updateMany.mockResolvedValue({ count: 1 });
  });

  it("deletes Blob content before clearing sensitive database fields", async () => {
    const result = await deleteExpiredVerificationDocuments(now);

    expect(mocks.remove).toHaveBeenCalledWith("private/document-1.pdf");
    expect(mocks.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: expect.objectContaining({ storageKey: null, fileName: null, deletedAt: now }),
    }));
    expect(result).toEqual({ checked: 1, deleted: 1, failed: 0 });
  });

  it("retains the key and records a retryable error when Blob deletion fails", async () => {
    mocks.remove.mockRejectedValue(new Error("temporary provider error"));

    const result = await deleteExpiredVerificationDocuments(now);

    expect(mocks.updateMany).toHaveBeenCalledWith(expect.objectContaining({
      data: { deletionError: "temporary provider error" },
    }));
    expect(result).toEqual({ checked: 1, deleted: 0, failed: 1 });
  });

  it("does not double-count a document already finalized by another cleanup", async () => {
    mocks.updateMany.mockResolvedValue({ count: 0 });
    await expect(deleteExpiredVerificationDocuments(now)).resolves.toEqual({
      checked: 1,
      deleted: 0,
      failed: 0,
    });
  });
});
