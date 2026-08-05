ALTER TYPE "PropertyStatus" ADD VALUE IF NOT EXISTS 'Draft' BEFORE 'Available';

CREATE TYPE "ApplicationStatus" AS ENUM ('Pending', 'Shortlisted', 'Accepted', 'Declined');
CREATE TYPE "ViewingStatus" AS ENUM ('Requested', 'Confirmed', 'Rescheduled', 'Completed', 'Cancelled');
CREATE TYPE "MessageType" AS ENUM ('Text', 'Document', 'System');
CREATE TYPE "VerificationSubmissionType" AS ENUM ('Identity', 'PropertyOwnership');
CREATE TYPE "VerificationSubmissionStatus" AS ENUM ('Draft', 'Pending', 'Approved', 'Rejected');

ALTER TABLE "properties"
  ADD COLUMN "latitude" DOUBLE PRECISION,
  ADD COLUMN "longitude" DOUBLE PRECISION,
  ADD COLUMN "houseRules" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "cautionFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "legalFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "agencyFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
  ADD COLUMN "serviceCharge" DOUBLE PRECISION NOT NULL DEFAULT 0;

ALTER TABLE "applications" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "applications"
  ALTER COLUMN "status" TYPE "ApplicationStatus"
  USING CASE
    WHEN lower("status") = 'shortlisted' THEN 'Shortlisted'::"ApplicationStatus"
    WHEN lower("status") IN ('accepted', 'approved') THEN 'Accepted'::"ApplicationStatus"
    WHEN lower("status") IN ('declined', 'rejected') THEN 'Declined'::"ApplicationStatus"
    ELSE 'Pending'::"ApplicationStatus"
  END;
ALTER TABLE "applications" ALTER COLUMN "status" SET DEFAULT 'Pending';
ALTER TABLE "applications" ADD COLUMN "score" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE "saved_properties" (
  "profileId" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "saved_properties_pkey" PRIMARY KEY ("profileId", "propertyId")
);

CREATE TABLE "viewings" (
  "id" TEXT NOT NULL,
  "propertyId" TEXT NOT NULL,
  "tenantId" TEXT NOT NULL,
  "landlordId" TEXT NOT NULL,
  "scheduledAt" TIMESTAMP(3) NOT NULL,
  "status" "ViewingStatus" NOT NULL DEFAULT 'Requested',
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "viewings_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "conversations" (
  "id" TEXT NOT NULL,
  "propertyId" TEXT,
  "applicationId" TEXT,
  "tenantId" TEXT NOT NULL,
  "landlordId" TEXT NOT NULL,
  "archivedByTenant" BOOLEAN NOT NULL DEFAULT false,
  "archivedByLandlord" BOOLEAN NOT NULL DEFAULT false,
  "lastMessageAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "messages" (
  "id" TEXT NOT NULL,
  "conversationId" TEXT NOT NULL,
  "senderId" TEXT NOT NULL,
  "type" "MessageType" NOT NULL DEFAULT 'Text',
  "body" TEXT NOT NULL,
  "attachmentName" TEXT,
  "attachmentUrl" TEXT,
  "readAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification_submissions" (
  "id" TEXT NOT NULL,
  "ownerId" TEXT NOT NULL,
  "propertyId" TEXT,
  "type" "VerificationSubmissionType" NOT NULL,
  "status" "VerificationSubmissionStatus" NOT NULL DEFAULT 'Draft',
  "documentType" TEXT,
  "note" TEXT,
  "submittedAt" TIMESTAMP(3),
  "reviewedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "verification_submissions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "verification_documents" (
  "id" TEXT NOT NULL,
  "submissionId" TEXT NOT NULL,
  "fileName" TEXT NOT NULL,
  "storageKey" TEXT,
  "mimeType" TEXT,
  "size" INTEGER,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "verification_documents_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "applications_propertyId_tenantId_key" ON "applications"("propertyId", "tenantId");
CREATE UNIQUE INDEX "conversations_applicationId_key" ON "conversations"("applicationId");
CREATE INDEX "properties_status_city_idx" ON "properties"("status", "city");
CREATE INDEX "properties_latitude_longitude_idx" ON "properties"("latitude", "longitude");
CREATE INDEX "properties_ownerId_status_idx" ON "properties"("ownerId", "status");
CREATE INDEX "saved_properties_propertyId_idx" ON "saved_properties"("propertyId");
CREATE INDEX "viewings_tenantId_scheduledAt_idx" ON "viewings"("tenantId", "scheduledAt");
CREATE INDEX "viewings_landlordId_scheduledAt_idx" ON "viewings"("landlordId", "scheduledAt");
CREATE INDEX "viewings_propertyId_scheduledAt_idx" ON "viewings"("propertyId", "scheduledAt");
CREATE INDEX "conversations_tenantId_lastMessageAt_idx" ON "conversations"("tenantId", "lastMessageAt");
CREATE INDEX "conversations_landlordId_lastMessageAt_idx" ON "conversations"("landlordId", "lastMessageAt");
CREATE INDEX "conversations_propertyId_idx" ON "conversations"("propertyId");
CREATE INDEX "messages_conversationId_createdAt_idx" ON "messages"("conversationId", "createdAt");
CREATE INDEX "messages_senderId_idx" ON "messages"("senderId");
CREATE INDEX "verification_submissions_ownerId_status_idx" ON "verification_submissions"("ownerId", "status");
CREATE INDEX "verification_submissions_propertyId_status_idx" ON "verification_submissions"("propertyId", "status");
CREATE INDEX "verification_documents_submissionId_idx" ON "verification_documents"("submissionId");

ALTER TABLE "saved_properties" ADD CONSTRAINT "saved_properties_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "saved_properties" ADD CONSTRAINT "saved_properties_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "viewings" ADD CONSTRAINT "viewings_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "viewings" ADD CONSTRAINT "viewings_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "viewings" ADD CONSTRAINT "viewings_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_landlordId_fkey" FOREIGN KEY ("landlordId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "verification_submissions" ADD CONSTRAINT "verification_submissions_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "verification_submissions" ADD CONSTRAINT "verification_submissions_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "properties"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "verification_documents" ADD CONSTRAINT "verification_documents_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "verification_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
