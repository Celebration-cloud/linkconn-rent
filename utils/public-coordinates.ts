import { MAP_CONFIG } from "@/lib/map-config";

function hashSeed(seed: string) {
  let value = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    value ^= seed.charCodeAt(index);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

export function createApproximateCoordinates(
  latitude: number,
  longitude: number,
  seed: string,
) {
  const hash = hashSeed(seed);
  const angle = ((hash % 360) * Math.PI) / 180;
  const distance =
    MAP_CONFIG.publicOffsetMetres * (0.65 + ((hash >>> 8) % 36) / 100);
  const latitudeOffset = (distance * Math.cos(angle)) / 111_320;
  const longitudeScale = Math.max(
    Math.cos((latitude * Math.PI) / 180),
    0.2,
  );
  const longitudeOffset =
    (distance * Math.sin(angle)) / (111_320 * longitudeScale);

  return {
    publicLatitude: Number((latitude + latitudeOffset).toFixed(6)),
    publicLongitude: Number((longitude + longitudeOffset).toFixed(6)),
  };
}
