import { apiError } from "@/lib/api-response";
import { getCurrentProfile, hasRole, isAccountOperational } from "@/lib/auth/current-profile";
import { prisma } from "@/lib/db/client";
import { getDocumentStorage } from "@/services/storage/document-storage";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string; documentId: string }> },
) {
  const profile = await getCurrentProfile();
  if (!profile) return apiError("Authentication required", 401);
  if (!isAccountOperational(profile) || !hasRole(profile, ["Admin", "SuperAdmin"])) {
    return apiError("Administrator document access required", 403);
  }
  const { id, documentId } = await context.params;
  const document = await prisma.verificationDocument.findFirst({
    where: { id: documentId, submissionId: id },
  });
  if (!document?.storageKey || document.deletedAt) return apiError("Document is unavailable", 404);
  const storage = getDocumentStorage();
  if (!storage.configured) return apiError("Private document storage is not configured", 503);
  const stored = await storage.read(document.storageKey);
  if (!stored) return apiError("Document is unavailable", 404);

  await prisma.adminAuditEvent.create({
    data: {
      actorId: profile.id,
      action: "verification.document.accessed",
      targetType: "Verification",
      targetId: id,
      resultingState: { documentId: document.id, kind: document.kind },
      reason: "Administrator viewed a private verification document",
    },
  });

  const extension = document.mimeType === "application/pdf" ? "pdf" : document.mimeType === "image/png" ? "png" : "jpg";
  return new Response(stored.stream, {
    headers: {
      "Content-Type": document.mimeType ?? "application/octet-stream",
      "Content-Disposition": `inline; filename="verification-document.${extension}"`,
      "Cache-Control": "private, no-store, max-age=0",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}
