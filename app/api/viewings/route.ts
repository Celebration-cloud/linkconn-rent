import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, hasRole, isAccountOperational } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { ViewingRepository } from "@/repositories/viewing.repository";
import { viewingCreateSchema } from "@/schemas/operating-system";
const privateNoStore = (response: Response) => { response.headers.set("Cache-Control", "private, no-store, max-age=0"); return response; };

export async function GET() {
  try { const profile = await getCurrentProfile(); if (!profile) return apiError("Authentication required", 401); if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403); if (!hasRole(profile, ["Tenant", "Landlord", "PropertyManager"])) return apiError("Rental workspace access required", 403); return privateNoStore(apiSuccess(await ViewingRepository.list(profile), "Viewings loaded")); }
  catch (error) { console.error("[GET /api/viewings]", error); return apiError("Unable to load viewings", 500); }
}
export async function POST(request: Request) {
  try { const profile = await getCurrentProfile(); if (!profile) return apiError("Authentication required", 401); if (!verifyCsrf(request)) return apiError("Security check failed", 403); if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403); if (!hasRole(profile, ["Tenant"])) return apiError("Tenant access required", 403); if (!checkRateLimit(getClientIp(request), `viewing-create:${profile.id}`, 12, 60 * 60 * 1000).allowed) return apiError("Too many viewing requests. Try again later", 429); const input = viewingCreateSchema.parse(await request.json()); return apiSuccess(await ViewingRepository.create(profile.id, input.propertyId, input.scheduledAt, input.note, input.idempotencyKey), "Viewing requested", 201); }
  catch (error) { if (error instanceof ZodError) return apiError(error.issues[0]?.message ?? "Invalid viewing request", 400); if (error instanceof Error && ["PROPERTY_NOT_AVAILABLE", "OWN_PROPERTY", "ACTIVE_VIEWING_EXISTS"].includes(error.message)) return apiError(error.message === "ACTIVE_VIEWING_EXISTS" ? "You already have an active viewing for this property" : "A viewing cannot be requested for this property", 409); console.error("[POST /api/viewings]", error); return apiError("Unable to request viewing", 500); }
}
