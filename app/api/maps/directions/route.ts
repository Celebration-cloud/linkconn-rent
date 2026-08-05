import { ZodError, z } from "zod";
import { apiError, apiSuccess } from "@/lib/api-response";
import { MAP_CONFIG } from "@/lib/map-config";
import { directionsQuerySchema } from "@/schemas/map-directions";

const osrmResponseSchema = z.object({
  code: z.string(),
  routes: z
    .array(
      z.object({
        distance: z.number(),
        duration: z.number(),
        geometry: z.object({
          type: z.literal("LineString"),
          coordinates: z.array(z.tuple([z.number(), z.number()])),
        }),
      }),
    )
    .default([]),
});

export async function GET(request: Request) {
  try {
    const input = directionsQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    if (!MAP_CONFIG.directionsUrl) {
      return apiError("Driving directions are not configured", 503);
    }

    const coordinates = [
      `${input.originLongitude},${input.originLatitude}`,
      `${input.destinationLongitude},${input.destinationLatitude}`,
    ].join(";");
    const endpoint = new URL(
      `/route/v1/driving/${coordinates}`,
      MAP_CONFIG.directionsUrl,
    );
    endpoint.searchParams.set("overview", "full");
    endpoint.searchParams.set("geometries", "geojson");
    endpoint.searchParams.set("steps", "false");

    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
      next: { revalidate: 300 },
    });
    if (!response.ok) return apiError("The route service is unavailable", 502);

    const parsed = osrmResponseSchema.parse(await response.json());
    const route = parsed.routes[0];
    if (parsed.code !== "Ok" || !route) {
      return apiError("No driving route was found", 404);
    }

    return apiSuccess(
      {
        geometry: route.geometry,
        distanceMetres: Math.round(route.distance),
        durationSeconds: Math.round(route.duration),
      },
      "Driving route loaded",
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError(error.issues[0]?.message || "Invalid coordinates", 400);
    }
    console.error("[GET /api/maps/directions]", error);
    return apiError("Unable to calculate directions", 500);
  }
}
