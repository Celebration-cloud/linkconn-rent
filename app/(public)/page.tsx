import { PublicHome } from "@/components/stitch/public-home";
import { PropertyRepository } from "@/repositories/property.repository";
import type { Property } from "@/domain/types/property";
import { FALLBACK_PROPERTIES } from "@/domain/constants/mock-properties";
import { mapProperty } from "@/utils/map-property";
import { withTimeout } from "@/utils/with-timeout";

// Revalidate data once every hour
export const revalidate = 3600;


export default async function PublicHomePage() {
  let properties: Property[] = [];
  try {
    const rawProperties = await withTimeout(
      PropertyRepository.listAll(),
      2500,
      "Public catalogue unavailable",
    );
    if (rawProperties && rawProperties.length > 0) {
      properties = rawProperties.map(mapProperty);
    } else {
      properties = FALLBACK_PROPERTIES;
    }
  } catch {
    properties = FALLBACK_PROPERTIES;
  }

  return <PublicHome properties={properties} />;
}
