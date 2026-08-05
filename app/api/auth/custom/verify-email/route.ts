import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/neon-auth";
import { verifyCsrf } from "@/lib/security/csrf";

const schema = z.object({
  token: z.string().optional(),
  callbackURL: z.string().optional(),
  email: z.string().email("Enter a valid email address").optional(),
  otp: z.string().length(6, "Enter the 6-digit code").optional(),
}).refine((data) => data.token || (data.email && data.otp), {
  message: "Provide either a token or email + otp code",
});

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

    const { token, callbackURL, email, otp } = parsed.data;

    // 3. Process verification based on provided parameters
    if (token) {
      // Token-based verification
      const result = await auth.verifyEmail({
        query: {
          token,
          callbackURL: callbackURL || "/dashboard",
        },
      });

      if (result.error) {
        return NextResponse.json(
          { success: false, message: result.error.message || "Verification failed" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result.data,
        message: "Email verified successfully.",
      });
    } else if (email && otp) {
      // OTP-based verification
      const result = await auth.emailOtp.verifyEmail({
        email,
        otp,
      });

      if (result.error) {
        return NextResponse.json(
          { success: false, message: result.error.message || "Invalid code" },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        data: result.data,
        message: "Email verified successfully.",
      });
    }

    return NextResponse.json(
      { success: false, message: "Invalid request parameters" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Verify email route error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during email verification." },
      { status: 500 }
    );
  }
}
