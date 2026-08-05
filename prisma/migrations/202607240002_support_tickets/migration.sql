CREATE TYPE "SupportTicketStatus" AS ENUM (
  'Open',
  'InProgress',
  'WaitingOnCustomer',
  'Resolved',
  'Closed'
);

CREATE TABLE "support_tickets" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "profileId" TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "status" "SupportTicketStatus" NOT NULL DEFAULT 'Open',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "support_tickets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "support_tickets_reference_key"
ON "support_tickets"("reference");

CREATE INDEX "support_tickets_profileId_createdAt_idx"
ON "support_tickets"("profileId", "createdAt");

CREATE INDEX "support_tickets_email_createdAt_idx"
ON "support_tickets"("email", "createdAt");

ALTER TABLE "support_tickets"
ADD CONSTRAINT "support_tickets_profileId_fkey"
FOREIGN KEY ("profileId") REFERENCES "profiles"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
