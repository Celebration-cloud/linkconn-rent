<<<<<<< HEAD
import { createHmac } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.PAYSTACK_SECRET_KEY;
    if (!secret) {
      return NextResponse.json({ success: false, message: "Webhook secret unconfigured" }, { status: 500 });
    }

    const body = await req.text();
    const signature = req.headers.get("x-paystack-signature");

    if (!signature) {
      return NextResponse.json({ success: false, message: "Missing signature" }, { status: 401 });
    }

    const hash = createHmac("sha512", secret).update(body).digest("hex");
    if (hash !== signature) {
      return NextResponse.json({ success: false, message: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(body) as { event: string; data?: Record<string, unknown> };

    // Acknowledge receipt of the webhook event
    return NextResponse.json({
      success: true,
      message: "Webhook processed",
      data: { event: event.event },
    });
  } catch (error) {
    console.error("[POST /api/billing/paystack/webhook]", error);
    return NextResponse.json({ success: false, message: "Failed to process webhook" }, { status: 500 });
=======
import { apiError, apiSuccess } from "@/lib/api-response";
import { validateAccountPlanPayment } from "@/domain/billing";
import { AccountPlanPaymentRepository } from "@/repositories/account-plan-payment.repository";
import {
  hasValidPaystackSignature,
  parseAccountPlanWebhook,
} from "@/services/payments/paystack-plan";

export async function POST(request: Request) {
  try {
    const body = await request.text();
    if (!hasValidPaystackSignature(
      body,
      request.headers.get("x-paystack-signature"),
    )) {
      return apiError("Invalid Paystack signature", 401);
    }

    const transaction = parseAccountPlanWebhook(body);
    if (!transaction) {
      return apiSuccess({ received: true }, "Event ignored");
    }

    const payment = await AccountPlanPaymentRepository.findByReference(
      transaction.reference,
    );
    if (
      !payment ||
      (payment.profile.role !== "Tenant" && payment.profile.role !== "Landlord")
    ) {
      return apiSuccess({ received: true }, "Event ignored");
    }
    const valid =
      payment.profileId === transaction.metadata.profileId &&
      payment.planKey === transaction.metadata.planKey &&
      payment.billingPeriod === transaction.metadata.billingPeriod &&
      payment.amountMinor === transaction.amount &&
      payment.currency === transaction.currency &&
      validateAccountPlanPayment(transaction, {
        id: payment.profile.id,
        email: payment.profile.email,
        role: payment.profile.role,
      });
    if (!valid) {
      console.error("[POST /api/billing/paystack/webhook] Plan payment mismatch", {
        reference: transaction.reference,
      });
      return apiSuccess({ received: true }, "Event ignored");
    }

    await AccountPlanPaymentRepository.complete(
      transaction.reference,
      payment.profileId,
    );
    return apiSuccess({ received: true }, "Plan payment recorded");
  } catch (error) {
    console.error("[POST /api/billing/paystack/webhook]", error);
    if (error instanceof Error && error.message === "PAYSTACK_NOT_CONFIGURED") {
      return apiError("Plan payments are not configured.", 503);
    }
    return apiError("Unable to process Paystack event", 500);
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
  }
}
