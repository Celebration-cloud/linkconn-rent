import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { AdministrationRepository } from "@/repositories/administration.repository";
import { disputeActionSchema } from "@/schemas/administration";
import { verifyCsrf } from "@/lib/security/csrf";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    const input = disputeActionSchema.parse(await request.json());
    const { id } = await context.params;
    return apiSuccess(await AdministrationRepository.actOnDispute(profile, id, input), "Dispute updated");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Reviewer access required", 403);
    if (error instanceof Error && error.message === "NOT_FOUND") return apiError("Dispute not found", 404);
    if (error instanceof Error && error.message === "ASSIGNMENT_CONFLICT") return apiError("Case is already assigned", 409);
    if (error instanceof Error && ["INVALID_TRANSITION", "INVALID_ASSIGNEE"].includes(error.message)) return apiError("Invalid dispute action", 409);
    console.error("[PATCH /api/admin/disputes/:id]", error);
    return apiError("Unable to update dispute", 500);
  }
}
