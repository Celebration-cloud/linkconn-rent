import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/neon-auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { verifyCsrf } from "@/lib/security/csrf";
import { internalRedirectSchema } from "@/lib/security/internal-redirect";
import {
  getAccountAccessProfile,
  getPostLoginDestination,
} from "@/lib/auth/account-access";
import { isAdministratorRole } from "@/lib/auth/review-access";
import { adminRateLimitResponse, checkAdminRateLimit } from "@/lib/security/admin-rate-limiter";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address").max(254),
  password: z.string().min(6, "Password must be at least 6 characters").max(1024),
  callbackURL: internalRedirectSchema.optional(),
  portal: z.enum(["public", "admin"]).default("public"),
});

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
  const rateLimit = checkRateLimit(ip, "login", 5, 15 * 60 * 1000); // 5 attempts per 15 mins
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many login attempts. Please try again after ${new Date(
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
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || "Invalid inputs" },
        { status: 400 }
      );
    }

    const { email, password, callbackURL, portal } = parsed.data;
    if (portal === "admin") {
      const adminLimit = await checkAdminRateLimit(req, "admin-login", email, 5, 15 * 60 * 1000);
      if (!adminLimit.allowed) return adminRateLimitResponse("Too many administrator sign-in attempts. Try again later.", adminLimit.resetTime);
    }

    // 4. Authenticate via Neon Auth
    const result = await auth.signIn.email({
      email,
      password,
      callbackURL: callbackURL || "/dashboard",
    });

    if (result.error) {
      return NextResponse.json(
        { success: false, message: "Invalid email or password" },
        { status: 400 }
      );
    }

    const profile = await getAccountAccessProfile(result.data.user.id);
    const administrator = isAdministratorRole(profile?.role);

    if (portal === "public" && administrator) {
      await auth.signOut();
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Administrator accounts must use the administrator sign-in page.",
        },
        { status: 403 },
      );
    }

    if (
      portal === "admin" &&
      (!administrator || !profile || profile.accountStatus === "Suspended" || !result.data.user.emailVerified)
    ) {
      await auth.signOut();
      return NextResponse.json(
        {
          success: false,
          data: null,
          message: "Invalid credentials or administrator access is unavailable.",
        },
        { status: 403 },
      );
    }

    const requestedDestination = callbackURL || (portal === "admin" ? "/admin" : "/dashboard");
    const destination = result.data.user.emailVerified
      ? getPostLoginDestination(
          profile,
          requestedDestination,
        )
      : requestedDestination;

    return NextResponse.json({
      success: true,
      data: { ...result.data, url: destination },
      message: "Signed in successfully",
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
    }
    console.error("Login route error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
