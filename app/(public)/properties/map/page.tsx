import type { Metadata } from "next";
import { PropertyMap } from "@/components/stitch/property-map";
import { FALLBACK_PROPERTIES } from "@/domain/constants/mock-properties";
import { assertProductionMapConfiguration } from "@/lib/map-config";
import { OperatingSystemRepository } from "@/repositories/operating-system.repository";
import { propertySearchSchema } from "@/schemas/operating-system";
import { mapProperty } from "@/utils/map-property";
import { searchFallbackProperties } from "@/utils/property-search";
import { withTimeout } from "@/utils/with-timeout";

assertProductionMapConfiguration();

export const metadata: Metadata = {
  title: "Map search | LinkConn Rent",
  description: "Explore verified rental properties across Nigeria on an interactive map.",
  robots: { index: false, follow: true },
};

export default async function MapSearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(",") : value,
    ]),
  );
  const parsed = propertySearchSchema.safeParse({ ...raw, mode: "map" });
  const filters = parsed.success
    ? parsed.data
    : propertySearchSchema.parse({ mode: "map" });
  let result = searchFallbackProperties(FALLBACK_PROPERTIES, filters);

  try {
    const databaseResult = await withTimeout(
      OperatingSystemRepository.searchProperties(filters),
      2_500,
      "Map catalogue unavailable",
    );
    if (databaseResult.pagination.totalItems > 0) {
      result = {
        ...databaseResult,
        items: databaseResult.items.map(mapProperty),
      };
    }
  } catch {
    // Keep the deterministic mapped catalogue available during local setup.
  }

  return <PropertyMap properties={result.items} />;
}
