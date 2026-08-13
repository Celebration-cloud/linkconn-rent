import "server-only";

import { createHmac } from "node:crypto";
import { prisma } from "@/lib/db/client";
import { requireEnvironmentValue, resolveNeonEnvironment } from "@/lib/env/neon-environment";
import { getClientIp } from "@/lib/security/rate-limiter";

export type DurableRateLimit = { allowed: boolean; remaining: number; resetTime: number };

function secret() {
  const configured = resolveNeonEnvironment().authCookieSecret;
  if (configured) return configured;
  if (process.env.NODE_ENV === "test") return "linkconn-test-admin-rate-limit-secret";
  return requireEnvironmentValue(configured, "NEON_AUTH_COOKIE_SECRET");
}

function hashSubject(request: Request, subject: string) {
  return createHmac("sha256", secret()).update(`${getClientIp(request)}:${subject.trim().toLowerCase()}`).digest("hex");
}

export async function checkAdminRateLimit(
  request: Request,
  scope: string,
  subject: string,
  limit: number,
  windowMs: number,
): Promise<DurableRateLimit> {
  const now = Date.now();
  if (process.env.NODE_ENV === "test" && process.env.TEST_DURABLE_RATE_LIMITER !== "true") {
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs };
  }
  const windowStartMs = Math.floor(now / windowMs) * windowMs;
  const windowStart = new Date(windowStartMs);
  const expiresAt = new Date(windowStartMs + windowMs * 2);
  const keyHash = hashSubject(request, subject);
  const bucket = await prisma.adminRateLimitBucket.upsert({
    where: { scope_keyHash_windowStart: { scope, keyHash, windowStart } },
    create: { scope, keyHash, windowStart, expiresAt, count: 1 },
    update: { count: { increment: 1 }, expiresAt },
    select: { count: true },
  });
  if (bucket.count === 1) await prisma.adminRateLimitBucket.deleteMany({ where: { expiresAt: { lt: new Date(now) } } });
  return {
    allowed: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    resetTime: windowStartMs + windowMs,
  };
}

export function adminRateLimitResponse(message: string, resetTime: number) {
  return Response.json(
    { success: false, data: null, message },
    { status: 429, headers: { "Retry-After": String(Math.max(1, Math.ceil((resetTime - Date.now()) / 1000))) } },
  );
}
