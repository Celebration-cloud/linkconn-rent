import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findUnique: vi.fn(),
  deleteDocument: vi.fn(),
  removeObject: vi.fn(),
}));

vi.mock("@/lib/db/client", () => ({
  prisma: {
    verificationDocument: {
      findUnique: mocks.findUnique,
      delete: mocks.deleteDocument,
    },
  },
}));

vi.mock("@/services/storage/document-storage", () => ({
  getDocumentStorage: () => ({ configured: true, remove: mocks.removeObject }),
}));

import { removeOnboardingDocument } from "@/features/onboarding/server/document-service";

describe("reviewed onboarding evidence removal", () => {
  beforeEach(() => vi.clearAllMocks());

  it("refuses to delete a NeedsChanges evidence row or private object", async () => {
    mocks.findUnique.mockResolvedValue({
      id: "document-1",
      storageKey: "private/document-1",
      submission: { ownerId: "owner-1", status: "NeedsChanges" },
    });

    await expect(removeOnboardingDocument(
      { id: "owner-1", role: "Tenant" },
      "document-1",
    )).rejects.toThrow("REPLACEMENT_REQUIRED");

    expect(mocks.removeObject).not.toHaveBeenCalled();
    expect(mocks.deleteDocument).not.toHaveBeenCalled();
  });
});
