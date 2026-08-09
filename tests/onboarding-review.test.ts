import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  profileUpsert: vi.fn(),
  tenantUpsert: vi.fn(),
  landlordUpsert: vi.fn(),
  reviewFindFirst: vi.fn(),
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

vi.mock("@/services/storage/document-storage", () => ({
  getDocumentStorage: () => ({
    configured: true,
    inspect: async (pathname: string) => ({ pathname, contentType: "application/pdf", size: 10 }),
  }),
}));

vi.mock("@/lib/db/client", () => ({
  prisma: {
    verificationSubmission: { findFirst: mocks.reviewFindFirst },
    // eslint-disable-next-line no-unused-vars
    $transaction: vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
      callback({
        profile: { upsert: mocks.profileUpsert },
        tenantProfile: { upsert: mocks.tenantUpsert },
        landlordProfile: { upsert: mocks.landlordUpsert },
        verificationSubmission: {
          findFirst: mocks.reviewFindFirst,
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
  documents: [
    { id: "11111111-1111-4111-8111-111111111111", kind: "GovernmentId" },
    { id: "22222222-2222-4222-8222-222222222222", kind: "Selfie" },
    { id: "33333333-3333-4333-8333-333333333333", kind: "ProofOfAddress" },
    { id: "44444444-4444-4444-8444-444444444444", kind: "EmploymentEvidence" },
  ],
};

const uploadedDocuments = payload.documents.map((document) => ({
  ...document,
  storageKey: `private-verifications/review-1/${document.id}/upload.pdf`,
  uploadIntentId: null,
  mimeType: "application/pdf",
  size: 10,
}));

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
    mocks.reviewUpdate.mockResolvedValue({ id: "review-1" });
  });

  it("submits the completed private-document draft after onboarding completes", async () => {
    mocks.reviewFindFirst.mockResolvedValue({
      id: "review-1",
      documents: uploadedDocuments,
    });

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
    expect(mocks.reviewUpdate).toHaveBeenCalledWith({
      where: { id: "review-1" },
      data: expect.objectContaining({
        status: "Pending",
      }),
    });
  });

  it("blocks completion when a required document is missing", async () => {
    mocks.reviewFindFirst.mockResolvedValue({
      id: "review-1",
      documents: uploadedDocuments.slice(0, 3),
    });

    const response = await POST(request());
    const body = await response.json();

    expect(response.status).toBe(409);
    expect(body.message).toContain("Employment evidence");
    expect(mocks.reviewUpdate).not.toHaveBeenCalled();
  });
});
