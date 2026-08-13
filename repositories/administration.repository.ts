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
import type { VerificationReviewInput } from "@/schemas/administration";
import { getDocumentDeletionDeadline } from "@/features/verifications/document-retention";
import {
  VERIFICATION_FINDINGS,
  requiredVerificationFindingKeys,
  toVerificationReviewDetailDto,
  toVerificationReviewSummaryDto,
  type VerificationReviewSource,
} from "@/features/verifications/review-contracts";

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
      select: {
        id: true,
        type: true,
        status: true,
        reviewRound: true,
        submittedAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          },
        },
        property: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        documents: {
          select: {
            deletedAt: true,
            supersededAt: true,
          },
        },
      },
      orderBy: filters.sort === "oldest" ? { createdAt: "asc" } : { createdAt: "desc" },
      skip: (filters.page - 1) * filters.pageSize,
      take: filters.pageSize,
    }),
      prisma.verificationSubmission.count({ where }),
    ]);
    void viewerRole;
    return pageResult(items.map((item) => toVerificationReviewSummaryDto(item)), totalItems, filters.page, filters.pageSize);
  }

  static async getVerificationDetail(id: string, viewerRole: AppRole) {
    requireReviewer(viewerRole);
    const submission = await prisma.verificationSubmission.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        status: true,
        reviewRound: true,
        correctionInstructions: true,
        submittedAt: true,
        reviewedAt: true,
        createdAt: true,
        updatedAt: true,
        owner: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            accountStatus: true,
            verificationLevel: true,
            emailVerified: true,
            onboardingComplete: true,
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
            _count: { select: { properties: true, applications: true, payments: true, maintenance: true } },
          },
        },
        property: { select: { id: true, title: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true } },
        reviewedBy: { select: { id: true, firstName: true, lastName: true } },
        documents: {
          orderBy: [{ kind: "asc" }, { revision: "desc" }, { createdAt: "desc" }],
          select: {
            id: true,
            kind: true,
            fileName: true,
            storageKey: true,
            mimeType: true,
            size: true,
            revision: true,
            supersededAt: true,
            deletedAt: true,
            createdAt: true,
          },
        },
        findings: {
          orderBy: [{ reviewRound: "desc" }, { createdAt: "asc" }],
          select: {
            id: true,
            reviewRound: true,
            key: true,
            label: true,
            status: true,
            note: true,
            createdAt: true,
            reviewer: { select: { id: true, firstName: true, lastName: true } },
          },
        },
      },
    });
    if (!submission) return null;
    const auditHistory = await prisma.adminAuditEvent.findMany({
      where: { targetType: "Verification", targetId: id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        action: true,
        reason: true,
        createdAt: true,
        actor: { select: { id: true, firstName: true, lastName: true } },
      },
    });
    const source: VerificationReviewSource = {
      id: submission.id,
      type: submission.type,
      status: submission.status,
      reviewRound: submission.reviewRound,
      correctionInstructions: submission.correctionInstructions,
      submittedAt: submission.submittedAt,
      reviewedAt: submission.reviewedAt,
      createdAt: submission.createdAt,
      updatedAt: submission.updatedAt,
      owner: {
        id: submission.owner.id,
        firstName: submission.owner.firstName,
        lastName: submission.owner.lastName,
        email: submission.owner.email,
        phone: submission.owner.phone,
        role: submission.owner.role,
        accountStatus: submission.owner.accountStatus,
        verificationLevel: submission.owner.verificationLevel,
        emailVerified: submission.owner.emailVerified,
        onboardingComplete: submission.owner.onboardingComplete,
        tenantProfile: submission.owner.tenantProfile,
        landlordProfile: submission.owner.landlordProfile,
      },
      property: submission.property,
      assignedTo: submission.assignedTo,
      reviewedBy: submission.reviewedBy,
      documents: submission.documents,
      findings: submission.findings,
      linked: {
        properties: submission.owner._count.properties,
        applications: submission.owner._count.applications,
        payments: submission.owner._count.payments,
        maintenance: submission.owner._count.maintenance,
      },
      auditHistory,
    };
    return toVerificationReviewDetailDto(source, {
      canViewPrivateEvidence: canAccessPrivateVerificationDocuments(viewerRole),
    });
  }

  static async revealVerificationSensitive(actor: { id: string; role: AppRole }, id: string) {
    if (!canAccessPrivateVerificationDocuments(actor.role)) throw new Error("FORBIDDEN");
    const submission = await prisma.verificationSubmission.findUnique({
      where: { id },
      select: {
        owner: {
          select: {
            tenantProfile: { select: { ninNumber: true } },
            landlordProfile: { select: { ninNumber: true, accountNumber: true } },
          },
        },
      },
    });
    if (!submission) throw new Error("NOT_FOUND");
    const result = {
      nin: submission.owner.tenantProfile?.ninNumber ?? submission.owner.landlordProfile?.ninNumber ?? null,
      payoutAccount: submission.owner.landlordProfile?.accountNumber ?? null,
    };
    await prisma.adminAuditEvent.create({
      data: {
        actorId: actor.id,
        action: "verification.sensitive.revealed",
        targetType: "Verification",
        targetId: id,
        resultingState: {
          ninRevealed: Boolean(result.nin),
          payoutAccountRevealed: Boolean(result.payoutAccount),
        },
        reason: "Administrator deliberately revealed masked verification values",
      },
    });
    return result;
  }

  static async reviewVerification(
    actor: { id: string; role: AppRole },
    id: string,
    input: VerificationReviewInput,
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
      if (current.assignedToId && current.assignedToId !== actor.id) {
        throw new Error("ASSIGNMENT_CONFLICT");
      }
      const requiredKeys = requiredVerificationFindingKeys(current.type);
      const supplied = new Map(input.findings.map((finding) => [finding.key, finding]));
      if (supplied.size !== requiredKeys.length || requiredKeys.some((key) => !supplied.has(key))) {
        throw new Error("INCOMPLETE_CHECKLIST");
      }
      if (input.action === "approve" && input.findings.some((finding) => finding.status !== "Approved")) {
        throw new Error("INVALID_CHECKLIST_DECISION");
      }
      if (input.action === "request_changes" && input.findings.every((finding) => finding.status === "Approved")) {
        throw new Error("INVALID_CHECKLIST_DECISION");
      }
      const nextStatus = input.action === "approve"
        ? "Approved"
        : input.action === "reject"
          ? "Rejected"
          : "NeedsChanges";
      const reviewedAt = new Date();
      const claimed = await tx.verificationSubmission.updateMany({
        where: {
          id,
          status: "Pending",
          reviewRound: current.reviewRound,
          assignedToId: current.assignedToId,
        },
        data: {
          status: nextStatus,
          reviewedById: actor.id,
          reviewedAt,
          decisionReason: input.reason,
          reviewNotes: input.notes,
          correctionInstructions: input.action === "request_changes" ? input.correctionInstructions : null,
        },
      });
      if (claimed.count !== 1) throw new Error("REVIEW_CONFLICT");
      for (const finding of input.findings) {
        await tx.verificationReviewFinding.upsert({
          where: {
            submissionId_reviewRound_key: {
              submissionId: id,
              reviewRound: current.reviewRound,
              key: finding.key,
            },
          },
          create: {
            submissionId: id,
            reviewRound: current.reviewRound,
            reviewerId: actor.id,
            key: finding.key,
            label: VERIFICATION_FINDINGS[finding.key],
            status: finding.status,
            note: finding.note,
          },
          update: {
            reviewerId: actor.id,
            label: VERIFICATION_FINDINGS[finding.key],
            status: finding.status,
            note: finding.note,
          },
        });
      }
      if (input.action === "approve" || input.action === "reject") {
        await tx.verificationDocument.updateMany({
          where: { submissionId: id, storageKey: { not: null }, deletedAt: null },
          data: {
            deleteAfter: getDocumentDeletionDeadline(reviewedAt),
            deletionError: null,
          },
        });
      }
      if (current.type === "Identity" && input.action === "approve") {
        await tx.profile.update({
          where: { id: current.ownerId },
          data: { verificationLevel: "FullyVerified" },
        });
      }
      await tx.adminAuditEvent.create({
        data: {
          actorId: actor.id,
            action: input.action === "request_changes" ? "verification.changes_requested" : `verification.${input.action}d`,
          targetType: "Verification",
          targetId: id,
          previousState: { status: current.status },
          resultingState: { status: nextStatus },
          reason: input.reason,
        },
      });
      await tx.notification.create({
        data: {
          profileId: current.ownerId,
          kind: "Verification",
          title: input.action === "approve"
            ? "Verification approved"
            : input.action === "reject"
              ? "Verification rejected"
              : "Verification changes requested",
          body: input.action === "request_changes" ? input.correctionInstructions : input.reason,
          href: "/verification",
          idempotencyKey: `verification:${id}:round:${current.reviewRound}:decision:${nextStatus}`,
        },
      });
      return tx.verificationSubmission.findUnique({ where: { id } });
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

  static async listUsers(filters: AdminQueueFilters, viewerRole: AppRole) {
    requireReviewer(viewerRole);
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

  static async getUserDetail(id: string, viewerRole: AppRole) {
    requireReviewer(viewerRole);
    const [profile, auditEvents] = await Promise.all([
      prisma.profile.findUnique({ where: { id }, select: {
        id: true, firstName: true, lastName: true, email: true, phone: true, avatar: true, bio: true, location: true, role: true, accountStatus: true, verificationLevel: true, twoFactorEnabled: true, onboardingComplete: true, emailVerified: true, createdAt: true, updatedAt: true,
        tenantProfile: { select: { employmentType: true, employerName: true, jobTitle: true, incomeRange: true, preferredLocations: true, preferredTypes: true, budgetMin: true, budgetMax: true, moveInDate: true, ninStatus: true } },
        landlordProfile: { select: { businessName: true, propertyCount: true, propertyTypesOffered: true, ninStatus: true } },
        verificationSubmissions: { select: { id: true, type: true, status: true, reviewRound: true, submittedAt: true, reviewedAt: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 10 },
        properties: { select: { id: true, title: true, status: true, moderationStatus: true }, orderBy: { updatedAt: "desc" }, take: 10 },
        applications: { select: { id: true, status: true, property: { select: { id: true, title: true } } }, orderBy: { updatedAt: "desc" }, take: 10 },
        tenantLeases: { select: { id: true, status: true, property: { select: { id: true, title: true } } }, orderBy: { updatedAt: "desc" }, take: 10 },
        landlordLeases: { select: { id: true, status: true, property: { select: { id: true, title: true } } }, orderBy: { updatedAt: "desc" }, take: 10 },
        payments: { select: { id: true, amount: true, status: true, reference: true, property: { select: { id: true, title: true } } }, orderBy: { updatedAt: "desc" }, take: 10 },
        maintenance: { select: { id: true, title: true, status: true, property: { select: { id: true, title: true } } }, orderBy: { updatedAt: "desc" }, take: 10 },
        supportTickets: { select: { id: true, reference: true, subject: true, status: true }, orderBy: { updatedAt: "desc" }, take: 10 },
      } }),
      prisma.adminAuditEvent.findMany({ where: { targetType: "User", targetId: id }, select: { id: true, action: true, reason: true, createdAt: true, actor: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
    ]);
    return profile ? { ...profile, auditEvents } : null;
  }

  static async listProperties(filters: AdminQueueFilters, viewerRole: AppRole) {
    requireReviewer(viewerRole);
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

  static async getPropertyDetail(id: string, viewerRole: AppRole) {
    requireReviewer(viewerRole);
    const [property, history] = await Promise.all([
      prisma.property.findUnique({ where: { id }, select: {
        id: true, title: true, type: true, location: true, city: true, description: true, price: true, period: true, bedrooms: true, bathrooms: true, toilets: true, area: true, images: true, amenities: true, houseRules: true, cautionFee: true, legalFee: true, agencyFee: true, serviceCharge: true, verified: true, featured: true, status: true, moderationStatus: true, moderationReason: true, reviewedAt: true, createdAt: true, updatedAt: true,
        owner: { select: { id: true, firstName: true, lastName: true, email: true, accountStatus: true, verificationLevel: true } }, reviewedBy: { select: { id: true, firstName: true, lastName: true } },
        applications: { select: { id: true, status: true, score: true, tenant: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { updatedAt: "desc" }, take: 20 },
        viewings: { select: { id: true, status: true, scheduledAt: true, tenant: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { scheduledAt: "desc" }, take: 20 },
        leases: { select: { id: true, status: true, activatedAt: true, tenant: { select: { id: true, firstName: true, lastName: true } } }, orderBy: { updatedAt: "desc" }, take: 10 },
        payments: { select: { id: true, amount: true, status: true, reference: true, dueDate: true, paidAt: true }, orderBy: { updatedAt: "desc" }, take: 20 },
        maintenance: { select: { id: true, title: true, status: true, priority: true, updatedAt: true }, orderBy: { updatedAt: "desc" }, take: 20 },
        disputes: { select: { id: true, reference: true, title: true, status: true, priority: true }, orderBy: { updatedAt: "desc" }, take: 20 },
      } }),
      prisma.adminAuditEvent.findMany({ where: { targetType: "Property", targetId: id }, select: { id: true, action: true, reason: true, createdAt: true, actor: { select: { firstName: true, lastName: true } } }, orderBy: { createdAt: "desc" }, take: 20 }),
    ]);
    return property ? { ...property, history } : null;
  }

  static async listPayments(filters: AdminQueueFilters, viewerRole: AppRole) {
    requireReviewer(viewerRole);
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

  static async getPaymentDetail(id: string, viewerRole: AppRole) {
    requireReviewer(viewerRole);
    const payment = await prisma.payment.findUnique({ where: { id }, select: {
      id: true, amount: true, status: true, reference: true, initializedAt: true, failureReason: true, dueDate: true, paidAt: true, createdAt: true, updatedAt: true,
      tenant: { select: { id: true, firstName: true, lastName: true, email: true } }, property: { select: { id: true, title: true, location: true } },
      leaseScheduleItem: { select: { id: true, sequence: true, label: true, lease: { select: { id: true, status: true, currentVersionNumber: true } } } },
      disputes: { select: { id: true, reference: true, title: true, status: true, priority: true }, orderBy: { updatedAt: "desc" } },
    } });
    if (!payment) return null;
    return {
      id: payment.id, amount: payment.amount, status: payment.status, reference: payment.reference,
      initializedAt: payment.initializedAt, failureReason: payment.failureReason, dueDate: payment.dueDate,
      paidAt: payment.paidAt, createdAt: payment.createdAt, updatedAt: payment.updatedAt,
      tenant: payment.tenant, property: payment.property, leaseScheduleItem: payment.leaseScheduleItem, disputes: payment.disputes,
    };
  }

  static async listAuditEvents(filters: AdminQueueFilters, viewerRole: AppRole) {
    requireReviewer(viewerRole);
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

  static async getAuditEventDetail(id: string, viewerRole: AppRole) {
    requireReviewer(viewerRole);
    const event = await prisma.adminAuditEvent.findUnique({ where: { id }, select: { id: true, action: true, targetType: true, targetId: true, reason: true, previousState: true, resultingState: true, createdAt: true, actor: { select: { id: true, firstName: true, lastName: true, email: true, role: true } } } });
    if (!event) return null;
    const paths: Partial<Record<string, string>> = { User: "/admin/users", Property: "/admin/properties", Payment: "/admin/payments", Verification: "/admin/verifications" };
    return { ...event, relatedHref: paths[event.targetType] ? `${paths[event.targetType]}?item=${event.targetId}` : null };
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
        const claimed = await tx.supportTicket.updateMany({ where: { id, assignedToId: current.assignedToId }, data: { assignedToId: actor.id } });
        if (claimed.count !== 1) throw new Error("OPERATION_CONFLICT");
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
        return tx.supportTicket.findUnique({ where: { id } });
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
      const claimed = await tx.supportTicket.updateMany({ where: { id, status: current.status, assignedToId: current.assignedToId }, data: { status: input.status } });
      if (claimed.count !== 1) throw new Error("OPERATION_CONFLICT");
      const activity = await tx.supportTicketActivity.create({
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
      if (current.profileId) await tx.notification.create({ data: { profileId: current.profileId, kind: "Support", title: "Support request updated", body: `${current.reference} is now ${input.status}.`, href: `/dashboard/support/${id}`, idempotencyKey: `support:${id}:activity:${activity.id}` } });
      return tx.supportTicket.findUnique({ where: { id } });
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
      const claimed = await tx.maintenanceRequest.updateMany({
        where: { id, status: current.status },
        data: { status, closedAt: status === "Closed" ? new Date() : status === "InProgress" ? null : undefined },
      });
      if (claimed.count !== 1) throw new Error("OPERATION_CONFLICT");
      const activity = await tx.maintenanceActivity.create({
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
      await tx.notification.create({ data: { profileId: current.requesterId, kind: "Maintenance", title: "Maintenance request updated", body: `${current.title} is now ${status}.`, href: `/dashboard/maintenance/${id}`, idempotencyKey: `maintenance:${id}:activity:${activity.id}` } });
      return tx.maintenanceRequest.findUnique({ where: { id } });
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
