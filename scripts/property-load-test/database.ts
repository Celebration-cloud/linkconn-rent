import { PrismaClient } from "@prisma/client";
import {
  generatePropertyLoadTestDataset,
  getPropertyLoadTestIds,
  LOAD_TEST_OWNER_EMAILS,
  PROPERTY_LOAD_TEST_SIZE,
  PROPERTY_LOAD_TEST_VERSION,
  type LoadTestOwner,
} from "./dataset";

type DatabaseIdentity = {
  database: string;
  version: string;
};

type ColumnIdentity = {
  columnName: string;
};

const REQUIRED_PROPERTY_COLUMNS = [
  "publicLatitude",
  "publicLongitude",
  "coordinateVerified",
] as const;

function getDatabaseUrl() {
  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) throw new Error("DATABASE_URL is not configured");
  const url = new URL(rawUrl);
  if (!url.hostname.endsWith(".neon.tech") || !url.hostname.includes("-pooler.")) {
    throw new Error("Refusing to run: DATABASE_URL is not a pooled Neon endpoint");
  }
  return url;
}

function verifyNeonAuthConfiguration(databaseUrl: URL) {
  const authBaseUrl = process.env.NEON_AUTH_BASE_URL;
  const cookieSecret = process.env.NEON_AUTH_COOKIE_SECRET;
  if (!authBaseUrl || !cookieSecret) {
    throw new Error("Neon Auth server configuration is incomplete");
  }
  const authUrl = new URL(authBaseUrl);
  const databaseEndpoint = databaseUrl.hostname.split(".")[0]?.replace(/-pooler$/, "");
  const authEndpoint = authUrl.hostname.split(".")[0];
  if (!authUrl.hostname.includes(".neonauth.") || databaseEndpoint !== authEndpoint) {
    throw new Error("Neon Auth and DATABASE_URL do not point to the same Neon project endpoint");
  }
}

export async function createLoadTestContext() {
  const databaseUrl = getDatabaseUrl();
  verifyNeonAuthConfiguration(databaseUrl);
  const prisma = new PrismaClient();
  try {
    await prisma.$connect();
    const rows = await prisma.$queryRaw<DatabaseIdentity[]>`
      SELECT current_database() AS database, version() AS version
    `;
    const identity = rows[0];
    if (!identity?.version.toLowerCase().includes("postgresql")) {
      throw new Error("The configured database did not identify itself as PostgreSQL");
    }
    const columns = await prisma.$queryRaw<ColumnIdentity[]>`
      SELECT column_name AS "columnName"
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'properties'
        AND column_name IN ('publicLatitude', 'publicLongitude', 'coordinateVerified')
    `;
    const availableColumns = new Set(columns.map((column) => column.columnName));
    const missingColumns = REQUIRED_PROPERTY_COLUMNS.filter(
      (column) => !availableColumns.has(column),
    );
    if (missingColumns.length) {
      throw new Error(
        `Database schema is missing required Property columns: ${missingColumns.join(", ")}. Apply the checked-in Prisma migrations before seeding.`,
      );
    }
    return { prisma, identity, databaseHost: databaseUrl.hostname };
  } catch (error) {
    await prisma.$disconnect();
    throw error;
  }
}

export async function resolveLoadTestOwners(prisma: PrismaClient) {
  const profiles = await prisma.profile.findMany({
    where: { email: { in: [...LOAD_TEST_OWNER_EMAILS] } },
    select: { id: true, email: true, role: true },
  });
  const byEmail = new Map(profiles.map((profile) => [profile.email, profile]));
  return LOAD_TEST_OWNER_EMAILS.map((email) => {
    const profile = byEmail.get(email);
    if (!profile) throw new Error(`Required landlord profile is missing: ${email}`);
    if (profile.role !== "Landlord") {
      throw new Error(`Required owner is not a Landlord profile: ${email}`);
    }
    return { id: profile.id, email } satisfies LoadTestOwner;
  });
}

export async function inspectExistingDataset(prisma: PrismaClient) {
  const ids = getPropertyLoadTestIds();
  return prisma.property.findMany({
    where: { id: { in: ids } },
    select: { id: true, title: true, ownerId: true, status: true, moderationStatus: true },
    orderBy: { id: "asc" },
  });
}

