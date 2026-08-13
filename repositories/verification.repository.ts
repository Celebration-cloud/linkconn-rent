import "server-only";

import type { AppRole, VerificationSubmissionType } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { getMissingDocumentRequirements, getOnboardingDocumentRequirements } from "@/features/onboarding/document-requirements";
import { toOwnerVerificationWorkspaceDto, type OwnerVerificationSource } from "@/features/verifications/owner-contracts";
import { getDocumentStorage } from "@/services/storage/document-storage";
import type { VerificationDraftInput } from "@/schemas/operating-system";

export class VerificationRepository {
  static async getOwnerWorkspace(ownerId: string, role: Extract<AppRole, "Tenant" | "Landlord">) {
    const [profile, submission] = await Promise.all([
      prisma.profile.findUnique({
        where: { id: ownerId },
        select: {
          id: true, email: true, firstName: true, lastName: true, phone: true, location: true,
          role: true, accountStatus: true, verificationLevel: true, emailVerified: true, onboardingComplete: true,
          tenantProfile: { select: { employmentType: true, employerName: true, jobTitle: true, incomeRange: true, preferredLocations: true, preferredTypes: true, budgetMin: true, budgetMax: true, moveInDate: true, ninStatus: true, ninNumber: true } },
          landlordProfile: { select: { businessName: true, propertyCount: true, propertyTypesOffered: true, ninStatus: true, ninNumber: true, bankName: true, accountNumber: true, accountName: true } },
        },
      }),
      prisma.verificationSubmission.findFirst({
        where: { ownerId, type: "Identity" },
        orderBy: { updatedAt: "desc" },
        select: {
          id: true, type: true, status: true, documentType: true, reviewRound: true, decisionReason: true,
          correctionInstructions: true, submittedAt: true, reviewedAt: true, createdAt: true, updatedAt: true,
          documents: { orderBy: [{ kind: "asc" }, { revision: "desc" }, { createdAt: "desc" }], select: { id: true, kind: true, fileName: true, storageKey: true, mimeType: true, size: true, uploadIntentId: true, deleteAfter: true, deletionError: true, deletedAt: true, revision: true, supersededAt: true, createdAt: true } },
          findings: { orderBy: [{ reviewRound: "desc" }, { createdAt: "asc" }], select: { reviewRound: true, key: true, label: true, status: true, note: true, createdAt: true } },
        },
      }),
    ]);
    if (!profile || profile.role !== role) throw new Error("NOT_FOUND");
    const [audits, notifications] = submission ? await Promise.all([
      prisma.adminAuditEvent.findMany({ where: { targetType: "Verification", targetId: submission.id, action: { in: ["verification.changes_requested", "verification.approved", "verification.rejected", "verification.resubmitted"] } }, orderBy: { createdAt: "desc" }, select: { action: true, reason: true, previousState: true, resultingState: true, createdAt: true } }),
      prisma.notification.findMany({ where: { profileId: ownerId, kind: "Verification", idempotencyKey: { startsWith: `verification:${submission.id}:round:` } }, orderBy: { createdAt: "desc" }, select: { body: true, idempotencyKey: true, createdAt: true } }),
    ]) : [[], []];
    const timeline: NonNullable<OwnerVerificationSource["submission"]>["timeline"] = [];
    for (const notification of notifications) {
      const match = notification.idempotencyKey?.match(/:round:(\d+):(decision:)?(NeedsChanges|Approved|Rejected|resubmitted)$/);
      if (!match) continue;
      const round = Number(match[1]);
      const value = match[3];
      if (value === "resubmitted") {
        const audit = audits.find((item) => item.action === "verification.resubmitted" && Math.abs(item.createdAt.getTime() - notification.createdAt.getTime()) < 60_000);
        const previous = audit?.previousState as Record<string, unknown> | null;
        timeline.push({ kind: "resubmission", reviewRound: round, status: "Pending", reason: audit?.reason ?? notification.body, correctionInstructions: typeof previous?.correctionInstructions === "string" ? previous.correctionInstructions : null, createdAt: notification.createdAt });
        continue;
      }
      const status = value as "NeedsChanges" | "Approved" | "Rejected";
      const action = status === "NeedsChanges" ? "verification.changes_requested" : status === "Approved" ? "verification.approved" : "verification.rejected";
      const audit = audits.find((item) => item.action === action && Math.abs(item.createdAt.getTime() - notification.createdAt.getTime()) < 60_000);
      timeline.push({ kind: "decision", reviewRound: round, status, reason: audit?.reason ?? notification.body, correctionInstructions: status === "NeedsChanges" ? notification.body : null, createdAt: notification.createdAt });
    }
    const source: OwnerVerificationSource = { profile, storageConfigured: getDocumentStorage().configured, submission: submission ? { ...submission, findings: submission.findings, timeline } : null };
    return toOwnerVerificationWorkspaceDto(source);
  }

