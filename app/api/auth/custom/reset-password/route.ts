import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/neon-auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { verifyCsrf } from "@/lib/security/csrf";

const schema = z.object({
  password: z.string().min(8, "Password must be at least 8 characters").max(1024),
  token: z.string().min(1, "Reset token is required").max(4096),
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
  const rateLimit = checkRateLimit(ip, "reset-password", 3, 15 * 60 * 1000); // 3 attempts per 15 mins
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many attempts to reset password. Please try again after ${new Date(
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

    const { password, token } = parsed.data;

    // 4. Reset Password via Neon Auth
    const result = await auth.resetPassword({
      newPassword: password,
      token,
    });

    if (result.error) {
      return NextResponse.json(
        { success: false, message: result.error.message || "Unable to reset password" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Password updated successfully.",
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
    }
    console.error("Reset password route error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during password reset." },
      { status: 500 }
    );
  }
}
