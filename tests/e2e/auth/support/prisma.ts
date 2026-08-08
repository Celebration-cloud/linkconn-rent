import { PrismaClient } from "@prisma/client";

// Test-process client. Application modules continue to use lib/db/client.ts;
// Playwright runs outside Next.js and therefore cannot import `server-only`.
export const authE2EPrisma = new PrismaClient();
