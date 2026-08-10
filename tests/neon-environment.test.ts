import { describe, expect, it } from "vitest";
import {
  requireEnvironmentValue,
  resolveNeonEnvironment,
} from "@/lib/env/neon-environment";

describe("Neon environment resolution", () => {
  it("prefers canonical variables over a different connected integration", () => {
    const environment = resolveNeonEnvironment({
      DATABASE_URL: "postgresql://canonical-database",
      NEON_AUTH_BASE_URL: "https://canonical-auth.example",
      linkcon_rent_DATABASE_URL: "postgresql://connected-database",
      linkcon_rent_POSTGRES_URL_NON_POOLING: "postgresql://connected-direct",
      linkcon_rent_NEON_AUTH_BASE_URL: "https://connected-auth.example",
      NEON_AUTH_COOKIE_SECRET: "secret",
    });

    expect(environment).toEqual({
      databaseUrl: "postgresql://canonical-database",
      directUrl: "postgresql://connected-direct",
      authBaseUrl: "https://canonical-auth.example",
      authCookieSecret: "secret",
    });
  });

  it("uses integration-prefixed variables when canonical values are absent", () => {
    expect(
      resolveNeonEnvironment({
        linkcon_rent_DATABASE_URL: "postgresql://connected-database",
        linkcon_rent_POSTGRES_URL_NON_POOLING: "postgresql://connected-direct",
        linkcon_rent_NEON_AUTH_BASE_URL: "https://connected-auth.example",
      }),
    ).toMatchObject({
      databaseUrl: "postgresql://connected-database",
      directUrl: "postgresql://connected-direct",
      authBaseUrl: "https://connected-auth.example",
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
