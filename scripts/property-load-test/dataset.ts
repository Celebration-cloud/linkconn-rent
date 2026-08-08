import { createHash } from "node:crypto";
import type { Prisma } from "@prisma/client";
import {
  AMENITIES,
  CITIES,
  PROPERTY_TYPES,
} from "../../domain/constants/property";

export const PROPERTY_LOAD_TEST_VERSION = "live-properties-500-v1";
export const PROPERTY_LOAD_TEST_SIZE = 500;

export const LOAD_TEST_OWNER_EMAILS = [
  "adeyemi@estates.com",
  "capital@homes.com",
  "greenfield@realty.com",
  "urbannest@rent.com",
  "prestige@prop.com",
  "campus@lodging.com",
] as const;

export type LoadTestOwner = {
  id: string;
  email: (typeof LOAD_TEST_OWNER_EMAILS)[number];
};

type CityDefinition = {
  city: (typeof CITIES)[number];
  latitude: number;
  longitude: number;
  neighborhoods: readonly string[];
};

const CITY_DEFINITIONS: readonly CityDefinition[] = [
  {
    city: "Lagos",
    latitude: 6.5244,
    longitude: 3.3792,
    neighborhoods: ["Lekki", "Yaba", "Ikoyi", "Surulere", "Ajah", "Ikeja"],
  },
  {
    city: "Abuja",
    latitude: 9.0765,
    longitude: 7.3986,
    neighborhoods: ["Wuse", "Gwarinpa", "Maitama", "Jabi", "Asokoro", "Kubwa"],
  },
  {
    city: "Port Harcourt",
    latitude: 4.8156,
    longitude: 7.0498,
    neighborhoods: ["GRA", "Choba", "Rumuola", "Woji", "Trans Amadi", "Eliozu"],
  },
  {
    city: "Ibadan",
    latitude: 7.3775,
    longitude: 3.947,
    neighborhoods: ["Bodija", "Oluyole", "Akobo", "Ring Road", "Jericho", "Mokola"],
  },
  {
    city: "Enugu",
    latitude: 6.4584,
    longitude: 7.5464,
    neighborhoods: ["Independence Layout", "New Haven", "GRA", "Trans Ekulu", "Achara", "Emene"],
  },
  {
    city: "Kano",
    latitude: 12.0022,
    longitude: 8.592,
    neighborhoods: ["Nassarawa", "Bompai", "Tarauni", "Hotoro", "Kano GRA", "Sabon Gari"],
  },
];

const ADJECTIVES = [
  "Airy",
  "Calm",
  "Contemporary",
  "Courtyard",
  "Elegant",
  "Garden",
  "Grand",
  "Harbour",
  "Light-Filled",
  "Modern",
  "Parkside",
  "Refined",
  "Secure",
  "Serene",
  "Skyline",
  "Spacious",
  "Sunlit",
  "Urban",
  "Verdant",
  "Waterfront",
] as const;

const FEATURES = [
  "Balcony",
  "Corner",
  "Courtyard",
  "Executive",
  "Family",
  "Garden",
  "Penthouse",
  "Poolside",
  "Smart",
  "Terrace",
] as const;

const IMAGE_PATHS = [
  "/images/prop1.jpg",
  "/images/prop2.jpg",
  "/images/prop3.jpg",
  "/images/prop4.jpg",
  "/images/prop5.jpg",
  "/images/prop6.jpg",
  "/images/generated/linkconn/property-abuja-bedroom.png",
  "/images/generated/linkconn/property-choba-common-room.png",
  "/images/generated/linkconn/property-gwarinpa-terrace.png",
  "/images/generated/linkconn/property-ibadan-flat.png",
  "/images/generated/linkconn/property-lagos-balcony.png",
  "/images/generated/linkconn/property-port-harcourt-duplex.png",
  "/images/generated/linkconn/property-secure-compound.png",
  "/images/generated/linkconn/property-wuse-kitchen.png",
  "/images/generated/linkconn/property-yaba-studio.png",
] as const;

const HOUSE_RULES = [
  "No smoking",
  "No short lets",
  "Residential use only",
  "Pets by prior agreement",
  "Quiet hours after 10pm",
  "Keep shared areas tidy",
] as const;

