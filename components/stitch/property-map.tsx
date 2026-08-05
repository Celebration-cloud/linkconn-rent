"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Building2,
  ChevronDown,
  List,
  LocateFixed,
  Map as MapIcon,
  MapPinned,
  Radio,
  RefreshCw,
  Route,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/form-controls";
import type { Property } from "@/domain/types/property";
import type { PropertySearchEnvelope } from "@/domain/types/property-search";
import { hasMapCoordinates } from "@/lib/map-config";
import { StitchPropertyCard } from "./property-card";
import type {
  MapCanvasHandle,
  MapRoute,
  MapUserLocation,
  MapViewportBounds,
} from "./property-map-canvas";

const PropertyMapCanvas = dynamic(
  () =>
    import("./property-map-canvas").then((module) => module.PropertyMapCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_60%_35%,rgba(35,122,87,0.14),transparent_30%),#e8eee9]"
        aria-label="Loading interactive map"
      />
    ),
  },
);

type DirectionsEnvelope = {
  success: boolean;
  data?: {
    geometry: MapRoute["geometry"];
    distanceMetres: number;
    durationSeconds: number;
  };
  message: string;
};

type MobileMode = "map" | "list";
type LocationPermissionState = "idle" | "requesting" | "granted" | "denied";
type BrowserCoordinates = {
  longitude: number;
  latitude: number;
  accuracyMetres?: number;
};

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

function distanceBetweenMetres(
  first: BrowserCoordinates,
  second: BrowserCoordinates,
) {
  const earthRadiusMetres = 6_371_000;
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const latitudeDelta = toRadians(second.latitude - first.latitude);
  const longitudeDelta = toRadians(second.longitude - first.longitude);
  const firstLatitude = toRadians(first.latitude);
  const secondLatitude = toRadians(second.latitude);
  const haversine =
    Math.sin(latitudeDelta / 2) ** 2 +
    Math.cos(firstLatitude) *
      Math.cos(secondLatitude) *
      Math.sin(longitudeDelta / 2) ** 2;

  return (
    earthRadiusMetres *
    2 *
    Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine))
  );
}

