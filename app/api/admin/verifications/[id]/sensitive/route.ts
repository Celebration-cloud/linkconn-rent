import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, hasRole, isAccountOperational } from "@/lib/auth/current-profile";
import { hasFreshAuthentication } from "@/lib/auth/fresh-auth";
import { AdministrationRepository } from "@/repositories/administration.repository";
import { verificationRouteParamsSchema } from "@/schemas/administration";
import { adminRateLimitResponse, checkAdminRateLimit } from "@/lib/security/admin-rate-limiter";

function markPrivateNoStore(response: Response) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (!hasRole(profile, ["Admin", "SuperAdmin"])) return apiError("Administrator sensitive access required", 403);
    if (!(await hasFreshAuthentication())) return apiError("Sign in again before revealing sensitive values", 401);
    const limit = await checkAdminRateLimit(request, "admin-verification-sensitive-reveal", profile.id, 20, 60 * 60 * 1000);
    if (!limit.allowed) return adminRateLimitResponse("Too many sensitive reveal attempts. Try again later.", limit.resetTime);
    const { id } = verificationRouteParamsSchema.parse(await context.params);
    const data = await AdministrationRepository.revealVerificationSensitive(profile, id);
    return markPrivateNoStore(apiSuccess(data, "Sensitive verification values revealed"));
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0]?.message ?? "Invalid verification id", 400);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Administrator sensitive access required", 403);
    if (error instanceof Error && error.message === "NOT_FOUND") return apiError("Submission not found", 404);
    console.error("[GET /api/admin/verifications/:id/sensitive]", error);
    return apiError("Unable to reveal sensitive verification values", 500);
  }
}
