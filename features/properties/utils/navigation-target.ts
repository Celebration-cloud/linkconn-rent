import type { PropertyNavigationTarget } from "@/features/properties/types/navigation";

type NavigationRecord = {
  id: string;
  title: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
};

export function mapNavigationTarget(
  record: NavigationRecord | null,
): PropertyNavigationTarget | null {
  if (
    !record ||
    typeof record.latitude !== "number" ||
    !Number.isFinite(record.latitude) ||
    record.latitude < -90 ||
    record.latitude > 90 ||
    typeof record.longitude !== "number" ||
    !Number.isFinite(record.longitude) ||
    record.longitude < -180 ||
    record.longitude > 180
  ) return null;
  return {
    propertyId: record.id,
    title: record.title,
    location: record.location,
    latitude: record.latitude,
    longitude: record.longitude,
  };
}
