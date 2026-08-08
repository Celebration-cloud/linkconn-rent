import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

loadEnvConfig(process.cwd());

function run(command, args, env) {
  const result = spawnSync(command, args, { stdio: "inherit", shell: process.platform === "win32", env });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

function validateEnvironment() {
  const missing = ["MAILSLURP_API_KEY", "E2E_AUTH_TEST_PASSWORD"].filter((name) => !process.env[name]);
  if (process.env.E2E_ALLOW_PRIMARY_MUTATIONS !== "true") missing.push("E2E_ALLOW_PRIMARY_MUTATIONS=true");
  if (missing.length) {
    throw new Error(`Auth E2E preflight refused. Missing: ${missing.join(", ")}`);
  }
}

try {
  validateEnvironment();
  const runId = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const baseURL = process.env.E2E_AUTH_BASE_URL || "http://127.0.0.1:3100";
  const env = {
    ...process.env,
    AUTH_E2E_RUN_ID: runId,
    E2E_AUTH_BASE_URL: baseURL,
    NEXT_PUBLIC_SITE_URL: baseURL,
    TRUST_PROXY_HEADERS: "true",
  };

  console.log(`[auth-e2e] run ${runId}: building production application`);
  const buildStatus = run("npm", ["run", "build"], env);
  if (buildStatus !== 0) process.exit(buildStatus);

  console.log(`[auth-e2e] run ${runId}: starting Playwright role and security matrix`);
  const testStatus = run("npx", ["playwright", "test", "--config=playwright.auth.config.ts"], env);
  if (testStatus === 0 || process.env.E2E_KEEP_FAILED_FIXTURES === "false") {
    const cleanupStatus = run("npx", ["ts-node", "--project", "tsconfig.scripts.json", "scripts/auth-e2e/cleanup.ts", "--run-id", runId], env);
    if (cleanupStatus !== 0) process.exit(cleanupStatus);
  } else {
    console.error(`[auth-e2e] fixtures retained for diagnosis. Cleanup: npm run test:e2e:auth:cleanup -- --run-id ${runId}`);
  }
  process.exit(testStatus);
} catch (error) {
  console.error(error instanceof Error ? error.message : "Auth E2E runner failed.");
  process.exit(1);
}
