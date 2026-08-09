import { VerificationDocumentKind } from "@prisma/client";
import { z } from "zod";

export const DOCUMENT_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "application/pdf",
] as const;
export const MAX_DOCUMENT_BYTES = 8 * 1024 * 1024;
export const MAX_DOCUMENTS_PER_ACCOUNT = 6;

export const documentReferenceSchema = z.object({
  id: z.string().uuid(),
  kind: z.nativeEnum(VerificationDocumentKind),
});

export const prepareDocumentSchema = z.object({
  kind: z.nativeEnum(VerificationDocumentKind),
  fileName: z.string().trim().min(1).max(180),
  mimeType: z.enum(DOCUMENT_MIME_TYPES),
  size: z.number().int().positive().max(MAX_DOCUMENT_BYTES),
});

export const uploadClientPayloadSchema = z.object({
  documentId: z.string().uuid(),
  uploadIntentId: z.string().uuid(),
});

export const completeDocumentUploadSchema = uploadClientPayloadSchema.extend({
  pathname: z.string().min(1).max(500),
});

export type DocumentReference = z.infer<typeof documentReferenceSchema>;
