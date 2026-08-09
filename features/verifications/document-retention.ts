export const DOCUMENT_RETENTION_DAYS = 60;

export function getDocumentDeletionDeadline(reviewedAt: Date) {
  return new Date(reviewedAt.getTime() + DOCUMENT_RETENTION_DAYS * 24 * 60 * 60 * 1000);
}

export function isDocumentEligibleForDeletion(deleteAfter: Date | null, now = new Date()) {
  return Boolean(deleteAfter && deleteAfter.getTime() <= now.getTime());
}
