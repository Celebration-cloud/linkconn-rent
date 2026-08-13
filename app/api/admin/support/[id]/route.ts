import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { AdministrationRepository } from "@/repositories/administration.repository";
import { supportTicketActionSchema } from "@/schemas/administration";
import { adminRateLimitResponse, checkAdminRateLimit } from "@/lib/security/admin-rate-limiter";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    const limit = await checkAdminRateLimit(request, "admin-support-mutation", profile.id, 80, 60 * 60 * 1000);
    if (!limit.allowed) return adminRateLimitResponse("Too many support actions. Try again later.", limit.resetTime);
    const input = supportTicketActionSchema.parse(await request.json());
    const { id } = await context.params;
    return apiSuccess(await AdministrationRepository.actOnSupportTicket(profile, id, input), "Support ticket updated");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0]?.message ?? "Invalid action", 400);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Reviewer access required", 403);
    if (error instanceof Error && error.message === "NOT_FOUND") return apiError("Support ticket not found", 404);
    if (error instanceof Error && error.message === "ASSIGNMENT_CONFLICT") return apiError("Ticket is already assigned", 409);
    if (error instanceof Error && ["INVALID_TRANSITION", "INVALID_ASSIGNEE"].includes(error.message)) return apiError("Invalid support action", 409);
    console.error("[PATCH /api/admin/support/:id]", error);
    return apiError("Unable to update support ticket", 500);
  }
}
