import type { Property as PrismaProperty, Profile } from "@prisma/client";
import type { Property } from "@/domain/types/property";

type PropertyWithOwner = PrismaProperty & { owner: Profile };

export function mapProperty(record: PropertyWithOwner): Property {
  const moveInEstimate = getMoveInEstimate(record);
  return {
    id: record.id,
    title: record.title,
    type: record.type,
    location: record.location,
    city: record.city,
    price: record.price,
    period: record.period,
    bedrooms: record.bedrooms,
    bathrooms: record.bathrooms,
    toilets: record.toilets,
    area: record.area,
    image: record.images[0] || "/images/prop1.jpg",
    images: record.images,
    amenities: record.amenities,
    houseRules: record.houseRules,
    latitude: record.publicLatitude,
    longitude: record.publicLongitude,
    mappable:
      record.publicLatitude !== null && record.publicLongitude !== null,
    cautionFee: record.cautionFee,
    legalFee: record.legalFee,
    agencyFee: record.agencyFee,
    serviceCharge: record.serviceCharge,
    moveInEstimate,
    verified: record.verified,
    featured: record.featured,
    landlord: `${record.owner.firstName} ${record.owner.lastName}`.trim(),
    landlordId: record.owner.id,
    rating: record.rating,
    status: record.status === "Rented" ? "Rented" : "Available",
    description: record.description,
  };
}

export function getMoveInEstimate(
  property: Pick<
    Property,
    "price" | "cautionFee" | "legalFee" | "agencyFee" | "serviceCharge"
  >,
) {
  const values = [
    property.price,
    property.cautionFee,
    property.legalFee,
    property.agencyFee,
    property.serviceCharge,
  ];
  if (
    values.some(
      (value) =>
        typeof value !== "number" || !Number.isFinite(value) || value < 0,
    )
  ) {
    return null;
  }
  return values.reduce<number>((total, value) => total + (value as number), 0);
}

export function formatNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactNaira(value: number) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    notation: "compact",
    maximumFractionDigits: value >= 1_000_000 ? 1 : 0,
  }).format(value);
}

export function getMoveInTotal(
  property: Pick<
    Property,
    "price" | "cautionFee" | "legalFee" | "agencyFee" | "serviceCharge"
  >,
) {
  return (
    property.price +
    (property.cautionFee || 0) +
    (property.legalFee || 0) +
    (property.agencyFee || 0) +
    (property.serviceCharge || 0)
  );
}
