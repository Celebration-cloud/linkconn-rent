import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { rotateAdminInvitation } from "@/features/admin-invitations/server/invitation-service";
import { adminInvitationHttpError } from "@/features/admin-invitations/server/http";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!verifyCsrf(request)) return apiError("Security check failed", 403);
  const profile = await getCurrentProfile();
  if (!profile) return apiError("Unauthorized", 401);
  try {
    const { id } = await params;
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

