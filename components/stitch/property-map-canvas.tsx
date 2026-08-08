"use client";

import L, {
  type LatLngExpression,
  type Map as LeafletMap,
  type Marker as LeafletMarker,
} from "leaflet";
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Pane,
  Polygon,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { Property } from "@/domain/types/property";
import { MAP_CONFIG } from "@/lib/map-config";
import type {
  BuildingFeature,
  BuildingFeatureCollection,
} from "@/schemas/map-buildings";
import { formatCompactNaira } from "@/utils/map-property";

export type MapViewportBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export type MapCanvasHandle = {
  // Parameter labels document the public imperative API.
  // eslint-disable-next-line no-unused-vars
  focusProperty(...args: [string]): void;
  // eslint-disable-next-line no-unused-vars
  focusCoordinates(...args: [number, number, number?]): void;
  getBounds: () => MapViewportBounds | null;
  // eslint-disable-next-line no-unused-vars
  setBuildingsEnabled(...args: [boolean]): boolean;
};

export type MapRoute = {
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  origin: [number, number];
  destination: [number, number];
};

export type MapUserLocation = {
  longitude: number;
  latitude: number;
  accuracyMetres: number;
};

type MappedProperty = Property & {
  latitude: number;
  longitude: number;
};

type BuildingsEnvelope = {
  success: boolean;
  data?: BuildingFeatureCollection;
  message: string;
};

/* eslint-disable no-unused-vars */
type BuildingStatusCallback = (
  status: "idle" | "loading" | "ready" | "unavailable",
  message?: string,
) => void;
/* eslint-enable no-unused-vars */

function isMappedProperty(property: Property): property is MappedProperty {
  return (
    typeof property.latitude === "number" &&
    Number.isFinite(property.latitude) &&
    typeof property.longitude === "number" &&
    Number.isFinite(property.longitude)
  );
}

function createPriceIcon(
  property: MappedProperty,
  selected: boolean,
  hovered: boolean,
) {
  const state = selected ? "selected" : hovered ? "hovered" : "default";
  return L.divIcon({
    className: "linkconn-property-marker-shell",
    html: `<span class="linkconn-property-marker linkconn-property-marker--${state}">${formatCompactNaira(property.price)}</span>`,
    iconAnchor: [38, 36],
    iconSize: [76, 36],
  });
}

function createClusterIcon(cluster: L.MarkerCluster) {
  const count = cluster.getChildCount();
  return L.divIcon({
    className: "linkconn-cluster-shell",
    html: `<span class="linkconn-cluster-marker">${count}</span>`,
    iconSize: [48, 48],
  });
}

function AccessiblePropertyMarker({
  property,
  selected,
  hovered,
  onSelect,
}: {
  property: MappedProperty;
  selected: boolean;
  hovered: boolean;
  // eslint-disable-next-line no-unused-vars
  onSelect(...args: [string]): void;
}) {
  const markerRef = useRef<LeafletMarker>(null);
  const label = `${property.title}, ${formatCompactNaira(property.price)}`;
  const icon = useMemo(
    () => createPriceIcon(property, selected, hovered),
    [hovered, property, selected],
  );

  useEffect(() => {
    const element = markerRef.current?.getElement();
    if (!element) return;
    element.setAttribute("role", "button");
    element.setAttribute("aria-label", label);
    element.setAttribute("aria-pressed", String(selected));
  }, [label, selected]);

  return (
    <Marker
      ref={markerRef}
      position={[property.latitude, property.longitude]}
      icon={icon}
      keyboard
      riseOnHover
      zIndexOffset={selected ? 1000 : hovered ? 500 : 0}
      eventHandlers={{
        click: () => onSelect(property.id),
        keypress: (event) => {
          const original = event.originalEvent as KeyboardEvent | undefined;
          if (original?.key === "Enter" || original?.key === " ") {
            original.preventDefault();
            onSelect(property.id);
          }
        },
      }}
    >
      {selected ? (
        <Tooltip
          permanent
          direction="bottom"
          offset={[0, 14]}
          className="linkconn-property-label"
        >
          <strong>{property.title}</strong>
          <span>
            {property.location}, {property.city}
          </span>
        </Tooltip>
      ) : null}
    </Marker>
  );
}

