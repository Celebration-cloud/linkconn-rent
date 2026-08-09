import "server-only";

import { randomUUID } from "node:crypto";
import type { AppRole, VerificationDocumentKind } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import { getDocumentStorage } from "@/services/storage/document-storage";
import {
  DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENTS_PER_ACCOUNT,
  type DocumentReference,
} from "@/features/onboarding/schemas/document-upload";
import { isDocumentKindAllowedForRole } from "@/features/onboarding/document-requirements";

type OnboardingRole = Extract<AppRole, "Tenant" | "Landlord">;

const EXTENSIONS: Record<(typeof DOCUMENT_MIME_TYPES)[number], string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "application/pdf": "pdf",
};

export type DocumentOwner = { id: string; role: AppRole };

function assertOnboardingRole(profile: DocumentOwner): asserts profile is DocumentOwner & { role: OnboardingRole } {
  if (profile.role !== "Tenant" && profile.role !== "Landlord") {
    throw new Error("ROLE_NOT_SUPPORTED");
  }
}

function documentDto(document: {
  id: string;
  kind: VerificationDocumentKind;
  fileName: string | null;
  mimeType: string | null;
  size: number | null;
  storageKey: string | null;
  deletedAt: Date | null;
}) {
  return {
    id: document.id,
    kind: document.kind,
    fileName: document.fileName,
    mimeType: document.mimeType,
    size: document.size,
    uploaded: Boolean(document.storageKey && !document.deletedAt),
  };
}

export async function listOnboardingDocuments(profile: DocumentOwner) {
  assertOnboardingRole(profile);
  const submission = await prisma.verificationSubmission.findFirst({
    where: { ownerId: profile.id, type: "Identity", status: "Draft" },
    orderBy: { createdAt: "desc" },
    include: { documents: { orderBy: { createdAt: "asc" } } },
  });
  return {
    storageConfigured: getDocumentStorage().configured,
    submissionId: submission?.id ?? null,
    documents: submission?.documents.map(documentDto) ?? [],
  };
}

async function getOrCreateDraftSubmission(ownerId: string) {
  const current = await prisma.verificationSubmission.findFirst({
    where: { ownerId, type: "Identity", status: "Draft" },
    orderBy: { createdAt: "desc" },
  });
  if (current) {
    await prisma.profile.updateMany({
      where: { id: ownerId, onboardingComplete: true },
      data: { onboardingComplete: false },
    });
    return current;
  }
  const rejected = await prisma.verificationSubmission.findFirst({
    where: { ownerId, type: "Identity", status: "Rejected" },
    orderBy: { createdAt: "desc" },
  });
  if (rejected) {
    return prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { id: ownerId },
        data: { onboardingComplete: false },
      });
      await tx.verificationDocument.updateMany({
        where: { submissionId: rejected.id, deletedAt: null },
        data: { deleteAfter: null, deletionError: null },
      });
      return tx.verificationSubmission.update({
        where: { id: rejected.id },
        data: {
          status: "Draft",
          submittedAt: null,
          reviewedAt: null,
          reviewedById: null,
          assignedToId: null,
          decisionReason: null,
          reviewNotes: null,
        },
      });
    });
  }
  return prisma.$transaction(async (tx) => {
    await tx.profile.update({
      where: { id: ownerId },
      data: { onboardingComplete: false },
    });
    return tx.verificationSubmission.create({
      data: {
        ownerId,
        type: "Identity",
        status: "Draft",
        documentType: "Role-based identity documents",
        note: "Private onboarding document draft.",
      },
    });
  });
}

export async function prepareOnboardingDocument(
  profile: DocumentOwner,
  input: {
    kind: VerificationDocumentKind;
    fileName: string;
    mimeType: (typeof DOCUMENT_MIME_TYPES)[number];
    size: number;
  },
) {
  assertOnboardingRole(profile);
  if (!getDocumentStorage().configured) throw new Error("STORAGE_NOT_CONFIGURED");
  if (!isDocumentKindAllowedForRole(profile.role, input.kind)) throw new Error("INVALID_DOCUMENT_KIND");

  const submission = await getOrCreateDraftSubmission(profile.id);
  const existing = await prisma.verificationDocument.findFirst({
    where: { submissionId: submission.id, kind: input.kind },
    orderBy: { createdAt: "desc" },
  });
  if (!existing) {
    const count = await prisma.verificationDocument.count({ where: { submissionId: submission.id } });
    if (count >= MAX_DOCUMENTS_PER_ACCOUNT) throw new Error("DOCUMENT_LIMIT_REACHED");
  }

  const uploadIntentId = randomUUID();
  const documentId = existing?.id ?? randomUUID();
  const extension = EXTENSIONS[input.mimeType];
  const pathname = `private-verifications/${submission.id}/${documentId}/${uploadIntentId}.${extension}`;
  const document = existing
    ? await prisma.verificationDocument.update({
        where: { id: existing.id },
        data: {
          fileName: input.fileName,
          mimeType: input.mimeType,
          size: input.size,
          uploadIntentId,
          deletedAt: null,
          deletionError: null,
        },
      })
    : await prisma.verificationDocument.create({
        data: {
          id: documentId,
          submissionId: submission.id,
          kind: input.kind,
          fileName: input.fileName,
          mimeType: input.mimeType,
          size: input.size,
          uploadIntentId,
        },
      });

  return {
    document: documentDto(document),
    pathname,
    uploadIntentId,
    clientPayload: JSON.stringify({ documentId, uploadIntentId }),
  };
}

