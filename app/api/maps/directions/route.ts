import { ZodError } from "zod";
import { unstable_rethrow } from "next/navigation";
import { apiError, apiSuccess } from "@/lib/api-response";
import {
  DirectionsProviderError,
  getDrivingRoute,
} from "@/features/properties/server/directions-provider";
import { getPropertyNavigationTarget } from "@/features/properties/server/navigation-data";
import {
  directionsQuerySchema,
  propertyDirectionsSchema,
} from "@/schemas/map-directions";

function handleError(error: unknown, method: string) {
  unstable_rethrow(error);
  if (error instanceof SyntaxError) return apiError("Request body must be valid JSON", 400);
  if (error instanceof ZodError) return apiError(error.issues[0]?.message || "Invalid directions request", 400);
  if (error instanceof DirectionsProviderError) return apiError(error.message, error.statusCode);
  console.error(`[${method} /api/maps/directions]`, error);
  return apiError("Unable to calculate directions", 500);
}

export async function POST(request: Request) {
  try {
    const input = propertyDirectionsSchema.parse(await request.json());
    const destination = await getPropertyNavigationTarget(input.propertyId);
    if (!destination) return apiError("Directions are unavailable for this property", 404);
    const route = await getDrivingRoute(input.origin, destination);
    return apiSuccess(route, "Driving route loaded");
  } catch (error) {
    return handleError(error, "POST");
  }
}

/** @deprecated Use POST with a propertyId so exact destinations are resolved server-side. */
export async function GET(request: Request) {
  try {
    const input = directionsQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    const route = await getDrivingRoute(
      { longitude: input.originLongitude, latitude: input.originLatitude },
      { longitude: input.destinationLongitude, latitude: input.destinationLatitude },
    );
    return apiSuccess(route, "Driving route loaded");
  } catch (error) {
    return handleError(error, "GET");
  }
}
