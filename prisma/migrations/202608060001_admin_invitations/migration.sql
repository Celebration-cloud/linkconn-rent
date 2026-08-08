ALTER TYPE "AdminAuditTarget" ADD VALUE IF NOT EXISTS 'AdminInvitation';

CREATE TABLE "admin_invitations" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "invitedById" TEXT NOT NULL,
  "acceptedById" TEXT,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "acceptedAt" TIMESTAMP(3),
  "revokedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "admin_invitations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "admin_invitations_tokenHash_key"
ON "admin_invitations"("tokenHash");

CREATE INDEX "admin_invitations_email_createdAt_idx"
ON "admin_invitations"("email", "createdAt");

CREATE INDEX "admin_invitations_invitedById_createdAt_idx"
ON "admin_invitations"("invitedById", "createdAt");

CREATE INDEX "admin_invitations_expiresAt_idx"
ON "admin_invitations"("expiresAt");

ALTER TABLE "admin_invitations"
ADD CONSTRAINT "admin_invitations_invitedById_fkey"
FOREIGN KEY ("invitedById") REFERENCES "profiles"("id")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "admin_invitations"
ADD CONSTRAINT "admin_invitations_acceptedById_fkey"
FOREIGN KEY ("acceptedById") REFERENCES "profiles"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
