import { notFound } from "next/navigation";
import { PropertyRepository } from "@/repositories/property.repository";
import { FALLBACK_PROPERTIES } from "@/domain/constants/mock-properties";
import { PropertyDetails } from "@/components/stitch/property-details";
import type { Property } from "@/domain/types/property";
import { mapProperty } from "@/utils/map-property";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
};

// Generate dynamic metadata for SEO compliance
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  let property: Property | undefined = FALLBACK_PROPERTIES.find((p) => p.id === id);

  try {
    const raw = await PropertyRepository.findById(id);
    if (raw) {
      property = mapProperty(raw);
    }
  } catch {
    // Graceful fallback
  }

  return {
    title: property ? `${property.title} | LinkConn Rent` : "Property Details | LinkConn Rent",
    description: property ? property.description.slice(0, 150) : "Direct verified property listing in Nigeria.",
  };
}

export default async function PropertyDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const query = await searchParams;
  const requestedReturn = Array.isArray(query.returnTo)
    ? query.returnTo[0]
    : query.returnTo;
  const returnTo =
    requestedReturn === "/properties" || requestedReturn?.startsWith("/properties?")
      ? requestedReturn
      : "/properties";
  let property: Property | undefined = FALLBACK_PROPERTIES.find((p) => p.id === id);
  let allProperties: Property[] = FALLBACK_PROPERTIES;

  try {
    // 1. Fetch main property
    const raw = await PropertyRepository.findById(id);
    if (raw) {
      property = mapProperty(raw);
    }

    // 2. Fetch all properties to compute related/similar ones
    const listRaw = await PropertyRepository.listAll();
    if (listRaw && listRaw.length > 0) {
      allProperties = listRaw.map(mapProperty);
    }
  } catch {
    // Fall back to constants
  }

  if (!property) {
    notFound();
  }

  // Find related properties: matching city or type, excluding current property
  const related = allProperties.filter(
    (p) => p.id !== id && (p.city.toLowerCase() === property!.city.toLowerCase() || p.type.toLowerCase() === property!.type.toLowerCase())
  );

  return (
    <PropertyDetails
      property={property}
      relatedProperties={related}
      returnTo={returnTo}
    />
  );
}
