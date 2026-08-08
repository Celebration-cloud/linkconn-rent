import "server-only";

import type { Prisma, Profile } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import {
  generateInvitationToken,
  hashInvitationToken,
} from "@/features/admin-invitations/server/invitation-crypto";
import { normalizeInvitationEmail } from "@/features/admin-invitations/schemas";
import type { AdminInvitationDto } from "@/features/admin-invitations/types";

const INVITATION_LIFETIME_MS = 72 * 60 * 60 * 1000;

export class AdminInvitationError extends Error {
  readonly status: 400 | 401 | 403 | 404 | 409;

  constructor(
    message: string,
    status: 400 | 401 | 403 | 404 | 409 = 400,
  ) {
    super(message);
    this.status = status;
  }
}

type InvitationActor = Pick<Profile, "id" | "role">;

export function canManageAdminInvitations(role: Profile["role"]) {
  return role === "SuperAdmin";
}

function requireSuperAdmin(actor: InvitationActor) {
  if (!canManageAdminInvitations(actor.role)) {
    throw new AdminInvitationError("Super Admin access required", 403);
  }
}

export function getAdminInvitationStatus(invitation: {
  acceptedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date;
}, now = new Date()): AdminInvitationDto["status"] {
  if (invitation.acceptedAt) return "Accepted";
  if (invitation.revokedAt) return "Revoked";
  if (invitation.expiresAt <= now) return "Expired";
  return "Pending";
}

function toDto(invitation: {
  id: string;
  email: string;
  acceptedAt: Date | null;
  revokedAt: Date | null;
  expiresAt: Date;
  createdAt: Date;
  invitedBy: { firstName: string; lastName: string; email: string };
}): AdminInvitationDto {
  const name = `${invitation.invitedBy.firstName} ${invitation.invitedBy.lastName}`.trim();
  return {
    id: invitation.id,
    email: invitation.email,
    status: getAdminInvitationStatus(invitation),
    expiresAt: invitation.expiresAt.toISOString(),
    acceptedAt: invitation.acceptedAt?.toISOString() ?? null,
    revokedAt: invitation.revokedAt?.toISOString() ?? null,
    createdAt: invitation.createdAt.toISOString(),
    invitedBy: name || invitation.invitedBy.email,
  };
}

const invitationWithInviter = {
  invitedBy: {
    select: { firstName: true, lastName: true, email: true },
  },
} satisfies Prisma.AdminInvitationInclude;

export async function listAdminInvitations(actor: InvitationActor) {
  requireSuperAdmin(actor);
  const invitations = await prisma.adminInvitation.findMany({
    include: invitationWithInviter,
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return invitations.map(toDto);
}

async function createInvitationRecord(actor: InvitationActor, rawEmail: string) {
  requireSuperAdmin(actor);
  const email = normalizeInvitationEmail(rawEmail);
  const existingProfile = await prisma.profile.findUnique({
    where: { email },
    select: { role: true },
  });
  if (existingProfile && (existingProfile.role === "Admin" || existingProfile.role === "SuperAdmin")) {
    throw new AdminInvitationError("This email already has administrator access", 409);
  }

  const token = generateInvitationToken();
  const tokenHash = hashInvitationToken(token);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + INVITATION_LIFETIME_MS);

  const invitation = await prisma.$transaction(async (tx) => {
    await tx.adminInvitation.updateMany({
      where: {
        email,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { revokedAt: now },
    });
    const created = await tx.adminInvitation.create({
      data: { email, tokenHash, invitedById: actor.id, expiresAt },
      include: invitationWithInviter,
    });
    await tx.adminAuditEvent.create({
      data: {
        actorId: actor.id,
        action: "admin.invitation.created",
        targetType: "AdminInvitation",
        targetId: created.id,
        resultingState: { email, expiresAt: expiresAt.toISOString() },
        reason: "Administrator invitation created",
      },
    });
    return created;
  }, { isolationLevel: "Serializable" });

  return { invitation: toDto(invitation), token };
}

export async function createAdminInvitation(actor: InvitationActor, email: string) {
  return createInvitationRecord(actor, email);
}

export async function rotateAdminInvitation(actor: InvitationActor, invitationId: string) {
  requireSuperAdmin(actor);
  const existing = await prisma.adminInvitation.findUnique({
    where: { id: invitationId },
    select: { email: true },
  });
  if (!existing) throw new AdminInvitationError("Invitation not found", 404);
  return createInvitationRecord(actor, existing.email);
}

export async function revokeAdminInvitation(actor: InvitationActor, invitationId: string) {
  requireSuperAdmin(actor);
  const now = new Date();
  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.adminInvitation.updateMany({
      where: { id: invitationId, acceptedAt: null, revokedAt: null },
      data: { revokedAt: now },
    });
    if (result.count !== 1) throw new AdminInvitationError("Active invitation not found", 404);
    await tx.adminAuditEvent.create({
      data: {
        actorId: actor.id,
        action: "admin.invitation.revoked",
        targetType: "AdminInvitation",
        targetId: invitationId,
        reason: "Administrator invitation revoked",
      },
    });
    return tx.adminInvitation.findUniqueOrThrow({
      where: { id: invitationId },
      include: invitationWithInviter,
    });
  });
  return toDto(updated);
}