function MapEventBridge({
  onMove,
}: {
  onMove: () => void;
}) {
  useMapEvents({
    moveend: onMove,
  });
  return null;
}

function ResizeBridge() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => map.invalidateSize(false));
    observer.observe(container);
    return () => observer.disconnect();
  }, [map]);

  return null;
}

function projectBuilding(
  map: LeafletMap,
  feature: BuildingFeature,
): {
  base: LatLngExpression[];
  roof: LatLngExpression[];
  shadow: LatLngExpression[];
  facades: LatLngExpression[][];
} {
  const ring = feature.geometry.coordinates[0];
  const base = ring.map(
    ([longitude, latitude]) => [latitude, longitude] as LatLngExpression,
  );
  const offset = Math.min(
    24,
    Math.max(3, feature.properties.heightMetres * 0.14),
  );
  const roof = base.map((latLng) => {
    const point = map.latLngToLayerPoint(latLng);
    return map.layerPointToLatLng(
      L.point(point.x - offset * 0.55, point.y - offset),
    );
  });
  const shadow = base.map((latLng) => {
    const point = map.latLngToLayerPoint(latLng);
    return map.layerPointToLatLng(
      L.point(point.x + offset * 0.35, point.y + offset * 0.4),
    );
  });
  const facades = base.slice(0, -1).map((point, index) => [
    point,
    base[index + 1],
    roof[index + 1],
    roof[index],
  ]);

  return { base, roof, shadow, facades };
}

function BuildingsLayer({
  enabled,
  selected,
  onStatus,
}: {
  enabled: boolean;
  selected: MappedProperty | null;
  // eslint-disable-next-line no-unused-vars
  onStatus(...args: ["idle" | "loading" | "ready" | "unavailable", string?]): void;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  const [renderVersion, setRenderVersion] = useState(0);
  const [features, setFeatures] = useState<BuildingFeature[]>([]);

  useMapEvents({
    zoomend: () => {
      setZoom(map.getZoom());
      setRenderVersion((value) => value + 1);
    },
    moveend: () => setRenderVersion((value) => value + 1),
  });

  useEffect(() => {
    if (!enabled || !selected || zoom < MAP_CONFIG.buildingMinZoom) {
      setFeatures([]);
      onStatus(
        "idle",
        enabled && selected
          ? `Zoom to level ${MAP_CONFIG.buildingMinZoom} to see 2.5D buildings`
          : undefined,
      );
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      latitude: String(selected.latitude),
      longitude: String(selected.longitude),
      radius: String(MAP_CONFIG.buildingRadiusMetres),
    });
    onStatus("loading", "Loading nearby 2.5D building detail");

    void fetch(`/api/maps/buildings?${params}`, {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = (await response.json()) as BuildingsEnvelope;
        if (!response.ok || !result.success || !result.data) {
          throw new Error(result.message || "Building detail is unavailable");
        }
        setFeatures(result.data.features);
        onStatus(
          "ready",
          result.data.features.length
            ? `${result.data.features.length} nearby buildings rendered in 2.5D`
            : "No mapped building footprints were found nearby",
        );
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setFeatures([]);
        onStatus(
          "unavailable",
          error instanceof Error
            ? error.message
            : "Building detail is unavailable",
        );
      });

    return () => controller.abort();
  }, [enabled, onStatus, selected, zoom]);

  // Movement changes renderVersion and re-renders the screen-space projection.
  void renderVersion;
  const projected = features.map((feature) => ({
    id: feature.id,
    geometry: projectBuilding(map, feature),
  }));

  if (!enabled || zoom < MAP_CONFIG.buildingMinZoom || !projected.length) {
    return null;
  }

  return (
    <>
      <Pane name="building-shadow" className="leaflet-building-shadow-pane">
        {projected.map(({ id, geometry }) => (
          <Polygon
            key={`shadow-${id}`}
            positions={geometry.shadow}
            pathOptions={{
              color: "transparent",
              fillColor: "#08231a",
              fillOpacity: 0.12,
              interactive: false,
            }}
          />
        ))}
      </Pane>
      <Pane name="building-facade" className="leaflet-building-facade-pane">
        {projected.flatMap(({ id, geometry }) =>
          geometry.facades.map((facade, index) => (
            <Polygon
              key={`facade-${id}-${index}`}
              positions={facade}
              pathOptions={{
                color: "#789081",
                weight: 0.5,
                fillColor: index % 2 ? "#8fa99a" : "#718f7e",
                fillOpacity: 0.78,
                interactive: false,
              }}
            />
          )),
        )}
      </Pane>
      <Pane name="building-roof" className="leaflet-building-roof-pane">
        {projected.map(({ id, geometry }) => (
          <Polygon
            key={`roof-${id}`}
            positions={geometry.roof}
            pathOptions={{
              color: "#4d6f5e",
              weight: 0.8,
              fillColor: "#b7c8b8",
              fillOpacity: 0.92,
              interactive: false,
            }}
          />
        ))}
      </Pane>
    </>
  );
}

