export type GeographicCoordinates = {
  longitude: number;
  latitude: number;
  accuracyMetres?: number;
};

export type PropertyMapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

export function distanceBetweenMetres(
  first: GeographicCoordinates,
  second: GeographicCoordinates,
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

export function addBoundsToQuery(query: URLSearchParams, bounds: PropertyMapBounds) {
  const next = new URLSearchParams(query);
  next.set("north", String(bounds.north));
  next.set("south", String(bounds.south));
  next.set("east", String(bounds.east));
  next.set("west", String(bounds.west));
  next.set("mode", "map");
  next.delete("page");
  return next;
}
