import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_PATHS = [
  "/",
  "/auth/login",
  "/auth/signup",
  "/rentals",
  "/about",
  "/contact",
];

export async function middleware(req) {
  const { pathname } = req.nextUrl;
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  // Public routes
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (token && ["/auth/login", "/auth/signup"].includes(pathname)) {
      return NextResponse.redirect(
        new URL(`/dashboard/${token.role}`, req.url)
      );
    }
    return NextResponse.next();
  }

  // Protected routes
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/onboarding") ||
    pathname.startsWith("/pending") ||
    pathname.startsWith("/rejected")
  ) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    const { role, onboarded, verification_status } = token;

    // 1. Onboarding check first
    if (!onboarded && !pathname.startsWith(`/onboarding/${role}`)) {
      return NextResponse.redirect(new URL(`/onboarding/${role}`, req.url));
    }

    // 2. If onboarded but verification is pending or rejected
    if (
      onboarded &&
      verification_status === "pending" &&
      !pathname.startsWith(`/pending/${role}`)
    ) {
      return NextResponse.redirect(new URL(`/pending/${role}`, req.url));
    }

    if (
      onboarded &&
      verification_status === "rejected" &&
      !pathname.startsWith(`/rejected/${role}`)
    ) {
      return NextResponse.redirect(new URL(`/rejected/${role}`, req.url));
    }

    // 3. If verified, redirect to dashboard
    if (
      onboarded &&
      verification_status === "approved" &&
      pathname.startsWith(`/onboarding/${role}`)
    ) {
      return NextResponse.redirect(new URL(`/dashboard/${role}`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/pending/:path*",
    "/rejected/:path*",
    "/auth/login",
    "/auth/signup",
  ],
};
