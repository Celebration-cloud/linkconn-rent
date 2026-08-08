import { apiError, apiSuccess } from "@/lib/api-response";
import { verifyCsrf } from "@/lib/security/csrf";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { adminInvitationTokenSchema } from "@/features/admin-invitations/schemas";
import {
  ADMIN_INVITATION_CLAIM_COOKIE,
  ADMIN_INVITATION_CLAIM_MAX_AGE,
  createInvitationClaim,
} from "@/features/admin-invitations/server/invitation-crypto";
import { exchangeAdminInvitationToken } from "@/features/admin-invitations/server/invitation-service";
import { adminInvitationHttpError } from "@/features/admin-invitations/server/http";

export async function POST(request: Request) {
  if (!verifyCsrf(request)) return apiError("Security check failed", 403);
  const rateLimit = checkRateLimit(getClientIp(request), "admin-invitation-exchange", 20, 60 * 60 * 1000);
  if (!rateLimit.allowed) return apiError("Too many invitation attempts. Try again later.", 429);
  try {
    const parsed = adminInvitationTokenSchema.safeParse(await request.json());
    if (!parsed.success) return apiError("Invitation link is invalid", 400);
    const invitation = await exchangeAdminInvitationToken(parsed.data.token);
    const response = apiSuccess(
      { email: invitation.email, expiresAt: invitation.expiresAt },
      "Administrator invitation verified",
    );
    response.cookies.set(ADMIN_INVITATION_CLAIM_COOKIE, createInvitationClaim(invitation.id), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: ADMIN_INVITATION_CLAIM_MAX_AGE,
    });
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
    return response;
  } catch (error) {
    if (error instanceof SyntaxError) return apiError("Invalid JSON body", 400);
    return adminInvitationHttpError(error);
  }
}

