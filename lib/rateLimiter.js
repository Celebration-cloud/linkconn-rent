import { NextResponse } from "next/server";

const stores = new Map();

function pruneStores() {
  const now = Date.now();

  for (const [key, entry] of stores.entries()) {
    if (now > entry.resetAt) {
      stores.delete(key);
    }
  }
}

export function withRateLimit(handler, options = {}) {
  const {
    max = 10,
    windowMs = 60000,
    message = "Rate limit exceeded. Try again later.",
    keyGenerator = (req) => {
      const headers = req.headers;
      const forwardedFor = headers.get("x-forwarded-for");
      const realIp = headers.get("x-real-ip");
      const ip = forwardedFor
        ? forwardedFor.split(",")[0].trim()
        : realIp || "global";

      return ip;
    },
  } = options;

  return async function (req) {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = Math.floor(now / windowMs) * windowMs;

    if (!stores.has(key)) {
      stores.set(key, {
        windowStart,
        count: 0,
        resetAt: windowStart + windowMs,
      });
    }

    const entry = stores.get(key);

    if (entry.windowStart !== windowStart) {
      entry.windowStart = windowStart;
      entry.count = 0;
      entry.resetAt = windowStart + windowMs;
    }

    if (entry.count >= max) {
      const retryAfter = Math.ceil((entry.resetAt - now) / 1000);

      return NextResponse.json(
        {
          success: false,
          error: message,
          retryAfter,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(max),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(entry.resetAt),
          },
        },
      );
    }

    entry.count += 1;
    pruneStores();

    const response = await handler(req);

    return response;
  };
}

setInterval(pruneStores, 2 * 60000);

export default { withRateLimit };
