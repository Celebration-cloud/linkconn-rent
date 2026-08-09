import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/neon-auth";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { verifyCsrf } from "@/lib/security/csrf";
import { internalRedirectSchema } from "@/lib/security/internal-redirect";
import { prisma } from "@/lib/db/client";

const signupSchema = z.object({
  name: z.string().min(2, "Enter your full name").max(120),
  email: z.string().email("Enter a valid email address").max(254),
  password: z.string().min(8, "Password must be at least 8 characters").max(1024),
  role: z.enum(["Tenant", "Landlord"]).default("Tenant"),
  callbackURL: internalRedirectSchema.optional(),
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

    const { name, email, password, role, callbackURL } = parsed.data;

    // 4. Register via Neon Auth
    const result = await auth.signUp.email({
      name,
      email,
      password,
      callbackURL: callbackURL || "/verify-email",
    });

    if (result.error) {
      return NextResponse.json(
        { success: false, message: "Unable to create account with those details" },
        { status: 400 }
      );
    }

    const user = result.data?.user;
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Account was created but could not be initialized. Please sign in to continue." },
        { status: 500 },
      );
    }
    const [firstName = "New", ...lastNameParts] = name.trim().split(/\s+/);
    try {
      await prisma.profile.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email: user.email,
          firstName,
          lastName: lastNameParts.join(" ") || "User",
          emailVerified: Boolean(user.emailVerified),
          role,
          onboardingComplete: false,
        },
        update: {
          email: user.email,
          firstName,
          lastName: lastNameParts.join(" ") || "User",
          emailVerified: Boolean(user.emailVerified),
          role,
          onboardingComplete: false,
        },
      });
    } catch (error) {
      // Neon Auth owns the new identity. Do not falsely report signup failure
      // after that irreversible step; onboarding draft persistence retries the
      // role mirror before any role-specific document can be uploaded.
      console.error("[signup profile role mirror]", error);
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: "Account created successfully",
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json({ success: false, message: "Invalid JSON body." }, { status: 400 });
    }
    console.error("Signup route error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during signup." },
      { status: 500 }
    );
  }
}
