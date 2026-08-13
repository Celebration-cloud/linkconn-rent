ALTER TYPE "ApplicationStatus" ADD VALUE IF NOT EXISTS 'Withdrawn';
ALTER TYPE "VerificationSubmissionStatus" ADD VALUE IF NOT EXISTS 'NeedsChanges';
ALTER TYPE "AdminAuditTarget" ADD VALUE IF NOT EXISTS 'Lease';

CREATE TYPE "LeaseStatus" AS ENUM (
  'Draft',
  'AwaitingAcceptance',
  'ChangesRequested',
  'AwaitingPayment',
  'Active',
  'Completed',
  'Cancelled',
  'Terminated'
);

CREATE TYPE "LeaseAcceptanceParty" AS ENUM ('Tenant', 'Landlord');

CREATE TYPE "NotificationKind" AS ENUM (
  'Application',
  'Viewing',
  'Verification',
  'Lease',
  'Payment',
  'Maintenance',
  'Message',
  'Support',
  'System'
);

CREATE TYPE "VerificationFindingStatus" AS ENUM (
  'Pending',
  'Approved',
  'NeedsChanges'
);

ALTER TABLE "verification_submissions"
  ADD COLUMN "reviewRound" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "correctionInstructions" TEXT;

ALTER TABLE "verification_documents"
  ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN "supersededAt" TIMESTAMP(3);

ALTER TABLE "conversations"
  ADD COLUMN "leaseId" TEXT;

ALTER TABLE "maintenance_requests"
  ADD COLUMN "leaseId" TEXT;

ALTER TABLE "viewings"
  ADD COLUMN "activeSlotKey" TEXT;

CREATE UNIQUE INDEX "viewings_activeSlotKey_key"
  ON "viewings"("activeSlotKey");

CREATE UNIQUE INDEX "conversations_tenantId_landlordId_propertyId_key"
  ON "conversations"("tenantId", "landlordId", "propertyId");