function deterministicUuid(index: number) {
  const hash = createHash("sha256")
    .update(`${PROPERTY_LOAD_TEST_VERSION}:${index}`)
    .digest("hex");
  const variant = ((Number.parseInt(hash[16] ?? "0", 16) & 0x3) | 0x8).toString(16);
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-${variant}${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

function selectWindow<T>(values: readonly T[], start: number, count: number) {
  return Array.from({ length: count }, (_, offset) => values[(start + offset) % values.length]);
}

function roundFee(value: number) {
  return Math.round(value / 5_000) * 5_000;
}

export function getPropertyLoadTestIds() {
  return Array.from({ length: PROPERTY_LOAD_TEST_SIZE }, (_, index) =>
    deterministicUuid(index),
  );
}

export function generatePropertyLoadTestDataset(
  owners: readonly LoadTestOwner[],
): Prisma.PropertyCreateManyInput[] {
  if (owners.length !== LOAD_TEST_OWNER_EMAILS.length) {
    throw new Error(`Expected ${LOAD_TEST_OWNER_EMAILS.length} eligible property owners`);
  }

  const baseCreatedAt = Date.UTC(2026, 0, 1, 8);
  return Array.from({ length: PROPERTY_LOAD_TEST_SIZE }, (_, index) => {
    const cityDefinition = CITY_DEFINITIONS[index % CITY_DEFINITIONS.length];
    const type = PROPERTY_TYPES[index % PROPERTY_TYPES.length];
    const adjective = ADJECTIVES[index % ADJECTIVES.length];
    const feature = FEATURES[Math.floor(index / ADJECTIVES.length) % FEATURES.length];
    const neighborhood = cityDefinition.neighborhoods[
      Math.floor(index / CITY_DEFINITIONS.length) % cityDefinition.neighborhoods.length
    ];
    const serial = String(index + 1).padStart(3, "0");
    const period = index % 5 === 0 ? "month" : "year";
    const price =
      period === "month"
        ? 180_000 + (index % 19) * 85_000
        : 650_000 + (index % 37) * 425_000;
    const bedrooms = type === "Commercial" ? 0 : 1 + (index % 6);
    const bathrooms = 1 + ((index * 3) % 6);
    const uniquenessOffset = Math.floor(index / 61) / 100_000;
    const latitudeOffset = (((index * 37) % 61) - 30) / 1_000 + uniquenessOffset;
    const longitudeOffset = (((index * 53) % 61) - 30) / 1_000 - uniquenessOffset;
    const latitude = Number((cityDefinition.latitude + latitudeOffset).toFixed(6));
    const longitude = Number((cityDefinition.longitude + longitudeOffset).toFixed(6));
    const publicLatitude = Number((latitude + (((index * 7) % 9) - 4) / 10_000).toFixed(6));
    const publicLongitude = Number((longitude + (((index * 11) % 9) - 4) / 10_000).toFixed(6));
    const amenityCount = 3 + (index % 6);
    const title = `${adjective} ${feature} ${type} in ${neighborhood} ${serial}`;

    return {
      id: deterministicUuid(index),
      title,
      type,
      location: `${neighborhood}, ${cityDefinition.city}`,
      city: cityDefinition.city,
      price,
      period,
      bedrooms,
      bathrooms,
      toilets: Math.max(bathrooms, bedrooms + 1),
      area: 42 + ((index * 17) % 610),
      latitude,
      longitude,
      publicLatitude,
      publicLongitude,
      coordinateVerified: index % 5 !== 0,
      images: selectWindow(IMAGE_PATHS, index, 1 + (index % 3)),
      amenities: selectWindow(AMENITIES, index * 2, amenityCount),
      houseRules: selectWindow(HOUSE_RULES, index, 1 + (index % 3)),
      cautionFee: roundFee(price * (period === "month" ? 0.5 : 0.1)),
      legalFee: roundFee(price * 0.05),
      agencyFee: roundFee(price * 0.1),
      serviceCharge: roundFee(price * (0.035 + (index % 4) * 0.01)),
      verified: index % 4 !== 0,
      featured: index % 23 === 0,
      rating: Number((3.4 + (index % 17) * 0.1).toFixed(1)),
      status: "Available",
      moderationStatus: "Approved",
      description: `${title} is a distinct ${bedrooms || "open-plan"}-bedroom listing with ${bathrooms} bathrooms across ${42 + ((index * 17) % 610)} square metres. It combines ${selectWindow(AMENITIES, index * 2, amenityCount).join(", ")} with practical access to ${neighborhood} services and transport in ${cityDefinition.city}.`,
      ownerId: owners[index % owners.length].id,
      createdAt: new Date(baseCreatedAt + index * 6 * 60 * 60 * 1_000),
      updatedAt: new Date(baseCreatedAt + index * 6 * 60 * 60 * 1_000),
    };
  });
}
