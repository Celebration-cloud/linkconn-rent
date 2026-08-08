import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { AuthFixtureManifest, AuthFixtureRecord } from "./types";

export const AUTH_RESULTS_DIRECTORY = path.join(process.cwd(), "test-results", "auth-fixtures");

export function manifestPath(runId: string): string {
  return path.join(AUTH_RESULTS_DIRECTORY, `${runId}.json`);
}

export async function createManifest(runId: string): Promise<AuthFixtureManifest> {
  const manifest: AuthFixtureManifest = {
    schemaVersion: 1,
    runId,
    prefix: `linkconn-e2e-${runId}`,
    createdAt: new Date().toISOString(),
    fixtures: [],
  };
  await saveManifest(manifest);
  return manifest;
}

export async function saveManifest(manifest: AuthFixtureManifest): Promise<void> {
  await mkdir(AUTH_RESULTS_DIRECTORY, { recursive: true });
  await writeFile(manifestPath(manifest.runId), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

export async function readManifest(runId: string): Promise<AuthFixtureManifest> {
  return JSON.parse(await readFile(manifestPath(runId), "utf8")) as AuthFixtureManifest;
}

export async function recordFixture(runId: string, fixture: AuthFixtureRecord): Promise<void> {
  const manifest = await readManifest(runId);
  const index = manifest.fixtures.findIndex((item) => item.role === fixture.role);
  if (index >= 0) manifest.fixtures[index] = fixture;
  else manifest.fixtures.push(fixture);
  await saveManifest(manifest);
}
