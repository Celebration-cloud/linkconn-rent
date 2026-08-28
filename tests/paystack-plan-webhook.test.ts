import { createHmac } from "node:crypto";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findPayment: vi.fn(),
  completePayment: vi.fn(),
}));

vi.mock("@/repositories/account-plan-payment.repository", () => ({
  AccountPlanPaymentRepository: {
    findByReference: mocks.findPayment,
    complete: mocks.completePayment,
  },
}));

import { POST } from "@/app/api/billing/paystack/webhook/route";

const secret = "sk_test_webhook_unit_secret";
const event = {
  event: "charge.success",
  data: {
    status: "success",
    reference: "LCP-reference-1",
    amount: 490_000,
    currency: "NGN",
    customer: { email: "tenant@example.com" },
    metadata: {
      purpose: "account-plan",
      profileId: "tenant-profile-1",
      role: "Tenant",
      planKey: "tenant-premium",
      billingPeriod: "annual",
    },
  },
};

describe("Paystack account-plan webhook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.PAYSTACK_SECRET_KEY = secret;
    mocks.findPayment.mockResolvedValue({
      id: "plan-payment-1",
      profileId: "tenant-profile-1",
      reference: "LCP-reference-1",
      planKey: "tenant-premium",
      billingPeriod: "annual",
      amountMinor: 490_000,
      currency: "NGN",
      status: "Processing",
      profile: {
        id: "tenant-profile-1",
        email: "tenant@example.com",
        role: "Tenant",
      },
    });
    mocks.completePayment.mockResolvedValue({ status: "Paid" });
  });

  it("rejects an event without a valid Paystack signature", async () => {
    const response = await POST(new Request("https://rent.example.com/webhook", {
      method: "POST",
      headers: { "x-paystack-signature": "invalid" },
      body: JSON.stringify(event),
    }));

    expect(response.status).toBe(401);
    expect(mocks.findPayment).not.toHaveBeenCalled();
  });

  it("records a matching signed charge even if the browser callback is missed", async () => {
    const body = JSON.stringify(event);
    const signature = createHmac("sha512", secret).update(body).digest("hex");
    const response = await POST(new Request("https://rent.example.com/webhook", {
      method: "POST",
      headers: { "x-paystack-signature": signature },
      body,
    }));

    expect(response.status).toBe(200);
    expect(mocks.completePayment).toHaveBeenCalledWith(
      "LCP-reference-1",
      "tenant-profile-1",
    );
  });
});
