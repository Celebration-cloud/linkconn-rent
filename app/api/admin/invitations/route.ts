import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { adminInvitationEmailSchema } from "@/features/admin-invitations/schemas";
import {
  createAdminInvitation,
  listAdminInvitations,
} from "@/features/admin-invitations/server/invitation-service";
import { adminInvitationHttpError } from "@/features/admin-invitations/server/http";
import { adminRateLimitResponse, checkAdminRateLimit } from "@/lib/security/admin-rate-limiter";

export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile) return apiError("Unauthorized", 401);
  try {
    return apiSuccess(await listAdminInvitations(profile), "Administrator invitations fetched");
  } catch (error) {
    return adminInvitationHttpError(error);
  }
}

export async function POST(request: Request) {
  if (!verifyCsrf(request)) return apiError("Security check failed", 403);
  const profile = await getCurrentProfile();
  if (!profile) return apiError("Unauthorized", 401);
  const rateLimit = checkRateLimit(getClientIp(request), "admin-invitation-create", 10, 60 * 60 * 1000);
  if (!rateLimit.allowed) return apiError("Too many invitation attempts. Try again later.", 429);
  const durableLimit = await checkAdminRateLimit(request, "admin-invitation-create", profile.id, 10, 60 * 60 * 1000);
  if (!durableLimit.allowed) return adminRateLimitResponse("Too many administrator invitation attempts. Try again later.", durableLimit.resetTime);

  try {
    const parsed = adminInvitationEmailSchema.safeParse(await request.json());
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid email", 400);
    const result = await createAdminInvitation(profile, parsed.data.email);
    const url = new URL("/admin-invite", request.url);
    url.hash = `token=${result.token}`;
    return apiSuccess(
      { invitation: result.invitation, invitationUrl: url.toString() },
      "Administrator invitation created",
      201,
    );
  } catch (error) {
    if (error instanceof SyntaxError) return apiError("Invalid JSON body", 400);
    return adminInvitationHttpError(error);
  }
}
