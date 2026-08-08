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
    const records = await PropertyRepository.listFeatured(3);
    return records.map(mapProperty);
  } catch (error) {
    console.error("[featured-properties] Neon query unavailable; using marketing fallback", error);
    return FALLBACK_PROPERTIES.slice(0, 3);
  }
}

export async function getPublicProperty(
  propertyId: string,
): Promise<Property | null> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  cacheTag(propertyCacheTags.all, propertyCacheTags.detail(propertyId));

  const record = await PropertyRepository.findById(propertyId);
  return record ? mapProperty(record) : null;
}

export async function getRelatedProperties(
  propertyId: string,
  city: string,
  type: string,
): Promise<Property[]> {
  "use cache";
  cacheLife({ stale: 60, revalidate: 300, expire: 3600 });
  cacheTag(propertyCacheTags.all, propertyCacheTags.detail(propertyId));

  const records = await PropertyRepository.listRelated(propertyId, city, type, 3);
  return records.map(mapProperty);
}
