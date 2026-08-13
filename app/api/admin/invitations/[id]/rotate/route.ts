import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { rotateAdminInvitation } from "@/features/admin-invitations/server/invitation-service";
import { adminInvitationHttpError } from "@/features/admin-invitations/server/http";
import { adminRateLimitResponse, checkAdminRateLimit } from "@/lib/security/admin-rate-limiter";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verifyCsrf(request)) return apiError("Security check failed", 403);
  const profile = await getCurrentProfile();
  if (!profile) return apiError("Unauthorized", 401);
  try {
    const { id } = await params;
    const durableLimit = await checkAdminRateLimit(request, "admin-invitation-rotate", profile.id, 20, 60 * 60 * 1000);
    if (!durableLimit.allowed) return adminRateLimitResponse("Too many administrator invitation changes. Try again later.", durableLimit.resetTime);
    const result = await rotateAdminInvitation(profile, id);
    const url = new URL("/admin-invite", request.url);
    url.hash = `token=${result.token}`;
    return apiSuccess(
      { invitation: result.invitation, invitationUrl: url.toString() },
      "Administrator invitation rotated",
    );
  } catch (error) {
    return adminInvitationHttpError(error);
  }
}
