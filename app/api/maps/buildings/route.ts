import { ZodError } from "zod";
import { unstable_rethrow } from "next/navigation";
import { apiError, apiSuccess } from "@/lib/api-response";
import {
  buildOverpassQuery,
  convertOverpassBuildings,
  getOverpassProviderUrl,
} from "@/lib/map-buildings";
import { MAP_CONFIG } from "@/lib/map-config";
import {
  buildingsQuerySchema,
  type BuildingFeatureCollection,
} from "@/schemas/map-buildings";

type CacheEntry = {
  expiresAt: number;
  data: BuildingFeatureCollection;
};

const CACHE_TTL_MS = 15 * 60 * 1000;
const responseCache = new Map<string, CacheEntry>();

function getCacheKey(latitude: number, longitude: number, radius: number) {
  return `${latitude.toFixed(4)}:${longitude.toFixed(4)}:${radius}`;
}

export async function GET(request: Request) {
  try {
    const input = buildingsQuerySchema.parse(
      Object.fromEntries(new URL(request.url).searchParams),
    );
    const providerUrl = getOverpassProviderUrl();
    if (!providerUrl) {
      return apiError("2.5D building detail is not configured", 503);
    }

    const cacheKey = getCacheKey(
      input.latitude,
      input.longitude,
      input.radius,
    );
    const cached = responseCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return apiSuccess(cached.data, "Building detail loaded from cache");
    }

    const response = await fetch(providerUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: new URLSearchParams({
        data: buildOverpassQuery(input),
      }),
      signal: AbortSignal.timeout(10_000),
      cache: "no-store",
    });
    if (!response.ok) {
      return apiError("The building detail service is unavailable", 502);
    }

    const data = convertOverpassBuildings(
      await response.json(),
      MAP_CONFIG.buildingFeatureLimit,
    );
    responseCache.set(cacheKey, {
      expiresAt: Date.now() + CACHE_TTL_MS,
      data,
    });
    if (responseCache.size > 50) {
      const oldestKey = responseCache.keys().next().value as string | undefined;
      if (oldestKey) responseCache.delete(oldestKey);
    }

    return apiSuccess(data, "Building detail loaded");
  } catch (error) {
    unstable_rethrow(error);
    if (error instanceof ZodError) {
      return apiError(error.issues[0]?.message || "Invalid map area", 400);
    }
    if (error instanceof Error && error.name === "TimeoutError") {
      return apiError("Building detail timed out", 504);
    }
    console.error("[GET /api/maps/buildings]", error);
    return apiError("Unable to load building detail", 500);
  }
}
