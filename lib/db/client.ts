import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

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

const databaseUrl = resolveDatabaseUrl(process.env.DATABASE_URL);

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    ...(databaseUrl
      ? {
          datasources: {
            db: {
              url: databaseUrl,
            },
          },
        }
      : {}),
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
import "server-only";
