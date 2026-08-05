import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  profileUpsert: vi.fn(),
  tenantUpsert: vi.fn(),
  landlordUpsert: vi.fn(),
  reviewFindFirst: vi.fn(),
  reviewCreate: vi.fn(),
  reviewUpdate: vi.fn(),
}));

vi.mock("@/lib/neon-auth", () => ({
  auth: { getSession: mocks.getSession },
}));

vi.mock("@/lib/security/csrf", () => ({
  verifyCsrf: () => true,
}));

vi.mock("@/lib/security/rate-limiter", () => ({
  getClientIp: () => "127.0.0.1",
  checkRateLimit: () => ({ allowed: true, resetTime: Date.now() + 60_000 }),
}));

vi.mock("@/lib/db/client", () => ({
  prisma: {
    // eslint-disable-next-line no-unused-vars
    $transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({
        profile: { upsert: mocks.profileUpsert },
        tenantProfile: { upsert: mocks.tenantUpsert },
        landlordProfile: { upsert: mocks.landlordUpsert },
        verificationSubmission: {
          findFirst: mocks.reviewFindFirst,
          create: mocks.reviewCreate,
          update: mocks.reviewUpdate,
        },
      }),
    ),
  },
}));

import { POST } from "@/app/api/onboarding/complete/route";

const payload = {
  role: "Tenant",
  personal: {
    firstName: "Chidi",
    lastName: "Okafor",
    phone: "08012345678",
    nin: "12345678901",
  },
  preferences: {
    preferredLocations: ["Yaba"],
    preferredTypes: ["Flat / Apartment"],
    budgetMax: 3_000_000,
  },
  employment: {
    employmentType: "Employed",
    employerName: "LinkConn Labs",
    jobTitle: "Designer",
    incomeRange: "Above500k",
  },
};

function request() {
  return new Request("http://localhost/api/onboarding/complete", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "http://localhost",
    },
    body: JSON.stringify(payload),
  });
}

describe("post-onboarding account review", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.getSession.mockResolvedValue({
      data: {
        user: {
          id: "tenant-1",
          email: "tenant@example.com",
          emailVerified: true,
        },
      },
    });
    mocks.profileUpsert.mockResolvedValue({});
    mocks.tenantUpsert.mockResolvedValue({});
    mocks.reviewCreate.mockResolvedValue({ id: "review-1" });
    mocks.reviewUpdate.mockResolvedValue({ id: "review-1" });
  });

  it("creates one pending identity review after onboarding completes", async () => {
    mocks.reviewFindFirst.mockResolvedValue(null);

    const response = await POST(request());
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toMatchObject({
      success: true,
      data: {
        onboardingComplete: true,
        accountReviewStatus: "Pending",
      },
    });
    expect(mocks.profileUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        update: expect.objectContaining({ onboardingComplete: true }),
      }),
    );
    expect(mocks.reviewCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        ownerId: "tenant-1",
        type: "Identity",
        status: "Pending",
      }),
    });
  });

  it("resubmits a rejected review instead of creating a duplicate", async () => {
    mocks.reviewFindFirst.mockResolvedValue({
      id: "review-1",
      status: "Rejected",
    });

    const response = await POST(request());

    expect(response.status).toBe(200);
    expect(mocks.reviewCreate).not.toHaveBeenCalled();
    expect(mocks.reviewUpdate).toHaveBeenCalledWith({
      where: { id: "review-1" },
      data: expect.objectContaining({
        status: "Pending",
        assignedToId: null,
        reviewedById: null,
        decisionReason: null,
      }),
    });
  });
});
