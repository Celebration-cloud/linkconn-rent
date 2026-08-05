/**
 * Verifies that request origin and referer match the configured site URL
 * to protect API endpoints against Cross-Site Request Forgery (CSRF).
 */
export function verifyCsrf(req: Request): boolean {
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");
  
  const siteUrlStr = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  let siteUrl: URL;
  try {
    siteUrl = new URL(siteUrlStr);
  } catch {
    return true; // If site URL is misconfigured, skip check to avoid breaking the app in dev
  }

  // 1. If Origin header is present, it must match our site origin
  if (origin) {
    try {
      const originUrl = new URL(origin);
      if (originUrl.origin !== siteUrl.origin) {
        return false;
      }
    } catch {
      return false;
    }
  }

  // 2. If Referer header is present, it must start with our site origin
  if (referer) {
    try {
      const refererUrl = new URL(referer);
      if (refererUrl.origin !== siteUrl.origin) {
        return false;
      }
    } catch {
      return false;
    }
  }

  // 3. For POST/PUT/DELETE, if neither Origin nor Referer is present, block the request if in production
  if (!origin && !referer && process.env.NODE_ENV === "production") {
    return false;
  }

  return true;
}
