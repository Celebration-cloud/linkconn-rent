import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { completeDocumentUploadSchema } from "@/features/onboarding/schemas/document-upload";
import { completeOnboardingDocumentUpload } from "@/features/onboarding/server/document-service";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!checkRateLimit(getClientIp(request), `document-complete:${profile.id}`, 30, 60 * 60 * 1000).allowed) {
      return apiError("Too many document upload attempts. Try again later", 429);
    }
    const { id } = await context.params;
    const input = completeDocumentUploadSchema.parse({ ...(await request.json()), documentId: id });
    const document = await completeOnboardingDocumentUpload({ ...input, ownerId: profile.id });
    return apiSuccess(document, "Document upload verified");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0]?.message ?? "Invalid upload", 400);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Document access denied", 403);
    if (error instanceof Error && ["UPLOAD_INTENT_INVALID", "UPLOAD_METADATA_INVALID", "FILE_SIGNATURE_INVALID"].includes(error.message)) {
      return apiError("The uploaded file could not be verified", 400);
    }
    if (error instanceof Error && error.message === "SUBMISSION_LOCKED") return apiError("Submitted documents cannot be changed", 409);
    console.error("[POST /api/verifications/documents/:id/complete]", error);
    return apiError("Unable to verify document upload", 500);
  }
}
