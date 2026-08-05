import type { Metadata } from "next";
import { PropertySearch } from "@/components/stitch/property-search";
import { FALLBACK_PROPERTIES } from "@/domain/constants/mock-properties";
import { OperatingSystemRepository } from "@/repositories/operating-system.repository";
import {
  propertySearchSchema,
  type PropertySearchInput,
} from "@/schemas/operating-system";
import { mapProperty } from "@/utils/map-property";
import { searchFallbackProperties } from "@/utils/property-search";
import { withTimeout } from "@/utils/with-timeout";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function flattenSearchParams(params: Awaited<SearchParams>) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => [
      key,
      Array.isArray(value) ? value.join(",") : value,
    ]),
  );
}

function parseSearchParams(params: Awaited<SearchParams>): PropertySearchInput {
  const result = propertySearchSchema.safeParse(flattenSearchParams(params));
  const parsed = result.success ? result.data : propertySearchSchema.parse({});
  return { ...parsed, pageSize: 12, mode: "list" };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const params = await searchParams;
  const input = parseSearchParams(params);
  const hasDiscoveryFilters = Object.keys(params).some(
    (key) => !["page", "pageSize"].includes(key),
  );
  const canonical = input.page > 1 ? `/properties?page=${input.page}` : "/properties";

  return {
    title:
      input.page > 1
        ? `Verified properties – page ${input.page} | LinkConn Rent`
        : "Browse verified properties | LinkConn Rent",
    description:
      "Browse direct-from-landlord apartments, duplexes, studios, and homes for rent across Lagos, Abuja, and Nigeria.",
    alternates: { canonical: hasDiscoveryFilters ? "/properties" : canonical },
    robots: hasDiscoveryFilters ? { index: false, follow: true } : undefined,
  };
}

export default async function PropertiesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const rawParams = await searchParams;
  const filters = parseSearchParams(rawParams);
  let result = searchFallbackProperties(FALLBACK_PROPERTIES, filters);

  try {
    const databaseResult = await withTimeout(
      OperatingSystemRepository.searchProperties(filters),
      2_500,
      "Public catalogue unavailable",
    );
    if (databaseResult.pagination.totalItems > 0) {
      result = {
        ...databaseResult,
        items: databaseResult.items.map(mapProperty),
      };
    }
  } catch {
    // The deterministic catalogue keeps public search usable during local setup.
  }

  const queryKey = new URLSearchParams(
    Object.entries(flattenSearchParams(rawParams)).filter(
      (entry): entry is [string, string] => Boolean(entry[1]),
    ),
  );
  return (
    <PropertySearch
      key={queryKey.toString()}
      initialResult={result}
      initialFilters={filters}
    />
  );
}
