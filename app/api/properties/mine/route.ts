import { canListProperties } from "@/domain/constants/property-access";
import { unstable_rethrow } from "next/navigation";
import { apiError, apiSuccess } from "@/lib/api-response";
import { getCurrentProfile } from "@/lib/auth/current-profile";
import { TenantOperationsRepository } from "@/repositories/tenant-operations.repository";

export async function GET() {
  try {
    const profile = await getCurrentProfile();
    if (!profile) return apiError("Authentication required", 401);
    if (!canListProperties(profile.role)) return apiError("Landlord access required", 403);
    return apiSuccess(await TenantOperationsRepository.listOwnedProperties(profile.id), "Properties loaded");
  } catch (error) {
    unstable_rethrow(error);
    console.error("[GET /api/properties/mine]", error);
    return apiError("Unable to load properties", 500);
  }
}
