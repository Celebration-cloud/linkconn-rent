import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("⚠️ DATABASE_URL is not set. Database queries might fail.");
}

// Single database client instance executing secure prepared statements
export const sql = neon(databaseUrl || "");