CREATE TABLE "application_activities" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "fromStatus" "ApplicationStatus",
  "toStatus" "ApplicationStatus",
  "note" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "idempotencyKey" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "application_activities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "viewing_activities" (
  "id" TEXT NOT NULL,
  "viewingId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "fromStatus" "ViewingStatus",
  "toStatus" "ViewingStatus",
  "note" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "idempotencyKey" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "viewing_activities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "leases" (
  "id" TEXT NOT NULL,
  "applicationId" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "landlordId" TEXT NOT NULL,
  "status" "LeaseStatus" NOT NULL DEFAULT 'Draft',
  "currentVersionNumber" INTEGER NOT NULL DEFAULT 0,
  "activatedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "terminatedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "leases_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lease_versions" (
  "id" TEXT NOT NULL,
  "leaseId" TEXT NOT NULL,
  "version" INTEGER NOT NULL,
  "createdById" TEXT NOT NULL,
  "terms" JSONB NOT NULL,
  "contentHash" TEXT NOT NULL,
  "renderedAgreement" TEXT NOT NULL,
  "sentAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lease_versions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lease_acceptances" (
  "id" TEXT NOT NULL,
  "leaseVersionId" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "party" "LeaseAcceptanceParty" NOT NULL,
  "legalName" TEXT NOT NULL,
  "consentVersion" TEXT NOT NULL,
  "agreementHash" TEXT NOT NULL,
  "ipHash" TEXT NOT NULL,
  "userAgentHash" TEXT NOT NULL,
  "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lease_acceptances_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lease_payment_schedule_items" (
  "id" TEXT NOT NULL,
  "leaseId" TEXT NOT NULL,
  "sequence" INTEGER NOT NULL,
  "label" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "dueDate" TIMESTAMP(3) NOT NULL,
  "paymentId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lease_payment_schedule_items_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "lease_activities" (
  "id" TEXT NOT NULL,
  "leaseId" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "fromStatus" "LeaseStatus",
  "toStatus" "LeaseStatus",
  "note" TEXT,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "idempotencyKey" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "lease_activities_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "notifications" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "kind" "NotificationKind" NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "href" TEXT NOT NULL,
  "readAt" TIMESTAMP(3),
  "idempotencyKey" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification_review_findings" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "reviewRound" INTEGER NOT NULL,
  "reviewerId" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "status" "VerificationFindingStatus" NOT NULL DEFAULT 'Pending',
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "verification_review_findings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "application_activities_idempotencyKey_key"
  ON "application_activities"("idempotencyKey");
CREATE INDEX "application_activities_applicationId_createdAt_idx"
  ON "application_activities"("applicationId", "createdAt");

CREATE UNIQUE INDEX "viewing_activities_idempotencyKey_key"
  ON "viewing_activities"("idempotencyKey");
CREATE INDEX "viewing_activities_viewingId_createdAt_idx"
  ON "viewing_activities"("viewingId", "createdAt");

CREATE UNIQUE INDEX "leases_applicationId_key" ON "leases"("applicationId");
CREATE INDEX "leases_tenantId_status_createdAt_idx"
  ON "leases"("tenantId", "status", "createdAt");
CREATE INDEX "leases_landlordId_status_createdAt_idx"
  ON "leases"("landlordId", "status", "createdAt");
CREATE INDEX "leases_propertyId_status_idx" ON "leases"("propertyId", "status");

CREATE UNIQUE INDEX "lease_versions_leaseId_version_key"
  ON "lease_versions"("leaseId", "version");
CREATE INDEX "lease_versions_leaseId_createdAt_idx"
  ON "lease_versions"("leaseId", "createdAt");

CREATE UNIQUE INDEX "lease_acceptances_leaseVersionId_party_key"
  ON "lease_acceptances"("leaseVersionId", "party");
CREATE INDEX "lease_acceptances_profileId_acceptedAt_idx"
  ON "lease_acceptances"("profileId", "acceptedAt");

CREATE UNIQUE INDEX "lease_payment_schedule_items_paymentId_key"
  ON "lease_payment_schedule_items"("paymentId");
CREATE UNIQUE INDEX "lease_payment_schedule_items_leaseId_sequence_key"
  ON "lease_payment_schedule_items"("leaseId", "sequence");
CREATE INDEX "lease_payment_schedule_items_leaseId_dueDate_idx"
  ON "lease_payment_schedule_items"("leaseId", "dueDate");
CREATE INDEX "lease_payment_schedule_items_dueDate_idx"
  ON "lease_payment_schedule_items"("dueDate");

CREATE UNIQUE INDEX "lease_activities_idempotencyKey_key"
  ON "lease_activities"("idempotencyKey");
CREATE INDEX "lease_activities_leaseId_createdAt_idx"
  ON "lease_activities"("leaseId", "createdAt");

CREATE UNIQUE INDEX "notifications_idempotencyKey_key"
  ON "notifications"("idempotencyKey");
CREATE INDEX "notifications_profileId_readAt_createdAt_idx"
  ON "notifications"("profileId", "readAt", "createdAt");
CREATE INDEX "notifications_profileId_createdAt_idx"
  ON "notifications"("profileId", "createdAt");

CREATE UNIQUE INDEX "verification_review_findings_submissionId_reviewRound_key_key"
  ON "verification_review_findings"("submissionId", "reviewRound", "key");
CREATE INDEX "verification_review_findings_reviewerId_createdAt_idx"
  ON "verification_review_findings"("reviewerId", "createdAt");

CREATE INDEX "conversations_leaseId_idx" ON "conversations"("leaseId");
CREATE INDEX "maintenance_requests_leaseId_idx" ON "maintenance_requests"("leaseId");

ALTER TABLE "application_activities"
  ADD CONSTRAINT "application_activities_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "applications"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "application_activities"
  ADD CONSTRAINT "application_activities_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "profiles"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "viewing_activities"
  ADD CONSTRAINT "viewing_activities_viewingId_fkey"
  FOREIGN KEY ("viewingId") REFERENCES "viewings"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "viewing_activities"
  ADD CONSTRAINT "viewing_activities_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "profiles"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "leases"
  ADD CONSTRAINT "leases_applicationId_fkey"
  FOREIGN KEY ("applicationId") REFERENCES "applications"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "leases"
  ADD CONSTRAINT "leases_propertyId_fkey"
  FOREIGN KEY ("propertyId") REFERENCES "properties"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "leases"
  ADD CONSTRAINT "leases_tenantId_fkey"
  FOREIGN KEY ("tenantId") REFERENCES "profiles"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "leases"
  ADD CONSTRAINT "leases_landlordId_fkey"
  FOREIGN KEY ("landlordId") REFERENCES "profiles"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lease_versions"
  ADD CONSTRAINT "lease_versions_leaseId_fkey"
  FOREIGN KEY ("leaseId") REFERENCES "leases"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lease_versions"
  ADD CONSTRAINT "lease_versions_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "profiles"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lease_acceptances"
  ADD CONSTRAINT "lease_acceptances_leaseVersionId_fkey"
  FOREIGN KEY ("leaseVersionId") REFERENCES "lease_versions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lease_acceptances"
  ADD CONSTRAINT "lease_acceptances_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "profiles"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "lease_payment_schedule_items"
  ADD CONSTRAINT "lease_payment_schedule_items_leaseId_fkey"
  FOREIGN KEY ("leaseId") REFERENCES "leases"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lease_payment_schedule_items"
  ADD CONSTRAINT "lease_payment_schedule_items_paymentId_fkey"
  FOREIGN KEY ("paymentId") REFERENCES "payments"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "lease_activities"
  ADD CONSTRAINT "lease_activities_leaseId_fkey"
  FOREIGN KEY ("leaseId") REFERENCES "leases"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "lease_activities"
  ADD CONSTRAINT "lease_activities_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "profiles"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "notifications"
  ADD CONSTRAINT "notifications_profileId_fkey"
  FOREIGN KEY ("profileId") REFERENCES "profiles"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "verification_review_findings"
  ADD CONSTRAINT "verification_review_findings_submissionId_fkey"
  FOREIGN KEY ("submissionId") REFERENCES "verification_submissions"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "verification_review_findings"
  ADD CONSTRAINT "verification_review_findings_reviewerId_fkey"
  FOREIGN KEY ("reviewerId") REFERENCES "profiles"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "conversations"
  ADD CONSTRAINT "conversations_leaseId_fkey"
  FOREIGN KEY ("leaseId") REFERENCES "leases"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "maintenance_requests"
  ADD CONSTRAINT "maintenance_requests_leaseId_fkey"
  FOREIGN KEY ("leaseId") REFERENCES "leases"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
