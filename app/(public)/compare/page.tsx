import type { Metadata } from "next";
import { PropertyComparison } from "@/components/stitch/property-comparison";
import { PropertyRepository } from "@/repositories/property.repository";
import { mapProperty } from "@/utils/map-property";
import { getPropertyNavigationTargets } from "@/features/properties/server/navigation-data";

export const metadata: Metadata = {
  title: "Compare rental properties | LinkConn Rent",
  description:
    "Compare rent, complete move-in cost, verification and availability for up to four properties.",
};

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ properties?: string | string[] }>;
}) {
  const params = await searchParams;
  const propertyIds = (Array.isArray(params.properties)
    ? params.properties.join(",")
    : params.properties || "")
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean)
    .slice(0, 4);
  const records = await PropertyRepository.listComparisonCandidates(propertyIds);
  const properties = records.map(mapProperty);
  const navigationTargets = await getPropertyNavigationTargets(
    records.map((record) => record.id),
  );
  return (
    <PropertyComparison
      properties={properties}
      initialSelectedIds={propertyIds}
      navigationTargets={navigationTargets}
    />
  );
}
