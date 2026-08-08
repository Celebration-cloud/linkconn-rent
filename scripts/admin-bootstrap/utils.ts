import { randomBytes } from "node:crypto";

export function generateBootstrapPassword() {
  return randomBytes(32).toString("base64url");
}

export function validateBootstrapDatabaseUrl(value: string | undefined) {
  if (!value) throw new Error("DATABASE_URL is required");
  const url = new URL(value);
  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("Bootstrap refused: DATABASE_URL is not PostgreSQL");
  }
  if (!url.hostname.endsWith(".neon.tech") || !url.hostname.includes("-pooler")) {
    throw new Error("Bootstrap refused: DATABASE_URL must use the configured Neon pooled endpoint");
  }
  return url;
}
