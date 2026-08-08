import { cookies } from "next/headers";
import { apiError, apiSuccess } from "@/lib/api-response";
import { auth } from "@/lib/neon-auth";
import { verifyCsrf } from "@/lib/security/csrf";
import {
  ADMIN_INVITATION_CLAIM_COOKIE,
  parseInvitationClaim,
} from "@/features/admin-invitations/server/invitation-crypto";
import { acceptAdminInvitation } from "@/features/admin-invitations/server/invitation-service";
import { adminInvitationHttpError } from "@/features/admin-invitations/server/http";

export async function POST(request: Request) {
  if (!verifyCsrf(request)) return apiError("Security check failed", 403);
  const { data: session } = await auth.getSession();
  if (!session?.user) return apiError("Sign in to accept this invitation", 401);
  const cookieStore = await cookies();
  const value = cookieStore.get(ADMIN_INVITATION_CLAIM_COOKIE)?.value;
  const claim = value ? parseInvitationClaim(value) : null;
  if (!claim) return apiError("Invitation claim expired. Open the invitation link again.", 400);

  try {
    const profile = await acceptAdminInvitation({
      invitationId: claim.invitationId,
      user: session.user,
    });
    const response = apiSuccess(profile, "Administrator invitation accepted");
    response.cookies.delete(ADMIN_INVITATION_CLAIM_COOKIE);
    response.headers.set("Cache-Control", "no-store");
    return response;
  } catch (error) {
    return adminInvitationHttpError(error);
  }
}
