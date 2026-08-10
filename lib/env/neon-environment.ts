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
    // Prefer the currently connected Vercel Neon resource. Canonical names
    // remain supported for local development and manual deployments.
    databaseUrl: firstDefined(environment, [
      `${INTEGRATION_PREFIX}DATABASE_URL`,
      "DATABASE_URL",
    ]),
    directUrl: firstDefined(environment, [
      `${INTEGRATION_PREFIX}POSTGRES_URL_NON_POOLING`,
      "DIRECT_URL",
    ]),
    authBaseUrl: firstDefined(environment, [
      `${INTEGRATION_PREFIX}NEON_AUTH_BASE_URL`,
      "NEON_AUTH_BASE_URL",
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
