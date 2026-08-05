import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/neon-auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { verifyCsrf } from "@/lib/security/csrf";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  redirectTo: z.string().optional(),
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

    const { email, redirectTo } = parsed.data;

    // 4. Request Password Reset via Neon Auth
    const result = await auth.requestPasswordReset({
      email,
      redirectTo: redirectTo || "/reset-password",
    });

    if (result.error) {
      return NextResponse.json(
        { success: false, message: result.error.message || "Unable to request password reset" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: result.data?.message || "Check your inbox for the reset link.",
    });
  } catch (error) {
    console.error("Forgot password route error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during password reset request." },
      { status: 500 }
    );
  }
}
