import { loadEnvConfig } from "@next/env";
import { PrismaPg } from "@prisma/adapter-pg";
import type { PrismaConfig } from "prisma";

loadEnvConfig(process.cwd());

function requireMigrationUrl() {
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DIRECT_URL or DATABASE_URL is required for Prisma commands");
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
