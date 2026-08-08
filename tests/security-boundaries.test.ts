import { afterEach, describe, expect, it, vi } from "vitest";
import { verifyCsrf } from "@/lib/security/csrf";
import { getInternalRedirectPath, isInternalRedirectPath } from "@/lib/security/internal-redirect";
import { getClientIp } from "@/lib/security/rate-limiter";

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("internal redirect validation", () => {
  it.each(["/dashboard", "/properties?page=2", "/verify-email?next=%2Fonboarding"])(
    "accepts %s",
    (path) => expect(isInternalRedirectPath(path)).toBe(true)
  );

  it.each([
    "https://evil.example/steal",
    "//evil.example/steal",
    "/\\evil.example/steal",
    "javascript:alert(1)",
    "dashboard",
    "/dashboard\nSet-Cookie:test=1",
  ])("rejects %s", (path) => expect(isInternalRedirectPath(path)).toBe(false));

  it("falls back instead of reflecting an unsafe next value", () => {
    expect(getInternalRedirectPath("//evil.example", "/dashboard")).toBe("/dashboard");
  });
});

describe("CSRF origin enforcement", () => {
  it("fails closed in production when the configured site URL is invalid", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "not a url");
    expect(verifyCsrf(new Request("https://app.example/api", { method: "POST" }))).toBe(false);
  });

  it("rejects cross-origin requests", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://app.example");
    const request = new Request("https://app.example/api", {
      method: "POST",
      headers: { origin: "https://evil.example" },
    });
    expect(verifyCsrf(request)).toBe(false);
  });

  it("accepts the configured origin", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://app.example");
    const request = new Request("https://app.example/api", {
      method: "POST",
      headers: { origin: "https://app.example" },
    });
    expect(verifyCsrf(request)).toBe(true);
  });
});

describe("trusted client IP extraction", () => {
  it("ignores spoofed forwarding headers by default", () => {
    const request = new Request("https://app.example", {
      headers: { "x-forwarded-for": "203.0.113.8", "x-real-ip": "203.0.113.9" },
    });
    expect(getClientIp(request)).toBe("127.0.0.1");
  });

  it("uses the Vercel-controlled forwarding chain on Vercel", () => {
    vi.stubEnv("VERCEL", "1");
    const request = new Request("https://app.example", {
      headers: { "x-vercel-forwarded-for": "2001:db8::1, 10.0.0.2" },
    });
    expect(getClientIp(request)).toBe("2001:db8::1");
  });

  it("uses x-real-ip only when an isolated trusted proxy is configured", () => {
    vi.stubEnv("TRUST_PROXY_HEADERS", "true");
    const request = new Request("https://app.example", {
      headers: { "x-real-ip": "198.51.100.4", "x-forwarded-for": "203.0.113.8" },
    });
    expect(getClientIp(request)).toBe("198.51.100.4");
  });
});
