import { notFound } from "next/navigation";
import { FALLBACK_PROPERTIES } from "@/domain/constants/mock-properties";
import { PropertyDetails } from "@/components/stitch/property-details";
import type { Property } from "@/domain/types/property";
import {
  getPublicProperty,
  getRelatedProperties,
} from "@/features/properties/server/public-property-data";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
};

// Generate dynamic metadata for SEO compliance
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  let property: Property | undefined = FALLBACK_PROPERTIES.find((p) => p.id === id);

  try {
    property = (await getPublicProperty(id)) || property;
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
  let related: Property[] = FALLBACK_PROPERTIES.filter(
    (candidate) => candidate.id !== id,
  );

  try {
    property = (await getPublicProperty(id)) || property;
    if (property) {
      related = await getRelatedProperties(
        property.id,
        property.city,
        property.type,
      );
    }
  } catch {
    // Fall back to constants
  }

  if (!property) {
    notFound();
  }

  return (
    <PropertyDetails
      property={property}
      relatedProperties={related}
      returnTo={returnTo}
    />
  );
}
