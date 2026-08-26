CREATE TYPE "SupportPriority" AS ENUM ('Standard', 'Priority');

CREATE TABLE "account_plan_payments" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "planKey" TEXT NOT NULL,
  "billingPeriod" TEXT NOT NULL,
  "checkoutContext" TEXT NOT NULL DEFAULT 'onboarding',
  "amountMinor" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'NGN',
  "status" "PaymentStatus" NOT NULL DEFAULT 'Processing',
  "paidAt" TIMESTAMP(3),
  "accessStartsAt" TIMESTAMP(3),
  "accessEndsAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "revocationReason" TEXT,
  "failureReason" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "account_plan_payments_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "saved_searches" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "criteria" JSONB NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "lastMatchedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "properties" ADD COLUMN "paidVisibilityEndsAt" TIMESTAMP(3);
ALTER TABLE "properties" ADD COLUMN "featuredUntil" TIMESTAMP(3);
ALTER TABLE "support_tickets" ADD COLUMN "priority" "SupportPriority" NOT NULL DEFAULT 'Standard';

CREATE UNIQUE INDEX "account_plan_payments_reference_key" ON "account_plan_payments"("reference");
CREATE INDEX "account_plan_payments_profileId_status_accessEndsAt_idx" ON "account_plan_payments"("profileId", "status", "accessEndsAt");
CREATE INDEX "account_plan_payments_profileId_paidAt_idx" ON "account_plan_payments"("profileId", "paidAt");
CREATE INDEX "saved_searches_profileId_active_createdAt_idx" ON "saved_searches"("profileId", "active", "createdAt");
CREATE INDEX "properties_status_paidVisibilityEndsAt_idx" ON "properties"("status", "paidVisibilityEndsAt");
CREATE INDEX "properties_featured_featuredUntil_idx" ON "properties"("featured", "featuredUntil");
DROP INDEX IF EXISTS "support_tickets_status_assignedToId_updatedAt_idx";
CREATE INDEX "support_tickets_status_priority_assignedToId_updatedAt_idx" ON "support_tickets"("status", "priority", "assignedToId", "updatedAt");

ALTER TABLE "account_plan_payments" ADD CONSTRAINT "account_plan_payments_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_searches" ADD CONSTRAINT "saved_searches_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

WITH ranked AS (
  SELECT "id", ROW_NUMBER() OVER (PARTITION BY "ownerId" ORDER BY "createdAt" ASC, "id" ASC) AS slot
  FROM "properties"
  WHERE "status" = 'Available'
)
UPDATE "properties" p
SET "paidVisibilityEndsAt" = CURRENT_TIMESTAMP
FROM ranked r
WHERE p."id" = r."id" AND r.slot > 2;
