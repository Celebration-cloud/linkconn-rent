import "server-only";

import type { VerificationSubmissionType } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import type { VerificationDraftInput } from "@/schemas/operating-system";

export class VerificationRepository {
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
