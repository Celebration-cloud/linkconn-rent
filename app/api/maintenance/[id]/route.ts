import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { TenantOperationsRepository } from "@/repositories/tenant-operations.repository";
import { maintenanceUpdateSchema } from "@/schemas/tenant-operations";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (!checkRateLimit(getClientIp(request), `maintenance-update:${profile.id}`, 40, 3_600_000).allowed) return apiError("Too many maintenance updates. Try again later", 429);
    const input = maintenanceUpdateSchema.parse(await request.json());
    const { id } = await context.params;
    return apiSuccess(await TenantOperationsRepository.updateMaintenance(profile, id, input), "Maintenance request updated");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "NOT_FOUND") return apiError("Maintenance request not found", 404);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Only the property owner can update status", 403);
    if (error instanceof Error && error.message === "INVALID_TRANSITION") return apiError("Invalid maintenance transition", 409);
    if (error instanceof Error && error.message === "OPERATION_CONFLICT") return apiError("This maintenance request changed. Refresh and try again", 409);
    console.error("[PATCH /api/maintenance/:id]", error);
    return apiError("Unable to update maintenance request", 500);
  }
}
