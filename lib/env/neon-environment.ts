type Environment = Record<string, string | undefined>;

const INTEGRATION_PREFIX = "linkcon_rent_";

function firstDefined(environment: Environment, names: string[]) {
  for (const name of names) {
    const value = environment[name]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function resolveNeonEnvironment(
  environment: Environment = process.env,
) {
  return {
    // Canonical application variables are authoritative. Integration-prefixed
    // values are fallback-only because a newly connected Vercel resource may
    // point at a different Neon project with a different Auth user store.
    databaseUrl: firstDefined(environment, [
      "DATABASE_URL",
      `${INTEGRATION_PREFIX}DATABASE_URL`,
    ]),
    directUrl: firstDefined(environment, [
      "DIRECT_URL",
      `${INTEGRATION_PREFIX}POSTGRES_URL_NON_POOLING`,
    ]),
    authBaseUrl: firstDefined(environment, [
      "NEON_AUTH_BASE_URL",
      `${INTEGRATION_PREFIX}NEON_AUTH_BASE_URL`,
    ]),
    authCookieSecret: firstDefined(environment, ["NEON_AUTH_COOKIE_SECRET"]),
  };
}

export function requireEnvironmentValue(
  value: string | undefined,
  name: string,
) {
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}
