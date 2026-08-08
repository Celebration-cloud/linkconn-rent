"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  PropertyNavigationTarget,
  PropertyRoute,
} from "@/features/properties/types/navigation";
import {
  findActiveRouteStepIndex,
  hasArrived,
  shouldReroute,
} from "@/features/properties/utils/navigation";
import type { MapUserLocation } from "@/components/stitch/property-map-canvas";

type DirectionsEnvelope = {
  success: boolean;
  data?: PropertyRoute;
  message: string;
};

export type LocationPermissionState = "idle" | "requesting" | "granted" | "denied";

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function useLivePropertyDirections(target: PropertyNavigationTarget | null) {
  const watchId = useRef<number | null>(null);
  const routeController = useRef<AbortController | null>(null);
  const lastRouted = useRef<(MapUserLocation & { requestedAt: number }) | null>(null);
  const [route, setRoute] = useState<PropertyRoute | null>(null);
  const [location, setLocation] = useState<MapUserLocation | null>(null);
  const [permission, setPermission] = useState<LocationPermissionState>("idle");
  const [status, setStatus] = useState("Use your location to calculate a driving route.");
  const [error, setError] = useState<string | null>(null);
  const [routing, setRouting] = useState(false);
  const [tracking, setTracking] = useState(false);
  const [arrived, setArrived] = useState(false);

  const clearWatch = useCallback(() => {
    if (watchId.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  }, []);

  const stop = useCallback((message = "Live directions stopped.") => {
    clearWatch();
    routeController.current?.abort();
    lastRouted.current = null;
    setTracking(false);
    setRouting(false);
    setRoute(null);
    setArrived(false);
    setStatus(message);
  }, [clearWatch]);

  useEffect(() => () => {
    clearWatch();
    routeController.current?.abort();
  }, [clearWatch]);

  const loadRoute = useCallback(async (origin: MapUserLocation) => {
    const destination = target;
    if (!destination) return;
    routeController.current?.abort();
    const controller = new AbortController();
    routeController.current = controller;
    setRouting(true);
    try {
      const response = await fetch("/api/maps/directions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        signal: controller.signal,
        body: JSON.stringify({
          origin: { latitude: origin.latitude, longitude: origin.longitude },
          propertyId: destination.propertyId,
        }),
      });
      const result = (await response.json()) as DirectionsEnvelope;
      if (!response.ok || !result.success || !result.data) throw new Error(result.message || "Unable to calculate directions");
      setRoute(result.data);
      setError(null);
      setStatus(`Driving route to ${destination.title} is ready.`);
    } catch (requestError) {
      if (!isAbortError(requestError)) {
        const message = requestError instanceof Error ? requestError.message : "Unable to calculate directions";
        setError(message);
        setStatus(message);
      }
    } finally {
      if (routeController.current === controller) setRouting(false);
    }
  }, [target]);

  const start = useCallback(() => {
    const destination = target;
    if (!destination) {
      setError("Directions are unavailable because this property has no verified coordinates.");
      return;
    }
    if (!navigator.geolocation) {
      setError("Location is not supported by this browser.");
      setStatus("Location is not supported by this browser.");
      return;
    }
    clearWatch();
    setPermission("requesting");
    setError(null);
    setArrived(false);
    setStatus("Waiting for browser location permission.");
    watchId.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const current: MapUserLocation = {
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracyMetres: Math.max(1, coords.accuracy),
        };
        const now = Date.now();
        setLocation(current);
        setPermission("granted");
        setTracking(true);
        setError(null);
        if (hasArrived(current, destination)) {
          setArrived(true);
          setStatus(`You have arrived at ${destination.title}.`);
          clearWatch();
          setTracking(false);
          return;
        }
        if (shouldReroute({ previous: lastRouted.current, current, now })) {
          lastRouted.current = { ...current, requestedAt: now };
          void loadRoute(current);
        } else {
          setStatus(
            current.accuracyMetres <= 100
              ? `Live location is accurate to about ${Math.round(current.accuracyMetres)} metres.`
              : `Location accuracy is broad at about ${Math.round(current.accuracyMetres)} metres. Move outdoors and retry if needed.`,
          );
        }
      },
      (locationError) => {
        clearWatch();
        const denied = locationError.code === locationError.PERMISSION_DENIED;
        const timedOut = locationError.code === locationError.TIMEOUT;
        const message = denied
          ? "Location permission was denied. Allow it in your browser settings and retry."
          : timedOut
            ? "Location timed out. Check location services and retry."
            : "Your current location is unavailable. Check location services and retry.";
        setPermission(denied ? "denied" : "idle");
        setTracking(false);
        setRouting(false);
        setError(message);
        setStatus(message);
      },
      { enableHighAccuracy: true, timeout: 30_000, maximumAge: 0 },
    );
  }, [clearWatch, loadRoute, target]);

  const activeStepIndex = location && route
    ? findActiveRouteStepIndex(location, route.geometry, route.steps)
    : 0;

  return {
    route,
    location,
    permission,
    status,
    error,
    routing,
    tracking,
    arrived,
    activeStep: route?.steps[activeStepIndex] ?? null,
    upcomingStep: route?.steps[activeStepIndex + 1] ?? null,
    start,
    stop,
  };
}
