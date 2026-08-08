import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sendVerificationOtp: vi.fn(),
}));

vi.mock("@/lib/neon-auth", () => ({
  auth: {
    emailOtp: {
      sendVerificationOtp: mocks.sendVerificationOtp,
    },
  },
}));

vi.mock("@/lib/security/csrf", () => ({
  verifyCsrf: () => true,
}));

import { POST } from "@/app/api/auth/custom/send-otp/route";

function request(email: string) {
  return new Request("http://localhost/api/auth/custom/send-otp", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

describe("verification OTP resend protection", () => {
  beforeEach(() => {
    mocks.sendVerificationOtp.mockReset();
    mocks.sendVerificationOtp.mockResolvedValue({ data: null, error: null });
  });

  it("sends only once for concurrent requests to the same normalized email", async () => {
    const email = `otp-${Date.now()}@example.com`;
    const [first, duplicate] = await Promise.all([
      POST(request(email.toUpperCase())),
      POST(request(email)),
    ]);

    expect([first.status, duplicate.status].sort()).toEqual([200, 429]);
    expect(mocks.sendVerificationOtp).toHaveBeenCalledTimes(1);
    expect(mocks.sendVerificationOtp).toHaveBeenCalledWith({
      email,
      type: "email-verification",
    });

    const blocked = first.status === 429 ? first : duplicate;
    expect(blocked.headers.get("retry-after")).toBeTruthy();
    expect((await blocked.json()).data.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("keeps the cooldown scoped to an email address", async () => {
    const suffix = Date.now();
    const first = await POST(request(`otp-a-${suffix}@example.com`));
    const second = await POST(request(`otp-b-${suffix}@example.com`));

    expect(first.status).toBe(200);
    expect(second.status).toBe(200);
    expect(mocks.sendVerificationOtp).toHaveBeenCalledTimes(2);
  });
});
