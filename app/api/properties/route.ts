import { ZodError } from "zod";
import { canListProperties } from "@/domain/constants/property-access";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { OperatingSystemRepository } from "@/repositories/operating-system.repository";
import {
  propertyDraftSchema,
  propertySearchSchema,
} from "@/schemas/operating-system";
import { mapProperty } from "@/utils/map-property";

export async function GET(request: Request) {
  try {
    const input = propertySearchSchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const result = await OperatingSystemRepository.searchProperties(input);
    return apiSuccess(
      { ...result, items: result.items.map(mapProperty) },
      "Properties loaded",
    );
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    console.error("[GET /api/properties]", error);
    return apiError("Unable to search properties", 500);
  }
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!canListProperties(profile.role)) {
      return apiError("Landlord access required", 403);
    }
    const input = propertyDraftSchema.parse(await request.json());
    if (input.publish && !input.images.length) {
      return apiError("Add at least one property image before publishing", 409);
    }
    const property = await OperatingSystemRepository.saveDraft(profile.id, input);
    return apiSuccess(
      property,
      input.publish ? "Property published" : "Draft saved",
      input.id ? 200 : 201,
    );
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return apiError("Property not found", 404);
    }
    console.error("[POST /api/properties]", error);
    return apiError("Unable to save property", 500);
  }
}
