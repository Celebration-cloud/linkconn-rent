import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/neon-auth";

const protectRoute = auth.middleware({ loginUrl: "/login" });

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isDashboard = pathname.startsWith("/dashboard");
  const isOnboarding = pathname.startsWith("/onboarding");
  const isMessages = pathname.startsWith("/messages");
  const isVerification = pathname.startsWith("/verification");
  const isAdmin = pathname.startsWith("/admin");
  const isProtected =
    isDashboard ||
    isOnboarding ||
    isMessages ||
    isVerification ||
    isAdmin;

  if (!isProtected) {
    return NextResponse.next();
  }

  // Delegate auth check to Neon Auth middleware (handles 401 → /login redirect)
  return protectRoute(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
