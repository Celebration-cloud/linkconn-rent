import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile, isAccountOperational } from "@/lib/auth/current-profile";
import { verifyCsrf } from "@/lib/security/csrf";
import { checkRateLimit, getClientIp } from "@/lib/security/rate-limiter";
import { TenantOperationsRepository } from "@/repositories/tenant-operations.repository";
import { maintenanceCreateSchema, maintenanceListQuerySchema } from "@/schemas/tenant-operations";

export async function GET(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    const query = maintenanceListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    const response = apiSuccess(await TenantOperationsRepository.listMaintenance(profile, query.status), "Maintenance requests loaded");
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    return response;
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0]?.message ?? "Invalid maintenance filters", 400);
    console.error("[GET /api/maintenance]", error);
    return apiError("Unable to load maintenance requests", 500);
  }
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!verifyCsrf(request)) return apiError("Security check failed", 403);
    if (!isAccountOperational(profile)) return apiError("Account access unavailable", 403);
    if (profile.role !== "Tenant") return apiError("Tenant access required", 403);
    if (!checkRateLimit(getClientIp(request), `maintenance-create:${profile.id}`, 10, 3_600_000).allowed) return apiError("Too many maintenance requests. Try again later", 429);
    const input = maintenanceCreateSchema.parse(await request.json());
    return apiSuccess(await TenantOperationsRepository.createMaintenance(profile.id, input), "Maintenance request created", 201);
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "ACTIVE_LEASE_REQUIRED") return apiError("An active lease is required for a new maintenance request", 403);
    console.error("[POST /api/maintenance]", error);
    return apiError("Unable to create maintenance request", 500);
  }
}
