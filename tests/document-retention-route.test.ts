import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  cleanup: vi.fn(),
}));

vi.mock("@/features/verifications/server/document-retention-service", () => ({
  deleteExpiredVerificationDocuments: mocks.cleanup,
}));

import { GET } from "@/app/api/cron/document-retention/route";

describe("document retention cron authorization", () => {
  const previousSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.CRON_SECRET = "test-cron-secret-with-sufficient-length";
    mocks.cleanup.mockResolvedValue({ checked: 2, deleted: 2, failed: 0 });
  });

  afterEach(() => {
    if (previousSecret === undefined) delete process.env.CRON_SECRET;
    else process.env.CRON_SECRET = previousSecret;
  });

  it.each([
    ["missing", undefined],
    ["incorrect", "Bearer wrong-secret"],
  ])("rejects a %s bearer token", async (_label, authorization) => {
    const headers = authorization ? { authorization } : undefined;
    const response = await GET(new Request("https://example.test/api/cron/document-retention", { headers }));
    expect(response.status).toBe(401);
    expect(mocks.cleanup).not.toHaveBeenCalled();
  });

  it("runs retention with the configured bearer token", async () => {
    const response = await GET(new Request("https://example.test/api/cron/document-retention", {
      headers: { authorization: `Bearer ${process.env.CRON_SECRET}` },
    }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      data: { checked: 2, deleted: 2, failed: 0 },
    });
    expect(mocks.cleanup).toHaveBeenCalledOnce();
  });
});
