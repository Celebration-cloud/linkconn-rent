import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/neon-auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { verifyCsrf } from "@/lib/security/csrf";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  callbackURL: z.string().optional(),
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

    const { email, password, callbackURL } = parsed.data;

    // 4. Authenticate via Neon Auth
    const result = await auth.signIn.email({
      email,
      password,
      callbackURL: callbackURL || "/dashboard",
    });

    if (result.error) {
      return NextResponse.json(
        { success: false, message: result.error.message || "Invalid credentials" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Signed in successfully",
    });
  } catch (error) {
    console.error("Login route error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
