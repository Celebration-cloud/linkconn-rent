import type { Property } from "@/domain/types/property";
import type {
  NavigationCoordinates,
  RouteGeometry,
  RouteStep,
} from "@/features/properties/types/navigation";
import { distanceBetweenMetres } from "./map-geometry";

export function formatManeuverInstruction(input: {
  type: string;
  modifier?: string | null;
  roadName?: string;
}) {
  const road = input.roadName?.trim();
  const suffix = road ? ` onto ${road}` : "";
  const modifier = input.modifier?.replaceAll("_", " ") || "";
  switch (input.type) {
    case "depart":
      return road ? `Start on ${road}` : "Start driving";
    case "arrive":
      return "You have arrived at the property";
    case "turn":
      return `Turn ${modifier || "ahead"}${suffix}`;
    case "continue":
    case "new name":
      return `Continue${modifier ? ` ${modifier}` : ""}${suffix}`;
    case "merge":
      return `Merge${modifier ? ` ${modifier}` : ""}${suffix}`;
    case "fork":
      return `Keep ${modifier || "ahead"}${suffix}`;
    case "roundabout":
    case "rotary":
      return `Enter the roundabout${suffix}`;
    case "on ramp":
      return `Take the ramp${modifier ? ` ${modifier}` : ""}${suffix}`;
    case "off ramp":
      return `Take the exit${modifier ? ` ${modifier}` : ""}${suffix}`;
    case "end of road":
      return `At the end of the road, turn ${modifier || "ahead"}${suffix}`;
    default:
      return road ? `Continue on ${road}` : "Continue on the route";
  }
}

function closestGeometryIndex(
  location: NavigationCoordinates,
  coordinates: [number, number][],
) {
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;
  coordinates.forEach(([longitude, latitude], index) => {
    const distance = distanceBetweenMetres(location, { latitude, longitude });
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });
  return closestIndex;
}

export function findActiveRouteStepIndex(
  location: NavigationCoordinates,
  geometry: RouteGeometry,
  steps: RouteStep[],
) {
  if (!steps.length || !geometry.coordinates.length) return 0;
  const routeIndex = closestGeometryIndex(location, geometry.coordinates);
  const maneuverIndices = steps.map((step) =>
    closestGeometryIndex(
      { latitude: step.location[1], longitude: step.location[0] },
      geometry.coordinates,
    ),
  );
  let active = 0;
  for (let index = 1; index < maneuverIndices.length; index += 1) {
    if (routeIndex >= maneuverIndices[index]) active = index;
  }
  return active;
}

export function shouldReroute(input: {
  previous: (NavigationCoordinates & { accuracyMetres: number; requestedAt: number }) | null;
  current: NavigationCoordinates & { accuracyMetres: number };
  now: number;
}) {
  if (!input.previous) return true;
  if (input.current.accuracyMetres + 25 < input.previous.accuracyMetres) return true;
  return (
    input.now - input.previous.requestedAt >= 15_000 &&
    distanceBetweenMetres(input.previous, input.current) >= 20
  );
}

export function hasArrived(
  current: NavigationCoordinates & { accuracyMetres: number },
  destination: NavigationCoordinates,
) {
  const threshold = Math.max(35, Math.min(100, current.accuracyMetres));
  return distanceBetweenMetres(current, destination) <= threshold;
}

export type ComparisonMetricKey = "rent" | "moveIn" | "area" | "distance";

export function getComparisonHighlights(
  properties: Property[],
  distances: Record<string, number | null>,
) {
  const finiteMinimum = (entries: Array<[string, number | null | undefined]>) => {
    const valid = entries.filter((entry): entry is [string, number] =>
      typeof entry[1] === "number" && Number.isFinite(entry[1]),
    );
    if (!valid.length) return new Set<string>();
    const value = Math.min(...valid.map((entry) => entry[1]));
    return new Set(valid.filter((entry) => entry[1] === value).map(([id]) => id));
  };
  const finiteMaximum = (entries: Array<[string, number]>) => {
    if (!entries.length) return new Set<string>();
    const value = Math.max(...entries.map((entry) => entry[1]));
    return new Set(entries.filter((entry) => entry[1] === value).map(([id]) => id));
  };
  return {
    rent: finiteMinimum(properties.map((property) => [property.id, property.price])),
    moveIn: finiteMinimum(properties.map((property) => [property.id, property.moveInEstimate])),
    area: finiteMaximum(properties.map((property) => [property.id, property.area])),
    distance: finiteMinimum(properties.map((property) => [property.id, distances[property.id]])),
  } satisfies Record<ComparisonMetricKey, Set<string>>;
}

export function rowHasDifferences(values: string[]) {
  return new Set(values).size > 1;
}
