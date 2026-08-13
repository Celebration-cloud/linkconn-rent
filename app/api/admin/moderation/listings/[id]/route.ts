import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { AdministrationRepository } from "@/repositories/administration.repository";
import { listingModerationSchema } from "@/schemas/administration";
import { invalidatePropertyCache } from "@/lib/cache/invalidate-property-cache";
import { verifyCsrf } from "@/lib/security/csrf";
import { adminRateLimitResponse, checkAdminRateLimit } from "@/lib/security/admin-rate-limiter";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    const limit = await checkAdminRateLimit(request, "admin-listing-moderation", profile.id, 60, 60 * 60 * 1000);
    if (!limit.allowed) return adminRateLimitResponse("Too many listing moderation actions. Try again later.", limit.resetTime);
    const input = listingModerationSchema.parse(await request.json());
    const { id } = await context.params;
    const listing = await AdministrationRepository.moderateListing(
      profile,
      id,
      input.status,
      input.reason,
    );
    invalidatePropertyCache({ propertyId: id });
    return apiSuccess(listing, "Listing moderation updated");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "FORBIDDEN") return apiError("Reviewer access required", 403);
    if (error instanceof Error && error.message === "NOT_FOUND") return apiError("Listing not found", 404);
    console.error("[PATCH /api/admin/moderation/listings/:id]", error);
    return apiError("Unable to update listing", 500);
  }
}
