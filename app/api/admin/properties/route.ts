import { ZodError } from "zod";
import { unstable_rethrow } from "next/navigation";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, hasRole, isAccountOperational } from "@/lib/auth/current-profile";
import { AdministrationRepository } from "@/repositories/administration.repository";
import { queueFiltersSchema } from "@/schemas/administration";

export async function GET(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile) || !hasRole(profile, ["Moderator", "Admin", "SuperAdmin"])) return apiError("Reviewer access required", 403);
    const filters = queueFiltersSchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return apiSuccess(await AdministrationRepository.listProperties(filters, profile.role), "Properties loaded");
  } catch (error) { unstable_rethrow(error); if (error instanceof ZodError) return apiError(error.issues[0]?.message ?? "Invalid query", 400); console.error("[GET /api/admin/properties]", error); return apiError("Unable to load properties", 500); }
}
