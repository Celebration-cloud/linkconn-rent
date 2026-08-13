import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { VerificationRepository } from "@/repositories/verification.repository";
import { verificationDraftSchema, verificationResubmitSchema } from "@/schemas/operating-system";

function privateNoStore(response: Response) {
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  return response;
}

function ownerRole(profile: { role: string }): profile is typeof profile & { role: "Tenant" | "Landlord" } {
  return profile.role === "Tenant" || profile.role === "Landlord";
}

export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (!ownerRole(profile)) return apiError("Verification workspace is available to tenants and landlords", 403);
    return privateNoStore(apiSuccess(await VerificationRepository.getOwnerWorkspace(profile.id, profile.role), "Verification workspace loaded"));
  } catch (error) {
    console.error("[GET /api/verifications]", error);
    return apiError("Unable to load verification records", 500);
  }
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (!ownerRole(profile)) return apiError("Verification workspace is available to tenants and landlords", 403);
    if (!checkRateLimit(getClientIp(request), `verification-mutation:${profile.id}`, 20, 60 * 60 * 1000).allowed) return apiError("Too many verification actions. Try again later", 429);
    const payload: unknown = await request.json();
    if (typeof payload === "object" && payload !== null && "action" in payload) {
      const input = verificationResubmitSchema.parse(payload);
      const submission = await VerificationRepository.resubmit(profile.id, profile.role, {
        submissionId: input.submissionId,
        reviewRound: input.reviewRound,
      });
      return apiSuccess(submission, "Verification resubmitted");
    }
    const input = verificationDraftSchema.parse(payload);
    const submission = await VerificationRepository.saveDraft(profile.id, input, false);
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
    if (error instanceof Error && error.message === "RESUBMIT_CONFLICT") return apiError("This verification was already resubmitted. Refresh to see the current round.", 409);
    if (error instanceof Error && error.message.startsWith("DOCUMENTS_INCOMPLETE")) return apiError(`Upload the required documents: ${error.message.split(":").slice(1).join(":")}.`, 409);
    console.error("[POST /api/verifications]", error);
    return apiError("Unable to save verification", 500);
  }
}
