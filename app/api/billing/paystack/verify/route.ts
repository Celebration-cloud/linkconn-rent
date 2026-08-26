import { connection, NextRequest } from "next/server";
import { z } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { validateAccountPlanPayment } from "@/domain/billing";
import { verifyAccountPlanPayment } from "@/services/payments/paystack-plan";
import { AccountPlanPaymentRepository } from "@/repositories/account-plan-payment.repository";

const schema = z.object({
  reference: z.string().trim().min(1, "Reference is required").max(160),
});

function privateNoStore(response: Response) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export async function GET(req: NextRequest) {
  await connection();
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (profile.role !== "Tenant" && profile.role !== "Landlord") {
      return apiError("A tenant or landlord account is required", 403);
    }

    const parsed = schema.safeParse({
      reference: req.nextUrl.searchParams.get("reference"),
    });
    if (!parsed.success) {
      return apiError(
        parsed.error.issues[0]?.message || "Missing transaction reference",
        400,
      );
    }
    if (!checkRateLimit(
      getClientIp(req),
      `paystack-plan-verify:${profile.id}`,
      12,
      60 * 60 * 1000,
    ).allowed) {
      return apiError("Too many verification attempts. Please try again later.", 429);
    }

    const transaction = await verifyAccountPlanPayment(parsed.data.reference);
    const pendingPayment = await AccountPlanPaymentRepository.findByReference(
      parsed.data.reference,
    );
    const billingProfile = {
      id: profile.id,
      email: profile.email,
      role: profile.role,
    };
    const valid =
      pendingPayment?.profileId === profile.id &&
      pendingPayment.planKey === transaction.metadata.planKey &&
      pendingPayment.billingPeriod === transaction.metadata.billingPeriod &&
      pendingPayment.amountMinor === transaction.amount &&
      pendingPayment.currency === transaction.currency &&
      transaction.reference === parsed.data.reference &&
      validateAccountPlanPayment(transaction, billingProfile);
    if (!valid) {
      return apiError(
        transaction.status === "success"
          ? "Payment does not match the selected account plan."
          : "Payment has not completed successfully.",
        409,
      );
    }

    await AccountPlanPaymentRepository.complete(
      transaction.reference,
      profile.id,
    );

    return privateNoStore(apiSuccess({
      status: "success",
      reference: transaction.reference,
      amount: transaction.amount,
      currency: transaction.currency,
      role: transaction.metadata.role,
      planKey: transaction.metadata.planKey,
      billingPeriod: transaction.metadata.billingPeriod,
    }, "Payment verified"));
  } catch (error) {
    console.error("[GET /api/billing/paystack/verify]", error);
    if (error instanceof Error && error.message === "PAYSTACK_NOT_CONFIGURED") {
      return apiError("Plan payments are not configured.", 503);
    }
    return apiError("Failed to verify payment.", 502);
  }
}