function signatureMatches(bytes: Uint8Array, mimeType: string) {
  if (mimeType === "image/jpeg") return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === "image/png") {
    return [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
      .every((value, index) => bytes[index] === value);
  }
  if (mimeType === "application/pdf") {
    return String.fromCharCode(...bytes.slice(0, 5)) === "%PDF-";
  }
  return false;
}

export async function completeOnboardingDocumentUpload(input: {
  documentId: string;
  uploadIntentId: string;
  pathname: string;
  ownerId?: string;
}) {
  const storage = getDocumentStorage();
  if (!storage.configured) throw new Error("STORAGE_NOT_CONFIGURED");
  const document = await prisma.verificationDocument.findUnique({
    where: { id: input.documentId },
    include: { submission: { select: { ownerId: true, status: true } } },
  });
  if (
    document &&
    document.uploadIntentId === null &&
    document.storageKey === input.pathname &&
    (!input.ownerId || document.submission.ownerId === input.ownerId)
  ) {
    return documentDto(document);
  }
  if (!document || document.uploadIntentId !== input.uploadIntentId) {
    await storage.remove(input.pathname).catch(() => undefined);
    throw new Error("UPLOAD_INTENT_INVALID");
  }
  if (input.ownerId && document.submission.ownerId !== input.ownerId) throw new Error("FORBIDDEN");
  if (document.submission.status !== "Draft") throw new Error("SUBMISSION_LOCKED");

  const expectedPrefix = `private-verifications/${document.submissionId}/${document.id}/${input.uploadIntentId}.`;
  const metadata = await storage.inspect(input.pathname);
  if (
    metadata.pathname !== input.pathname ||
    !input.pathname.startsWith(expectedPrefix) ||
    !document.mimeType ||
    !DOCUMENT_MIME_TYPES.includes(document.mimeType as (typeof DOCUMENT_MIME_TYPES)[number]) ||
    metadata.contentType !== document.mimeType ||
    metadata.size <= 0 ||
    metadata.size > MAX_DOCUMENT_BYTES ||
    metadata.size !== document.size
  ) {
    await storage.remove(input.pathname).catch(() => undefined);
    throw new Error("UPLOAD_METADATA_INVALID");
  }

  const blob = await storage.read(input.pathname);
  if (!blob) throw new Error("BLOB_NOT_FOUND");
  const bytes = new Uint8Array(await new Response(blob.stream).arrayBuffer());
  if (!signatureMatches(bytes, document.mimeType)) {
    await storage.remove(input.pathname).catch(() => undefined);
    throw new Error("FILE_SIGNATURE_INVALID");
  }

  const previousStorageKey = document.storageKey;
  const updated = await prisma.verificationDocument.updateMany({
    where: { id: document.id, uploadIntentId: input.uploadIntentId },
    data: {
      storageKey: input.pathname,
      uploadIntentId: null,
      deletedAt: null,
      deleteAfter: null,
      deletionError: null,
    },
  });
  if (updated.count !== 1) {
    await storage.remove(input.pathname).catch(() => undefined);
    throw new Error("UPLOAD_INTENT_INVALID");
  }
  if (previousStorageKey && previousStorageKey !== input.pathname) {
    await storage.remove(previousStorageKey).catch((error) => {
      console.error("[document replacement cleanup]", error);
    });
  }
  const saved = await prisma.verificationDocument.findUniqueOrThrow({ where: { id: document.id } });
  return documentDto(saved);
}

export async function removeOnboardingDocument(profile: DocumentOwner, documentId: string) {
  assertOnboardingRole(profile);
  const document = await prisma.verificationDocument.findUnique({
    where: { id: documentId },
    include: { submission: { select: { ownerId: true, status: true } } },
  });
  if (!document || document.submission.ownerId !== profile.id) throw new Error("NOT_FOUND");
  if (document.submission.status !== "Draft") throw new Error("SUBMISSION_LOCKED");
  if (document.storageKey) await getDocumentStorage().remove(document.storageKey);
  await prisma.verificationDocument.delete({ where: { id: document.id } });
}

export function toDocumentReferences(documents: Array<{ id: string; kind: VerificationDocumentKind }>): DocumentReference[] {
  return documents.map(({ id, kind }) => ({ id, kind }));
}
