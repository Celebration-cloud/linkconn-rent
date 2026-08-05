import type {
  AccountStatus,
  AppRole,
  DisputePriority,
  DisputeStatus,
  ModerationStatus,
  Prisma,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import {
  canReviewVerification,
  canTransitionDispute,
  isListingDecision,
} from "@/lib/admin-lifecycle";
import {
  canReviewQueues,
  canSanctionUsers,
  REVIEWER_ROLES,
} from "@/lib/admin-permissions";

function requireReviewer(role: AppRole) {
  if (!canReviewQueues(role)) throw new Error("FORBIDDEN");
}

function requireSanctioner(role: AppRole) {
  if (!canSanctionUsers(role)) throw new Error("FORBIDDEN");
}

export class AdministrationRepository {
  static async getOverview() {
    const [
      users,
      listings,
      pendingVerifications,
      flaggedListings,
      paymentIssues,
      openDisputes,
      completedViewings,
      successfulTenancies,
    ] = await Promise.all([
      prisma.profile.count(),
      prisma.property.count(),
      prisma.verificationSubmission.count({ where: { status: "Pending" } }),
      prisma.property.count({ where: { moderationStatus: "Flagged" } }),
      prisma.payment.count({
        where: { status: { in: ["Failed", "Overdue"] } },
      }),
      prisma.disputeCase.count({
        where: { status: { in: ["Open", "Investigating"] } },
      }),
      prisma.viewing.count({ where: { status: "Completed" } }),
      prisma.application.count({ where: { status: "Accepted" } }),
    ]);

    return {
      users,
      listings,
      pendingVerifications,
      flaggedListings,
      paymentIssues,
      openDisputes,
      completedViewings,
      successfulTenancies,
    };
  }

  static listVerifications(filters: { status?: string; query?: string; limit: number }) {
    return prisma.verificationSubmission.findMany({
      where: {
        ...(filters.status ? { status: filters.status as never } : {}),
        ...(filters.query
          ? {
              owner: {
                OR: [
                  { firstName: { contains: filters.query, mode: "insensitive" } },
                  { lastName: { contains: filters.query, mode: "insensitive" } },
                  { email: { contains: filters.query, mode: "insensitive" } },
                ],
              },
            }
          : {}),
      },
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        property: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        documents: true,
      },
      orderBy: { createdAt: "asc" },
      take: filters.limit,
    });
  }

  static async reviewVerification(
    actor: { id: string; role: AppRole },
    id: string,
    input:
      | { action: "assign"; assigneeId: string }
      | { action: "approve" | "reject"; reason: string; notes?: string },
  ) {
    requireReviewer(actor.role);
    return prisma.$transaction(async (tx) => {
      const current = await tx.verificationSubmission.findUnique({ where: { id } });
      if (!current) throw new Error("NOT_FOUND");
      if (input.action === "assign") {
        if (current.assignedToId && current.assignedToId !== input.assigneeId) {
          throw new Error("ASSIGNMENT_CONFLICT");
        }
        const assignee = await tx.profile.findFirst({
          where: { id: input.assigneeId, role: { in: [...REVIEWER_ROLES] } },
          select: { id: true },
        });
        if (!assignee) throw new Error("INVALID_ASSIGNEE");
        const updated = await tx.verificationSubmission.update({
          where: { id },
          data: { assignedToId: input.assigneeId },
        });
        await tx.adminAuditEvent.create({
          data: {
            actorId: actor.id,
            action: "verification.assigned",
            targetType: "Verification",
            targetId: id,
            previousState: { assignedToId: current.assignedToId },
            resultingState: { assignedToId: input.assigneeId },
            reason: "Reviewer assignment",
          },
        });
        return updated;
      }
      if (!canReviewVerification(current.status)) throw new Error("INVALID_TRANSITION");
      const nextStatus = input.action === "approve" ? "Approved" : "Rejected";
      const updated = await tx.verificationSubmission.update({
        where: { id },
        data: {
          status: nextStatus,
          reviewedById: actor.id,
          reviewedAt: new Date(),
          decisionReason: input.reason,
          reviewNotes: input.notes,
        },
      });
      if (current.type === "Identity" && input.action === "approve") {
        await tx.profile.update({
          where: { id: current.ownerId },
          data: { verificationLevel: "FullyVerified" },
        });
      }
      await tx.adminAuditEvent.create({
        data: {
          actorId: actor.id,
          action: `verification.${input.action}d`,
          targetType: "Verification",
          targetId: id,
          previousState: { status: current.status },
          resultingState: { status: nextStatus },
          reason: input.reason,
        },
      });
      return updated;
    });
  }

  static listDisputes(filters: { status?: string; priority?: string; query?: string; limit: number }) {
    return prisma.disputeCase.findMany({
      where: {
        ...(filters.status ? { status: filters.status as DisputeStatus } : {}),
        ...(filters.priority ? { priority: filters.priority as DisputePriority } : {}),
        ...(filters.query
          ? {
              OR: [
                { reference: { contains: filters.query, mode: "insensitive" } },
                { title: { contains: filters.query, mode: "insensitive" } },
              ],
            }
          : {}),
      },
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        payment: true,
        property: { select: { id: true, title: true } },
        notes: { orderBy: { createdAt: "asc" }, include: { author: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      take: filters.limit,
    });
  }

  static async createDispute(
    reporterId: string,
    input: {
      title: string;
      description: string;
      category: Prisma.DisputeCaseCreateInput["category"];
      priority: Prisma.DisputeCaseCreateInput["priority"];
      propertyId?: string;
      paymentId?: string;
    },
  ) {
    return prisma.disputeCase.create({
      data: {
        reference: `LC-${Date.now().toString(36).toUpperCase()}`,
        title: input.title,
        description: input.description,
        category: input.category,
        priority: input.priority,
        reporterId,
        propertyId: input.propertyId,
        paymentId: input.paymentId,
      },
    });
  }

  static async actOnDispute(
    actor: { id: string; role: AppRole },
    id: string,
    input:
      | { action: "assign"; assigneeId: string }
      | { action: "investigate" | "resolve" | "dismiss"; reason: string }
      | { action: "note"; body: string; internal: boolean },
  ) {
    requireReviewer(actor.role);
    return prisma.$transaction(async (tx) => {
      const current = await tx.disputeCase.findUnique({ where: { id } });
      if (!current) throw new Error("NOT_FOUND");
      if (input.action === "note") {
        return tx.disputeNote.create({
          data: { disputeId: id, authorId: actor.id, body: input.body, internal: input.internal },
        });
      }
      if (input.action === "assign") {
        if (current.assignedToId && current.assignedToId !== input.assigneeId) {
          throw new Error("ASSIGNMENT_CONFLICT");
        }
        const updated = await tx.disputeCase.update({
          where: { id },
          data: { assignedToId: input.assigneeId },
        });
        await tx.adminAuditEvent.create({
          data: {
            actorId: actor.id,
            action: "dispute.assigned",
            targetType: "Dispute",
            targetId: id,
            previousState: { assignedToId: current.assignedToId },
            resultingState: { assignedToId: input.assigneeId },
            reason: "Investigator assignment",
          },
        });
        return updated;
      }
      const next: DisputeStatus =
        input.action === "investigate" ? "Investigating" : input.action === "resolve" ? "Resolved" : "Dismissed";
      if (!canTransitionDispute(current.status, next)) throw new Error("INVALID_TRANSITION");
      const updated = await tx.disputeCase.update({
        where: { id },
        data: {
          status: next,
          resolution: input.action === "investigate" ? undefined : input.reason,
          resolvedAt: input.action === "investigate" ? undefined : new Date(),
        },
      });
      await tx.adminAuditEvent.create({
        data: {
          actorId: actor.id,
          action: `dispute.${input.action}`,
          targetType: "Dispute",
          targetId: id,
          previousState: { status: current.status },
          resultingState: { status: next },
          reason: input.reason,
        },
      });
      return updated;
    });
  }

  static async listModeration() {
    const [users, listings, audits] = await Promise.all([
      prisma.profile.findMany({
        where: { role: { in: ["Tenant", "Landlord", "PropertyManager"] } },
        select: { id: true, firstName: true, lastName: true, email: true, role: true, accountStatus: true, updatedAt: true },
        orderBy: { updatedAt: "desc" },
        take: 30,
      }),
      prisma.property.findMany({
        where: { moderationStatus: { in: ["PendingReview", "Flagged"] } },
        include: { owner: { select: { firstName: true, lastName: true, email: true } } },
        orderBy: { updatedAt: "desc" },
        take: 30,
      }),
      prisma.adminAuditEvent.findMany({
        include: { actor: { select: { firstName: true, lastName: true } } },
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
    ]);
    return { users, listings, audits };
  }

  static async moderateUser(
    actor: { id: string; role: AppRole },
    profileId: string,
    status: AccountStatus,
    reason: string,
  ) {
    requireSanctioner(actor.role);
    if (profileId === actor.id) throw new Error("SELF_SANCTION");
    return prisma.$transaction(async (tx) => {
      const current = await tx.profile.findUnique({ where: { id: profileId } });
      if (!current) throw new Error("NOT_FOUND");
      const updated = await tx.profile.update({ where: { id: profileId }, data: { accountStatus: status } });
      await tx.adminAuditEvent.create({
        data: {
          actorId: actor.id,
          action: "user.moderated",
          targetType: "User",
          targetId: profileId,
          previousState: { accountStatus: current.accountStatus },
          resultingState: { accountStatus: status },
          reason,
        },
      });
      return updated;
    });
  }

  static async moderateListing(
    actor: { id: string; role: AppRole },
    propertyId: string,
    status: ModerationStatus,
    reason: string,
  ) {
    requireReviewer(actor.role);
    if (!isListingDecision(status)) throw new Error("INVALID_TRANSITION");
    return prisma.$transaction(async (tx) => {
      const current = await tx.property.findUnique({ where: { id: propertyId } });
      if (!current) throw new Error("NOT_FOUND");
      const updated = await tx.property.update({
        where: { id: propertyId },
        data: {
          moderationStatus: status,
          moderationReason: reason,
          reviewedById: actor.id,
          reviewedAt: new Date(),
          ...(status === "Removed" ? { status: "Archived" } : {}),
        },
      });
      await tx.adminAuditEvent.create({
        data: {
          actorId: actor.id,
          action: "property.moderated",
          targetType: "Property",
          targetId: propertyId,
          previousState: { moderationStatus: current.moderationStatus, status: current.status },
          resultingState: { moderationStatus: status, status: updated.status },
          reason,
        },
      });
      return updated;
    });
  }
}
