import { loadEnvConfig } from "@next/env";
import { authE2EPrisma } from "./prisma";

loadEnvConfig(process.cwd());

export type AuthE2EEnvironment = {
  baseURL: string;
  password: string;
  mailSlurpApiKey: string;
};

export function requireAuthE2EEnvironment(): AuthE2EEnvironment {
  if (process.env.E2E_ALLOW_PRIMARY_MUTATIONS !== "true") {
    throw new Error("Auth E2E refused: set E2E_ALLOW_PRIMARY_MUTATIONS=true to authorize disposable primary-Neon fixtures.");
  }

  const password = process.env.E2E_AUTH_TEST_PASSWORD || "";
  if (password.length < 16 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password) || !/[^\w]/.test(password)) {
    throw new Error("Auth E2E refused: E2E_AUTH_TEST_PASSWORD must be at least 16 characters with upper, lower, number, and symbol.");
  }

  const mailSlurpApiKey = process.env.MAILSLURP_API_KEY || "";
  if (!mailSlurpApiKey) throw new Error("Auth E2E refused: MAILSLURP_API_KEY is required.");

  const baseURL = process.env.E2E_AUTH_BASE_URL || "http://127.0.0.1:3100";
  const databaseURL = process.env.DATABASE_URL || "";
  const authURL = process.env.NEON_AUTH_BASE_URL || "";
  let database: URL;
  let auth: URL;
  try {
    database = new URL(databaseURL);
    auth = new URL(authURL);
    new URL(baseURL);
  } catch {
    throw new Error("Auth E2E refused: database, Neon Auth, and E2E base URLs must be valid.");
  }

  if (database.protocol !== "postgresql:" || !database.hostname.endsWith(".neon.tech") || !database.hostname.includes("-pooler")) {
    throw new Error("Auth E2E refused: DATABASE_URL must target a pooled Neon PostgreSQL endpoint.");
  }
  if (auth.protocol !== "https:" || (!auth.hostname.includes("neonauth") && !auth.hostname.endsWith(".neon.tech"))) {
    throw new Error("Auth E2E refused: NEON_AUTH_BASE_URL is not a recognized HTTPS Neon Auth endpoint.");
  }

  return { baseURL, password, mailSlurpApiKey };
}

export async function verifyNeonDatabasePreflight(): Promise<void> {
  const rows = await authE2EPrisma.$queryRaw<Array<{ databaseName: string; authSchema: boolean }>>`
    SELECT
      current_database() AS "databaseName",
      EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'neon_auth') AS "authSchema"
  `;
  if (!rows[0]?.authSchema) {
    throw new Error("Auth E2E refused: the configured Neon database does not contain the Neon Auth schema.");
  }
}
