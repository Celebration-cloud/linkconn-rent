import { z } from "zod";
import type {
  BuildingFeature,
  BuildingFeatureCollection,
} from "@/schemas/map-buildings";

const pointSchema = z.object({
  lat: z.number().finite().min(-90).max(90),
  lon: z.number().finite().min(-180).max(180),
});

const tagsSchema = z.record(z.string()).optional();

const waySchema = z.object({
  type: z.literal("way"),
  id: z.number().int(),
  tags: tagsSchema,
  geometry: z.array(pointSchema).optional(),
});

const relationSchema = z.object({
  type: z.literal("relation"),
  id: z.number().int(),
  tags: tagsSchema,
  members: z
    .array(
      z.object({
        type: z.string(),
        role: z.string().optional(),
        geometry: z.array(pointSchema).optional(),
      }),
    )
    .optional(),
});

export const overpassResponseSchema = z.object({
  elements: z.array(z.union([waySchema, relationSchema])).default([]),
});

const MIN_BUILDING_HEIGHT = 3;
const MAX_BUILDING_HEIGHT = 120;
const DEFAULT_BUILDING_HEIGHT = 6;

function parsePositiveNumber(value: string | undefined) {
  if (!value) return null;
  const parsed = Number.parseFloat(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function normalizeBuildingHeight(
  tags: Record<string, string> | undefined,
) {
  const explicitHeight = parsePositiveNumber(tags?.height);
  const levels = parsePositiveNumber(tags?.["building:levels"]);
  const height = explicitHeight ?? (levels ? levels * 3 : DEFAULT_BUILDING_HEIGHT);
  return Math.min(
    MAX_BUILDING_HEIGHT,
    Math.max(MIN_BUILDING_HEIGHT, Math.round(height * 10) / 10),
  );
}

function closeRing(
  geometry: z.infer<typeof pointSchema>[] | undefined,
): [number, number][] | null {
  if (!geometry || geometry.length < 3) return null;
  const ring = geometry.map(({ lon, lat }) => [lon, lat] as [number, number]);
  const first = ring[0];
  const last = ring.at(-1);
  if (first[0] !== last?.[0] || first[1] !== last?.[1]) {
    ring.push([...first]);
  }
  return ring.length >= 4 ? ring : null;
}

function createFeature(
  id: string,
  osmId: number,
  tags: Record<string, string> | undefined,
  geometry: z.infer<typeof pointSchema>[] | undefined,
): BuildingFeature | null {
  const ring = closeRing(geometry);
  if (!ring) return null;
  return {
    type: "Feature",
    id,
    geometry: { type: "Polygon", coordinates: [ring] },
    properties: {
      osmId,
      heightMetres: normalizeBuildingHeight(tags),
    },
  };
}

export function convertOverpassBuildings(
  input: unknown,
  featureLimit: number,
): BuildingFeatureCollection {
  const response = overpassResponseSchema.parse(input);
  const features: BuildingFeature[] = [];

  for (const element of response.elements) {
    if (features.length >= featureLimit) break;
    if (element.type === "way") {
      const feature = createFeature(
        `way-${element.id}`,
        element.id,
        element.tags,
        element.geometry,
      );
      if (feature) features.push(feature);
      continue;
    }

    for (const [index, member] of (element.members || []).entries()) {
      if (features.length >= featureLimit) break;
      if (member.type !== "way" || (member.role && member.role !== "outer")) {
        continue;
      }
      const feature = createFeature(
        `relation-${element.id}-${index}`,
        element.id,
        element.tags,
        member.geometry,
      );
      if (feature) features.push(feature);
    }
  }

  return { type: "FeatureCollection", features };
}

export function getOverpassProviderUrl() {
  return (
    process.env.OVERPASS_API_URL ||
    (process.env.NODE_ENV === "production"
      ? null
      : "https://overpass-api.de/api/interpreter")
  );
}

export function buildOverpassQuery({
  latitude,
  longitude,
  radius,
}: {
  latitude: number;
  longitude: number;
  radius: number;
}) {
  return `[out:json][timeout:8];(way["building"](around:${radius},${latitude},${longitude});relation["building"](around:${radius},${latitude},${longitude}););out tags geom;`;
}
