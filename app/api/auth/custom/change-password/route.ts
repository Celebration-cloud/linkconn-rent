import { apiError, apiSuccess } from "@/lib/api-response";
import { auth } from "@/lib/neon-auth";
import { verifyCsrf } from "@/lib/security/csrf";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { changePasswordSchema } from "@/features/admin-invitations/schemas";

export async function POST(request: Request) {
  if (!verifyCsrf(request)) return apiError("Security check failed", 403);
  const { data: session } = await auth.getSession();
  if (!session?.user) return apiError("Unauthorized", 401);
  const rateLimit = checkRateLimit(getClientIp(request), "change-password", 5, 60 * 60 * 1000);
  if (!rateLimit.allowed) return apiError("Too many password attempts. Try again later.", 429);

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
