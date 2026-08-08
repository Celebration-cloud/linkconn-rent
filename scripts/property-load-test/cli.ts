import {
  generatePropertyLoadTestDataset,
  LOAD_TEST_OWNER_EMAILS,
  PROPERTY_LOAD_TEST_VERSION,
} from "./dataset";
import { loadProjectEnvironment } from "./environment";
import {
  cleanupLoadTestDataset,
  createLoadTestContext,
  getCleanupImpact,
  inspectExistingDataset,
  resolveLoadTestOwners,
  seedLoadTestDataset,
  verifyLoadTestDataset,
} from "./database";
import { benchmarkPropertyApi } from "./benchmark";

type Command = "dry-run" | "seed" | "verify" | "cleanup" | "benchmark";

function getArgument(name: string) {
  const prefix = `--${name}=`;
  return process.argv.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

async function runDatabaseCommand(command: Exclude<Command, "benchmark">) {
  loadProjectEnvironment();
  const context = await createLoadTestContext();
  try {
    const owners = await resolveLoadTestOwners(context.prisma);
    const existing = await inspectExistingDataset(context.prisma);
    const safeConnection = {
      databaseHost: context.databaseHost,
      database: context.identity.database,
      engine: "PostgreSQL",
      neonAuthConfigured: true,
    };

    if (command === "dry-run") {
      const dataset = generatePropertyLoadTestDataset(owners);
      console.log(
        JSON.stringify(
          {
            command,
            version: PROPERTY_LOAD_TEST_VERSION,
            connection: safeConnection,
            existingRecords: existing.length,
            generatedRecords: dataset.length,
            owners: LOAD_TEST_OWNER_EMAILS,
            ownerDistribution: Object.fromEntries(
              LOAD_TEST_OWNER_EMAILS.map((email) => [
                email,
                dataset.filter((property) => property.ownerId === owners.find((owner) => owner.email === email)?.id).length,
              ]),
            ),
            willWrite: false,
          },
          null,
          2,
        ),
      );
      return;
    }

    if (command === "verify") {
      const verification = await verifyLoadTestDataset(context.prisma);
      console.log(JSON.stringify({ command, connection: safeConnection, ...verification }, null, 2));
      if (!verification.valid) process.exitCode = 1;
      return;
    }

    if (command === "seed") {
      const result = await seedLoadTestDataset(context.prisma, owners);
      console.log(JSON.stringify({ command, connection: safeConnection, ...result }, null, 2));
      return;
    }

    const impact = await getCleanupImpact(context.prisma);
    if (!process.argv.includes("--confirm")) {
      console.log(JSON.stringify({ command, connection: safeConnection, impact, deleted: 0, confirmationRequired: true }, null, 2));
      throw new Error("Cleanup requires the explicit --confirm flag");
    }
    const result = await cleanupLoadTestDataset(context.prisma);
    console.log(JSON.stringify({ command, connection: safeConnection, impact, deleted: result.count }, null, 2));
  } finally {
    await context.prisma.$disconnect();
  }
}

async function main() {
  const command = process.argv[2] as Command | undefined;
  if (!command || !["dry-run", "seed", "verify", "cleanup", "benchmark"].includes(command)) {
    throw new Error("Use one of: dry-run, seed, verify, cleanup, benchmark");
  }
  if (command === "benchmark") {
    const baseUrl = getArgument("base-url") ?? "http://127.0.0.1:3000";
    await benchmarkPropertyApi(baseUrl);
    return;
  }
  await runDatabaseCommand(command);
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown load-test failure";
  console.error(`[property-load-test] ${message}`);
  process.exitCode = 1;
});
