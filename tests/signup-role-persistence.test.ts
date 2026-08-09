import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signUp: vi.fn(),
  profileUpsert: vi.fn(),
}));

vi.mock("@/lib/neon-auth", () => ({
  auth: { signUp: { email: mocks.signUp } },
}));
vi.mock("@/lib/db/client", () => ({
  prisma: { profile: { upsert: mocks.profileUpsert } },
}));
vi.mock("@/lib/security/csrf", () => ({ verifyCsrf: () => true }));
vi.mock("@/lib/security/rate-limiter", () => ({
  checkRateLimit: () => ({ allowed: true, resetTime: Date.now() + 60_000 }),
  getClientIp: () => "127.0.0.1",
}));

import { POST } from "@/app/api/auth/custom/signup/route";

describe("signup role persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signUp.mockResolvedValue({
      error: null,
      data: {
        user: {
          id: "auth-user-1",
          email: "owner@example.com",
          emailVerified: false,
        },
      },
    });
    mocks.profileUpsert.mockResolvedValue({ id: "auth-user-1" });
  });

  it("mirrors the selected Landlord role using the Neon Auth user ID", async () => {
    const response = await POST(new Request("https://example.test/api/auth/custom/signup", {
      method: "POST",
      body: JSON.stringify({
        name: "Ada Owner",
        email: "owner@example.com",
        password: "strong-password",
        role: "Landlord",
      }),
    }));

    expect(response.status).toBe(200);
    expect(mocks.profileUpsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: "auth-user-1" },
      create: expect.objectContaining({ id: "auth-user-1", role: "Landlord" }),
      update: expect.objectContaining({ role: "Landlord" }),
    }));
  });

  it("rejects attempts to select a privileged signup role", async () => {
    const response = await POST(new Request("https://example.test/api/auth/custom/signup", {
      method: "POST",
      body: JSON.stringify({
        name: "Invalid Admin",
        email: "invalid@example.com",
        password: "strong-password",
        role: "Admin",
      }),
    }));

    expect(response.status).toBe(400);
    expect(mocks.signUp).not.toHaveBeenCalled();
    expect(mocks.profileUpsert).not.toHaveBeenCalled();
  });

  it("does not report Neon Auth signup as failed when the profile mirror needs retrying", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined);
    mocks.profileUpsert.mockRejectedValueOnce(new Error("temporary database error"));

    const response = await POST(new Request("https://example.test/api/auth/custom/signup", {
      method: "POST",
      body: JSON.stringify({
        name: "Teni Renter",
        email: "tenant@example.com",
        password: "strong-password",
        role: "Tenant",
      }),
    }));

    expect(response.status).toBe(200);
    expect(consoleError).toHaveBeenCalledWith(
      "[signup profile role mirror]",
      expect.any(Error),
    );
    consoleError.mockRestore();
  });
});
