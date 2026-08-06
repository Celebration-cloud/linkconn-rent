import { ZodError } from "zod";
import { canListProperties } from "@/domain/constants/property-access";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { TenantOperationsRepository } from "@/repositories/tenant-operations.repository";
import { propertyActionSchema } from "@/schemas/tenant-operations";
import { invalidatePropertyCache } from "@/lib/cache/invalidate-property-cache";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!canListProperties(profile.role)) return apiError("Landlord access required", 403);
    const input = propertyActionSchema.parse(await request.json());
    const { id } = await context.params;
    const property = await TenantOperationsRepository.propertyAction(
      profile.id,
      id,
      input.action,
    );
    invalidatePropertyCache({ propertyId: id });
    return apiSuccess(property, `Property ${input.action} action completed`);
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "NOT_FOUND") return apiError("Property not found", 404);
    if (error instanceof Error && error.message === "MEDIA_REQUIRED") return apiError("Add at least one image before publishing", 409);
    console.error("[POST /api/properties/:id/actions]", error);
    return apiError("Unable to update property", 500);
  }
}
