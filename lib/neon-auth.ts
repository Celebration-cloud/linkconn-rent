import { createNeonAuth } from "@neondatabase/auth/next/server";

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const auth = createNeonAuth({
  baseUrl: requiredEnv("NEON_AUTH_BASE_URL"),
  cookies: {
    secret: requiredEnv("NEON_AUTH_COOKIE_SECRET"),
    sessionDataTtl: 300,
  },
  logLevel: "silent",
});
import "server-only";

