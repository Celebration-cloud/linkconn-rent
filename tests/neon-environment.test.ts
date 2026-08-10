import { describe, expect, it } from "vitest";
import {
  requireEnvironmentValue,
  resolveNeonEnvironment,
} from "@/lib/env/neon-environment";

describe("Neon environment resolution", () => {
  it("prefers the connected LinkConn Vercel integration variables", () => {
    const environment = resolveNeonEnvironment({
      DATABASE_URL: "postgresql://stale-database",
      NEON_AUTH_BASE_URL: "https://stale-auth.example",
      linkcon_rent_DATABASE_URL: "postgresql://connected-database",
      linkcon_rent_POSTGRES_URL_NON_POOLING: "postgresql://connected-direct",
      linkcon_rent_NEON_AUTH_BASE_URL: "https://connected-auth.example",
      NEON_AUTH_COOKIE_SECRET: "secret",
    });

    expect(environment).toEqual({
      databaseUrl: "postgresql://connected-database",
      directUrl: "postgresql://connected-direct",
      authBaseUrl: "https://connected-auth.example",
      authCookieSecret: "secret",
    });
  });

  it("keeps canonical variables as the local and manual-deployment fallback", () => {
    expect(
      resolveNeonEnvironment({
        DATABASE_URL: "postgresql://local-database",
        DIRECT_URL: "postgresql://local-direct",
        NEON_AUTH_BASE_URL: "https://local-auth.example",
        NEON_AUTH_COOKIE_SECRET: "local-secret",
      }),
    ).toEqual({
      databaseUrl: "postgresql://local-database",
      directUrl: "postgresql://local-direct",
      authBaseUrl: "https://local-auth.example",
      authCookieSecret: "local-secret",
    });
  });

  it("fails clearly when a required value is absent", () => {
    expect(() =>
      requireEnvironmentValue(undefined, "NEON_AUTH_COOKIE_SECRET"),
    ).toThrow("Missing required environment variable: NEON_AUTH_COOKIE_SECRET");
  });
});
