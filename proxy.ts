import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/neon-auth";

const protectRoute = auth.middleware({ loginUrl: "/login" });

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = [
    "/dashboard",
    "/onboarding",
    "/messages",
    "/verification",
    "/admin",
  ].some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) return NextResponse.next();

  return protectRoute(request);
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
