import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import type { PrismaConfig } from "prisma";
import { resolveNeonEnvironment } from "./lib/env/neon-environment";

loadEnvConfig(process.cwd());

function requireMigrationUrl() {
  const environment = resolveNeonEnvironment();
  const connectionString = environment.directUrl ?? environment.databaseUrl;
  if (!connectionString) {
    throw new Error(
      "A Neon direct or pooled database URL is required for Prisma commands",
    );
  }
  return connectionString;
}

export default {
  experimental: {
    adapter: true,
  },
  engine: "js",
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  adapter: async () =>
    new PrismaPg({
      connectionString: requireMigrationUrl(),
    }),
} satisfies PrismaConfig;
