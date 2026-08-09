import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { prisma } from "@/lib/db/client";
import {
  DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_BYTES,
  uploadClientPayloadSchema,
} from "@/features/onboarding/schemas/document-upload";
import { completeOnboardingDocumentUpload } from "@/features/onboarding/server/document-service";
import { verifyCsrf } from "@/lib/security/csrf";

export async function POST(request: Request) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (process.env.DOCUMENT_STORAGE_PROVIDER !== "vercel-blob" || !token) {
    return NextResponse.json({ success: false, data: null, message: "Private document storage is not configured" }, { status: 503 });
  }

  try {
    const body = (await request.json()) as HandleUploadBody;
    if ("clientPayload" in body.payload && !verifyCsrf(request)) {
      return NextResponse.json({ success: false, data: null, message: "Security check failed" }, { status: 403 });
    }
    const response = await handleUpload({
      request,
      body,
      token,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const profile = await getCurrentProfile();
        if (!profile) throw new Error("AUTHENTICATION_REQUIRED");
        const parsed = uploadClientPayloadSchema.parse(JSON.parse(clientPayload ?? "{}"));
        const document = await prisma.verificationDocument.findUnique({
          where: { id: parsed.documentId },
          include: { submission: { select: { ownerId: true, status: true } } },
        });
        if (
          !document ||
          document.submission.ownerId !== profile.id ||
          document.submission.status !== "Draft" ||
          document.uploadIntentId !== parsed.uploadIntentId ||
          !pathname.startsWith(`private-verifications/${document.submissionId}/${document.id}/${parsed.uploadIntentId}.`)
        ) {
          throw new Error("UPLOAD_NOT_ALLOWED");
        }
        return {
          allowedContentTypes: [...DOCUMENT_MIME_TYPES],
          maximumSizeInBytes: MAX_DOCUMENT_BYTES,
          validUntil: Date.now() + 10 * 60 * 1000,
          addRandomSuffix: false,
          allowOverwrite: false,
          cacheControlMaxAge: 60,
          tokenPayload: JSON.stringify(parsed),
          ...(process.env.VERCEL_BLOB_CALLBACK_URL
            ? { callbackUrl: process.env.VERCEL_BLOB_CALLBACK_URL }
            : {}),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        const parsed = uploadClientPayloadSchema.parse(JSON.parse(tokenPayload ?? "{}"));
        await completeOnboardingDocumentUpload({
          ...parsed,
          pathname: blob.pathname,
        });
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error("[POST /api/verifications/uploads]", error);
    return NextResponse.json({ success: false, data: null, message: "Upload authorization failed" }, { status: 400 });
  }
}
