import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/lib/neon-auth";

const protectRoute = auth.middleware({ loginUrl: "/login" });
const protectAdminRoute = auth.middleware({ loginUrl: "/admin/login" });
const ADMIN_AUTH_ROUTES = new Set([
  "/admin/login",
  "/admin/forgot-password",
  "/admin/reset-password",
]);
type RouteProtector = typeof protectRoute;

async function protectWithReturnPath(
  request: NextRequest,
  protect: RouteProtector,
  loginPath: string,
) {
  const response = await protect(request);
  const location = response.headers.get("location");
  if (!location || response.status < 300 || response.status >= 400) return response;

  const loginUrl = new URL(location, request.url);
  if (loginUrl.pathname !== loginPath || loginUrl.searchParams.has("next")) return response;

  loginUrl.searchParams.set("next", `${request.nextUrl.pathname}${request.nextUrl.search}`);
  const redirect = NextResponse.redirect(loginUrl);
  for (const cookie of response.headers.getSetCookie()) redirect.headers.append("Set-Cookie", cookie);
  return redirect;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (ADMIN_AUTH_ROUTES.has(pathname)) return NextResponse.next();

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return protectWithReturnPath(request, protectAdminRoute, "/admin/login");
  }

  const isProtected = [
    "/dashboard",
    "/onboarding",
    "/messages",
    "/verification",
  ].some((prefix) => pathname.startsWith(prefix));

  if (!isProtected) return NextResponse.next();

  return protectWithReturnPath(request, protectRoute, "/login");
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
