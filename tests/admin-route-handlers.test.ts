import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getCurrentProfile: vi.fn(),
  hasRole: vi.fn(),
  listVerifications: vi.fn(),
  reviewVerification: vi.fn(),
}));

vi.mock("@/lib/auth/current-profile", () => ({
  getCurrentProfile: mocks.getCurrentProfile,
  hasRole: mocks.hasRole,
  isAccountOperational: (profile: { accountStatus: string }) => profile.accountStatus !== "Suspended",
}));

vi.mock("@/repositories/administration.repository", () => ({
  AdministrationRepository: {
    listVerifications: mocks.listVerifications,
    reviewVerification: mocks.reviewVerification,
  },
}));

import { GET } from "@/app/api/admin/verifications/route";
import { PATCH } from "@/app/api/admin/verifications/[id]/route";

const reviewer = {
  id: "reviewer",
  email: "reviewer@linkconn.rent",
  firstName: "Ada",
  lastName: "Nwosu",
  role: "Moderator",
  accountStatus: "Active",
  onboardingComplete: true,
};

describe("admin verification route handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.hasRole.mockReturnValue(true);
    mocks.listVerifications.mockResolvedValue([]);
  });

  it("returns a consistent unauthenticated envelope", async () => {
    mocks.getCurrentProfile.mockResolvedValue(null);
    const response = await GET(new Request("http://localhost/api/admin/verifications"));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({
      success: false,
      data: null,
      message: "Authentication required",
    });
  });

  it("rejects roles without queue permission", async () => {
    mocks.getCurrentProfile.mockResolvedValue(reviewer);
    mocks.hasRole.mockReturnValue(false);
    const response = await GET(new Request("http://localhost/api/admin/verifications"));
    expect(response.status).toBe(403);
    expect((await response.json()).success).toBe(false);
    expect(mocks.listVerifications).not.toHaveBeenCalled();
  });

  it("returns an empty queue through the success envelope", async () => {
    mocks.getCurrentProfile.mockResolvedValue(reviewer);
    const response = await GET(new Request("http://localhost/api/admin/verifications"));
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      success: true,
      data: [],
      message: "Verification queue loaded",
    });
  });

  it("rejects invalid review decisions before repository access", async () => {
    mocks.getCurrentProfile.mockResolvedValue(reviewer);
    const response = await PATCH(
      new Request("http://localhost/api/admin/verifications/submission", {
        method: "PATCH",
        body: JSON.stringify({ action: "approve", reason: "short" }),
      }),
      { params: Promise.resolve({ id: "submission" }) },
    );
    expect(response.status).toBe(400);
    expect(mocks.reviewVerification).not.toHaveBeenCalled();
  });
});
