import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import type { Property } from "@/domain/types/property";
import { FALLBACK_PROPERTIES } from "@/domain/constants/mock-properties";
import { propertyCacheTags } from "@/lib/cache/property-tags";
import { PropertyRepository } from "@/repositories/property.repository";
import { mapProperty } from "@/utils/map-property";

export async function getFeaturedProperties(): Promise<Property[]> {
  "use cache";
  cacheLife({ stale: 300, revalidate: 3600, expire: 86400 });
  cacheTag(propertyCacheTags.all, propertyCacheTags.featured);

  try {
    const records = await PropertyRepository.listAll();
    return records.length ? records.map(mapProperty) : FALLBACK_PROPERTIES;
  } catch {
    return FALLBACK_PROPERTIES;
  }
}

export async function getPublicProperty(
  propertyId: string,
): Promise<Property | null> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  cacheTag(propertyCacheTags.all, propertyCacheTags.detail(propertyId));

  try {
    const record = await PropertyRepository.findById(propertyId);
    return record ? mapProperty(record) : null;
  } catch {
    return FALLBACK_PROPERTIES.find((property) => property.id === propertyId) ?? null;
  }
}

export async function getRelatedProperties(
  propertyId: string,
  city: string,
  type: string,
): Promise<Property[]> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  cacheTag(propertyCacheTags.all, propertyCacheTags.detail(propertyId));

  const normalizedCity = city.toLowerCase();
  const normalizedType = type.toLowerCase();
  let properties = FALLBACK_PROPERTIES;
  try {
    const records = await PropertyRepository.listAll();
    if (records.length) properties = records.map(mapProperty);
  } catch {
    // The bundled public catalogue remains available during database outages.
  }

  return properties
    .filter(
      (property) =>
        property.id !== propertyId &&
        (property.city.toLowerCase() === normalizedCity ||
          property.type.toLowerCase() === normalizedType),
    );
}
