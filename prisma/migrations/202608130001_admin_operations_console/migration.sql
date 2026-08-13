ALTER TYPE "AdminAuditTarget" ADD VALUE IF NOT EXISTS 'Support';

ALTER TABLE "support_tickets"
  ADD COLUMN "assignedToId" TEXT;

ALTER TABLE "support_tickets"
  ADD CONSTRAINT "support_tickets_assignedToId_fkey"
  FOREIGN KEY ("assignedToId") REFERENCES "profiles"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "support_tickets_status_assignedToId_updatedAt_idx"
  ON "support_tickets"("status", "assignedToId", "updatedAt");

CREATE TABLE "support_ticket_activities" (
  "id" TEXT NOT NULL,
  "ticketId" TEXT NOT NULL,
  "actorId" TEXT NOT NULL,
  "fromStatus" "SupportTicketStatus",
  "toStatus" "SupportTicketStatus",
  "note" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "support_ticket_activities_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "support_ticket_activities"
  ADD CONSTRAINT "support_ticket_activities_ticketId_fkey"
  FOREIGN KEY ("ticketId") REFERENCES "support_tickets"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "support_ticket_activities"
  ADD CONSTRAINT "support_ticket_activities_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "profiles"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "support_ticket_activities_ticketId_createdAt_idx"
  ON "support_ticket_activities"("ticketId", "createdAt");

CREATE TABLE "admin_rate_limit_buckets" (
  "id" TEXT NOT NULL,
  "scope" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "windowStart" TIMESTAMP(3) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 1,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "admin_rate_limit_buckets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_rate_limit_buckets_scope_keyHash_windowStart_key"
  ON "admin_rate_limit_buckets"("scope", "keyHash", "windowStart");

CREATE INDEX "admin_rate_limit_buckets_expiresAt_idx"
  ON "admin_rate_limit_buckets"("expiresAt");
