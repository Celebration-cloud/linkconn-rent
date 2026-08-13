import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentProfile: vi.fn(),
  getOwnerWorkspace: vi.fn(),
  resubmit: vi.fn(),
}));

vi.mock("@/lib/auth/current-profile", () => ({
  getCurrentProfile: mocks.getCurrentProfile,
  isAccountOperational: (profile: { accountStatus: string }) => profile.accountStatus !== "Suspended",
}));
vi.mock("@/repositories/verification.repository", () => ({
  VerificationRepository: {
    getOwnerWorkspace: mocks.getOwnerWorkspace,
    resubmit: mocks.resubmit,
  },
}));
vi.mock("@/lib/security/csrf", () => ({ verifyCsrf: () => true }));
vi.mock("@/lib/security/rate-limiter", () => ({
  checkRateLimit: () => ({ allowed: true, remaining: 9, resetTime: Date.now() + 60_000 }),
  getClientIp: () => "127.0.0.1",
}));

import { GET, POST } from "@/app/api/verifications/route";

const profile = {
  id: "owner-1",
  email: "ada@example.com",
  firstName: "Ada",
  lastName: "Okafor",
  role: "Landlord",
  accountStatus: "Active",
  onboardingComplete: true,
};

describe("owner verification route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentProfile.mockResolvedValue(profile);
    mocks.getOwnerWorkspace.mockResolvedValue({ current: { id: "submission-1" } });
    mocks.resubmit.mockResolvedValue({ id: "submission-1", status: "Pending", reviewRound: 3 });
  });

  it("returns the owner workspace in a private no-store envelope", async () => {
    const response = await GET();
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("private");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect(mocks.getOwnerWorkspace).toHaveBeenCalledWith("owner-1", "Landlord");
  });

  it("resubmits through the validated API envelope", async () => {
    const response = await POST(new Request("http://localhost:3000/api/verifications", {
      method: "POST",
      headers: { origin: "http://localhost:3000", "content-type": "application/json" },
      body: JSON.stringify({
        action: "resubmit",
        submissionId: "11111111-1111-4111-8111-111111111111",
        reviewRound: 2,
      }),
    }));
    expect(response.status).toBe(200);
    expect((await response.json())).toEqual(expect.objectContaining({ success: true, message: "Verification resubmitted" }));
    expect(mocks.resubmit).toHaveBeenCalledWith("owner-1", "Landlord", {
      submissionId: "11111111-1111-4111-8111-111111111111",
      reviewRound: 2,
    });
  });

  it("maps stale and incomplete resubmissions to actionable conflicts", async () => {
    mocks.resubmit.mockRejectedValueOnce(new Error("RESUBMIT_CONFLICT"));
    const stale = await POST(new Request("http://localhost:3000/api/verifications", {
      method: "POST",
      headers: { origin: "http://localhost:3000", "content-type": "application/json" },
      body: JSON.stringify({ action: "resubmit", submissionId: "11111111-1111-4111-8111-111111111111", reviewRound: 2 }),
    }));
    expect(stale.status).toBe(409);
  });
});
