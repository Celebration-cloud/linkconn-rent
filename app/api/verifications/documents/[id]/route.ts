import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { removeOnboardingDocument } from "@/features/onboarding/server/document-service";

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    const { id } = await context.params;
    await removeOnboardingDocument(profile, id);
    return apiSuccess(null, "Document removed");
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") return apiError("Document not found", 404);
    if (error instanceof Error && error.message === "SUBMISSION_LOCKED") return apiError("Submitted documents cannot be changed", 409);
    if (error instanceof Error && error.message === "ROLE_NOT_SUPPORTED") return apiError("Document onboarding is unavailable for this role", 403);
    console.error("[DELETE /api/verifications/documents/:id]", error);
    return apiError("Unable to remove document", 500);
  }
}