export async function verifyLoadTestDataset(prisma: PrismaClient) {
  const ids = getPropertyLoadTestIds();
  const properties = await prisma.property.findMany({
    where: { id: { in: ids } },
    select: {
      id: true,
      title: true,
      type: true,
      city: true,
      period: true,
      verified: true,
      status: true,
      moderationStatus: true,
      owner: { select: { email: true } },
    },
  });
  const ownerCounts = Object.fromEntries(
    LOAD_TEST_OWNER_EMAILS.map((email) => [
      email,
      properties.filter((property) => property.owner.email === email).length,
    ]),
  );
  const summary = {
    version: PROPERTY_LOAD_TEST_VERSION,
    expected: PROPERTY_LOAD_TEST_SIZE,
    actual: properties.length,
    uniqueIds: new Set(properties.map((property) => property.id)).size,
    uniqueTitles: new Set(properties.map((property) => property.title)).size,
    visible: properties.filter(
      (property) =>
        property.status === "Available" && property.moderationStatus === "Approved",
    ).length,
    cities: new Set(properties.map((property) => property.city)).size,
    types: new Set(properties.map((property) => property.type)).size,
    periods: new Set(properties.map((property) => property.period)).size,
    verifiedStates: new Set(properties.map((property) => property.verified)).size,
    ownerCounts,
  };
  const valid =
    summary.actual === PROPERTY_LOAD_TEST_SIZE &&
    summary.uniqueIds === PROPERTY_LOAD_TEST_SIZE &&
    summary.uniqueTitles === PROPERTY_LOAD_TEST_SIZE &&
    summary.visible === PROPERTY_LOAD_TEST_SIZE &&
    Object.values(ownerCounts).every((count) => count === 83 || count === 84);
  return { valid, summary };
}

export async function seedLoadTestDataset(prisma: PrismaClient, owners: LoadTestOwner[]) {
  const existing = await inspectExistingDataset(prisma);
  if (existing.length === PROPERTY_LOAD_TEST_SIZE) {
    const verification = await verifyLoadTestDataset(prisma);
    if (!verification.valid) throw new Error("Existing load-test dataset is inconsistent");
    return { inserted: 0, idempotent: true, verification };
  }
  if (existing.length !== 0) {
    throw new Error(
      `Partial load-test dataset detected (${existing.length}/${PROPERTY_LOAD_TEST_SIZE}); clean it up before retrying`,
    );
  }
  const result = await prisma.property.createMany({
    data: generatePropertyLoadTestDataset(owners),
  });
  if (result.count !== PROPERTY_LOAD_TEST_SIZE) {
    throw new Error(`Expected to insert ${PROPERTY_LOAD_TEST_SIZE} properties, inserted ${result.count}`);
  }
  const verification = await verifyLoadTestDataset(prisma);
  if (!verification.valid) throw new Error("Inserted dataset failed post-write verification");
  return { inserted: result.count, idempotent: false, verification };
}

export async function getCleanupImpact(prisma: PrismaClient) {
  const propertyIds = getPropertyLoadTestIds();
  const [properties, applications, payments, maintenance, saves, viewings, conversations, verifications, disputes] =
    await Promise.all([
      prisma.property.count({ where: { id: { in: propertyIds } } }),
      prisma.application.count({ where: { propertyId: { in: propertyIds } } }),
      prisma.payment.count({ where: { propertyId: { in: propertyIds } } }),
      prisma.maintenanceRequest.count({ where: { propertyId: { in: propertyIds } } }),
      prisma.savedProperty.count({ where: { propertyId: { in: propertyIds } } }),
      prisma.viewing.count({ where: { propertyId: { in: propertyIds } } }),
      prisma.conversation.count({ where: { propertyId: { in: propertyIds } } }),
      prisma.verificationSubmission.count({ where: { propertyId: { in: propertyIds } } }),
      prisma.disputeCase.count({ where: { propertyId: { in: propertyIds } } }),
    ]);
  return { properties, applications, payments, maintenance, saves, viewings, conversations, verifications, disputes };
}

export async function cleanupLoadTestDataset(prisma: PrismaClient) {
  return prisma.property.deleteMany({ where: { id: { in: getPropertyLoadTestIds() } } });
}
