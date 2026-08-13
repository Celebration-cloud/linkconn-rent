import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, hasRole, isAccountOperational } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { ApplicationRepository } from "@/repositories/application.repository";
import { applicationCreateSchema } from "@/schemas/operating-system";

function privateNoStore(response: Response) { response.headers.set("Cache-Control", "private, no-store, max-age=0"); return response; }

export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (!hasRole(profile, ["Tenant", "Landlord", "PropertyManager"])) return apiError("Rental workspace access required", 403);
    return privateNoStore(apiSuccess(await ApplicationRepository.list(profile), "Applications loaded"));
  } catch (error) { console.error("[GET /api/applications]", error); return apiError("Unable to load applications", 500); }
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (!hasRole(profile, ["Tenant"])) return apiError("Tenant access required", 403);
    if (!checkRateLimit(getClientIp(request), `application-create:${profile.id}`, 10, 60 * 60 * 1000).allowed) return apiError("Too many application attempts. Try again later", 429);
    const input = applicationCreateSchema.parse(await request.json());
    return apiSuccess(await ApplicationRepository.create(profile.id, input.propertyId, input.message, input.idempotencyKey), "Application submitted", 201);
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0]?.message ?? "Invalid application", 400);
    if (error instanceof Error && ["PROPERTY_NOT_AVAILABLE", "OWN_PROPERTY", "NOT_ELIGIBLE", "ALREADY_APPLIED"].includes(error.message)) return apiError(error.message === "NOT_ELIGIBLE" ? "Complete identity verification before applying" : error.message === "ALREADY_APPLIED" ? "You already applied for this property" : "This property cannot accept your application", 409);
    console.error("[POST /api/applications]", error); return apiError("Unable to submit application", 500);
  }
}
