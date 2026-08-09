import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { prepareDocumentSchema } from "@/features/onboarding/schemas/document-upload";
import {
  listOnboardingDocuments,
  prepareOnboardingDocument,
} from "@/features/onboarding/server/document-service";

export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    return apiSuccess(await listOnboardingDocuments(profile), "Documents loaded");
  } catch (error) {
    if (error instanceof Error && error.message === "ROLE_NOT_SUPPORTED") {
      return apiError("Document onboarding is unavailable for this role", 403);
    }
    console.error("[GET /api/verifications/documents]", error);
    return apiError("Unable to load documents", 500);
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!checkRateLimit(getClientIp(request), `document-prepare:${profile.id}`, 30, 60 * 60 * 1000).allowed) {
      return apiError("Too many document upload attempts. Try again later", 429);
    }
    const input = prepareDocumentSchema.parse(await request.json());
    const result = await prepareOnboardingDocument(profile, input);
    return apiSuccess(result, "Private upload prepared", 201);
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0]?.message ?? "Invalid document", 400);
    if (error instanceof Error) {
      if (error.message === "STORAGE_NOT_CONFIGURED") return apiError("Private document storage is not configured", 503);
      if (error.message === "ROLE_NOT_SUPPORTED" || error.message === "INVALID_DOCUMENT_KIND") return apiError("Document is not valid for this role", 403);
      if (error.message === "DOCUMENT_LIMIT_REACHED") return apiError("A maximum of six documents is allowed", 409);
    }
    console.error("[POST /api/verifications/documents]", error);
    return apiError("Unable to prepare document upload", 500);
  }
}
