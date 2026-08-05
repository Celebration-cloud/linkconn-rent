import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, hasRole } from "@/lib/auth/current-profile";
import { OperatingSystemRepository } from "@/repositories/operating-system.repository";
import { viewingCreateSchema } from "@/schemas/operating-system";

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!hasRole(profile, ["Tenant"])) {
      return apiError("Tenant access required", 403);
    }
    const input = viewingCreateSchema.parse(await request.json());
    const viewing = await OperatingSystemRepository.createViewing(
      profile.id,
      input.propertyId,
      input.scheduledAt,
      input.note,
    );
    return apiSuccess(viewing, "Viewing requested", 201);
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (
      error instanceof Error &&
      ["PROPERTY_NOT_AVAILABLE", "OWN_PROPERTY"].includes(error.message)
    ) {
      return apiError("A viewing cannot be requested for this property", 409);
    }
    console.error("[POST /api/viewings]", error);
    return apiError("Unable to request viewing", 500);
  }
}
