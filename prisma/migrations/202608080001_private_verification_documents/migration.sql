CREATE TYPE "VerificationDocumentKind" AS ENUM (
  'GovernmentId',
  'Selfie',
  'ProofOfAddress',
  'EmploymentEvidence',
  'SelfEmploymentEvidence',
  'StudentEvidence',
  'RetirementEvidence',
  'GuarantorEvidence',
  'PropertyOwnership',
  'ManagementAuthority',
  'PayoutAccountEvidence',
  'BusinessRegistration'
);

ALTER TABLE "verification_documents"
  ADD COLUMN "kind" "VerificationDocumentKind" NOT NULL DEFAULT 'GovernmentId',
  ALTER COLUMN "fileName" DROP NOT NULL,
  ADD COLUMN "uploadIntentId" TEXT,
  ADD COLUMN "deleteAfter" TIMESTAMP(3),
  ADD COLUMN "deletedAt" TIMESTAMP(3),
  ADD COLUMN "deletionError" TEXT,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "verification_documents_submissionId_kind_idx"
  ON "verification_documents"("submissionId", "kind");

CREATE INDEX "verification_documents_deleteAfter_deletedAt_idx"
  ON "verification_documents"("deleteAfter", "deletedAt");
