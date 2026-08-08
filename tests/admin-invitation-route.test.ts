import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentProfile: vi.fn(),
  listAdminInvitations: vi.fn(),
  createAdminInvitation: vi.fn(),
}));

vi.mock("@/lib/auth/current-profile", () => ({ getCurrentProfile: mocks.getCurrentProfile }));
vi.mock("@/lib/security/csrf", () => ({ verifyCsrf: () => true }));
vi.mock("@/lib/security/rate-limiter", () => ({
  getClientIp: () => "127.0.0.1",
  checkRateLimit: () => ({ allowed: true, remaining: 9, resetTime: Date.now() + 1000 }),
}));
vi.mock("@/features/admin-invitations/server/invitation-service", () => ({
  AdminInvitationError: class AdminInvitationError extends Error {
    status = 403;
  },
  listAdminInvitations: mocks.listAdminInvitations,
  createAdminInvitation: mocks.createAdminInvitation,
}));

import { GET, POST } from "@/app/api/admin/invitations/route";

describe("administrator invitation Route Handler", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 for guests", async () => {
    mocks.getCurrentProfile.mockResolvedValue(null);
    expect((await GET()).status).toBe(401);
  });

  it("returns invitations for the authenticated Super Admin", async () => {
    mocks.getCurrentProfile.mockResolvedValue({ id: "super-1", role: "SuperAdmin" });
    mocks.listAdminInvitations.mockResolvedValue([]);
    const response = await GET();
    expect(response.status).toBe(200);
    expect(mocks.listAdminInvitations).toHaveBeenCalledWith({ id: "super-1", role: "SuperAdmin" });
  });

  it("returns a fragment URL while keeping the raw token out of the DTO", async () => {
    mocks.getCurrentProfile.mockResolvedValue({ id: "super-1", role: "SuperAdmin" });
    mocks.createAdminInvitation.mockResolvedValue({
      invitation: { id: "invite-1", email: "admin@example.com" },
      token: "secret-token-value-that-is-long-enough",
    });
    const response = await POST(new Request("http://localhost:3000/api/admin/invitations", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "http://localhost:3000" },
      body: JSON.stringify({ email: "Admin@Example.com" }),
    }));
    const body = await response.json() as { success: boolean; data: { invitation: { token?: string }; invitationUrl: string } };
    expect(response.status).toBe(201);
    expect(body.data.invitation.token).toBeUndefined();
    expect(body.data.invitationUrl).toBe("http://localhost:3000/admin-invite#token=secret-token-value-that-is-long-enough");
  });
});
