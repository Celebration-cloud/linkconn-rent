import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { TenantOperationsRepository } from "@/repositories/tenant-operations.repository";
import { maintenanceUpdateSchema } from "@/schemas/tenant-operations";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    const input = maintenanceUpdateSchema.parse(await request.json());
    const { id } = await context.params;
    return apiSuccess(await TenantOperationsRepository.updateMaintenance(profile, id, input), "Maintenance request updated");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "NOT_FOUND") return apiError("Maintenance request not found", 404);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Only the property owner can update status", 403);
    console.error("[PATCH /api/maintenance/:id]", error);
    return apiError("Unable to update maintenance request", 500);
  }
}

