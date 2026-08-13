import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, hasRole, isAccountOperational } from "@/lib/auth/current-profile";
import { hasFreshAuthentication } from "@/lib/auth/fresh-auth";
import { AdministrationRepository } from "@/repositories/administration.repository";
import { verificationReviewSchema, verificationRouteParamsSchema } from "@/schemas/administration";
import { verifyCsrf } from "@/lib/security/csrf";
import { adminRateLimitResponse, checkAdminRateLimit } from "@/lib/security/admin-rate-limiter";

function markPrivateNoStore(response: Response) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (!hasRole(profile, ["Moderator", "Admin", "SuperAdmin"])) return apiError("Reviewer access required", 403);
    const { id } = verificationRouteParamsSchema.parse(await context.params);
    const detail = await AdministrationRepository.getVerificationDetail(id, profile.role);
    if (!detail) return apiError("Submission not found", 404);
    return markPrivateNoStore(apiSuccess(detail, "Verification detail loaded"));
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0]?.message ?? "Invalid verification id", 400);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Reviewer access required", 403);
    console.error("[GET /api/admin/verifications/:id]", error);
    return apiError("Unable to load verification detail", 500);
  }
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (!hasRole(profile, ["Moderator", "Admin", "SuperAdmin"])) return apiError("Reviewer access required", 403);
    if (!(await hasFreshAuthentication())) return apiError("Sign in again before making a verification decision", 401);
    const limit = await checkAdminRateLimit(request, "admin-verification-mutation", profile.id, 60, 60 * 60 * 1000);
    if (!limit.allowed) return adminRateLimitResponse("Too many verification actions. Try again later.", limit.resetTime);
    const { id } = verificationRouteParamsSchema.parse(await context.params);
    const input = verificationReviewSchema.parse(await request.json());
    const data = await AdministrationRepository.reviewVerification(profile, id, input);
    return apiSuccess(data, "Verification updated");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Reviewer access required", 403);
    if (error instanceof Error && error.message === "NOT_FOUND") return apiError("Submission not found", 404);
    if (error instanceof Error && error.message === "ASSIGNMENT_CONFLICT") return apiError("Submission is already assigned", 409);
    if (error instanceof Error && error.message === "REVIEW_CONFLICT") return apiError("This verification was already updated. Refresh and review the current round.", 409);
    if (error instanceof Error && ["INVALID_TRANSITION", "INVALID_ASSIGNEE", "INCOMPLETE_CHECKLIST", "INVALID_CHECKLIST_DECISION"].includes(error.message)) return apiError("Complete every required review finding before deciding", 409);
    console.error("[PATCH /api/admin/verifications/:id]", error);
    return apiError("Unable to update verification", 500);
  }
}
