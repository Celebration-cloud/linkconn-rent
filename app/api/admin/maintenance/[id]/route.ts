import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { AdministrationRepository } from "@/repositories/administration.repository";
import { maintenanceAdminActionSchema } from "@/schemas/administration";
import { adminRateLimitResponse, checkAdminRateLimit } from "@/lib/security/admin-rate-limiter";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    const limit = await checkAdminRateLimit(request, "admin-maintenance-mutation", profile.id, 60, 60 * 60 * 1000);
    if (!limit.allowed) return adminRateLimitResponse("Too many maintenance actions. Try again later.", limit.resetTime);
    const input = maintenanceAdminActionSchema.parse(await request.json());
    const { id } = await context.params;
    return apiSuccess(
      await AdministrationRepository.actOnMaintenanceRequest(profile, id, input.status, input.reason),
      "Maintenance request updated",
    );
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0]?.message ?? "Invalid action", 400);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Reviewer access required", 403);
    if (error instanceof Error && error.message === "NOT_FOUND") return apiError("Maintenance request not found", 404);
    if (error instanceof Error && error.message === "INVALID_TRANSITION") return apiError("Invalid maintenance transition", 409);
    if (error instanceof Error && error.message === "OPERATION_CONFLICT") return apiError("This maintenance request changed. Refresh and try again", 409);
    console.error("[PATCH /api/admin/maintenance/:id]", error);
    return apiError("Unable to update maintenance request", 500);
  }
}
