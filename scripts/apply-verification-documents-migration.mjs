import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import nextEnv from "@next/env";
import pg from "pg";

const MIGRATION_NAME = "202608080001_private_verification_documents";
const EXPECTED_COLUMNS = [
  "kind",
  "uploadIntentId",
  "deleteAfter",
  "deletedAt",
  "deletionError",
  "updatedAt",
];

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

function getConnectionString() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL or DATABASE_URL is required.");
  }

  const url = new URL(connectionString);
  if (url.protocol !== "postgresql:" && url.protocol !== "postgres:") {
    throw new Error("The migration target must be PostgreSQL.");
  }
  if (!url.hostname.endsWith(".neon.tech")) {
    throw new Error("The migration target must be a Neon PostgreSQL endpoint.");
  }
  return connectionString;
}

const migrationPath = resolve(
  process.cwd(),
  "prisma",
  "migrations",
  MIGRATION_NAME,
  "migration.sql",
);
const migrationSql = await readFile(migrationPath, "utf8");
const checksum = createHash("sha256").update(migrationSql).digest("hex");
const client = new pg.Client({ connectionString: getConnectionString() });

try {
  await client.connect();
  await client.query("BEGIN");
  await client.query(
    "SELECT pg_advisory_xact_lock(hashtext('linkconn-rent:prisma-migration'))",
  );

  const history = await client.query(
    `SELECT "finished_at", "rolled_back_at", "checksum"
       FROM "_prisma_migrations"
      WHERE "migration_name" = $1`,
    [MIGRATION_NAME],
  );

  if (history.rowCount === 1) {
    const existing = history.rows[0];
    if (existing.finished_at && !existing.rolled_back_at && existing.checksum === checksum) {
      await client.query("ROLLBACK");
      console.log("Verification-document migration is already applied and consistent.");
      process.exitCode = 0;
    } else {
      throw new Error("An incomplete or inconsistent migration-history record already exists.");
    }
  } else if ((history.rowCount ?? 0) > 1) {
    throw new Error("Duplicate migration-history records were found.");
  } else {
    const columns = await client.query(
      `SELECT column_name
         FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'verification_documents'
          AND column_name = ANY($1::text[])`,
      [EXPECTED_COLUMNS],
    );
    const enumType = await client.query(
      "SELECT 1 FROM pg_type WHERE typname = 'VerificationDocumentKind'",
    );
    if ((columns.rowCount ?? 0) > 0 || (enumType.rowCount ?? 0) > 0) {
      throw new Error("The database contains a partial verification-document migration; no changes were made.");
    }

    const id = randomUUID();
    await client.query(
      `INSERT INTO "_prisma_migrations"
        ("id", "checksum", "started_at", "migration_name", "logs", "rolled_back_at", "finished_at", "applied_steps_count")
       VALUES ($1, $2, NOW(), $3, NULL, NULL, NULL, 0)`,
      [id, checksum, MIGRATION_NAME],
    );
    await client.query(migrationSql);
    await client.query(
      `UPDATE "_prisma_migrations"
          SET "finished_at" = NOW(), "applied_steps_count" = 1
        WHERE "id" = $1`,
      [id],
    );
    await client.query("COMMIT");
    console.log("Applied the verification-document migration transactionally.");
  }
} catch (error) {
  await client.query("ROLLBACK").catch(() => undefined);
  throw error;
} finally {
  await client.end();
}
