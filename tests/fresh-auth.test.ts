import { describe, expect, it } from "vitest";
import { isFreshAuthentication } from "@/lib/auth/session-recency";

describe("fresh authentication", () => {
  it("accepts a session created inside the configured age", () => {
    expect(isFreshAuthentication(
      { createdAt: new Date("2026-08-13T10:00:00.000Z") },
      new Date("2026-08-13T10:14:59.000Z"),
    )).toBe(true);
  });

  it("fails closed for old, future, or missing session timestamps", () => {
    const now = new Date("2026-08-13T10:15:01.000Z");
    expect(isFreshAuthentication({ createdAt: new Date("2026-08-13T10:00:00.000Z") }, now)).toBe(false);
    expect(isFreshAuthentication({ createdAt: new Date("2026-08-13T10:16:00.000Z") }, now)).toBe(false);
    expect(isFreshAuthentication(null, now)).toBe(false);
  });
});
