import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requestPasswordReset: vi.fn(),
  getAccountRoleByEmail: vi.fn(),
}));

vi.mock("@/lib/neon-auth", () => ({
  auth: { requestPasswordReset: mocks.requestPasswordReset },
}));
vi.mock("@/lib/auth/account-access", () => ({
  getAccountRoleByEmail: mocks.getAccountRoleByEmail,
}));
vi.mock("@/lib/security/csrf", () => ({ verifyCsrf: () => true }));
vi.mock("@/lib/security/rate-limiter", () => ({
  getClientIp: () => "127.0.0.1",
  checkRateLimit: () => ({ allowed: true, resetTime: Date.now() + 60_000 }),
}));

import { POST } from "@/app/api/auth/custom/forgot-password/route";

function request(portal: "public" | "admin", redirectTo: string) {
  return POST(
    new Request("http://localhost/api/auth/custom/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "person@example.com", portal, redirectTo }),
    }),
  );
}

describe("portal-aware password recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.requestPasswordReset.mockResolvedValue({ error: null, data: null });
  });

  it.each(["Admin", "SuperAdmin"] as const)(
    "sends %s recovery links back to the administrator reset page",
    async (role) => {
      mocks.getAccountRoleByEmail.mockResolvedValue(role);
      const response = await request("admin", "/admin/reset-password?next=%2Fadmin%2Flogin");

      expect(response.status).toBe(200);
      expect(mocks.requestPasswordReset).toHaveBeenCalledWith({
        email: "person@example.com",
        redirectTo:
          "http://localhost/admin/reset-password?next=%2Fadmin%2Flogin",
      });
    },
  );

  it("does not send an administrator reset through the public portal", async () => {
    mocks.getAccountRoleByEmail.mockResolvedValue("Admin");
    const response = await request("public", "/reset-password");

    expect(response.status).toBe(200);
    expect(mocks.requestPasswordReset).toHaveBeenCalledWith({
      email: "auth-decoy@example.com",
      redirectTo: "http://localhost/reset-password",
    });
    expect(await response.json()).toMatchObject({
      success: true,
      message: "If an account exists for that email, a reset link will be sent.",
    });
  });

  it.each(["Tenant", "Landlord", "PropertyManager", "Moderator"] as const)(
    "does not send a %s reset through the administrator portal",
    async (role) => {
      mocks.getAccountRoleByEmail.mockResolvedValue(role);
      const response = await request("admin", "/admin/reset-password");

      expect(response.status).toBe(200);
      expect(mocks.requestPasswordReset).toHaveBeenCalledWith({
        email: "auth-decoy@example.com",
        redirectTo: "http://localhost/admin/reset-password",
      });
    },
  );
});
