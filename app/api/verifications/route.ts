import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { OperatingSystemRepository } from "@/repositories/operating-system.repository";
import { verificationDraftSchema } from "@/schemas/operating-system";
import { getDocumentStorage } from "@/services/storage/document-storage";

export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    const submissions =
      await OperatingSystemRepository.listVerificationSubmissions(profile.id);
    return apiSuccess(
      { submissions, storageConfigured: getDocumentStorage().configured },
      "Verification records loaded",
    );
  } catch (error) {
    console.error("[GET /api/verifications]", error);
    return apiError("Unable to load verification records", 500);
  }
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    const input = verificationDraftSchema.parse(await request.json());
    const storage = getDocumentStorage();
    const submission =
      await OperatingSystemRepository.saveVerificationDraft(
        profile.id,
        input,
        storage.configured && input.documents.every((item) => item.storageKey),
      );
    return apiSuccess(
      submission,
      input.submit ? "Verification submitted" : "Verification draft saved",
      input.id ? 200 : 201,
    );
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "STORAGE_DISABLED") {
      return apiError(
        "Document uploads are disabled until a storage provider is configured",
        409,
      );
    }
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return apiError("Verification record or property not found", 404);
    }
    console.error("[POST /api/verifications]", error);
    return apiError("Unable to save verification", 500);
  }
}
