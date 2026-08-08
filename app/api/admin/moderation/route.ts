import { apiError, apiSuccess } from "@/lib/api-response";
import { unstable_rethrow } from "next/navigation";
import { getCurrentProfile, hasRole, isAccountOperational } from "@/lib/auth/current-profile";
import { AdministrationRepository } from "@/repositories/administration.repository";

export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (!hasRole(profile, ["Moderator", "Admin", "SuperAdmin"])) return apiError("Reviewer access required", 403);
    return apiSuccess(await AdministrationRepository.listModeration(), "Moderation center loaded");
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/admin/moderation]", error);
    return apiError("Unable to load moderation center", 500);
  }
}
