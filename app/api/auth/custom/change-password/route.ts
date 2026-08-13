import { apiError, apiSuccess } from "@/lib/api-response";
import { auth } from "@/lib/neon-auth";
import { verifyCsrf } from "@/lib/security/csrf";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { changePasswordSchema } from "@/features/admin-invitations/schemas";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { isAdministratorRole } from "@/lib/auth/review-access";
import { adminRateLimitResponse, checkAdminRateLimit } from "@/lib/security/admin-rate-limiter";

export async function POST(request: Request) {
  if (!verifyCsrf(request)) return apiError("Security check failed", 403);
  const { data: session } = await auth.getSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  const rateLimit = checkRateLimit(getClientIp(request), "change-password", 5, 60 * 60 * 1000);
  if (!rateLimit.allowed) return apiError("Too many password attempts. Try again later.", 429);
  const profile = await getCurrentProfile();
  if (profile && isAdministratorRole(profile.role)) {
    const adminLimit = await checkAdminRateLimit(request, "admin-password-change", profile.id, 5, 60 * 60 * 1000);
    if (!adminLimit.allowed) return adminRateLimitResponse("Too many administrator password attempts. Try again later.", adminLimit.resetTime);
  }

  try {
    const parsed = changePasswordSchema.safeParse(await request.json());
    if (!parsed.success) return apiError(parsed.error.issues[0]?.message ?? "Invalid password", 400);
    const result = await auth.changePassword({
      currentPassword: parsed.data.currentPassword,
      newPassword: parsed.data.newPassword,
      revokeOtherSessions: true,
    });
    if (result.error) return apiError("Current password is incorrect", 400);
    return apiSuccess({ changed: true }, "Password updated successfully");
  } catch (error) {
    if (error instanceof SyntaxError) return apiError("Invalid JSON body", 400);
    console.error("[POST /api/auth/custom/change-password]", error);
    return apiError("Unable to update password", 500);
  }
}
