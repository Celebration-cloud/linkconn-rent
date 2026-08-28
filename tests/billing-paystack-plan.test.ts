import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";

vi.mock("next/server", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next/server")>();
  return { ...actual, connection: vi.fn().mockResolvedValue(undefined) };
});

const mocks = vi.hoisted(() => ({
  profile: vi.fn(),
  csrf: vi.fn(),
  rateLimit: vi.fn(),
  initialize: vi.fn(),
  verify: vi.fn(),
  createPayment: vi.fn(),
  findPayment: vi.fn(),
  failPayment: vi.fn(),
  completePayment: vi.fn(),
}));

vi.mock("@/lib/auth/current-profile", () => ({
  getCurrentProfile: mocks.profile,
  isAccountOperational: (profile: { accountStatus: string }) =>
    profile.accountStatus !== "Suspended",
}));
vi.mock("@/lib/security/csrf", () => ({ verifyCsrf: mocks.csrf }));
vi.mock("@/lib/security/rate-limiter", () => ({
  checkRateLimit: mocks.rateLimit,
  getClientIp: () => "127.0.0.1",
}));
vi.mock("@/services/payments/paystack-plan", () => ({
  initializeAccountPlanPayment: mocks.initialize,
  verifyAccountPlanPayment: mocks.verify,
}));
vi.mock("@/repositories/account-plan-payment.repository", () => ({
  AccountPlanPaymentRepository: {
    create: mocks.createPayment,
    findByReference: mocks.findPayment,
    markFailed: mocks.failPayment,
    complete: mocks.completePayment,
  },
}));

import { POST as initializePlan } from "@/app/api/billing/paystack/initialize/route";
import { GET as verifyPlan } from "@/app/api/billing/paystack/verify/route";

const profile = {
  id: "tenant-profile-1",
  email: "tenant@example.com",
  role: "Tenant",
  accountStatus: "Active",
  onboardingComplete: true,
};

const successfulTransaction = {
  status: "success",
  reference: "LCP-reference-1",
  amount: 490_000,
  currency: "NGN",
  customerEmail: profile.email,
  metadata: {
    purpose: "account-plan" as const,
    profileId: profile.id,
    role: "Tenant" as const,
    planKey: "tenant-premium" as const,
    billingPeriod: "annual" as const,
  },
};

describe("Paystack account-plan checkout", () => {
  const previousCallback = process.env.PAYSTACK_CALLBACK_URL;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PAYSTACK_CALLBACK_URL =
      "https://rent.example.com/billing/complete";
    mocks.profile.mockResolvedValue(profile);
    mocks.csrf.mockReturnValue(true);
    mocks.rateLimit.mockReturnValue({ allowed: true });
    mocks.initialize.mockResolvedValue({
      authorization_url: "https://checkout.paystack.com/access-code",
      access_code: "access-code",
      reference: "LCP-reference-1",
    });
    mocks.verify.mockResolvedValue(successfulTransaction);
    mocks.createPayment.mockResolvedValue({ id: "plan-payment-1" });
    mocks.findPayment.mockResolvedValue({
      id: "plan-payment-1",
      profileId: profile.id,
      reference: successfulTransaction.reference,
      planKey: successfulTransaction.metadata.planKey,
      billingPeriod: successfulTransaction.metadata.billingPeriod,
      amountMinor: successfulTransaction.amount,
      currency: successfulTransaction.currency,
      status: "Processing",
      profile,
    });
    mocks.completePayment.mockResolvedValue({
      id: "plan-payment-1",
      status: "Paid",
    });
  });

  afterEach(() => {
    if (previousCallback === undefined) {
      delete process.env.PAYSTACK_CALLBACK_URL;
    } else {
      process.env.PAYSTACK_CALLBACK_URL = previousCallback;
    }
  });

  it("binds checkout to the authenticated profile and server-calculated plan amount", async () => {
    const response = await initializePlan(
      new NextRequest("https://rent.example.com/api/billing/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "Tenant",
          planKey: "tenant-premium",
          billingPeriod: "annual",
          email: "attacker@example.com",
        }),
      }),
    );

    expect(response.status).toBe(200);
    expect(mocks.initialize).toHaveBeenCalledWith(expect.objectContaining({
      email: profile.email,
      amountMinor: 490_000,
      callbackUrl: "https://rent.example.com/billing/complete",
      metadata: {
        purpose: "account-plan",
        profileId: profile.id,
        role: "Tenant",
        planKey: "tenant-premium",
        billingPeriod: "annual",
      },
    }));
    expect(mocks.createPayment).toHaveBeenCalledWith(expect.objectContaining({
      profileId: profile.id,
      planKey: "tenant-premium",
      billingPeriod: "annual",
      amountMinor: 490_000,
    }));
  });

  it("does not send a production user back to a configured localhost callback", async () => {
    process.env.PAYSTACK_CALLBACK_URL = "http://localhost:3000/billing/complete";
    await initializePlan(
      new NextRequest("https://rent.example.com/api/billing/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "Tenant",
          planKey: "tenant-premium",
          billingPeriod: "annual",
        }),
      }),
    );

    expect(mocks.initialize).toHaveBeenCalledWith(expect.objectContaining({
      callbackUrl: "https://rent.example.com/billing/complete",
    }));
  });

  it("rejects a plan that does not match the authenticated account role", async () => {
    const response = await initializePlan(
      new NextRequest("https://rent.example.com/api/billing/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: "Landlord",
          planKey: "landlord-featured",
          billingPeriod: "monthly",
        }),
      }),
    );

    expect(response.status).toBe(403);
    expect(mocks.initialize).not.toHaveBeenCalled();
  });

  it.each([
    ["an incomplete transaction", { status: "abandoned" }],
    ["a mismatched amount", { amount: 100 }],
    ["another profile's transaction", { metadata: { ...successfulTransaction.metadata, profileId: "tenant-profile-2" } }],
  ])("does not activate %s", async (_label, change) => {
    mocks.verify.mockResolvedValue({ ...successfulTransaction, ...change });
    const response = await verifyPlan(
      new NextRequest(
        "https://rent.example.com/api/billing/paystack/verify?reference=LCP-reference-1",
      ),
    );

    expect(response.status).toBe(409);
  });

  it("returns only the verified plan fields and prevents caching", async () => {
    const response = await verifyPlan(
      new NextRequest(
        "https://rent.example.com/api/billing/paystack/verify?reference=LCP-reference-1",
      ),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe(
      "private, no-store, max-age=0",
    );
    expect(payload).toEqual({
      success: true,
      message: "Payment verified",
      data: {
        status: "success",
        reference: "LCP-reference-1",
        amount: 490_000,
        currency: "NGN",
        role: "Tenant",
        planKey: "tenant-premium",
        billingPeriod: "annual",
      },
    });
    expect(mocks.completePayment).toHaveBeenCalledWith(
      "LCP-reference-1",
      profile.id,
    );
  });
});
