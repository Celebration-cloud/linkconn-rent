import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, hasRole } from "@/lib/auth/current-profile";
import { OperatingSystemRepository } from "@/repositories/operating-system.repository";
import { applicationDecisionSchema } from "@/schemas/operating-system";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!hasRole(profile, ["Landlord", "PropertyManager"])) {
      return apiError("Landlord access required", 403);
    }
    const input = applicationDecisionSchema.parse(await request.json());
    const { id } = await context.params;
    const application = await OperatingSystemRepository.decideApplication(
      profile.id,
      id,
      input.status,
    );
    return apiSuccess(application, "Applicant status updated");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return apiError("Application not found", 404);
    }
    if (error instanceof Error && error.message === "INVALID_TRANSITION") {
      return apiError("That application transition is not allowed", 409);
    }
    console.error("[PATCH /api/applications/:id]", error);
    return apiError("Unable to update application", 500);
  }
}
