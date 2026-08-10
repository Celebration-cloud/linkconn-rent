import "server-only";

import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import { resolveNeonEnvironment } from "@/lib/env/neon-environment";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function resolveDatabaseUrl(rawUrl: string | undefined): string | undefined {
  if (!rawUrl) return undefined;

  const expandedUrl = rawUrl.replace(
    /\$\{([A-Z0-9_]+)\}/g,
    (_match: string, envName: string) => process.env[envName] ?? _match
  );

  try {
    const url = new URL(expandedUrl);

    if (/^[A-Z0-9_]+$/.test(url.hostname)) {
      const resolvedHost = process.env[url.hostname];
      if (resolvedHost) {
        url.hostname = resolvedHost;
      }
    }

    return url.toString();
  } catch {
    return expandedUrl;
  }
}

const databaseUrl = resolveDatabaseUrl(resolveNeonEnvironment().databaseUrl);

function createPrismaClient(): PrismaClient {
  const log = process.env.NODE_ENV === "development" ? (["query"] as const) : [];

  if (!databaseUrl) {
    return new PrismaClient({ log: [...log] });
  }

  // Use Neon's HTTP/WebSocket transport instead of Prisma's native TCP engine.
  // This keeps the pooled Neon connection while avoiding platform-specific TLS
  // failures in local Windows development.
  const adapter = new PrismaNeon({ connectionString: databaseUrl });
  return new PrismaClient({ adapter, log: [...log] });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
