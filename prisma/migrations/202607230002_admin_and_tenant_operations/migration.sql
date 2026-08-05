ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'Processing';
ALTER TYPE "PaymentStatus" ADD VALUE IF NOT EXISTS 'Failed';

CREATE TYPE "AccountStatus" AS ENUM ('Active', 'Restricted', 'Suspended');
CREATE TYPE "ModerationStatus" AS ENUM ('PendingReview', 'Approved', 'Flagged', 'Removed');
CREATE TYPE "DisputeStatus" AS ENUM ('Open', 'Investigating', 'Resolved', 'Dismissed');
CREATE TYPE "DisputePriority" AS ENUM ('Low', 'Medium', 'High', 'Critical');
CREATE TYPE "DisputeCategory" AS ENUM ('Payment', 'Listing', 'Fraud', 'Harassment', 'Identity', 'Other');
CREATE TYPE "AdminAuditTarget" AS ENUM ('Verification', 'Dispute', 'User', 'Property', 'Payment', 'Maintenance');

ALTER TABLE "profiles" ADD COLUMN "accountStatus" "AccountStatus" NOT NULL DEFAULT 'Active';

ALTER TABLE "properties"
  ADD COLUMN "moderationStatus" "ModerationStatus" NOT NULL DEFAULT 'PendingReview',
  ADD COLUMN "moderationReason" TEXT,
  ADD COLUMN "reviewedById" TEXT,
  ADD COLUMN "reviewedAt" TIMESTAMP(3);

ALTER TABLE "maintenance_requests" ADD COLUMN "closedAt" TIMESTAMP(3);

ALTER TABLE "payments"
  ADD COLUMN "accessCode" TEXT,
  ADD COLUMN "initializedAt" TIMESTAMP(3),
  ADD COLUMN "failureReason" TEXT;

ALTER TABLE "verification_submissions"
  ADD COLUMN "assignedToId" TEXT,
  ADD COLUMN "reviewedById" TEXT,
  ADD COLUMN "decisionReason" TEXT,
  ADD COLUMN "reviewNotes" TEXT;

CREATE TABLE "dispute_cases" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" "DisputeCategory" NOT NULL,
  "priority" "DisputePriority" NOT NULL DEFAULT 'Medium',
  "status" "DisputeStatus" NOT NULL DEFAULT 'Open',
  "reporterId" TEXT NOT NULL,
  "assignedToId" TEXT,
  "propertyId" TEXT,
  "paymentId" TEXT,
  "resolution" TEXT,
  "resolvedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "dispute_cases_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "dispute_notes" (
  "id" TEXT NOT NULL,
  "disputeId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "internal" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "dispute_notes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "maintenance_activities" (
  "id" TEXT NOT NULL,
  "requestId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "fromStatus" "RequestStatus",
  "toStatus" "RequestStatus",
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "maintenance_activities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "admin_audit_events" (
  "id" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "targetType" "AdminAuditTarget" NOT NULL,
  "targetId" TEXT NOT NULL,
  "previousState" JSONB,
  "resultingState" JSONB,
  "reason" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "admin_audit_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "dispute_cases_reference_key" ON "dispute_cases"("reference");
CREATE INDEX "properties_moderationStatus_updatedAt_idx" ON "properties"("moderationStatus", "updatedAt");
CREATE INDEX "maintenance_requests_requesterId_status_idx" ON "maintenance_requests"("requesterId", "status");
CREATE INDEX "maintenance_requests_propertyId_status_idx" ON "maintenance_requests"("propertyId", "status");
CREATE INDEX "payments_tenantId_status_dueDate_idx" ON "payments"("tenantId", "status", "dueDate");
CREATE INDEX "payments_propertyId_status_idx" ON "payments"("propertyId", "status");
CREATE INDEX "verification_submissions_status_assignedToId_createdAt_idx" ON "verification_submissions"("status", "assignedToId", "createdAt");
CREATE INDEX "dispute_cases_status_priority_createdAt_idx" ON "dispute_cases"("status", "priority", "createdAt");
CREATE INDEX "dispute_cases_assignedToId_status_idx" ON "dispute_cases"("assignedToId", "status");
CREATE INDEX "dispute_cases_reporterId_createdAt_idx" ON "dispute_cases"("reporterId", "createdAt");
CREATE INDEX "dispute_notes_disputeId_createdAt_idx" ON "dispute_notes"("disputeId", "createdAt");
CREATE INDEX "maintenance_activities_requestId_createdAt_idx" ON "maintenance_activities"("requestId", "createdAt");
CREATE INDEX "admin_audit_events_targetType_targetId_createdAt_idx" ON "admin_audit_events"("targetType", "targetId", "createdAt");
CREATE INDEX "admin_audit_events_actorId_createdAt_idx" ON "admin_audit_events"("actorId", "createdAt");

ALTER TABLE "properties" ADD CONSTRAINT "properties_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "verification_submissions" ADD CONSTRAINT "verification_submissions_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "verification_submissions" ADD CONSTRAINT "verification_submissions_reviewedById_fkey" FOREIGN KEY ("reviewedById") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "dispute_cases" ADD CONSTRAINT "dispute_cases_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dispute_cases" ADD CONSTRAINT "dispute_cases_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "dispute_cases" ADD CONSTRAINT "dispute_cases_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "dispute_cases" ADD CONSTRAINT "dispute_cases_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "dispute_notes" ADD CONSTRAINT "dispute_notes_disputeId_fkey" FOREIGN KEY ("disputeId") REFERENCES "dispute_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "dispute_notes" ADD CONSTRAINT "dispute_notes_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "maintenance_activities" ADD CONSTRAINT "maintenance_activities_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "maintenance_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "maintenance_activities" ADD CONSTRAINT "maintenance_activities_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "admin_audit_events" ADD CONSTRAINT "admin_audit_events_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
