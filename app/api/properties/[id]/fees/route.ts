import { ZodError } from "zod";
import { canListProperties } from "@/domain/constants/property-access";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { OperatingSystemRepository } from "@/repositories/operating-system.repository";
import { propertyFeesSchema } from "@/schemas/operating-system";
import { invalidatePropertyCache } from "@/lib/cache/invalidate-property-cache";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!canListProperties(profile.role)) {
      return apiError("Landlord access required", 403);
    }
    const input = propertyFeesSchema.parse(await request.json());
    const { id } = await context.params;
    const property = await OperatingSystemRepository.updateFees(
      profile.id,
      id,
      input,
    );
    invalidatePropertyCache({ propertyId: id });
    return apiSuccess(property, "Rent and fees saved");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return apiError("Property not found", 404);
    }
    console.error("[PATCH /api/properties/:id/fees]", error);
    return apiError("Unable to save rent and fees", 500);
  }
}
