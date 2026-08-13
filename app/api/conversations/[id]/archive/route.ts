import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { OperatingSystemRepository } from "@/repositories/operating-system.repository";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    const { id } = await context.params;
    await OperatingSystemRepository.archiveConversation(profile.id, id);
    return apiSuccess(null, "Conversation archived");
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return apiError("Conversation not found", 404);
    }
    console.error("[POST /api/conversations/:id/archive]", error);
    return apiError("Unable to archive conversation", 500);
  }
}
