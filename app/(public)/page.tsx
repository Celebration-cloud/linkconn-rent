import { PublicHome } from "@/components/stitch/public-home";
import type { Property } from "@/domain/types/property";
import { FALLBACK_PROPERTIES } from "@/domain/constants/mock-properties";
import { getFeaturedProperties } from "@/features/properties/server/public-property-data";
import { withTimeout } from "@/utils/with-timeout";

export default async function PublicHomePage() {
  let properties: Property[] = [];
  try {
    const cachedProperties = await withTimeout(
      getFeaturedProperties(),
      2500,
      "Public catalogue unavailable",
    );
    if (cachedProperties.length > 0) {
      properties = cachedProperties;
    } else {
      properties = FALLBACK_PROPERTIES;
    }
  } catch {
    properties = FALLBACK_PROPERTIES;
  }

  return <PublicHome properties={properties} />;
}
