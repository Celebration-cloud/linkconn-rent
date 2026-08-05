import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, hasRole } from "@/lib/auth/current-profile";
import { OperatingSystemRepository } from "@/repositories/operating-system.repository";
import { savedPropertySchema } from "@/schemas/operating-system";

export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!hasRole(profile, ["Tenant"])) {
      return apiError("Tenant access required", 403);
    }
    const propertyIds = await OperatingSystemRepository.listSavedPropertyIds(
      profile.id,
    );
    return apiSuccess({ propertyIds }, "Saved properties loaded");
  } catch (error) {
    console.error("[GET /api/saved-properties]", error);
    return apiError("Unable to load saved properties", 500);
  }
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!hasRole(profile, ["Tenant"])) {
      return apiError("Tenant access required", 403);
    }
    const input = savedPropertySchema.parse(await request.json());
    const saved = await OperatingSystemRepository.saveProperty(
      profile.id,
      input.propertyId,
    );
    return apiSuccess(saved, "Property saved", 201);
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    console.error("[POST /api/saved-properties]", error);
    return apiError("Unable to save property", 500);
  }
}

export async function DELETE(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!hasRole(profile, ["Tenant"])) {
      return apiError("Tenant access required", 403);
    }
    const input = savedPropertySchema.parse(await request.json());
    await OperatingSystemRepository.removeSavedProperty(
      profile.id,
      input.propertyId,
    );
    return apiSuccess(null, "Saved property removed");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    console.error("[DELETE /api/saved-properties]", error);
    return apiError("Unable to remove saved property", 500);
  }
}
