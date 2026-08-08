import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, hasRole, isAccountOperational } from "@/lib/auth/current-profile";
import { AdministrationRepository } from "@/repositories/administration.repository";
import { disputeCreateSchema, queueFiltersSchema } from "@/schemas/administration";

export async function GET(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (!hasRole(profile, ["Moderator", "Admin", "SuperAdmin"])) return apiError("Reviewer access required", 403);
    const filters = queueFiltersSchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return apiSuccess(await AdministrationRepository.listDisputes(filters), "Dispute queue loaded");
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    console.error("[GET /api/admin/disputes]", error);
    return apiError("Unable to load disputes", 500);
  }
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    const input = disputeCreateSchema.parse(await request.json());
    return apiSuccess(await AdministrationRepository.createDispute(profile.id, input), "Dispute submitted", 201);
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    console.error("[POST /api/admin/disputes]", error);
    return apiError("Unable to submit dispute", 500);
  }
}
