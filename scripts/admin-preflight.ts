import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import { validateBootstrapDatabaseUrl } from "./admin-bootstrap/utils";

loadEnvConfig(process.cwd());

function requireMatchingNeonProject(databaseUrl: URL) {
  const authValue = process.env.NEON_AUTH_BASE_URL;
  if (!authValue) throw new Error("NEON_AUTH_BASE_URL is required");
  const authUrl = new URL(authValue);
  const databaseEndpoint = databaseUrl.hostname.split(".")[0]?.replace(/-pooler$/, "");
  const authEndpoint = authUrl.hostname.split(".")[0];
  if (!authUrl.hostname.includes(".neonauth.") || databaseEndpoint !== authEndpoint) {
    throw new Error("Neon Auth and DATABASE_URL do not point to the same Neon project endpoint");
  }
}

async function main() {
  const databaseUrl = validateBootstrapDatabaseUrl(process.env.DATABASE_URL);
  requireMatchingNeonProject(databaseUrl);
  const prisma = new PrismaClient();
  try {
    const [identity, profiles, properties, payments, verifications, disputes, audits, superAdmins] = await Promise.all([
      prisma.$queryRaw<Array<{ database: string; version: string }>>`SELECT current_database()::text AS database, version()::text AS version`,
      prisma.profile.count(), prisma.property.count(), prisma.payment.count(),
      prisma.verificationSubmission.count(), prisma.disputeCase.count(), prisma.adminAuditEvent.count(),
      prisma.profile.findMany({ where: { role: "SuperAdmin", accountStatus: "Active" }, select: { id: true, email: true, emailVerified: true } }),
    ]);
    if (!identity[0]?.version.toLowerCase().includes("postgresql")) throw new Error("Configured database did not identify as PostgreSQL");
    if (!superAdmins.some((profile) => profile.emailVerified)) throw new Error("No active, email-verified Super Admin profile mirror exists");
    console.log(`[admin-preflight] connected to pooled Neon endpoint ${databaseUrl.hostname}`);
    console.log(`[admin-preflight] database=${identity[0].database} profiles=${profiles} properties=${properties} payments=${payments} verifications=${verifications} disputes=${disputes} audits=${audits}`);
    console.log(`[admin-preflight] verified ${superAdmins.length} active Super Admin profile mirror${superAdmins.length === 1 ? "" : "s"}; run admin:bootstrap:verify with credentials to prove the Neon Auth session ID match`);
  } finally { await prisma.$disconnect(); }
}

main().catch((error: unknown) => { console.error(`[admin-preflight] ${error instanceof Error ? error.message : "Unknown error"}`); process.exitCode = 1; });