export function PropertyMap({ properties }: { properties: Property[] }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<MapCanvasHandle>(null);
  const requestController = useRef<AbortController | null>(null);
  const directionsController = useRef<AbortController | null>(null);
  const locationWatchId = useRef<number | null>(null);
  const lastRoutedLocation = useRef<
    (Required<BrowserCoordinates> & { requestedAt: number }) | null
  >(null);
  const [visibleProperties, setVisibleProperties] = useState(properties);
  const [selectedId, setSelectedId] = useState<string | null>(
    properties.find(hasMapCoordinates)?.id || null,
  );
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [query, setQuery] = useState(searchParams.get("location") || "");
  const [mobileMode, setMobileMode] = useState<MobileMode>("map");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [searchingArea, setSearchingArea] = useState(false);
  const [areaSearchAvailable, setAreaSearchAvailable] = useState(false);
  const [statusMessage, setStatusMessage] = useState("Loading interactive map");
  const [buildingsEnabled, setBuildingsEnabled] = useState(true);
  const [route, setRoute] = useState<MapRoute | null>(null);
  const [routeSummary, setRouteSummary] = useState<{
    distanceMetres: number;
    durationSeconds: number;
  } | null>(null);
  const [routing, setRouting] = useState(false);
  const [permissionPromptOpen, setPermissionPromptOpen] = useState(false);
  const [locationPermission, setLocationPermission] =
    useState<LocationPermissionState>("idle");
  const [locationError, setLocationError] = useState<string | null>(null);
  const [liveTracking, setLiveTracking] = useState(false);
  const [liveLocation, setLiveLocation] =
    useState<MapUserLocation | null>(null);

  const mappedProperties = useMemo(
    () => visibleProperties.filter(hasMapCoordinates),
    [visibleProperties],
  );
  const unmappedCount = visibleProperties.length - mappedProperties.length;
  const selected =
    visibleProperties.find((property) => property.id === selectedId) || null;

  useEffect(() => {
    return () => {
      requestController.current?.abort();
      directionsController.current?.abort();
      if (locationWatchId.current !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(locationWatchId.current);
      }
    };
  }, []);

  const syncUrl = useCallback(
    (next: URLSearchParams) => {
      const queryString = next.toString();
      router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router],
  );

  const stopLiveDirections = useCallback((announce = true) => {
    if (locationWatchId.current !== null && navigator.geolocation) {
      navigator.geolocation.clearWatch(locationWatchId.current);
      locationWatchId.current = null;
    }
    directionsController.current?.abort();
    lastRoutedLocation.current = null;
    setLiveTracking(false);
    setLiveLocation(null);
    setRoute(null);
    setRouteSummary(null);
    setRouting(false);
    if (announce) setStatusMessage("Live directions stopped");
  }, []);

  const focusProperty = useCallback(
    (property: Property) => {
      stopLiveDirections(false);
      setSelectedId(property.id);
      setLocationError(null);
      setSheetOpen(false);
      if (hasMapCoordinates(property)) {
        canvasRef.current?.focusProperty(property.id);
        setMobileMode("map");
      }
    },
    [stopLiveDirections],
  );

  const searchLocation = useCallback(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return;
    const match = visibleProperties.find((property) =>
      `${property.location} ${property.city}`.toLowerCase().includes(needle),
    );
    if (!match) {
      setStatusMessage(`No mapped property matched ${query.trim()}`);
      return;
    }
    focusProperty(match);
    const next = new URLSearchParams(searchParams.toString());
    next.set("location", query.trim());
    syncUrl(next);
    setStatusMessage(`Showing ${match.title} in ${match.location}`);
  }, [
    focusProperty,
    query,
    searchParams,
    syncUrl,
    visibleProperties,
  ]);

  const searchBounds = useCallback(
    async (bounds: MapViewportBounds) => {
      requestController.current?.abort();
      const controller = new AbortController();
      requestController.current = controller;
      const next = new URLSearchParams(searchParams.toString());
      next.set("north", String(bounds.north));
      next.set("south", String(bounds.south));
      next.set("east", String(bounds.east));
      next.set("west", String(bounds.west));
      next.set("mode", "map");
      setSearchingArea(true);
      setAreaSearchAvailable(false);
      setStatusMessage("Searching this map area");

      try {
        const response = await fetch(`/api/properties?${next.toString()}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json()) as PropertySearchEnvelope;
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Unable to search this area");
        }
        setVisibleProperties(result.data.items);
        setSelectedId(result.data.items.find(hasMapCoordinates)?.id || null);
        syncUrl(next);
        setStatusMessage(
          result.data.items.length
            ? `${result.data.pagination.totalItems} properties found in this area`
            : "No properties are currently available in this area",
        );
      } catch (error) {
        if (!isAbortError(error)) {
          setStatusMessage(
            error instanceof Error
              ? error.message
              : "Unable to search this area",
          );
          setAreaSearchAvailable(true);
        }
      } finally {
        if (requestController.current === controller) {
          setSearchingArea(false);
        }
      }
    },
    [searchParams, syncUrl],
  );

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setStatusMessage("Location is not supported by this browser");
      return;
    }
    setLocationPermission("requesting");
    setLocationError(null);
    setStatusMessage("Requesting a fresh precise location");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        const accuracyMetres = Math.max(1, coords.accuracy);
        setLiveLocation({
          longitude: coords.longitude,
          latitude: coords.latitude,
          accuracyMetres,
        });
        setLocationPermission("granted");
        canvasRef.current?.focusCoordinates(
          coords.longitude,
          coords.latitude,
          accuracyMetres <= 100 ? 16 : accuracyMetres <= 1_000 ? 14 : 12,
        );
        setAreaSearchAvailable(true);
        setStatusMessage(
          `Map centred on your browser location, accurate to about ${Math.round(accuracyMetres)} metres`,
        );
      },
      (error) => {
        const denied = error.code === error.PERMISSION_DENIED;
        const message = denied
          ? "Location permission was denied. You can still search by area."
          : "We could not determine your location";
        setLocationPermission(denied ? "denied" : "idle");
        setLocationError(message);
        setStatusMessage(message);
      },
      { enableHighAccuracy: true, timeout: 30_000, maximumAge: 0 },
    );
  }, []);

  const loadDirections = useCallback(
    async (origin: BrowserCoordinates, destination: Property) => {
      if (!hasMapCoordinates(destination)) return;

      directionsController.current?.abort();
      const controller = new AbortController();
      directionsController.current = controller;
      const params = new URLSearchParams({
        originLongitude: String(origin.longitude),
        originLatitude: String(origin.latitude),
        destinationLongitude: String(destination.longitude),
        destinationLatitude: String(destination.latitude),
      });
      setRouting(true);

      try {
        const response = await fetch(`/api/maps/directions?${params}`, {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = (await response.json()) as DirectionsEnvelope;
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Unable to calculate directions");
        }
        setRoute({
          geometry: result.data.geometry,
          origin: [origin.longitude, origin.latitude],
          destination: [destination.longitude, destination.latitude],
        });
        setRouteSummary({
          distanceMetres: result.data.distanceMetres,
          durationSeconds: result.data.durationSeconds,
        });
        setLocationError(null);
        setStatusMessage(
          `Live driving directions to ${destination.title} are ready`,
        );
      } catch (error) {
        if (!isAbortError(error)) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to calculate directions";
          setLocationError(message);
          setStatusMessage(message);
        }
      } finally {
        if (directionsController.current === controller) setRouting(false);
      }
    },
    [],
  );

  const openDirectionsPermission = useCallback(() => {
    if (!selected || !hasMapCoordinates(selected)) {
      setStatusMessage("Select a mapped property before requesting directions");
      return;
    }
    if (!navigator.geolocation) {
      const message = "Location is not supported by this browser";
      setLocationError(message);
      setStatusMessage(message);
      return;
    }
    setLocationError(null);
    setPermissionPromptOpen(true);
  }, [selected]);

  const startLiveDirections = useCallback(() => {
    if (!selected || !hasMapCoordinates(selected) || !navigator.geolocation) {
      return;
    }

    const destination = selected;
    if (locationWatchId.current !== null) {
      navigator.geolocation.clearWatch(locationWatchId.current);
    }
    setPermissionPromptOpen(false);
    setLocationPermission("requesting");
    setLocationError(null);
    setRouting(true);
    setStatusMessage("Waiting for browser location permission");
    lastRoutedLocation.current = null;

    locationWatchId.current = navigator.geolocation.watchPosition(
      ({ coords, timestamp }) => {
        const currentLocation = {
          longitude: coords.longitude,
          latitude: coords.latitude,
          accuracyMetres: Math.max(1, coords.accuracy),
        };
        const previous = lastRoutedLocation.current;
        const now = Date.now();
        const hasMeaningfullyBetterAccuracy =
          Boolean(previous) &&
          currentLocation.accuracyMetres + 25 <
            (previous?.accuracyMetres ?? Number.POSITIVE_INFINITY);
        const shouldRefreshRoute =
          !previous ||
          hasMeaningfullyBetterAccuracy ||
          (now - previous.requestedAt >= 15_000 &&
            distanceBetweenMetres(previous, currentLocation) >= 20);

        setLiveLocation(currentLocation);
        setLocationPermission("granted");
        setLiveTracking(true);
        setLocationError(null);
        setStatusMessage(
          currentLocation.accuracyMetres <= 100
            ? `Fresh live location received, accurate to about ${Math.round(currentLocation.accuracyMetres)} metres`
            : `Your browser reported an approximate location, accurate to about ${Math.round(currentLocation.accuracyMetres)} metres`,
        );

        if (shouldRefreshRoute) {
          lastRoutedLocation.current = {
            ...currentLocation,
            requestedAt: Math.max(now, timestamp),
          };
          void loadDirections(currentLocation, destination);
        }
      },
      (error) => {
        if (locationWatchId.current !== null) {
          navigator.geolocation.clearWatch(locationWatchId.current);
          locationWatchId.current = null;
        }
        const denied = error.code === error.PERMISSION_DENIED;
        const message = denied
          ? "Location permission was denied. Allow location access in your browser to use live directions."
          : "We could not determine your live location. Check location services and try again.";
        setLocationPermission(denied ? "denied" : "idle");
        setLiveTracking(false);
        setRouting(false);
        setLocationError(message);
        setStatusMessage(message);
      },
      { enableHighAccuracy: true, timeout: 30_000, maximumAge: 0 },
    );
  }, [loadDirections, selected]);

  const toggleBuildings = useCallback(() => {
    const next = !buildingsEnabled;
    const supported = canvasRef.current?.setBuildingsEnabled(next) ?? false;
    if (!supported) {
      setStatusMessage(
        "The map is still loading. Try the 2.5D building control again shortly.",
      );
      return;
    }
    setBuildingsEnabled(next);
    setStatusMessage(
      next ? "2.5D buildings enabled" : "2.5D buildings disabled",
    );
  }, [buildingsEnabled]);

  const handleBuildingStatus = useCallback(
    (
      status: "idle" | "loading" | "ready" | "unavailable",
      message?: string,
    ) => {
      void status;
      if (message) setStatusMessage(message);
    },
    [],
  );

  return (
    <main
      id="main-content"
      data-location-permission={locationPermission}
      className="relative min-h-[100dvh] overflow-hidden bg-sand-50 pt-16"
    >
      <p
        className="sr-only"
        role="status"
        data-map-status={mapError ? "error" : mapReady ? "ready" : "loading"}
      >
        {mapError
          ? "Map unavailable"
          : mapReady
            ? "Map ready"
            : "Loading interactive map"}
      </p>
      <p className="sr-only" aria-live="polite">
        {statusMessage}
      </p>

      <header className="absolute inset-x-0 top-16 z-30 border-b border-line bg-sand-50/95 px-3 py-3 backdrop-blur-xl md:left-[23rem]">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <Link
            href={`/properties?${searchParams.toString()}`}
            className="grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-white text-forest-900 transition hover:bg-sand-100"
            aria-label="Back to property list"
          >
            <ArrowLeft className="size-4" />
          </Link>
          <label className="min-w-0 flex-1">
            <span className="sr-only">Search neighbourhood or city</span>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") searchLocation();
              }}
              placeholder="Search Yaba, Wuse, Lekki…"
              leadingIcon={Search}
            />
          </label>
          <button onClick={searchLocation} className="stitch-button px-4">
            <span className="hidden sm:inline">Search</span>
            <Search className="size-4 sm:hidden" />
          </button>
          <button
            onClick={() => setSheetOpen(true)}
            className="grid size-11 place-items-center rounded-lg border border-line bg-white text-forest-900 md:hidden"
            aria-label="Open map results and filters"
          >
            <SlidersHorizontal className="size-4" />
          </button>
        </div>
      </header>

      <aside className="absolute bottom-0 left-0 top-16 z-20 hidden w-[23rem] overflow-y-auto border-r border-line bg-sand-50 md:block">
        <ResultsPanel
          properties={visibleProperties}
          selectedId={selectedId}
          mappedCount={mappedProperties.length}
          unmappedCount={unmappedCount}
          onSelect={focusProperty}
          onHover={setHoveredId}
        />
      </aside>

      <div
        className={`absolute inset-x-0 bottom-0 top-[7.55rem] md:left-[23rem] md:top-[7.55rem] ${
          mobileMode === "list" ? "hidden md:block" : "block"
        }`}
      >
        <PropertyMapCanvas
          ref={canvasRef}
          properties={mappedProperties}
          selectedId={selectedId}
          hoveredId={hoveredId}
          route={route}
          userLocation={liveLocation}
          buildingsEnabled={buildingsEnabled}
          onSelect={(id) => {
            const property = mappedProperties.find((item) => item.id === id);
            if (property) {
              focusProperty(property);
              setStatusMessage(property.title);
            }
          }}
          onMove={() => setAreaSearchAvailable(true)}
          onReady={() => {
            setMapReady(true);
            setMapError(null);
            setAreaSearchAvailable(true);
            setStatusMessage("Map ready");
          }}
          onError={() => {
            setMapError("The live map tiles could not load");
            setStatusMessage(
              "The map could not load. Property results remain available.",
            );
          }}
          onBuildingStatus={handleBuildingStatus}
        />

        <div className="absolute right-3 top-3 z-20 flex flex-col gap-2">
          <button
            type="button"
            onClick={locateUser}
            className="grid size-11 place-items-center rounded-lg border border-line bg-white text-forest-900 shadow-[0_8px_24px_rgba(18,55,42,0.14)] transition hover:bg-sand-100"
            aria-label="Use my current location"
          >
            <LocateFixed className="size-4" />
          </button>
          <button
            type="button"
            onClick={openDirectionsPermission}
            disabled={!selected || routing || liveTracking}
            className="grid size-11 place-items-center rounded-lg border border-line bg-white text-forest-900 shadow-[0_8px_24px_rgba(18,55,42,0.14)] transition hover:bg-sand-100 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Directions from my location"
            aria-pressed={liveTracking}
          >
            <Route className={`size-4 ${routing ? "animate-pulse" : ""}`} />
          </button>
          <button
            type="button"
            onClick={toggleBuildings}
            className={`grid size-11 place-items-center rounded-lg border shadow-[0_8px_24px_rgba(18,55,42,0.14)] transition ${
              buildingsEnabled
                ? "border-forest-800 bg-forest-900 text-white"
                : "border-line bg-white text-forest-900 hover:bg-sand-100"
            }`}
            aria-label="Toggle 2.5D buildings"
            aria-pressed={buildingsEnabled}
          >
            <Building2 className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="grid size-11 place-items-center rounded-lg border border-line bg-white text-forest-900 shadow-[0_8px_24px_rgba(18,55,42,0.14)] md:hidden"
            aria-label="View property results"
          >
            <List className="size-4" />
          </button>
        </div>

        {routeSummary ? (
          <div className="absolute bottom-20 left-1/2 z-20 w-[min(22rem,calc(100%-1.5rem))] -translate-x-1/2 rounded-xl border border-white/80 bg-white/95 px-4 py-3 text-center shadow-[0_12px_34px_rgba(18,55,42,0.2)] backdrop-blur md:bottom-5">
            <p className="mb-1 flex items-center justify-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-forest-700">
              <Radio className="size-3 animate-pulse" />
              {liveTracking ? "Live location on" : "Route ready"}
            </p>
            <p className="text-xs font-extrabold text-ink">
              {(routeSummary.distanceMetres / 1000).toFixed(1)} km ·{" "}
              {Math.max(1, Math.round(routeSummary.durationSeconds / 60))} min
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-muted">
              Route ends at the public approximate property pin
            </p>
            {liveLocation ? (
              <p
                className={`mt-1 text-[10px] font-bold ${
                  liveLocation.accuracyMetres > 500
                    ? "text-amber-700"
                    : "text-primary"
                }`}
              >
                Browser accuracy: ±
                {liveLocation.accuracyMetres >= 1_000
                  ? `${(liveLocation.accuracyMetres / 1_000).toFixed(1)} km`
                  : `${Math.round(liveLocation.accuracyMetres)} m`}
              </p>
            ) : null}
            {liveLocation && liveLocation.accuracyMetres > 500 ? (
              <p className="mt-1 text-[10px] leading-4 text-amber-800">
                This device is giving an approximate position. Turn on precise
                location in your browser and operating-system settings.
              </p>
            ) : null}
            <div className="mt-1 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={startLiveDirections}
                disabled={routing}
                className="min-h-8 text-[10px] font-bold text-primary disabled:opacity-50"
              >
                {routing ? "Finding fresh GPS…" : "Refresh precise location"}
              </button>
              <button
                type="button"
                onClick={() => stopLiveDirections()}
                className="min-h-8 text-[10px] font-bold text-forest-700"
              >
                Stop
              </button>
            </div>
          </div>
        ) : null}

        {selected &&
        hasMapCoordinates(selected) &&
        !routeSummary &&
        !mapError ? (
          <div className="absolute bottom-5 left-5 z-20 hidden w-72 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-[0_16px_42px_rgba(18,55,42,0.2)] backdrop-blur md:block">
            <p className="text-xs font-extrabold text-ink">
              Get directions to this home
            </p>
            <p className="mt-1 text-[11px] leading-5 text-muted">
              See your live location and route to the approximate property pin.
            </p>
            <button
              type="button"
              onClick={openDirectionsPermission}
              disabled={routing}
              className="stitch-button mt-3 w-full justify-center disabled:opacity-60"
            >
              <LocateFixed className={`size-4 ${routing ? "animate-pulse" : ""}`} />
              {routing ? "Starting live directions…" : "Directions from my location"}
            </button>
            {locationError ? (
              <p className="mt-2 text-xs leading-5 text-red-700" role="alert">
                {locationError}
              </p>
            ) : null}
          </div>
        ) : null}

        <AnimatePresence>
          {areaSearchAvailable && mapReady && !mapError ? (
            <motion.button
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              type="button"
              className="stitch-button absolute left-1/2 top-3 z-20 -translate-x-1/2 shadow-[0_12px_30px_rgba(18,55,42,0.24)] disabled:opacity-60"
              onClick={() => {
                const bounds = canvasRef.current?.getBounds();
                if (bounds) void searchBounds(bounds);
              }}
              disabled={searchingArea}
            >
              <RefreshCw
                className={`size-4 ${searchingArea ? "animate-spin" : ""}`}
              />
              {searchingArea ? "Searching…" : "Search this area"}
            </motion.button>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {selected &&
          hasMapCoordinates(selected) &&
          !sheetOpen &&
          !routeSummary ? (
            <motion.article
              initial={
                reducedMotion ? { opacity: 0 } : { opacity: 0, y: 28, scale: 0.98 }
              }
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18 }}
              className="absolute inset-x-3 bottom-20 z-20 mx-auto max-w-sm overflow-hidden rounded-2xl border border-white/70 bg-white/95 p-3 shadow-[0_24px_60px_rgba(18,55,42,0.25)] backdrop-blur md:hidden"
            >
              <button
                type="button"
                onClick={() => setSelectedId(null)}
                className="absolute right-2 top-2 z-10 grid size-9 place-items-center rounded-full bg-white text-forest-900 shadow"
                aria-label="Close selected property"
              >
                <X className="size-4" />
              </button>
              <StitchPropertyCard property={selected} compact />
              {!routeSummary ? (
                <>
                  <button
                    type="button"
                    onClick={openDirectionsPermission}
                    disabled={routing}
                    className="stitch-button mt-3 w-full justify-center disabled:opacity-60"
                  >
                    <LocateFixed
                      className={`size-4 ${routing ? "animate-pulse" : ""}`}
                    />
                    {routing
                      ? "Starting live directions…"
                      : "Directions from my location"}
                  </button>
                  <p className="mt-2 text-center text-[10px] leading-4 text-muted">
                    We will ask before using your live location.
                  </p>
                  {locationError ? (
                    <p
                      className="mt-2 text-center text-xs leading-5 text-red-700"
                      role="alert"
                    >
                      {locationError}
                    </p>
                  ) : null}
                </>
              ) : null}
            </motion.article>
          ) : null}
        </AnimatePresence>

        {mapError ? (
          <div className="absolute inset-0 z-30 grid place-items-center bg-sand-100/95 p-6">
            <div className="max-w-md text-center">
              <MapPinned className="mx-auto size-10 text-forest-700" />
              <h2 className="mt-4 text-2xl font-extrabold text-ink">
                The live map is unavailable
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">
                {mapError}. You can keep browsing the full property list.
              </p>
              <div className="mt-5 flex justify-center gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="stitch-button"
                >
                  Try again
                </button>
                <button
                  onClick={() => setMobileMode("list")}
                  className="stitch-button stitch-button-secondary md:hidden"
                >
                  View list
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="fixed inset-x-3 bottom-3 z-40 mx-auto grid max-w-xs grid-cols-2 rounded-xl border border-line bg-white p-1 shadow-[0_16px_40px_rgba(18,55,42,0.22)] md:hidden">
        {(["map", "list"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setMobileMode(mode)}
            className={`flex min-h-11 items-center justify-center gap-2 rounded-lg text-sm font-bold capitalize transition ${
              mobileMode === mode
                ? "bg-forest-900 text-white"
                : "text-forest-800"
            }`}
            aria-pressed={mobileMode === mode}
          >
            {mode === "map" ? (
              <MapIcon className="size-4" />
            ) : (
              <List className="size-4" />
            )}
            {mode}
          </button>
        ))}
      </div>

      {mobileMode === "list" ? (
        <div className="absolute inset-x-0 bottom-0 top-[7.55rem] overflow-y-auto bg-sand-50 pb-24 md:hidden">
          <ResultsPanel
            properties={visibleProperties}
            selectedId={selectedId}
            mappedCount={mappedProperties.length}
            unmappedCount={unmappedCount}
            onSelect={focusProperty}
            onHover={setHoveredId}
          />
        </div>
      ) : null}

      <AnimatePresence>
        {sheetOpen ? (
          <>
            <motion.button
              type="button"
              aria-label="Close results sheet"
              className="fixed inset-0 z-40 bg-forest-950/35 md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSheetOpen(false)}
            />
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label="Map property results"
              className="fixed inset-x-0 bottom-0 z-50 max-h-[78dvh] overflow-y-auto rounded-t-3xl bg-sand-50 pb-10 shadow-[0_-24px_60px_rgba(18,55,42,0.25)] md:hidden"
              initial={reducedMotion ? { opacity: 0 } : { y: "100%" }}
              animate={reducedMotion ? { opacity: 1 } : { y: 0 }}
              exit={reducedMotion ? { opacity: 0 } : { y: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-sand-50/95 px-5 py-4 backdrop-blur">
                <div>
                  <p className="text-xs font-bold text-forest-700">
                    {visibleProperties.length} results
                  </p>
                  <h2 className="text-lg font-extrabold text-ink">
                    Homes in this area
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setSheetOpen(false)}
                  className="grid size-11 place-items-center rounded-full border border-line bg-white"
                  aria-label="Close results"
                >
                  <ChevronDown className="size-5" />
                </button>
              </div>
              <ResultsPanel
                properties={visibleProperties}
                selectedId={selectedId}
                mappedCount={mappedProperties.length}
                unmappedCount={unmappedCount}
                onSelect={focusProperty}
                onHover={setHoveredId}
                compactHeader
              />
            </motion.section>
          </>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {permissionPromptOpen && selected ? (
          <>
            <motion.button
              type="button"
              aria-label="Close location permission explanation"
              className="fixed inset-0 z-[60] bg-forest-950/55 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPermissionPromptOpen(false)}
            />
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="location-permission-title"
              aria-describedby="location-permission-description"
              className="fixed inset-x-4 top-1/2 z-[70] mx-auto max-w-md -translate-y-1/2 rounded-3xl border border-white/80 bg-sand-50 p-6 shadow-[0_30px_90px_rgba(8,35,26,0.38)] sm:p-7"
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.97 }
              }
              animate={{ opacity: 1, scale: 1 }}
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.98 }
              }
            >
              <div className="grid size-12 place-items-center rounded-2xl bg-forest-900 text-white">
                <ShieldCheck className="size-6" />
              </div>
              <h2
                id="location-permission-title"
                className="mt-5 text-2xl font-extrabold tracking-tight text-ink"
              >
                Use your location for live directions?
              </h2>
              <p
                id="location-permission-description"
                className="mt-3 text-sm leading-6 text-muted"
              >
                After you continue, your browser will ask for location
                permission. LinkConn uses it only to draw and update your route
                to {selected.title}; it is not saved or shared with the
                landlord.
              </p>
              <div className="mt-4 rounded-xl border border-line bg-white p-3 text-xs leading-5 text-forest-800">
                For privacy, the route ends at the home&apos;s public
                approximate pin. The exact address stays protected.
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPermissionPromptOpen(false)}
                  className="stitch-button stitch-button-secondary justify-center"
                >
                  Not now
                </button>
                <button
                  type="button"
                  onClick={startLiveDirections}
                  className="stitch-button justify-center"
                >
                  <LocateFixed className="size-4" />
                  Allow location
                </button>
              </div>
            </motion.section>
          </>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

function ResultsPanel({
  properties,
  selectedId,
  mappedCount,
  unmappedCount,
  onSelect,
  onHover,
  compactHeader = false,
}: {
  properties: Property[];
  selectedId: string | null;
  mappedCount: number;
  unmappedCount: number;
  // eslint-disable-next-line no-unused-vars
  onSelect(...args: [Property]): void;
  // eslint-disable-next-line no-unused-vars
  onHover(...args: [string | null]): void;
  compactHeader?: boolean;
}) {
  return (
    <div className="p-4 sm:p-5">
      {!compactHeader ? (
        <div className="mb-5">
          <p className="text-xs font-bold tracking-[0.12em] text-forest-700">
            Verified map search
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink">
            Homes across Nigeria
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            {mappedCount} mapped homes. Pins show an approximate area until a
            viewing is confirmed.
          </p>
        </div>
      ) : null}

      {unmappedCount > 0 ? (
        <div className="mb-4 rounded-xl bg-amber-50 p-3 text-xs leading-5 text-amber-900">
          {unmappedCount}{" "}
          {unmappedCount === 1 ? "listing is" : "listings are"} available in
          the results but excluded from the map until location verification is
          complete.
        </div>
      ) : null}

      {properties.length ? (
        <div className="space-y-4">
          {properties.map((property) => (
              <div
                key={property.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelect(property)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(property);
                  }
                }}
                onMouseEnter={() => onHover(property.id)}
                onMouseLeave={() => onHover(null)}
                onFocus={() => onHover(property.id)}
                onBlur={() => onHover(null)}
                className={`block w-full rounded-2xl text-left transition ${
                selectedId === property.id
                  ? "ring-2 ring-forest-600 ring-offset-2 ring-offset-sand-50"
                  : ""
                }`}
                aria-pressed={selectedId === property.id}
                aria-label={`Focus ${property.title} on the map`}
              >
                <StitchPropertyCard property={property} compact />
              </div>
          ))}
        </div>
      ) : (
        <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed border-line bg-white p-8 text-center">
          <div>
            <MapPinned className="mx-auto size-9 text-forest-600" />
            <h2 className="mt-4 text-lg font-extrabold text-ink">
              No homes in this map area
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              Move the map or return to the full search to adjust your filters.
            </p>
            <Link href="/properties" className="stitch-button mt-5">
              View all homes
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
