import { timingSafeEqual } from "node:crypto";
import { apiError, apiSuccess } from "@/lib/api-response";
import { deleteExpiredVerificationDocuments } from "@/features/verifications/server/document-retention-service";

function hasValidCronSecret(request: Request) {
  const configured = process.env.CRON_SECRET;
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!configured || !supplied) return false;
  const expected = Buffer.from(configured);
  const actual = Buffer.from(supplied);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export async function GET(request: Request) {
  if (!hasValidCronSecret(request)) return apiError("Unauthorized", 401);
  try {
    return apiSuccess(await deleteExpiredVerificationDocuments(), "Expired documents processed");
  } catch (error) {
    if (error instanceof Error && error.message === "STORAGE_NOT_CONFIGURED") {
      return apiError("Private document storage is not configured", 503);
    }
    console.error("[GET /api/cron/document-retention]", error);
    return apiError("Document retention cleanup failed", 500);
  }
}
