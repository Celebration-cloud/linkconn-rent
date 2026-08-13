import type {
  AccountStatus,
  AppRole,
  DisputePriority,
  DisputeStatus,
  ModerationStatus,
  Prisma,
  RequestStatus,
  SupportTicketStatus,
} from "@prisma/client";
import { prisma } from "@/lib/db/client";
import {
  canReviewVerification,
  canTransitionDispute,
  isListingDecision,
} from "@/lib/admin-lifecycle";
import {
  canAccessPrivateVerificationDocuments,
  canReviewQueues,
  canSanctionUsers,
  REVIEWER_ROLES,
} from "@/lib/admin-permissions";
import type { AdminQueueFilters } from "@/schemas/administration";
import { getDocumentDeletionDeadline } from "@/features/verifications/document-retention";

function pageResult<T>(items: T[], totalItems: number, page: number, pageSize: number) {
  return {
    items,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
    },
  };
}

function requireReviewer(role: AppRole) {
  if (!canReviewQueues(role)) throw new Error("FORBIDDEN");
}

function requireSanctioner(role: AppRole) {
  if (!canSanctionUsers(role)) throw new Error("FORBIDDEN");
}

const SUPPORT_TRANSITIONS: Record<SupportTicketStatus, SupportTicketStatus[]> = {
  Open: ["InProgress", "WaitingOnCustomer", "Resolved", "Closed"],
  InProgress: ["WaitingOnCustomer", "Resolved", "Closed"],
  WaitingOnCustomer: ["InProgress", "Resolved", "Closed"],
  Resolved: ["InProgress", "Closed"],
  Closed: ["InProgress"],
};

const MAINTENANCE_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  Pending: ["InProgress", "Completed", "Closed"],
  InProgress: ["Completed", "Closed"],
  Completed: ["InProgress", "Closed"],
  Closed: ["InProgress"],
};

