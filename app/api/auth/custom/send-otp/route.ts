import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/neon-auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { verifyCsrf } from "@/lib/security/csrf";

const schema = z.object({
  email: z.string().email("Enter a valid email address").max(254),
});

const OTP_RESEND_COOLDOWN_MS = 60 * 1000;

function retryAfterSeconds(resetTime: number) {
  return Math.max(1, Math.ceil((resetTime - Date.now()) / 1000));
}

export async function POST(req: Request) {
  // 1. Verify CSRF
  if (!verifyCsrf(req)) {
    return NextResponse.json(
      { success: false, message: "Security check failed: Origin mismatch." },
      { status: 403 }
    );
  }

  try {
    // 2. Validate Inputs
    const body = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || "Invalid inputs" },
        { status: 400 }
      );
    }

    const email = parsed.data.email.trim().toLowerCase();
    const ip = getClientIp(req);
    const emailKey = createHash("sha256").update(email).digest("hex");

    // Reserve the email/client pair before awaiting the provider so concurrent
    // requests cannot both send a code.
    const cooldown = checkRateLimit(
      `${ip}:${emailKey}`,
      "send-otp-cooldown",
      1,
      OTP_RESEND_COOLDOWN_MS,
    );
    if (!cooldown.allowed) {
      const retryAfter = retryAfterSeconds(cooldown.resetTime);
      return NextResponse.json(
        {
          success: false,
          data: { retryAfterSeconds: retryAfter },
          message: `A code was already requested. Try again in ${retryAfter} seconds.`,
        },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    // Retain a broader abuse limit while keeping it separate from the resend
    // cooldown. Only requests that pass the cooldown consume this allowance.
    const rateLimit = checkRateLimit(ip, "send-otp", 3, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      const retryAfter = retryAfterSeconds(rateLimit.resetTime);
      return NextResponse.json(
        {
          success: false,
          data: { retryAfterSeconds: retryAfter },
          message: "Too many code requests. Please try again later.",
        },
        { status: 429, headers: { "Retry-After": String(retryAfter) } },
      );
    }

    // 3. Send verification OTP via Neon Auth
    const result = await auth.emailOtp.sendVerificationOtp({
      email,
      type: "email-verification",
    });

    if (result.error) {
      console.warn("Verification code request was not accepted by the auth provider");
    }

    return NextResponse.json({
      success: true,
      data: { retryAfterSeconds: OTP_RESEND_COOLDOWN_MS / 1000 },
      message: "If the account is eligible, a verification code will be sent.",
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
    }
    console.error("Send OTP route error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while sending the code." },
      { status: 500 }
    );
  }
}
