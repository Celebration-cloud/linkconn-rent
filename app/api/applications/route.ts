import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, hasRole } from "@/lib/auth/current-profile";
import { OperatingSystemRepository } from "@/repositories/operating-system.repository";
import { applicationCreateSchema } from "@/schemas/operating-system";

export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!hasRole(profile, ["Landlord", "PropertyManager"])) {
      return apiError("Landlord access required", 403);
    }
    const applications =
      await OperatingSystemRepository.listLandlordApplications(profile.id);
    return apiSuccess(applications, "Applicants loaded");
  } catch (error) {
    console.error("[GET /api/applications]", error);
    return apiError("Unable to load applicants", 500);
  }
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!hasRole(profile, ["Tenant"])) {
      return apiError("Tenant access required", 403);
    }
    const input = applicationCreateSchema.parse(await request.json());
    const application = await OperatingSystemRepository.createApplication(
      profile.id,
      input.propertyId,
      input.message,
    );
    return apiSuccess(application, "Application submitted", 201);
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (
      error instanceof Error &&
      ["PROPERTY_NOT_AVAILABLE", "OWN_PROPERTY"].includes(error.message)
    ) {
      return apiError("This property cannot accept your application", 409);
    }
    console.error("[POST /api/applications]", error);
    return apiError("Unable to submit application", 500);
  }
}