  static async resubmit(
    ownerId: string,
    role: Extract<AppRole, "Tenant" | "Landlord">,
    input: { submissionId: string; reviewRound: number },
  ) {
    return prisma.$transaction(async (tx) => {
      const current = await tx.verificationSubmission.findFirst({
        where: {
          id: input.submissionId,
          ownerId,
          status: "NeedsChanges",
          reviewRound: input.reviewRound,
        },
        select: {
          id: true,
          ownerId: true,
          status: true,
          reviewRound: true,
          decisionReason: true,
          correctionInstructions: true,
          owner: { select: { tenantProfile: { select: { employmentType: true } } } },
          documents: {
            select: {
              id: true,
              kind: true,
              storageKey: true,
              uploadIntentId: true,
              deletedAt: true,
              supersededAt: true,
              revision: true,
              createdAt: true,
            },
          },
        },
      });
      if (!current) throw new Error("RESUBMIT_CONFLICT");
      const requirements = role === "Tenant"
        ? getOnboardingDocumentRequirements({ role, employmentType: current.owner?.tenantProfile?.employmentType })
        : getOnboardingDocumentRequirements({ role });
      const active = current.documents.filter((document) =>
        Boolean(document.storageKey && !document.uploadIntentId && !document.deletedAt && !document.supersededAt),
      );
      const missing = getMissingDocumentRequirements(requirements, active.map((document) => document.kind));
      if (missing.length) throw new Error(`DOCUMENTS_INCOMPLETE:${missing.map((item) => item.label).join(", ")}`);

      const supersededIds: string[] = [];
      for (const document of active) {
        const newest = active
          .filter((candidate) => candidate.kind === document.kind)
          .sort((a, b) => b.revision - a.revision || b.createdAt.getTime() - a.createdAt.getTime())[0];
        if (newest && newest.id !== document.id) supersededIds.push(document.id);
      }
      const now = new Date();
      if (supersededIds.length) {
        await tx.verificationDocument.updateMany({
          where: { id: { in: supersededIds }, submissionId: current.id, supersededAt: null },
          data: { supersededAt: now },
        });
      }
      const nextRound = current.reviewRound + 1;
      const claimed = await tx.verificationSubmission.updateMany({
        where: { id: current.id, ownerId, status: "NeedsChanges", reviewRound: current.reviewRound },
        data: {
          status: "Pending",
          reviewRound: nextRound,
          submittedAt: now,
          assignedToId: null,
          reviewedById: null,
          reviewedAt: null,
          decisionReason: null,
          reviewNotes: null,
          correctionInstructions: null,
        },
      });
      if (claimed.count !== 1) throw new Error("RESUBMIT_CONFLICT");
      await tx.adminAuditEvent.create({
        data: {
          actorId: ownerId,
          action: "verification.resubmitted",
          targetType: "Verification",
          targetId: current.id,
          previousState: {
            status: current.status,
            reviewRound: current.reviewRound,
            decisionReason: current.decisionReason,
            correctionInstructions: current.correctionInstructions,
          },
          resultingState: { status: "Pending", reviewRound: nextRound },
          reason: "Owner resubmitted corrected verification evidence",
        },
      });
      await tx.notification.create({
        data: {
          profileId: ownerId,
          kind: "Verification",
          title: "Verification resubmitted",
          body: "Your corrected evidence is back in the review queue.",
          href: "/verification",
          idempotencyKey: `verification:${current.id}:round:${nextRound}:resubmitted`,
        },
      });
      const updated = await tx.verificationSubmission.findUnique({
        where: { id: current.id },
        select: {
          id: true,
          type: true,
          status: true,
          reviewRound: true,
          submittedAt: true,
          updatedAt: true,
        },
      });
      if (!updated) throw new Error("RESUBMIT_CONFLICT");
      return {
        id: updated.id,
        type: updated.type,
        status: updated.status,
        reviewRound: updated.reviewRound,
        submittedAt: updated.submittedAt,
        updatedAt: updated.updatedAt,
      };
    });
  }

  static list(ownerId: string) {
    return prisma.verificationSubmission.findMany({
      where: { ownerId },
      include: { documents: true, property: true },
      orderBy: { updatedAt: "desc" },
    });
  }

  static async saveDraft(ownerId: string, input: VerificationDraftInput, canSubmit: boolean) {
    if (input.submit && !canSubmit) throw new Error("STORAGE_DISABLED");
    if (input.propertyId) {
      const property = await prisma.property.findFirst({
        where: { id: input.propertyId, ownerId },
        select: { id: true },
      });
      if (!property) throw new Error("NOT_FOUND");
    }
    const data = {
      type: input.type as VerificationSubmissionType,
      propertyId: input.propertyId,
      documentType: input.documentType,
      note: input.note,
      status: input.submit ? ("Pending" as const) : ("Draft" as const),
      submittedAt: input.submit ? new Date() : null,
    };
    const metadataOnlyDocuments = input.documents.map((document) => ({
      fileName: document.fileName,
      mimeType: document.mimeType,
      size: document.size,
      storageKey: null,
    }));
    if (input.id) {
      const owned = await prisma.verificationSubmission.findFirst({
        where: { id: input.id, ownerId },
        select: { id: true },
      });
      if (!owned) throw new Error("NOT_FOUND");
      return prisma.verificationSubmission.update({
        where: { id: input.id },
        data: { ...data, documents: { deleteMany: {}, create: metadataOnlyDocuments } },
        include: { documents: true },
      });
    }
    return prisma.verificationSubmission.create({
      data: { ownerId, ...data, documents: { create: metadataOnlyDocuments } },
      include: { documents: true },
    });
  }
}
