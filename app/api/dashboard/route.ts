import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { DashboardRepository } from "@/repositories/dashboard.repository";

export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    const snapshot = await DashboardRepository.getSnapshot(profile);
    return apiSuccess(snapshot, "Dashboard loaded");
  } catch (error) {
    console.error("[GET /api/dashboard]", error);
    return apiError("Unable to load dashboard", 500);
  }
}
