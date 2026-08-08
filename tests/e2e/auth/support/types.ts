export const AUTH_ROLES = [
  "Tenant",
  "Landlord",
  "PropertyManager",
  "Moderator",
  "Admin",
  "SuperAdmin",
] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export type AuthFixtureRecord = {
  runId: string;
  role: AuthRole;
  email: string;
  userId: string | null;
  inboxId: string;
  storageStatePath: string | null;
  cleanupStatus: "pending" | "complete" | "failed";
};

export type AuthFixtureManifest = {
  schemaVersion: 1;
  runId: string;
  prefix: string;
  createdAt: string;
  fixtures: AuthFixtureRecord[];
};
