import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { AdministrationRepository } from "@/repositories/administration.repository";
import { userModerationSchema } from "@/schemas/administration";
import { verifyCsrf } from "@/lib/security/csrf";
import { adminRateLimitResponse, checkAdminRateLimit } from "@/lib/security/admin-rate-limiter";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    const limit = await checkAdminRateLimit(request, "admin-user-moderation", profile.id, 40, 60 * 60 * 1000);
    if (!limit.allowed) return adminRateLimitResponse("Too many account moderation actions. Try again later.", limit.resetTime);
    const input = userModerationSchema.parse(await request.json());
    const { id } = await context.params;
    return apiSuccess(await AdministrationRepository.moderateUser(profile, id, input.status, input.reason), "Account status updated");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Admin access required", 403);
    if (error instanceof Error && error.message === "NOT_FOUND") return apiError("User not found", 404);
    if (error instanceof Error && error.message === "SELF_SANCTION") return apiError("You cannot sanction your own account", 409);
    console.error("[PATCH /api/admin/moderation/users/:id]", error);
    return apiError("Unable to update account", 500);
  }
}
