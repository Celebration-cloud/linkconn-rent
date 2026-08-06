import "server-only";

import { revalidateTag } from "next/cache";
import { propertyCacheTags } from "@/lib/cache/property-tags";

type PropertyCacheInvalidation = {
  propertyId?: string;
  collectionChanged?: boolean;
};

export function invalidatePropertyCache({
  propertyId,
  collectionChanged = true,
}: PropertyCacheInvalidation) {
  if (propertyId) {
    revalidateTag(propertyCacheTags.detail(propertyId), "max");
  }
  if (collectionChanged) {
    revalidateTag(propertyCacheTags.all, "max");
    revalidateTag(propertyCacheTags.featured, "max");
  }
}
