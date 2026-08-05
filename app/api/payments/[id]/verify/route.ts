import { ZodError } from "zod";
import { paystackAmountMatches } from "@/lib/admin-lifecycle";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { TenantOperationsRepository } from "@/repositories/tenant-operations.repository";
import { paymentVerifySchema } from "@/schemas/tenant-operations";
import { verifyRentPayment } from "@/services/payments/paystack-rent";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    const { id } = await context.params;
    const input = paymentVerifySchema.parse(await request.json());
    const payment = await TenantOperationsRepository.getOwnedPayment(profile.id, id);
    if (!payment) return apiError("Payment not found", 404);
    if (payment.status === "Paid") return apiSuccess(payment, "Payment already verified");
    if (payment.reference !== input.reference) return apiError("Payment reference does not match", 409);
    const verified = await verifyRentPayment(input.reference);
    const valid =
      verified.status === "success" &&
      verified.reference === input.reference &&
      verified.metadata?.paymentId === payment.id &&
      paystackAmountMatches(payment.amount, verified.amount);
    const result = await TenantOperationsRepository.completePayment(payment.id, input.reference, valid, valid ? undefined : "Paystack amount or metadata mismatch");
    if (!valid) return apiError("Payment verification failed", 409);
    return apiSuccess(result, "Payment verified");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "PAYSTACK_NOT_CONFIGURED") return apiError("Rent payments are not configured", 503);
    console.error("[POST /api/payments/:id/verify]", error);
    return apiError("Unable to verify payment", 502);
  }
}
