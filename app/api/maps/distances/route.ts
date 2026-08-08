import { ZodError } from "zod";
import { unstable_rethrow } from "next/navigation";
import { apiError, apiSuccess } from "@/lib/api-response";
import {
  DirectionsProviderError,
  getDrivingDistanceMatrix,
} from "@/features/properties/server/directions-provider";
import { getPropertyNavigationTargets } from "@/features/properties/server/navigation-data";
import { propertyDistanceMatrixSchema } from "@/schemas/map-directions";

export async function POST(request: Request) {
  try {
    const input = propertyDistanceMatrixSchema.parse(await request.json());
    const uniqueIds = [...new Set(input.propertyIds)];
    const targets = await getPropertyNavigationTargets(uniqueIds);
    const targetById = new Map(targets.map((target) => [target.propertyId, target]));
    const routableIds = uniqueIds.filter((id) => targetById.has(id));
    const metrics = await getDrivingDistanceMatrix(
      input.origin,
      routableIds.map((id) => targetById.get(id)!),
    );
    const metricById = new Map(routableIds.map((id, index) => [id, metrics[index]]));
    return apiSuccess(
      input.propertyIds.map((propertyId) => ({
        propertyId,
        distanceMetres: metricById.get(propertyId)?.distanceMetres ?? null,
        durationSeconds: metricById.get(propertyId)?.durationSeconds ?? null,
      })),
      "Driving distances loaded",
    );
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof SyntaxError) return apiError("Request body must be valid JSON", 400);
    if (error instanceof ZodError) return apiError(error.issues[0]?.message || "Invalid distance request", 400);
    if (error instanceof DirectionsProviderError) return apiError(error.message, error.statusCode);
    console.error("[POST /api/maps/distances]", error);
    return apiError("Unable to calculate driving distances", 500);
  }
}
