import { createNeonAuth } from "@neondatabase/auth/next/server";
import {
  requireEnvironmentValue,
  resolveNeonEnvironment,
} from "@/lib/env/neon-environment";

const neonEnvironment = resolveNeonEnvironment();

export const auth = createNeonAuth({
  baseUrl: requireEnvironmentValue(
    neonEnvironment.authBaseUrl,
    "linkcon_rent_NEON_AUTH_BASE_URL or NEON_AUTH_BASE_URL",
  ),
  cookies: {
    secret: requireEnvironmentValue(
      neonEnvironment.authCookieSecret,
      "NEON_AUTH_COOKIE_SECRET",
    ),
    sessionDataTtl: 300,
  },
  logLevel: "silent",
});
import "server-only";
