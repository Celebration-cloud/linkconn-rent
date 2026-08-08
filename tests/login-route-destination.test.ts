import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  signIn: vi.fn(),
  signOut: vi.fn(),
  getAccountAccessProfile: vi.fn(),
  getPostLoginDestination: vi.fn(),
}));

vi.mock("@/lib/neon-auth", () => ({
  auth: { signIn: { email: mocks.signIn }, signOut: mocks.signOut },
}));
vi.mock("@/lib/security/csrf", () => ({ verifyCsrf: () => true }));
vi.mock("@/lib/security/rate-limiter", () => ({
  getClientIp: () => "127.0.0.1",
  checkRateLimit: () => ({ allowed: true, resetTime: Date.now() + 60_000 }),
}));
vi.mock("@/lib/auth/account-access", () => ({
  getAccountAccessProfile: mocks.getAccountAccessProfile,
  getPostLoginDestination: mocks.getPostLoginDestination,
}));

import { POST } from "@/app/api/auth/custom/login/route";

function mockSuccessfulSignIn(emailVerified = true) {
  mocks.signIn.mockResolvedValue({
    error: null,
    data: {
      user: {
        id: "user-1",
        email: "person@example.com",
        emailVerified,
      },
      url: "/dashboard",
    },
  });
}

describe("custom login destination", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.signOut.mockResolvedValue({ error: null });
  });

  it("waits for account review resolution before returning a destination", async () => {
    mocks.signIn.mockResolvedValue({
      error: null,
      data: {
        user: {
          id: "user-1",
          email: "tenant@example.com",
          emailVerified: true,
        },
        url: "/dashboard",
      },
    });

    let releaseProfile: () => void = () => undefined;
    mocks.getAccountAccessProfile.mockReturnValue(
      new Promise((resolve) => {
        releaseProfile = () => resolve({ id: "user-1" });
      }),
    );
    mocks.getPostLoginDestination.mockReturnValue("/account-review");

    let settled = false;
    const responsePromise = POST(
      new Request("http://localhost/api/auth/custom/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "tenant@example.com",
          password: "correct-password",
          callbackURL: "/dashboard",
        }),
      }),
    ).then((response) => {
      settled = true;
      return response;
    });

    await Promise.resolve();
    expect(settled).toBe(false);
    releaseProfile();

    const response = await responsePromise;
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      success: true,
      data: { url: "/account-review" },
    });
    expect(mocks.getPostLoginDestination).toHaveBeenCalledWith(
      { id: "user-1" },
      "/dashboard",
    );
  });

  it.each(["Admin", "SuperAdmin"] as const)(
    "allows %s through the administrator portal",
    async (role) => {
      mockSuccessfulSignIn();
      const profile = {
        id: "user-1",
        role,
        accountStatus: "Active",
        onboardingComplete: true,
        accountReviewStatus: "NotSubmitted",
      };
      mocks.getAccountAccessProfile.mockResolvedValue(profile);
      mocks.getPostLoginDestination.mockReturnValue("/admin/invitations");

      const response = await POST(
        new Request("http://localhost/api/auth/custom/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "person@example.com",
            password: "correct-password",
            callbackURL: "/admin/invitations",
            portal: "admin",
          }),
        }),
      );

      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({ data: { url: "/admin/invitations" } });
      expect(mocks.signOut).not.toHaveBeenCalled();
    },
  );

  it("clears an administrator session created through the public login", async () => {
    mockSuccessfulSignIn();
    mocks.getAccountAccessProfile.mockResolvedValue({
      id: "user-1",
      role: "Admin",
      accountStatus: "Active",
      onboardingComplete: true,
      accountReviewStatus: "Approved",
    });

    const response = await POST(
      new Request("http://localhost/api/auth/custom/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "person@example.com",
          password: "correct-password",
          portal: "public",
        }),
      }),
    );

    expect(response.status).toBe(403);
    expect(await response.json()).toMatchObject({
      success: false,
      message: expect.stringContaining("administrator sign-in page"),
    });
    expect(mocks.signOut).toHaveBeenCalledOnce();
  });

  it.each(["Tenant", "Landlord", "PropertyManager", "Moderator"] as const)(
    "rejects %s through the administrator portal without disclosing the role",
    async (role) => {
      mockSuccessfulSignIn();
      mocks.getAccountAccessProfile.mockResolvedValue({
        id: "user-1",
        role,
        accountStatus: "Active",
        onboardingComplete: true,
        accountReviewStatus: "Approved",
      });

      const response = await POST(
        new Request("http://localhost/api/auth/custom/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: "person@example.com",
            password: "correct-password",
            portal: "admin",
          }),
        }),
      );

      expect(response.status).toBe(403);
      expect(await response.json()).toMatchObject({
        success: false,
        message: "Invalid credentials or administrator access is unavailable.",
      });
      expect(mocks.signOut).toHaveBeenCalledOnce();
    },
  );

  it("rejects and clears a suspended administrator session", async () => {
    mockSuccessfulSignIn();
    mocks.getAccountAccessProfile.mockResolvedValue({
      id: "user-1",
      role: "SuperAdmin",
      accountStatus: "Suspended",
      onboardingComplete: true,
      accountReviewStatus: "Approved",
    });

    const response = await POST(
      new Request("http://localhost/api/auth/custom/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: "person@example.com",
          password: "correct-password",
          portal: "admin",
        }),
      }),
    );

    expect(response.status).toBe(403);
    expect(mocks.signOut).toHaveBeenCalledOnce();
  });
});
