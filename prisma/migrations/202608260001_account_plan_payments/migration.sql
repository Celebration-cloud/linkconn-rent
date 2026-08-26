CREATE TABLE "account_plan_payments" (
    "id" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "planKey" TEXT NOT NULL,
    "billingPeriod" TEXT NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "status" "PaymentStatus" NOT NULL DEFAULT 'Processing',
    "paidAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "account_plan_payments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "account_plan_payments_reference_key" ON "account_plan_payments"("reference");
CREATE INDEX "account_plan_payments_profileId_status_createdAt_idx" ON "account_plan_payments"("profileId", "status", "createdAt");
CREATE INDEX "account_plan_payments_profileId_paidAt_idx" ON "account_plan_payments"("profileId", "paidAt");

ALTER TABLE "account_plan_payments"
ADD CONSTRAINT "account_plan_payments_profileId_fkey"
FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
