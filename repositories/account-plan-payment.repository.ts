import "server-only";

import { prisma } from "@/lib/db/client";
import type { BillingPeriod, PlanKey } from "@/domain/billing";

export class AccountPlanPaymentRepository {
  static create(input: {
    profileId: string;
    reference: string;
    planKey: PlanKey;
    billingPeriod: BillingPeriod;
    amountMinor: number;
  }) {
    return prisma.accountPlanPayment.create({
      data: {
        ...input,
        currency: "NGN",
        status: "Processing",
      },
    });
  }

  static findByReference(reference: string) {
    return prisma.accountPlanPayment.findUnique({
      where: { reference },
      include: {
        profile: {
          select: { id: true, email: true, role: true },
        },
      },
    });
  }

  static async markFailed(reference: string, reason: string) {
    await prisma.accountPlanPayment.updateMany({
      where: { reference, status: "Processing" },
      data: { status: "Failed", failureReason: reason.slice(0, 240) },
    });
  }

  static async complete(reference: string, profileId: string) {
    return prisma.$transaction(async (tx) => {
      const payment = await tx.accountPlanPayment.findUnique({
        where: { reference },
      });
      if (!payment || payment.profileId !== profileId) {
        throw new Error("PLAN_PAYMENT_NOT_FOUND");
      }
      if (payment.status === "Paid") return payment;
      if (payment.status !== "Processing") {
        throw new Error("PLAN_PAYMENT_NOT_PAYABLE");
      }
      return tx.accountPlanPayment.update({
        where: { id: payment.id },
        data: {
          status: "Paid",
          paidAt: new Date(),
          failureReason: null,
        },
      });
    });
  }
}
