import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/neon-auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { verifyCsrf } from "@/lib/security/csrf";
import { internalRedirectSchema } from "@/lib/security/internal-redirect";
import { getAccountRoleByEmail } from "@/lib/auth/account-access";
import { isAdministratorRole } from "@/lib/auth/review-access";

const schema = z.object({
  email: z.string().email("Enter a valid email address").max(254),
  redirectTo: internalRedirectSchema.optional(),
  portal: z.enum(["public", "admin"]).default("public"),
});
const PASSWORD_RESET_DECOY_EMAIL = "auth-decoy@example.com";

export async function POST(req: Request) {
  // 1. Verify CSRF
  if (!verifyCsrf(req)) {
    return NextResponse.json(
      { success: false, message: "Security check failed: Origin mismatch." },
      { status: 403 }
    );
  }

  // 2. Check Rate Limit
  const ip = getClientIp(req);
  const rateLimit = checkRateLimit(ip, "forgot-password", 3, 15 * 60 * 1000); // 3 attempts per 15 mins
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many password reset requests. Please try again after ${new Date(
          rateLimit.resetTime
        ).toLocaleTimeString()}.`,
      },
      {
        status: 429,
        headers: {
          "Retry-After": Math.ceil((rateLimit.resetTime - Date.now()) / 1000).toString(),
        },
      }
    );
  }

  try {
    // 3. Validate Inputs
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || "Invalid inputs" },
        { status: 400 }
      );
    }

    const { email, redirectTo, portal } = parsed.data;
    const accountRole = await getAccountRoleByEmail(email);
    const administrator = isAdministratorRole(accountRole);
    const eligibleForPortal = portal === "admin" ? administrator : !administrator;

    // 4. Request Password Reset via Neon Auth
    const result = await auth.requestPasswordReset({
      email: eligibleForPortal ? email : PASSWORD_RESET_DECOY_EMAIL,
      redirectTo: redirectTo || (portal === "admin" ? "/admin/reset-password" : "/reset-password"),
    });

    if (result.error) {
      console.warn("Password reset request was not accepted by the auth provider");
    }

    return NextResponse.json({
      success: true,
      data: null,
      message: "If an account exists for that email, a reset link will be sent.",
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
    }
    console.error("Forgot password route error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during password reset request." },
      { status: 500 }
    );
  }
}
