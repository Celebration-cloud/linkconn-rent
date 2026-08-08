"use client";

import { useEffect, useState } from "react";
import type { MapUserLocation } from "@/components/stitch/property-map-canvas";

export type PropertyDistanceResult = {
  propertyId: string;
  distanceMetres: number | null;
  durationSeconds: number | null;
};

export function usePropertyDistances(propertyIds: string[], origin: MapUserLocation | null) {
  const [results, setResults] = useState<PropertyDistanceResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const key = propertyIds.join(",");
  useEffect(() => {
    if (!origin || !key) return;
    const requestedIds = key.split(",");
    const controller = new AbortController();
    void fetch("/api/maps/distances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      signal: controller.signal,
      body: JSON.stringify({
        origin: { latitude: origin.latitude, longitude: origin.longitude },
        propertyIds: requestedIds,
      }),
    }).then(async (response) => {
      const envelope = (await response.json()) as { success: boolean; data?: PropertyDistanceResult[]; message: string };
      if (!response.ok || !envelope.success || !envelope.data) throw new Error(envelope.message);
      setResults(envelope.data);
      setError(null);
    }).catch((requestError: unknown) => {
      if (requestError instanceof DOMException && requestError.name === "AbortError") return;
      setError(requestError instanceof Error ? requestError.message : "Unable to calculate distances");
    });
    return () => controller.abort();
  }, [key, origin]);
  return { results, error };
}
