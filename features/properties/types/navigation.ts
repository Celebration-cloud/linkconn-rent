export type NavigationCoordinates = {
  latitude: number;
  longitude: number;
};

export type PropertyNavigationTarget = NavigationCoordinates & {
  propertyId: string;
  title: string;
  location: string;
};

export type RouteGeometry = {
  type: "LineString";
  coordinates: [number, number][];
};

export type RouteStep = {
  instruction: string;
  maneuverType: string;
  modifier: string | null;
  roadName: string;
  location: [number, number];
  distanceMetres: number;
  durationSeconds: number;
};

export type PropertyRoute = {
  geometry: RouteGeometry;
  origin: [number, number];
  destination: [number, number];
  distanceMetres: number;
  durationSeconds: number;
  steps: RouteStep[];
};
