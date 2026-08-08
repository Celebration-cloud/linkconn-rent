import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  changePassword: vi.fn(),
}));

vi.mock("@/lib/neon-auth", () => ({
  auth: {
    getSession: mocks.getSession,
    changePassword: mocks.changePassword,
  },
}));
vi.mock("@/lib/security/csrf", () => ({ verifyCsrf: () => true }));
vi.mock("@/lib/security/rate-limiter", () => ({
  getClientIp: () => "127.0.0.1",
  checkRateLimit: () => ({ allowed: true, remaining: 4, resetTime: Date.now() + 1000 }),
}));

import { POST } from "@/app/api/auth/custom/change-password/route";

function request(body: unknown) {
  return new Request("http://localhost:3000/api/auth/custom/change-password", {
    method: "POST",
    headers: { "content-type": "application/json", origin: "http://localhost:3000" },
    body: JSON.stringify(body),
  });
}

describe("change-password Route Handler", () => {
  beforeEach(() => vi.clearAllMocks());

  it("rejects guests", async () => {
    mocks.getSession.mockResolvedValue({ data: null });
    expect((await POST(request({ currentPassword: "old-password", newPassword: "new-password-value" }))).status).toBe(401);
  });

  it("enforces the stronger password contract", async () => {
    mocks.getSession.mockResolvedValue({ data: { user: { id: "user-1" } } });
    expect((await POST(request({ currentPassword: "old-password", newPassword: "too-short" }))).status).toBe(400);
    expect(mocks.changePassword).not.toHaveBeenCalled();
  });

  it("delegates credential rotation to Neon Auth and revokes other sessions", async () => {
    mocks.getSession.mockResolvedValue({ data: { user: { id: "user-1" } } });
    mocks.changePassword.mockResolvedValue({ data: { token: null }, error: null });
    const response = await POST(request({ currentPassword: "old-password", newPassword: "a-new-secure-password" }));
    expect(response.status).toBe(200);
    expect(mocks.changePassword).toHaveBeenCalledWith({
      currentPassword: "old-password",
      newPassword: "a-new-secure-password",
      revokeOtherSessions: true,
    });
  });
});
