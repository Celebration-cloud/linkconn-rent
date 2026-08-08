import { notFound } from "next/navigation";
import { PropertyDetails } from "@/components/stitch/property-details";
import {
  getPublicProperty,
  getRelatedProperties,
} from "@/features/properties/server/public-property-data";
import { getPropertyNavigationTarget } from "@/features/properties/server/navigation-data";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ returnTo?: string | string[] }>;
};

// Generate dynamic metadata for SEO compliance
export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  const property = await getPublicProperty(id);

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
  const property = await getPublicProperty(id);

  if (!property) {
    notFound();
  }
  const [related, navigationTarget] = await Promise.all([
    getRelatedProperties(property.id, property.city, property.type),
    getPropertyNavigationTarget(property.id),
  ]);

  return (
    <PropertyDetails
      property={property}
      relatedProperties={related}
      navigationTarget={navigationTarget}
      returnTo={returnTo}
    />
  );
}
