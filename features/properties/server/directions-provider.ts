import "server-only";

import { z } from "zod";
import { MAP_CONFIG } from "@/lib/map-config";
import type {
  NavigationCoordinates,
  PropertyRoute,
  RouteStep,
} from "@/features/properties/types/navigation";
import { formatManeuverInstruction } from "@/features/properties/utils/navigation";

const coordinatePair = z.tuple([z.number().finite(), z.number().finite()]);
const geometrySchema = z.object({
  type: z.literal("LineString"),
  coordinates: z.array(coordinatePair).min(2),
});
const maneuverSchema = z.object({
  type: z.string(),
  modifier: z.string().optional(),
  location: coordinatePair,
});
const osrmRouteResponseSchema = z.object({
  code: z.string(),
  waypoints: z.array(z.object({ location: coordinatePair })).default([]),
  routes: z.array(z.object({
    distance: z.number().finite().nonnegative(),
    duration: z.number().finite().nonnegative(),
    geometry: geometrySchema,
    legs: z.array(z.object({
      steps: z.array(z.object({
        distance: z.number().finite().nonnegative(),
        duration: z.number().finite().nonnegative(),
        name: z.string().default(""),
        maneuver: maneuverSchema,
      })).default([]),
    })).default([]),
  })).default([]),
});

const nullableMetric = z.number().finite().nonnegative().nullable();
const osrmTableResponseSchema = z.object({
  code: z.string(),
  durations: z.array(z.array(nullableMetric)).optional(),
  distances: z.array(z.array(nullableMetric)).optional(),
});

function providerUrl(path: string) {
  if (!MAP_CONFIG.directionsUrl) throw new DirectionsProviderError("Driving directions are not configured", 503);
  return new URL(path, MAP_CONFIG.directionsUrl);
}

export class DirectionsProviderError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
  }
}

async function fetchProvider(endpoint: URL) {
  try {
    return await fetch(endpoint, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(12_000),
    });
  } catch (error) {
    const timedOut = error instanceof DOMException && (error.name === "TimeoutError" || error.name === "AbortError");
    throw new DirectionsProviderError(
      timedOut ? "The route service timed out" : "The route service is unavailable",
      timedOut ? 504 : 502,
    );
  }
}

export async function getDrivingRoute(
  origin: NavigationCoordinates,
  destination: NavigationCoordinates,
): Promise<PropertyRoute> {
  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;
  const endpoint = providerUrl(`/route/v1/driving/${coordinates}`);
  endpoint.searchParams.set("overview", "full");
  endpoint.searchParams.set("geometries", "geojson");
  endpoint.searchParams.set("steps", "true");
  const response = await fetchProvider(endpoint);
  if (!response.ok) throw new DirectionsProviderError("The route service is unavailable", 502);
  let parsed: z.infer<typeof osrmRouteResponseSchema>;
  try {
    parsed = osrmRouteResponseSchema.parse(await response.json());
  } catch {
    throw new DirectionsProviderError("The route service returned an invalid response", 502);
  }
  const route = parsed.routes[0];
  if (parsed.code !== "Ok" || !route) throw new DirectionsProviderError("No driving route was found", 404);
  const steps: RouteStep[] = route.legs.flatMap((leg) => leg.steps.map((step) => ({
    instruction: formatManeuverInstruction({
      type: step.maneuver.type,
      modifier: step.maneuver.modifier,
      roadName: step.name,
    }),
    maneuverType: step.maneuver.type,
    modifier: step.maneuver.modifier ?? null,
    roadName: step.name,
    location: step.maneuver.location,
    distanceMetres: Math.round(step.distance),
    durationSeconds: Math.round(step.duration),
  })));
  return {
    geometry: route.geometry,
    origin: parsed.waypoints[0]?.location ?? [origin.longitude, origin.latitude],
    destination: parsed.waypoints[1]?.location ?? [destination.longitude, destination.latitude],
    distanceMetres: Math.round(route.distance),
    durationSeconds: Math.round(route.duration),
    steps,
  };
}

export async function getDrivingDistanceMatrix(
  origin: NavigationCoordinates,
  destinations: NavigationCoordinates[],
) {
  if (!destinations.length) return [];
  const coordinates = [origin, ...destinations]
    .map((coordinate) => `${coordinate.longitude},${coordinate.latitude}`)
    .join(";");
  const endpoint = providerUrl(`/table/v1/driving/${coordinates}`);
  endpoint.searchParams.set("sources", "0");
  endpoint.searchParams.set("destinations", destinations.map((_, index) => String(index + 1)).join(";"));
  endpoint.searchParams.set("annotations", "distance,duration");
  const response = await fetchProvider(endpoint);
  if (!response.ok) throw new DirectionsProviderError("The distance service is unavailable", 502);
  let parsed: z.infer<typeof osrmTableResponseSchema>;
  try {
    parsed = osrmTableResponseSchema.parse(await response.json());
  } catch {
    throw new DirectionsProviderError("The distance service returned an invalid response", 502);
  }
  if (parsed.code !== "Ok") throw new DirectionsProviderError("No driving distances were found", 404);
  return destinations.map((_, index) => ({
    distanceMetres: parsed.distances?.[0]?.[index] ?? null,
    durationSeconds: parsed.durations?.[0]?.[index] ?? null,
  }));
}
