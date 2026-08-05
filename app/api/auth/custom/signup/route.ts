import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/neon-auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { verifyCsrf } from "@/lib/security/csrf";

const signupSchema = z.object({
  name: z.string().min(2, "Enter your full name"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
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
  const rateLimit = checkRateLimit(ip, "signup", 5, 15 * 60 * 1000); // 5 attempts per 15 mins
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        message: `Too many sign up attempts. Please try again after ${new Date(
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
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: parsed.error.issues[0]?.message || "Invalid inputs" },
        { status: 400 }
      );
    }

    const { name, email, password, callbackURL } = parsed.data;

    // 4. Register via Neon Auth
    const result = await auth.signUp.email({
      name,
      email,
      password,
      callbackURL: callbackURL || "/verify-email",
    });

    if (result.error) {
      return NextResponse.json(
        { success: false, message: result.error.message || "Unable to create account" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Account created successfully",
    });
  } catch (error) {
    console.error("Signup route error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during signup." },
      { status: 500 }
    );
  }
}
