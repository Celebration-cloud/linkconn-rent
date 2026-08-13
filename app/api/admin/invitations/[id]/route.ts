import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { revokeAdminInvitation } from "@/features/admin-invitations/server/invitation-service";
import { adminInvitationHttpError } from "@/features/admin-invitations/server/http";
import { adminRateLimitResponse, checkAdminRateLimit } from "@/lib/security/admin-rate-limiter";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verifyCsrf(request)) return apiError("Security check failed", 403);
  const profile = await getCurrentProfile();
  if (!profile) return apiError("Unauthorized", 401);
  try {
    const { id } = await params;
    const durableLimit = await checkAdminRateLimit(request, "admin-invitation-revoke", profile.id, 20, 60 * 60 * 1000);
    if (!durableLimit.allowed) return adminRateLimitResponse("Too many administrator invitation changes. Try again later.", durableLimit.resetTime);
    return apiSuccess(await revokeAdminInvitation(profile, id), "Administrator invitation revoked");
  } catch (error) {
    return adminInvitationHttpError(error);
  }
}
