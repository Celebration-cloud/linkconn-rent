import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { OnboardingRepository } from "@/repositories/onboarding.repository";
import { onboardingDraftSchema } from "@/schemas/onboarding";

export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    return apiSuccess(
      await OnboardingRepository.getDraft(profile.id),
      "Onboarding draft loaded",
    );
  } catch (error) {
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return apiError("Profile not found", 404);
    }
    console.error("[GET /api/onboarding/draft]", error);
    return apiError("Unable to load onboarding draft", 500);
  }
}

export async function POST(request: Request) {
  try {
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    const input = onboardingDraftSchema.parse(await request.json());
    const data = await OnboardingRepository.saveDraft(profile.id, input);
    return apiSuccess(data, "Onboarding draft saved");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "NOT_FOUND") {
      return apiError("Profile not found", 404);
    }
    console.error("[POST /api/onboarding/draft]", error);
    return apiError("Unable to save onboarding draft", 500);
  }
}
