import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/neon-auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { verifyCsrf } from "@/lib/security/csrf";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
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
  const rateLimit = checkRateLimit(ip, "send-otp", 3, 15 * 60 * 1000); // 3 attempts per 15 mins
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many code requests. Please try again after ${new Date(
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

    const { email } = parsed.data;

    // 4. Send verification OTP via Neon Auth
    const result = await auth.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });

    if (result.error) {
      return NextResponse.json(
        { success: false, message: result.error.message || "Unable to send verification code" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Verification code sent successfully.",
    });
  } catch (error) {
    console.error("Send OTP route error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while sending the code." },
      { status: 500 }
    );
  }
}