export class AdministrationRepository {
  static async getNavigationCounts() {
    const [verifications, disputes, moderation, support, maintenance] = await Promise.all([
      prisma.verificationSubmission.count({ where: { status: "Pending" } }),
      prisma.disputeCase.count({ where: { status: { in: ["Open", "Investigating"] } } }),
      prisma.property.count({ where: { moderationStatus: { in: ["PendingReview", "Flagged"] } } }),
      prisma.supportTicket.count({ where: { status: { in: ["Open", "InProgress", "WaitingOnCustomer"] } } }),
      prisma.maintenanceRequest.count({ where: { status: { in: ["Pending", "InProgress"] } } }),
    ]);
    return { verifications, disputes, moderation, support, maintenance };
  }

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
      openSupport,
      activeMaintenance,
      recentActivity,
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
      prisma.supportTicket.count({ where: { status: { in: ["Open", "InProgress", "WaitingOnCustomer"] } } }),
      prisma.maintenanceRequest.count({ where: { status: { in: ["Pending", "InProgress"] } } }),
      prisma.adminAuditEvent.findMany({
        select: {
          id: true, action: true, reason: true, targetType: true, createdAt: true,
          actor: { select: { firstName: true, lastName: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 8,
      }),
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
      openSupport,
      activeMaintenance,
      recentActivity,
    };
  }

  static async listVerifications(filters: AdminQueueFilters, viewerRole?: AppRole) {
    const where: Prisma.VerificationSubmissionWhereInput = {
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
    };
    const [items, totalItems] = await Promise.all([
      prisma.verificationSubmission.findMany({
      where,
      include: {
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            emailVerified: true,
            tenantProfile: {
              select: {
                employmentType: true,
                employerName: true,
                jobTitle: true,
                incomeRange: true,
                preferredLocations: true,
                preferredTypes: true,
                budgetMin: true,
                budgetMax: true,
                moveInDate: true,
                ninStatus: true,
                ninNumber: true,
              },
            },
            landlordProfile: {
              select: {
                businessName: true,
                propertyCount: true,
                propertyTypesOffered: true,
                ninStatus: true,
                ninNumber: true,
                bankName: true,
                accountNumber: true,
                accountName: true,
              },
            },
          },
        },
        property: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        documents: {
          select: {
            id: true,
            kind: true,
            fileName: true,
            mimeType: true,
            size: true,
            deletedAt: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
      prisma.verificationSubmission.count({ where }),
    ]);
    const canViewSensitive = viewerRole
      ? canAccessPrivateVerificationDocuments(viewerRole)
      : false;
    const safeItems = items.map((item) => ({
      ...item,
      owner: {
        ...item.owner,
        tenantProfile: item.owner.tenantProfile
          ? {
              ...item.owner.tenantProfile,
              ninNumber: canViewSensitive ? item.owner.tenantProfile.ninNumber : null,
            }
          : null,
        landlordProfile: item.owner.landlordProfile
          ? {
              ...item.owner.landlordProfile,
              ninNumber: canViewSensitive ? item.owner.landlordProfile.ninNumber : null,
              accountNumber: canViewSensitive ? item.owner.landlordProfile.accountNumber : null,
            }
          : null,
      },
    }));
    return pageResult(safeItems, totalItems, filters.page, filters.pageSize);
  }

  static async reviewVerification(
    actor: { id: string; role: AppRole },
    id: string,
    input:
      | { action: "assign" }
      | { action: "approve" | "reject"; reason: string; notes?: string },
  ) {
    requireReviewer(actor.role);
    return prisma.$transaction(async (tx) => {
      const current = await tx.verificationSubmission.findUnique({ where: { id } });
      if (!current) throw new Error("NOT_FOUND");
      if (input.action === "assign") {
        if (current.assignedToId && current.assignedToId !== actor.id) {
          throw new Error("ASSIGNMENT_CONFLICT");
        }
        const assignee = await tx.profile.findFirst({
          where: { id: actor.id, role: { in: [...REVIEWER_ROLES] }, accountStatus: { not: "Suspended" } },
          select: { id: true },
        });
        if (!assignee) throw new Error("INVALID_ASSIGNEE");
        const updated = await tx.verificationSubmission.update({
          where: { id },
          data: { assignedToId: actor.id },
        });
        await tx.adminAuditEvent.create({
          data: {
            actorId: actor.id,
            action: "verification.assigned",
            targetType: "Verification",
            targetId: id,
            previousState: { assignedToId: current.assignedToId },
            resultingState: { assignedToId: actor.id },
            reason: "Reviewer assignment",
          },
        });
        return updated;
      }
      if (!canReviewVerification(current.status)) throw new Error("INVALID_TRANSITION");
      const nextStatus = input.action === "approve" ? "Approved" : "Rejected";
      const reviewedAt = new Date();
      const updated = await tx.verificationSubmission.update({
        where: { id },
        data: {
          status: nextStatus,
          reviewedById: actor.id,
          reviewedAt,
          decisionReason: input.reason,
          reviewNotes: input.notes,
        },
      });
      await tx.verificationDocument.updateMany({
        where: { submissionId: id, storageKey: { not: null }, deletedAt: null },
        data: {
          deleteAfter: getDocumentDeletionDeadline(reviewedAt),
          deletionError: null,
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

  static async listDisputes(filters: AdminQueueFilters) {
    const where: Prisma.DisputeCaseWhereInput = {
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
    };
    const [items, totalItems] = await Promise.all([
      prisma.disputeCase.findMany({
      where,
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        payment: true,
        property: { select: { id: true, title: true } },
        notes: { orderBy: { createdAt: "asc" }, include: { author: { select: { firstName: true, lastName: true } } } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "asc" }],
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
      prisma.disputeCase.count({ where }),
    ]);
    return pageResult(items, totalItems, filters.page, filters.pageSize);
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
      | { action: "assign" }
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
        if (current.assignedToId && current.assignedToId !== actor.id) {
          throw new Error("ASSIGNMENT_CONFLICT");
        }
        const assignee = await tx.profile.findFirst({
          where: { id: actor.id, role: { in: [...REVIEWER_ROLES] }, accountStatus: { not: "Suspended" } },
          select: { id: true },
        });
        if (!assignee) throw new Error("INVALID_ASSIGNEE");
        const updated = await tx.disputeCase.update({
          where: { id },
          data: { assignedToId: actor.id },
        });
        await tx.adminAuditEvent.create({
          data: {
            actorId: actor.id,
            action: "dispute.assigned",
            targetType: "Dispute",
            targetId: id,
            previousState: { assignedToId: current.assignedToId },
            resultingState: { assignedToId: actor.id },
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

  static async listUsers(filters: AdminQueueFilters) {
    const where: Prisma.ProfileWhereInput = {
      ...(filters.role ? { role: filters.role as AppRole } : {}),
      ...(filters.status ? { accountStatus: filters.status as AccountStatus } : {}),
      ...(filters.query
        ? {
            OR: [
              { firstName: { contains: filters.query, mode: "insensitive" } },
              { lastName: { contains: filters.query, mode: "insensitive" } },
              { email: { contains: filters.query, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [items, totalItems] = await Promise.all([
      prisma.profile.findMany({
        where,
        select: {
          id: true, firstName: true, lastName: true, email: true, role: true,
          accountStatus: true, verificationLevel: true, emailVerified: true,
          onboardingComplete: true, createdAt: true, updatedAt: true,
          _count: { select: { properties: true, applications: true, payments: true } },
        },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.profile.count({ where }),
    ]);
    return pageResult(items, totalItems, filters.page, filters.pageSize);
  }

  static async listProperties(filters: AdminQueueFilters) {
    const where: Prisma.PropertyWhereInput = {
      ...(filters.status ? { moderationStatus: filters.status as ModerationStatus } : {}),
      ...(filters.query
        ? {
            OR: [
              { title: { contains: filters.query, mode: "insensitive" } },
              { location: { contains: filters.query, mode: "insensitive" } },
              { city: { contains: filters.query, mode: "insensitive" } },
              { owner: { email: { contains: filters.query, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
    const [items, totalItems] = await Promise.all([
      prisma.property.findMany({
        where,
        select: {
          id: true, title: true, location: true, city: true, type: true, price: true,
          status: true, moderationStatus: true, moderationReason: true, verified: true,
          createdAt: true, updatedAt: true, reviewedAt: true,
          owner: { select: { id: true, firstName: true, lastName: true, email: true } },
          reviewedBy: { select: { firstName: true, lastName: true } },
        },
        orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.property.count({ where }),
    ]);
    return pageResult(items, totalItems, filters.page, filters.pageSize);
  }

  static async listPayments(filters: AdminQueueFilters) {
    const where: Prisma.PaymentWhereInput = {
      ...(filters.status ? { status: filters.status as never } : {}),
      ...(filters.query
        ? {
            OR: [
              { reference: { contains: filters.query, mode: "insensitive" } },
              { property: { title: { contains: filters.query, mode: "insensitive" } } },
              { tenant: { email: { contains: filters.query, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
    const [items, totalItems] = await Promise.all([
      prisma.payment.findMany({
        where,
        select: {
          id: true, amount: true, status: true, reference: true, failureReason: true,
          dueDate: true, paidAt: true, createdAt: true, updatedAt: true,
          tenant: { select: { id: true, firstName: true, lastName: true, email: true } },
          property: { select: { id: true, title: true, location: true } },
          _count: { select: { disputes: true } },
        },
        orderBy: [{ updatedAt: "desc" }, { id: "asc" }],
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.payment.count({ where }),
    ]);
    return pageResult(items, totalItems, filters.page, filters.pageSize);
  }

  static async listAuditEvents(filters: AdminQueueFilters) {
    const where: Prisma.AdminAuditEventWhereInput = {
      ...(filters.targetType ? { targetType: filters.targetType as never } : {}),
      ...(filters.query
        ? {
            OR: [
              { action: { contains: filters.query, mode: "insensitive" } },
              { reason: { contains: filters.query, mode: "insensitive" } },
              { targetId: { contains: filters.query, mode: "insensitive" } },
              { actor: { email: { contains: filters.query, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
    const [items, totalItems] = await Promise.all([
      prisma.adminAuditEvent.findMany({
        where,
        select: {
          id: true, action: true, targetType: true, targetId: true, reason: true,
          previousState: true, resultingState: true, createdAt: true,
          actor: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
        },
        orderBy: [{ createdAt: "desc" }, { id: "asc" }],
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.adminAuditEvent.count({ where }),
    ]);
    return pageResult(items, totalItems, filters.page, filters.pageSize);
  }

  static async listSupportTickets(filters: AdminQueueFilters) {
    const where: Prisma.SupportTicketWhereInput = {
      ...(filters.status ? { status: filters.status as SupportTicketStatus } : {}),
      ...(filters.assignee === "unassigned"
        ? { assignedToId: null }
        : filters.assignee
          ? { assignedToId: filters.assignee }
          : {}),
      ...(filters.category ? { category: filters.category } : {}),
      ...(filters.query
        ? {
            OR: [
              { reference: { contains: filters.query, mode: "insensitive" } },
              { subject: { contains: filters.query, mode: "insensitive" } },
              { name: { contains: filters.query, mode: "insensitive" } },
              { email: { contains: filters.query, mode: "insensitive" } },
            ],
          }
        : {}),
    };
    const [items, totalItems] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          profile: { select: { id: true, firstName: true, lastName: true, role: true } },
          assignedTo: { select: { id: true, firstName: true, lastName: true } },
          activities: {
            include: { actor: { select: { firstName: true, lastName: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { createdAt: filters.sort === "oldest" ? "asc" : "desc" },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.supportTicket.count({ where }),
    ]);
    return pageResult(items, totalItems, filters.page, filters.pageSize);
  }

  static async actOnSupportTicket(
    actor: { id: string; role: AppRole },
    id: string,
    input:
      | { action: "assign" }
      | { action: "status"; status: SupportTicketStatus; reason: string }
      | { action: "note"; note: string },
  ) {
    requireReviewer(actor.role);
    return prisma.$transaction(async (tx) => {
      const current = await tx.supportTicket.findUnique({ where: { id } });
      if (!current) throw new Error("NOT_FOUND");
      if (input.action === "assign") {
        if (current.assignedToId && current.assignedToId !== actor.id) throw new Error("ASSIGNMENT_CONFLICT");
        const assignee = await tx.profile.findFirst({
          where: { id: actor.id, role: { in: [...REVIEWER_ROLES] }, accountStatus: { not: "Suspended" } },
          select: { id: true },
        });
        if (!assignee) throw new Error("INVALID_ASSIGNEE");
        const updated = await tx.supportTicket.update({ where: { id }, data: { assignedToId: actor.id } });
        await tx.adminAuditEvent.create({
          data: {
            actorId: actor.id,
            action: "support.assigned",
            targetType: "Support",
            targetId: id,
            previousState: { assignedToId: current.assignedToId },
            resultingState: { assignedToId: actor.id },
            reason: "Support owner assignment",
          },
        });
        return updated;
      }
      if (input.action === "note") {
        const activity = await tx.supportTicketActivity.create({
          data: { ticketId: id, actorId: actor.id, note: input.note },
        });
        await tx.adminAuditEvent.create({
          data: { actorId: actor.id, action: "support.note.added", targetType: "Support", targetId: id, reason: input.note },
        });
        return activity;
      }
      if (!SUPPORT_TRANSITIONS[current.status].includes(input.status)) throw new Error("INVALID_TRANSITION");
      const updated = await tx.supportTicket.update({ where: { id }, data: { status: input.status } });
      await tx.supportTicketActivity.create({
        data: { ticketId: id, actorId: actor.id, fromStatus: current.status, toStatus: input.status, note: input.reason },
      });
      await tx.adminAuditEvent.create({
        data: {
          actorId: actor.id,
          action: "support.status.updated",
          targetType: "Support",
          targetId: id,
          previousState: { status: current.status },
          resultingState: { status: input.status },
          reason: input.reason,
        },
      });
      return updated;
    });
  }

  static async listMaintenanceRequests(filters: AdminQueueFilters) {
    const where: Prisma.MaintenanceRequestWhereInput = {
      ...(filters.status ? { status: filters.status as RequestStatus } : {}),
      ...(filters.priority && filters.priority !== "Critical" ? { priority: filters.priority } : {}),
      ...(filters.query
        ? {
            OR: [
              { title: { contains: filters.query, mode: "insensitive" } },
              { property: { title: { contains: filters.query, mode: "insensitive" } } },
              { requester: { email: { contains: filters.query, mode: "insensitive" } } },
            ],
          }
        : {}),
    };
    const [items, totalItems] = await Promise.all([
      prisma.maintenanceRequest.findMany({
        where,
        include: {
          property: { select: { id: true, title: true, location: true, owner: { select: { firstName: true, lastName: true } } } },
          requester: { select: { id: true, firstName: true, lastName: true, email: true } },
          activities: {
            include: { actor: { select: { firstName: true, lastName: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: filters.sort === "oldest" ? { createdAt: "asc" } : { updatedAt: "desc" },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
      }),
      prisma.maintenanceRequest.count({ where }),
    ]);
    return pageResult(items, totalItems, filters.page, filters.pageSize);
  }

  static async actOnMaintenanceRequest(
    actor: { id: string; role: AppRole },
    id: string,
    status: RequestStatus,
    reason: string,
  ) {
    requireReviewer(actor.role);
    return prisma.$transaction(async (tx) => {
      const current = await tx.maintenanceRequest.findUnique({ where: { id } });
      if (!current) throw new Error("NOT_FOUND");
      if (!MAINTENANCE_TRANSITIONS[current.status].includes(status)) throw new Error("INVALID_TRANSITION");
      const updated = await tx.maintenanceRequest.update({
        where: { id },
        data: { status, closedAt: status === "Closed" ? new Date() : status === "InProgress" ? null : undefined },
      });
      await tx.maintenanceActivity.create({
        data: { requestId: id, actorId: actor.id, fromStatus: current.status, toStatus: status, note: reason },
      });
      await tx.adminAuditEvent.create({
        data: {
          actorId: actor.id,
          action: "maintenance.status.updated",
          targetType: "Maintenance",
          targetId: id,
          previousState: { status: current.status },
          resultingState: { status },
          reason,
        },
      });
      return updated;
    });
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
import "server-only";
