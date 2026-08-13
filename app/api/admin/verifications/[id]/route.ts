import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { AdministrationRepository } from "@/repositories/administration.repository";
import { verificationReviewSchema } from "@/schemas/administration";
import { verifyCsrf } from "@/lib/security/csrf";
import { adminRateLimitResponse, checkAdminRateLimit } from "@/lib/security/admin-rate-limiter";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    const limit = await checkAdminRateLimit(request, "admin-verification-mutation", profile.id, 60, 60 * 60 * 1000);
    if (!limit.allowed) return adminRateLimitResponse("Too many verification actions. Try again later.", limit.resetTime);
    const { id } = await context.params;
    const input = verificationReviewSchema.parse(await request.json());
    const data = await AdministrationRepository.reviewVerification(profile, id, input);
    return apiSuccess(data, "Verification updated");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Reviewer access required", 403);
    if (error instanceof Error && error.message === "NOT_FOUND") return apiError("Submission not found", 404);
    if (error instanceof Error && error.message === "ASSIGNMENT_CONFLICT") return apiError("Submission is already assigned", 409);
    if (error instanceof Error && ["INVALID_TRANSITION", "INVALID_ASSIGNEE"].includes(error.message)) return apiError("Invalid review action", 409);
    console.error("[PATCH /api/admin/verifications/:id]", error);
    return apiError("Unable to update verification", 500);
  }
}
