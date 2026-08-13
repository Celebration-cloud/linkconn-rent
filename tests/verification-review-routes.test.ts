import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentProfile: vi.fn(),
  hasFreshAuthentication: vi.fn(),
  getVerificationDetail: vi.fn(),
  revealVerificationSensitive: vi.fn(),
  reviewVerification: vi.fn(),
}));

vi.mock("@/lib/auth/current-profile", () => ({
  getCurrentProfile: mocks.getCurrentProfile,
  hasRole: (profile: { role: string }, roles: string[]) => roles.includes(profile.role),
  isAccountOperational: (profile: { accountStatus: string }) => profile.accountStatus !== "Suspended",
}));

vi.mock("@/lib/auth/fresh-auth", () => ({
  hasFreshAuthentication: mocks.hasFreshAuthentication,
}));

vi.mock("@/repositories/administration.repository", () => ({
  AdministrationRepository: {
    getVerificationDetail: mocks.getVerificationDetail,
    revealVerificationSensitive: mocks.revealVerificationSensitive,
    reviewVerification: mocks.reviewVerification,
  },
}));

vi.mock("@/lib/security/csrf", () => ({ verifyCsrf: () => true }));
vi.mock("@/lib/security/admin-rate-limiter", () => ({
  checkAdminRateLimit: () => Promise.resolve({ allowed: true, remaining: 9, resetTime: Date.now() + 60_000 }),
  adminRateLimitResponse: vi.fn(),
}));

import { GET as getDetail, PATCH as review } from "@/app/api/admin/verifications/[id]/route";
import { GET as revealSensitive } from "@/app/api/admin/verifications/[id]/sensitive/route";

const ID = "11111111-1111-4111-8111-111111111111";
const profile = {
  id: "admin-1",
  email: "admin@example.com",
  firstName: "Admin",
  lastName: "Reviewer",
  role: "Admin",
  accountStatus: "Active",
  onboardingComplete: true,
};

describe("verification review detail and sensitive routes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getCurrentProfile.mockResolvedValue(profile);
    mocks.hasFreshAuthentication.mockResolvedValue(true);
    mocks.getVerificationDetail.mockResolvedValue({ id: ID, documents: [] });
    mocks.revealVerificationSensitive.mockResolvedValue({ nin: "12345678901", payoutAccount: null });
    mocks.reviewVerification.mockResolvedValue({ id: ID, status: "NeedsChanges" });
  });

  it("serves an authorized detail through a private no-store envelope", async () => {
    const response = await getDetail(new Request(`http://localhost/api/admin/verifications/${ID}`), {
      params: Promise.resolve({ id: ID }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("private");
    expect(response.headers.get("cache-control")).toContain("no-store");
    expect((await response.json()).data).toEqual({ id: ID, documents: [] });
  });

  it("never allows a moderator to reveal sensitive values", async () => {
    mocks.getCurrentProfile.mockResolvedValue({ ...profile, role: "Moderator" });
    const response = await revealSensitive(new Request(`http://localhost/api/admin/verifications/${ID}/sensitive`), {
      params: Promise.resolve({ id: ID }),
    });

    expect(response.status).toBe(403);
    expect(mocks.revealVerificationSensitive).not.toHaveBeenCalled();
  });

  it("requires a fresh session and marks successful reveals no-store", async () => {
    mocks.hasFreshAuthentication.mockResolvedValue(false);
    const stale = await revealSensitive(new Request(`http://localhost/api/admin/verifications/${ID}/sensitive`), {
      params: Promise.resolve({ id: ID }),
    });
    expect(stale.status).toBe(401);

    mocks.hasFreshAuthentication.mockResolvedValue(true);
    const response = await revealSensitive(new Request(`http://localhost/api/admin/verifications/${ID}/sensitive`), {
      params: Promise.resolve({ id: ID }),
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toContain("no-store");
  });

  it("requires fresh authentication for review decisions", async () => {
    mocks.hasFreshAuthentication.mockResolvedValue(false);
    const response = await review(
      new Request(`http://localhost/api/admin/verifications/${ID}`, {
        method: "PATCH",
        body: JSON.stringify({
          action: "request_changes",
          reason: "Identity evidence cannot be verified.",
          correctionInstructions: "Upload a clear uncropped government ID.",
          findings: [
            { key: "identity_match", status: "NeedsChanges", note: "Name is unreadable." },
            { key: "document_validity", status: "NeedsChanges", note: "Document is blurred." },
            { key: "profile_consistency", status: "Approved" },
          ],
        }),
      }),
      { params: Promise.resolve({ id: ID }) },
    );

    expect(response.status).toBe(401);
    expect(mocks.reviewVerification).not.toHaveBeenCalled();
  });

  it.each(["ASSIGNMENT_CONFLICT", "REVIEW_CONFLICT"])("maps %s review races to conflict", async (code) => {
    mocks.reviewVerification.mockRejectedValue(new Error(code));
    const response = await review(
      new Request(`http://localhost/api/admin/verifications/${ID}`, {
        method: "PATCH",
        body: JSON.stringify({
          action: "approve",
          reason: "All required identity evidence has been verified.",
          findings: [
            { key: "identity_match", status: "Approved" },
            { key: "document_validity", status: "Approved" },
            { key: "profile_consistency", status: "Approved" },
          ],
        }),
      }),
      { params: Promise.resolve({ id: ID }) },
    );

    expect(response.status).toBe(409);
  });
});
