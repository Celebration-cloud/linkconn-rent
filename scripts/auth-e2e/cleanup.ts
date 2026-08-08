import { loadEnvConfig } from "@next/env";
import { request } from "@playwright/test";
import { authE2EPrisma as prisma } from "../../tests/e2e/auth/support/prisma";
import { deleteExactProfile } from "../../tests/e2e/auth/support/database";
import { requireAuthE2EEnvironment } from "../../tests/e2e/auth/support/environment";
import { deleteInbox } from "../../tests/e2e/auth/support/mailslurp";
import { readManifest, saveManifest } from "../../tests/e2e/auth/support/manifest";

loadEnvConfig(process.cwd());

function getRunId(): string {
  const args = process.argv.slice(2);
  const flagIndex = args.indexOf("--run-id");
  const value = flagIndex >= 0 ? args[flagIndex + 1] : args.find((item) => item.startsWith("--run-id="))?.slice(9);
  if (!value || !/^\d{13}-[0-9a-f]{8}$/.test(value)) throw new Error("Cleanup requires a valid --run-id from the fixture manifest.");
  return value;
}

async function main() {
  const runId = getRunId();
  const env = requireAuthE2EEnvironment();
  const manifest = await readManifest(runId);
  if (manifest.runId !== runId || manifest.prefix !== `linkconn-e2e-${runId}`) throw new Error("Cleanup refused: manifest identity mismatch.");

  for (const fixture of manifest.fixtures) {
    if (fixture.cleanupStatus === "complete") continue;
    try {
      const context = await request.newContext({
        baseURL: env.baseURL,
        extraHTTPHeaders: { origin: env.baseURL, "x-real-ip": `198.51.100.${manifest.fixtures.indexOf(fixture) + 20}` },
      });
      const login = await context.post("/api/auth/custom/login", {
        data: { email: fixture.email, password: env.password, callbackURL: "/" },
      });
      if (login.ok()) {
        const deletion = await context.post("/api/auth/delete-user", { data: { password: env.password } });
        if (!deletion.ok() && deletion.status() !== 404) throw new Error(`Neon Auth delete-user returned ${deletion.status()}.`);
      }
      await context.dispose();

      if (fixture.userId) await deleteExactProfile(fixture.userId, fixture.email);
      await deleteInbox(env.mailSlurpApiKey, fixture.inboxId);
      fixture.cleanupStatus = "complete";
      await saveManifest(manifest);
    } catch (error) {
      fixture.cleanupStatus = "failed";
      await saveManifest(manifest);
      throw error;
    }
  }

  const fixtureIds = manifest.fixtures.flatMap((fixture) => fixture.userId ? [fixture.userId] : []);
  const leftovers = await prisma.profile.count({ where: { id: { in: fixtureIds } } });
  if (leftovers !== 0) throw new Error(`Cleanup verification found ${leftovers} remaining profile fixture(s).`);
  console.log(`[auth-e2e] cleanup complete for run ${runId}`);
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : "Auth E2E cleanup failed.");
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
