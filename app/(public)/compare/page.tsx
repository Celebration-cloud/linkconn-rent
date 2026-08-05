import type { Metadata } from "next";
import { PropertyComparison } from "@/components/stitch/property-comparison";
import { FALLBACK_PROPERTIES } from "@/domain/constants/mock-properties";
import { PropertyRepository } from "@/repositories/property.repository";
import { mapProperty } from "@/utils/map-property";
import { withTimeout } from "@/utils/with-timeout";

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
  let properties = FALLBACK_PROPERTIES;
  try {
    const records = await withTimeout(
      PropertyRepository.listAll(),
      2_500,
      "Comparison catalogue unavailable",
    );
    if (records.length) properties = records.map(mapProperty);
  } catch {
    // Deterministic catalogue keeps public comparison available.
  }
  return (
    <PropertyComparison
      properties={properties}
      initialSelectedIds={propertyIds}
    />
  );
}
