import "server-only";

import { prisma } from "@/lib/db/client";
import { getDocumentStorage } from "@/services/storage/document-storage";

const CLEANUP_BATCH_SIZE = 50;

export async function deleteExpiredVerificationDocuments(now = new Date()) {
  const storage = getDocumentStorage();
  if (!storage.configured) throw new Error("STORAGE_NOT_CONFIGURED");
  const documents = await prisma.verificationDocument.findMany({
    where: {
      storageKey: { not: null },
      deletedAt: null,
      deleteAfter: { lte: now },
    },
    select: { id: true, storageKey: true },
    orderBy: { deleteAfter: "asc" },
    take: CLEANUP_BATCH_SIZE,
  });

  let deleted = 0;
  let failed = 0;
  for (const document of documents) {
    if (!document.storageKey) continue;
    try {
      await storage.remove(document.storageKey);
      const result = await prisma.verificationDocument.updateMany({
        where: { id: document.id, storageKey: document.storageKey, deletedAt: null },
        data: {
          storageKey: null,
          fileName: null,
          uploadIntentId: null,
          deletedAt: now,
          deletionError: null,
        },
      });
      deleted += result.count;
    } catch (error) {
      failed += 1;
      await prisma.verificationDocument.updateMany({
        where: { id: document.id, deletedAt: null },
        data: {
          deletionError: error instanceof Error
            ? error.message.slice(0, 500)
            : "Unknown storage deletion error",
        },
      });
    }
  }
  return { checked: documents.length, deleted, failed };
}