export const PropertyMapCanvas = forwardRef<
  MapCanvasHandle,
  {
    properties: Property[];
    selectedId: string | null;
    hoveredId: string | null;
    route: MapRoute | null;
    userLocation: MapUserLocation | null;
    buildingsEnabled: boolean;
    // eslint-disable-next-line no-unused-vars
    onSelect(...args: [string]): void;
    onMove: () => void;
    onReady: () => void;
    onError: () => void;
    onBuildingStatus: BuildingStatusCallback;
  }
>(function PropertyMapCanvas(
  {
    properties,
    selectedId,
    hoveredId,
    route,
    userLocation,
    buildingsEnabled,
    onSelect,
    onMove,
    onReady,
    onError,
    onBuildingStatus,
  },
  forwardedRef,
) {
  const mapRef = useRef<LeafletMap>(null);
  const readyReported = useRef(false);
  const tileErrors = useRef(0);
  const [mapInitialized, setMapInitialized] = useState(false);
  const mappedProperties = useMemo(
    () => properties.filter(isMappedProperty),
    [properties],
  );
  const selected =
    mappedProperties.find((property) => property.id === selectedId) || null;

  const reportReady = useCallback(() => {
    if (readyReported.current) return;
    readyReported.current = true;
    onReady();
  }, [onReady]);

  const focusProperty = useCallback(
    (propertyId: string) => {
      const property = mappedProperties.find((item) => item.id === propertyId);
      const map = mapRef.current;
      if (!property || !map) return;
      map.flyTo(
        [property.latitude, property.longitude],
        Math.max(map.getZoom(), buildingsEnabled ? 16 : 13),
        { animate: true, duration: 0.65 },
      );
    },
    [buildingsEnabled, mappedProperties],
  );

  useImperativeHandle(
    forwardedRef,
    () => ({
      focusProperty,
      focusCoordinates(longitude, latitude, zoom = 13) {
        mapRef.current?.flyTo([latitude, longitude], zoom, {
          animate: true,
          duration: 0.7,
        });
      },
      getBounds() {
        const bounds = mapRef.current?.getBounds();
        if (!bounds) return null;
        return {
          north: Number(bounds.getNorth().toFixed(6)),
          south: Number(bounds.getSouth().toFixed(6)),
          east: Number(bounds.getEast().toFixed(6)),
          west: Number(bounds.getWest().toFixed(6)),
        };
      },
      setBuildingsEnabled() {
        return Boolean(mapRef.current);
      },
    }),
    [focusProperty],
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!mapInitialized || !map || !mappedProperties.length || route) return;
    if (mappedProperties.length === 1) {
      map.setView(
        [mappedProperties[0].latitude, mappedProperties[0].longitude],
        12,
        { animate: false },
      );
      return;
    }
    map.fitBounds(
      mappedProperties.map(
        ({ latitude, longitude }) => [latitude, longitude] as [number, number],
      ),
      { padding: [72, 72], maxZoom: 12, animate: false },
    );
  }, [mapInitialized, mappedProperties, route]);

  useEffect(() => {
    const map = mapRef.current;
    if (!mapInitialized || !map || !route?.geometry.coordinates.length) return;
    map.fitBounds(
      route.geometry.coordinates.map(
        ([longitude, latitude]) => [latitude, longitude] as [number, number],
      ),
      { padding: [72, 72], maxZoom: 15, animate: true, duration: 0.9 },
    );
  }, [mapInitialized, route]);

  return (
    <MapContainer
      ref={mapRef}
      center={[MAP_CONFIG.center.latitude, MAP_CONFIG.center.longitude]}
      zoom={MAP_CONFIG.defaultZoom}
      minZoom={MAP_CONFIG.minZoom}
      maxZoom={MAP_CONFIG.maxZoom}
      zoomControl={false}
      attributionControl
      className="h-full w-full bg-[#e8eee9]"
      whenReady={() => setMapInitialized(true)}
    >
      <TileLayer
        url={MAP_CONFIG.tileUrl}
        attribution={MAP_CONFIG.tileAttribution}
        maxZoom={MAP_CONFIG.maxZoom}
        eventHandlers={{
          load: () => {
            if (tileErrors.current >= 4) {
              onError();
              return;
            }
            reportReady();
          },
          tileerror: () => {
            tileErrors.current += 1;
            if (!readyReported.current && tileErrors.current >= 4) onError();
          },
        }}
      />
      <ZoomControl position="bottomright" />
      <ResizeBridge />
      <MapEventBridge onMove={onMove} />
      <BuildingsLayer
        enabled={buildingsEnabled}
        selected={selected}
        onStatus={onBuildingStatus}
      />

      {route ? (
        <>
          <Pane name="route" className="leaflet-route-pane">
            <Polyline
              positions={route.geometry.coordinates.map(
                ([longitude, latitude]) =>
                  [latitude, longitude] as LatLngExpression,
              )}
              pathOptions={{
                color: "#ffffff",
                weight: 9,
                opacity: 0.9,
                lineCap: "round",
                lineJoin: "round",
                interactive: false,
              }}
            />
            <Polyline
              positions={route.geometry.coordinates.map(
                ([longitude, latitude]) =>
                  [latitude, longitude] as LatLngExpression,
              )}
              pathOptions={{
                color: "#237a57",
                weight: 5,
                lineCap: "round",
                lineJoin: "round",
                interactive: false,
              }}
            />
          </Pane>
          <CircleMarker
            center={[route.destination[1], route.destination[0]]}
            radius={8}
            pathOptions={{
              color: "#ffffff",
              weight: 3,
              fillColor: "#b8e36e",
              fillOpacity: 1,
            }}
          >
            <Tooltip>Exact property destination</Tooltip>
          </CircleMarker>
        </>
      ) : null}

      {userLocation ? (
        <>
          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={userLocation.accuracyMetres}
            pathOptions={{
              color: "#006041",
              weight: 1,
              fillColor: "#b8e36e",
              fillOpacity: 0.12,
              interactive: false,
            }}
          />
          <CircleMarker
            center={[userLocation.latitude, userLocation.longitude]}
            radius={9}
            pathOptions={{
              color: "#ffffff",
              weight: 4,
              fillColor: "#006041",
              fillOpacity: 1,
            }}
          >
            <Tooltip permanent>
              Your live location · accurate to about{" "}
              {Math.round(userLocation.accuracyMetres)} m
            </Tooltip>
          </CircleMarker>
        </>
      ) : route ? (
        <CircleMarker
          center={[route.origin[1], route.origin[0]]}
          radius={9}
          pathOptions={{
            color: "#ffffff",
            weight: 4,
            fillColor: "#006041",
            fillOpacity: 1,
          }}
        >
          <Tooltip>Your route starting point</Tooltip>
        </CircleMarker>
      ) : null}

      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={MAP_CONFIG.clusterRadius}
        disableClusteringAtZoom={MAP_CONFIG.clusterMaxZoom + 1}
        showCoverageOnHover={false}
        spiderfyOnMaxZoom
        zoomToBoundsOnClick
        iconCreateFunction={createClusterIcon}
      >
        {mappedProperties.map((property) => (
          <AccessiblePropertyMarker
            key={property.id}
            property={property}
            selected={selectedId === property.id}
            hovered={hoveredId === property.id}
            onSelect={(id) => {
              onSelect(id);
              focusProperty(id);
            }}
          />
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
});
