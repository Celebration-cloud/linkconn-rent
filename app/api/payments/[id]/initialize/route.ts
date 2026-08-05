import { randomUUID } from "node:crypto";
import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { TenantOperationsRepository } from "@/repositories/tenant-operations.repository";
import { paymentInitializeSchema } from "@/schemas/tenant-operations";
import { initializeRentPayment } from "@/services/payments/paystack-rent";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    const { id } = await context.params;
    const payment = await TenantOperationsRepository.getOwnedPayment(profile.id, id);
    if (!payment) return apiError("Payment not found", 404);
    return apiSuccess(payment, "Payment loaded");
  } catch (error) {
    console.error("[GET /api/payments/:id/initialize]", error);
    return apiError("Unable to load payment", 500);
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (profile.role !== "Tenant") return apiError("Tenant access required", 403);
    const input = paymentInitializeSchema.parse(await request.json());
    const { id } = await context.params;
    const payment = await TenantOperationsRepository.getOwnedPayment(profile.id, id);
    if (!payment) return apiError("Payment not found", 404);
    if (payment.status === "Paid") return apiSuccess(payment, "Payment already completed");
    if (payment.status === "Processing" && payment.reference && payment.accessCode) {
      return apiSuccess(
        {
          authorizationUrl: `https://checkout.paystack.com/${payment.accessCode}`,
          reference: payment.reference,
        },
        "Existing secure payment resumed",
      );
    }
    const reference = `LCR-${payment.id.slice(0, 8)}-${randomUUID().slice(0, 8)}`;
    const origin = new URL(request.url).origin;
    const initialized = await initializeRentPayment({
      email: payment.tenant.email,
      amount: payment.amount,
      reference,
      paymentId: payment.id,
      callbackUrl: `${origin}/dashboard/payments/${payment.id}`,
      channel: input.channel,
    });
    await TenantOperationsRepository.beginPayment(profile.id, payment.id, initialized.reference, initialized.access_code);
    return apiSuccess({ authorizationUrl: initialized.authorization_url, reference: initialized.reference }, "Secure payment initialized");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "PAYSTACK_NOT_CONFIGURED") return apiError("Rent payments are not configured", 503);
    if (error instanceof Error && error.message === "NOT_PAYABLE") return apiError("Payment is not payable", 409);
    console.error("[POST /api/payments/:id/initialize]", error);
    return apiError("Unable to initialize payment", 502);
  }
}
