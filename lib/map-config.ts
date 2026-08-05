export type MapCoordinates = {
  latitude: number;
  longitude: number;
};

const DEVELOPMENT_TILE_URL =
  "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const DEVELOPMENT_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors · Property pins are approximate';

export const NIGERIA_MAP_BOUNDS = {
  west: 2.67,
  south: 4.27,
  east: 14.68,
  north: 13.89,
} as const;

export const MAP_CONFIG = {
  tileUrl: process.env.NEXT_PUBLIC_LEAFLET_TILE_URL || DEVELOPMENT_TILE_URL,
  tileAttribution:
    process.env.NEXT_PUBLIC_LEAFLET_TILE_ATTRIBUTION ||
    DEVELOPMENT_ATTRIBUTION,
  usesDevelopmentTiles: !process.env.NEXT_PUBLIC_LEAFLET_TILE_URL,
  center: { longitude: 7.49, latitude: 9.08 } satisfies MapCoordinates,
  defaultZoom: 5.2,
  minZoom: 4,
  maxZoom: 19,
  clusterRadius: 52,
  clusterMaxZoom: 13,
  publicOffsetMetres: 340,
  buildingMinZoom: 16,
  buildingRadiusMetres: 300,
  buildingMaxRadiusMetres: 400,
  buildingFeatureLimit: 250,
  directionsUrl:
    process.env.DIRECTIONS_API_URL ||
    (process.env.NODE_ENV === "production"
      ? null
      : "https://router.project-osrm.org"),
} as const;

export const NIGERIAN_CITY_CENTRES: Record<string, MapCoordinates> = {
  Lagos: { longitude: 3.3792, latitude: 6.5244 },
  Abuja: { longitude: 7.3986, latitude: 9.0765 },
  Ibadan: { longitude: 3.947, latitude: 7.3775 },
  "Port Harcourt": { longitude: 7.0134, latitude: 4.8156 },
};

export function hasMapCoordinates(value: {
  latitude?: number | null;
  longitude?: number | null;
}): value is { latitude: number; longitude: number } {
  return (
    typeof value.latitude === "number" &&
    Number.isFinite(value.latitude) &&
    typeof value.longitude === "number" &&
    Number.isFinite(value.longitude)
  );
}

export function assertProductionMapConfiguration() {
  if (
    process.env.NODE_ENV === "production" &&
    (!process.env.NEXT_PUBLIC_LEAFLET_TILE_URL ||
      !process.env.NEXT_PUBLIC_LEAFLET_TILE_ATTRIBUTION)
  ) {
    console.warn(
      "[map] Configure NEXT_PUBLIC_LEAFLET_TILE_URL and NEXT_PUBLIC_LEAFLET_TILE_ATTRIBUTION before production deployment. Public OpenStreetMap tiles are a local-development fallback only.",
    );
  }
}
