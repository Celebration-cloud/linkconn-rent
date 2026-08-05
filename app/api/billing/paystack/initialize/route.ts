import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyCsrf } from "@/lib/security/csrf";
import { getClientIp, checkRateLimit } from "@/lib/security/rate-limiter";
import { billingPeriodSchema, planKeySchema, signupRoleSchema } from "@/schemas/billing";
import { PLAN_LIBRARY, getCheckoutAmount, getPlanMeta } from "@/domain/billing";

const schema = z.object({
  role: signupRoleSchema,
  planKey: planKeySchema,
  billingPeriod: billingPeriodSchema,
  email: z.string().email(),
});

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

export async function POST(req: NextRequest) {
  if (!verifyCsrf(req)) {
    return NextResponse.json({ success: false, message: "Security check failed." }, { status: 403 });
  }

  const rateLimit = checkRateLimit(getClientIp(req), "paystack-init", 8, 60 * 60 * 1000);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { success: false, message: "Too many billing attempts. Please try again later." },
      { status: 429 }
    );
  }

  const body = await req.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, message: parsed.error.issues[0]?.message || "Invalid billing request" },
      { status: 400 }
    );
  }

  if (!PLAN_LIBRARY[parsed.data.role].some((item) => item.key === parsed.data.planKey)) {
    return NextResponse.json({ success: false, message: "Plan does not match role." }, { status: 400 });
  }

  const plan = getPlanMeta(parsed.data.role, parsed.data.planKey);
  const amount = getCheckoutAmount(plan, parsed.data.billingPeriod);

  if (amount <= 0) {
    return NextResponse.json(
      { success: false, message: "This plan does not require payment." },
      { status: 400 }
    );
  }

  try {
    const origin = new URL(req.url).origin;
    const callbackUrl = `${origin}/billing/complete`;
    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${requiredEnv("PAYSTACK_SECRET_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: parsed.data.email,
        amount: Math.round(amount * 100),
        callback_url: callbackUrl,
        metadata: {
          role: parsed.data.role,
          planKey: parsed.data.planKey,
          billingPeriod: parsed.data.billingPeriod,
        },
      }),
    });

    const payload = (await response.json()) as {
      status: boolean;
      message?: string;
      data?: { authorization_url?: string; reference?: string };
    };

    if (!response.ok || !payload.status || !payload.data?.authorization_url) {
      return NextResponse.json(
        { success: false, message: payload.message || "Unable to start Paystack checkout" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Checkout started",
      data: {
        authorizationUrl: payload.data.authorization_url,
        reference: payload.data.reference,
      },
    });
  } catch (error) {
    console.error("[POST /api/billing/paystack/initialize]", error);
    return NextResponse.json(
      { success: false, message: "Failed to initialize checkout." },
      { status: 500 }
    );
  }
}
