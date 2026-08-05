import type { RequestStatus } from "@prisma/client";
import { ZodError } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { TenantOperationsRepository } from "@/repositories/tenant-operations.repository";
import { maintenanceCreateSchema } from "@/schemas/tenant-operations";

export async function GET(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    const value = new URL(request.url).searchParams.get("status") as RequestStatus | null;
    return apiSuccess(await TenantOperationsRepository.listMaintenance(profile, value || undefined), "Maintenance requests loaded");
  } catch (error) {
    console.error("[GET /api/maintenance]", error);
    return apiError("Unable to load maintenance requests", 500);
  }
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (profile.role !== "Tenant") return apiError("Tenant access required", 403);
    const input = maintenanceCreateSchema.parse(await request.json());
    return apiSuccess(await TenantOperationsRepository.createMaintenance(profile.id, input), "Maintenance request created", 201);
  } catch (error) {
    if (error instanceof ZodError) return apiError(error.issues[0].message, 400);
    if (error instanceof Error && error.message === "NOT_TENANT") return apiError("You can only report maintenance for an accepted tenancy", 403);
    console.error("[POST /api/maintenance]", error);
    return apiError("Unable to create maintenance request", 500);
  }
}

