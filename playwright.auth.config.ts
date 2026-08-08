import { loadEnvConfig } from "@next/env";
import { defineConfig, devices } from "@playwright/test";

loadEnvConfig(process.cwd());

const baseURL = process.env.E2E_AUTH_BASE_URL || "http://127.0.0.1:3100";

export default defineConfig({
  testDir: "./tests/e2e/auth",
  outputDir: "./test-results/auth-artifacts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [["list"], ["html", { outputFolder: "playwright-report/auth", open: "never" }]],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "npx next start -p 3100",
    url: baseURL,
    reuseExistingServer: false,
    timeout: 180_000,
    env: {
      ...process.env,
      NEXT_PUBLIC_SITE_URL: baseURL,
      TRUST_PROXY_HEADERS: "true",
    },
  },
  projects: [
    { name: "auth-desktop", use: { ...devices["Desktop Chrome"] }, grepInvert: /@mobile/ },
    { name: "auth-mobile", use: { ...devices["Pixel 7"] }, grep: /@mobile/ },
  ],
});
