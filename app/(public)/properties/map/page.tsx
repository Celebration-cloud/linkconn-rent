import type { Metadata } from "next";
import { PropertyMap } from "@/components/stitch/property-map";
import { assertProductionMapConfiguration } from "@/lib/map-config";
import { OperatingSystemRepository } from "@/repositories/operating-system.repository";
import { propertySearchSchema } from "@/schemas/operating-system";
import { mapProperty } from "@/utils/map-property";

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
  const databaseResult = await OperatingSystemRepository.searchProperties(filters);
  const result = {
    ...databaseResult,
    items: databaseResult.items.map(mapProperty),
  };

  return <PropertyMap properties={result.items} />;
}
