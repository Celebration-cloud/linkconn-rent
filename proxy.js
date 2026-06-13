import { NextResponse } from "next/server";

import { auth } from "@/lib/auth/server";
import { sql } from "@/lib/db";

const FULLY_VERIFIED_REDIRECT = ["/auth/login", "/auth/signup"];
const TENANT_ONBOARDING_PATHS = [
  "/onboarding",
  "/onboarding/tenant",
  "/onboarding/tenant/employment",
  "/onboarding/tenant/preference",
  "/onboarding/tenant/success",
];
const LANDLORD_ONBOARDING_PATHS = [
  "/onboarding",
  "/onboarding/landlord",
  "/onboarding/landlord/property",
  "/onboarding/landlord/payout",
  "/onboarding/landlord/success",
];

const EMAIL_UNVERIFIED_ALLOWED = [
  "/",
  "/rentals",
  "/about",
  "/contact",
  "/properties",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/reset-password",
];

const PROFILE_UNVERIFIED_ALLOWED = [
  "/",
  "/rentals",
  "/about",
  "/contact",
  "/properties",
  "/onboarding",
  "/onboarding/tenant",
  "/onboarding/tenant/employment",
  "/onboarding/tenant/preference",
  "/onboarding/tenant/success",
  "/onboarding/landlord",
  "/onboarding/landlord/property",
  "/onboarding/landlord/payout",
  "/onboarding/landlord/success",
  "/auth/verify-email",
  "/auth/forgot-password",
  "/auth/reset-password",
];

export async function proxy(req) {
  const { pathname } = req.nextUrl;

  const session = await auth.getSession({ headers: req.headers });
  const hasSession = session && session.user;

  if (!hasSession) {
    return NextResponse.next();
  }

  const userId = session.user.id;
  let profileVerified = false;
  let userRole = "tenant";

  try {
    const profiles = await sql`
      SELECT verified, role FROM profiles WHERE id = ${userId} LIMIT 1
    `;
    if (profiles.length > 0) {
      profileVerified = profiles[0].verified;
      userRole = profiles[0].role || "tenant";
    }
  } catch (err) {
    console.error("Proxy DB fetch error:", err);
  }

  const emailVerified = !!session.user.emailVerified;
  const profileComplete = profileVerified;

  if (!emailVerified) {
    const isAllowed = EMAIL_UNVERIFIED_ALLOWED.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );

    if (!isAllowed) {
      return NextResponse.redirect(new URL("/auth/verify-email", req.url));
    }

    return NextResponse.next();
  }

  if (!profileComplete) {
    const allowedOnboardingPaths =
      userRole === "landlord"
        ? LANDLORD_ONBOARDING_PATHS
        : TENANT_ONBOARDING_PATHS;

    const isAllowedOnboardingPath = allowedOnboardingPaths.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );

    if (pathname.startsWith("/onboarding") && !isAllowedOnboardingPath) {
      return NextResponse.redirect(
        new URL(`/onboarding/${userRole}`, req.url),
      );
    }

    const isAllowed = PROFILE_UNVERIFIED_ALLOWED.some(
      (p) => pathname === p || pathname.startsWith(p + "/"),
    );

    if (!isAllowed) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }

    for (const path of FULLY_VERIFIED_REDIRECT) {
      if (pathname === path || pathname.startsWith(path + "/")) {
        return NextResponse.redirect(new URL("/onboarding", req.url));
      }
    }

    return NextResponse.next();
  }

  if (pathname.startsWith("/onboarding")) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  for (const path of FULLY_VERIFIED_REDIRECT) {
    if (pathname === path || pathname.startsWith(path + "/")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (pathname.startsWith("/dashboard")) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/:path*",
    "/onboarding/:path*",
    "/",
    "/rentals",
    "/about",
    "/contact",
    "/properties",
  ],
};
