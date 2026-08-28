import { randomUUID } from "node:crypto";
import { NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { getClientIp, checkRateLimit } from "@/lib/security/rate-limiter";
import { billingPeriodSchema, planKeySchema, signupRoleSchema } from "@/schemas/billing";
import { PLAN_LIBRARY, getCheckoutAmount, getPlanMeta } from "@/domain/billing";
import { initializeAccountPlanPayment } from "@/services/payments/paystack-plan";
import { AccountPlanPaymentRepository } from "@/repositories/account-plan-payment.repository";

const schema = z.object({
  role: signupRoleSchema,
  planKey: planKeySchema,
  billingPeriod: billingPeriodSchema,
  // Kept optional for compatibility with existing clients. The authenticated
  // profile email is authoritative and is the only email sent to Paystack.
  email: z.string().email().optional(),
});

function getCallbackUrl(request: NextRequest) {
  const configured = process.env.PAYSTACK_CALLBACK_URL?.trim();
  const requestUrl = new URL(request.url);
  const fallback = new URL("/billing/complete", requestUrl);
  const callback = new URL(configured || fallback.toString());
  if (callback.protocol !== "https:" && callback.protocol !== "http:") {
    throw new Error("PAYSTACK_CALLBACK_INVALID");
  }
  const configuredIsLocal = callback.hostname === "localhost" || callback.hostname === "127.0.0.1";
  const requestIsLocal = requestUrl.hostname === "localhost" || requestUrl.hostname === "127.0.0.1";
  return configuredIsLocal && !requestIsLocal ? fallback.toString() : callback.toString();
}

export async function POST(req: NextRequest) {
  try {
    if (!verifyCsrf(req)) return apiError("Security check failed.", 403);

    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (profile.role !== "Tenant" && profile.role !== "Landlord") {
      return apiError("A tenant or landlord account is required", 403);
    }

    const rateLimit = checkRateLimit(
      getClientIp(req),
      `paystack-plan-init:${profile.id}`,
      8,
      60 * 60 * 1000,
    );
    if (!rateLimit.allowed) {
      return apiError("Too many billing attempts. Please try again later.", 429);
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message || "Invalid billing request",
        400,
      );
    }
    if (parsed.data.role !== profile.role) {
      return apiError("Plan does not match your account role.", 403);
    }
    if (!PLAN_LIBRARY[profile.role].some((plan) => plan.key === parsed.data.planKey)) {
      return apiError("Plan does not match role.", 400);
    }

    const plan = getPlanMeta(profile.role, parsed.data.planKey);
    const amountMinor = Math.round(
      getCheckoutAmount(plan, parsed.data.billingPeriod) * 100,
    );
    if (amountMinor <= 0) {
      return apiError("This plan does not require payment.", 400);
    }

    const reference = `LCP-${profile.id.slice(0, 8)}-${randomUUID().slice(0, 12)}`;
    await AccountPlanPaymentRepository.create({
      profileId: profile.id,
      reference,
      planKey: parsed.data.planKey,
      billingPeriod: parsed.data.billingPeriod,
      amountMinor,
    });
    let checkout;
    try {
      checkout = await initializeAccountPlanPayment({
        email: profile.email,
        amountMinor,
        reference,
        callbackUrl: getCallbackUrl(req),
        metadata: {
          purpose: "account-plan",
          profileId: profile.id,
          role: profile.role,
          planKey: parsed.data.planKey,
          billingPeriod: parsed.data.billingPeriod,
        },
      });
    } catch (error) {
      await AccountPlanPaymentRepository.markFailed(
        reference,
        error instanceof Error ? error.message : "Paystack initialization failed",
      );
      throw error;
    }

    return apiSuccess(
      {
        authorizationUrl: checkout.authorization_url,
        reference: checkout.reference,
      },
      "Checkout started",
    );
  } catch (error) {
    console.error("[POST /api/billing/paystack/initialize]", error);
    if (error instanceof Error && error.message === "PAYSTACK_NOT_CONFIGURED") {
      return apiError("Plan payments are not configured.", 503);
    }
    if (error instanceof Error && error.message === "PAYSTACK_CALLBACK_INVALID") {
      return apiError("The payment return URL is not configured correctly.", 503);
    }
    return apiError("Failed to initialize checkout.", 502);
  }
}
