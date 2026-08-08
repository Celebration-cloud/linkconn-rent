type RateLimitWindow = {
  timestamps: number[];
};

type RateLimitGlobal = typeof globalThis & {
  __rateLimitInterval?: ReturnType<typeof setInterval>;
};

// Simple in-memory storage for sliding window rate limiting
const store = new Map<string, RateLimitWindow>();

// Cleanup stale entries every 5 minutes to prevent memory leaks
if (typeof globalThis !== "undefined") {
  const rateLimitGlobal = globalThis as RateLimitGlobal;
  if (!rateLimitGlobal.__rateLimitInterval) {
    rateLimitGlobal.__rateLimitInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, window] of store.entries()) {
        const activeTimestamps = window.timestamps.filter(
          (t) => now - t < 15 * 60 * 1000 // 15 minutes window
        );
        if (activeTimestamps.length === 0) {
          store.delete(key);
        } else {
          window.timestamps = activeTimestamps;
        }
      }
    }, 5 * 60 * 1000);
  }
}

/**
 * Checks if the request exceeds the rate limit.
 * @param ip - Client's IP address
 * @param endpoint - Endpoint name
 * @param limit - Maximum requests allowed in the window (default: 5)
 * @param windowMs - Time window in milliseconds (default: 15 minutes)
 * @returns boolean - true if request is allowed, false if rate limited
 */
export function checkRateLimit(
  ip: string,
  endpoint: string,
  limit = 5,
  windowMs = 15 * 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const key = `${ip}:${endpoint}`;
  const now = Date.now();

  let entry = store.get(key);
  if (!entry) {
    entry = { timestamps: [] };
    store.set(key, entry);
  }

  // Remove timestamps outside the sliding window
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= limit) {
    const oldestTimestamp = entry.timestamps[0] || now;
    const resetTime = oldestTimestamp + windowMs;
    return {
      allowed: false,
      remaining: 0,
      resetTime,
    };
  }

  entry.timestamps.push(now);
  return {
    allowed: true,
    remaining: limit - entry.timestamps.length,
    resetTime: now + windowMs,
  };
}

/**
 * Extracts the IP address from Next.js request headers.
 */
export function getClientIp(req: Request): string {
  const trustProxy = process.env.VERCEL === "1" || process.env.TRUST_PROXY_HEADERS === "true";
  if (!trustProxy) return "127.0.0.1";

  const forwarded = process.env.VERCEL === "1"
    ? req.headers.get("x-vercel-forwarded-for") || req.headers.get("x-forwarded-for")
    : req.headers.get("x-real-ip");

  const candidate = forwarded?.split(",")[0]?.trim();
  if (candidate && /^[0-9a-f:.]+$/i.test(candidate)) return candidate;
  return "127.0.0.1";
}