export async function exchangeAdminInvitationToken(token: string) {
  const invitation = await prisma.adminInvitation.findUnique({
    where: { tokenHash: hashInvitationToken(token) },
    select: {
      id: true,
      email: true,
      expiresAt: true,
      acceptedAt: true,
      revokedAt: true,
    },
  });
  if (!invitation || getAdminInvitationStatus(invitation) !== "Pending") {
    throw new AdminInvitationError("Invitation is invalid or no longer active", 404);
  }
  return { id: invitation.id, email: invitation.email, expiresAt: invitation.expiresAt.toISOString() };
}

export async function acceptAdminInvitation(input: {
  invitationId: string;
  user: { id: string; email: string; name?: string | null; emailVerified: boolean };
}) {
  if (!input.user.emailVerified) {
    throw new AdminInvitationError("Verify your email before accepting this invitation", 403);
  }
  const email = normalizeInvitationEmail(input.user.email);
  const now = new Date();

  return prisma.$transaction(async (tx) => {
    const invitation = await tx.adminInvitation.findUnique({ where: { id: input.invitationId } });
    if (!invitation || getAdminInvitationStatus(invitation, now) !== "Pending") {
      throw new AdminInvitationError("Invitation is invalid or no longer active", 404);
    }
    if (invitation.email !== email) {
      throw new AdminInvitationError("Sign in with the email address that received this invitation", 403);
    }

    const emailOwner = await tx.profile.findUnique({ where: { email }, select: { id: true } });
    if (emailOwner && emailOwner.id !== input.user.id) {
      throw new AdminInvitationError("Invitation profile does not match the authenticated account", 409);
    }

    const [firstName = "Admin", ...lastNameParts] = (input.user.name ?? "").trim().split(/\s+/);
    const profile = await tx.profile.upsert({
      where: { id: input.user.id },
      create: {
        id: input.user.id,
        email,
        firstName: firstName || "Admin",
        lastName: lastNameParts.join(" ") || "User",
        role: "Admin",
        accountStatus: "Active",
        verificationLevel: "Trusted",
        onboardingComplete: true,
        emailVerified: true,
      },
      update: {
        email,
        role: "Admin",
        accountStatus: "Active",
        onboardingComplete: true,
        emailVerified: true,
      },
      select: { id: true, email: true, role: true },
    });

    const accepted = await tx.adminInvitation.updateMany({
      where: {
        id: invitation.id,
        acceptedAt: null,
        revokedAt: null,
        expiresAt: { gt: now },
      },
      data: { acceptedAt: now, acceptedById: profile.id },
    });
    if (accepted.count !== 1) throw new AdminInvitationError("Invitation was already used", 409);

    await tx.adminAuditEvent.create({
      data: {
        actorId: profile.id,
        action: "admin.invitation.accepted",
        targetType: "AdminInvitation",
        targetId: invitation.id,
        resultingState: { email, role: "Admin" },
        reason: "Administrator invitation accepted",
      },
    });
    return profile;
  }, { isolationLevel: "Serializable" });
}
