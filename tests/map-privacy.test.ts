import { describe, expect, it } from "vitest";
import { hasMapCoordinates, MAP_CONFIG } from "@/lib/map-config";
import { directionsQuerySchema } from "@/schemas/map-directions";
import { propertySearchSchema } from "@/schemas/operating-system";
import { mapProperty } from "@/utils/map-property";
import { createApproximateCoordinates } from "@/utils/public-coordinates";

describe("public property coordinates", () => {
  it("creates a stable approximate point without returning the exact point", () => {
    const first = createApproximateCoordinates(6.4474, 3.4723, "property-1");
    const second = createApproximateCoordinates(6.4474, 3.4723, "property-1");

    expect(first).toEqual(second);
    expect(first.publicLatitude).not.toBe(6.4474);
    expect(first.publicLongitude).not.toBe(3.4723);
  });

  it("maps only the public point into the browser property contract", () => {
    const record = {
      id: "property-1",
      title: "Modern 2 Bedroom Apartment in Yaba",
      type: "Apartment",
      location: "Yaba",
      city: "Lagos",
      price: 3_200_000,
      period: "year",
      bedrooms: 2,
      bathrooms: 2,
      toilets: 3,
      area: 105,
      latitude: 6.500001,
      longitude: 3.390001,
      publicLatitude: 6.501234,
      publicLongitude: 3.391234,
      coordinateVerified: true,
      images: ["/images/prop1.jpg"],
      amenities: [],
      houseRules: [],
      cautionFee: 250_000,
      legalFee: 0,
      agencyFee: 0,
      serviceCharge: 450_000,
      verified: true,
      featured: true,
      rating: 0,
      status: "Available",
      moderationStatus: "Approved",
      moderationReason: null,
      reviewedById: null,
      reviewedAt: null,
      description: "A verified apartment with transparent move-in costs.",
      ownerId: "owner-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      owner: {
        id: "owner-1",
        email: "owner@example.com",
        firstName: "Adekunle",
        lastName: "Adebayo",
        phone: null,
        avatar: null,
        bio: null,
        location: null,
        role: "Landlord",
        accountStatus: "Active",
        verificationLevel: "FullyVerified",
        twoFactorEnabled: false,
        onboardingComplete: true,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    } as Parameters<typeof mapProperty>[0];

    const browserProperty = mapProperty(record);
    expect(browserProperty.latitude).toBe(6.501234);
    expect(browserProperty.longitude).toBe(3.391234);
    expect(browserProperty).not.toMatchObject({
      latitude: 6.500001,
      longitude: 3.390001,
    });
  });

  it("requires a complete viewport and keeps other filters", () => {
    expect(() =>
      propertySearchSchema.parse({
        north: "6.7",
        south: "6.3",
        location: "Yaba",
      }),
    ).toThrow("All four map bounds are required");

    const result = propertySearchSchema.parse({
      north: "6.7",
      south: "6.3",
      east: "3.8",
      west: "3.1",
      location: "Yaba",
      period: "year",
      amenities: "Parking, Security",
    });
    expect(result).toMatchObject({
      location: "Yaba",
      period: "year",
      amenities: ["Parking", "Security"],
    });
  });

  it("recognises only complete numeric map points", () => {
    expect(hasMapCoordinates({ latitude: 6.5, longitude: 3.4 })).toBe(true);
    expect(hasMapCoordinates({ latitude: null, longitude: 3.4 })).toBe(false);
  });

  it("uses labelled Leaflet tiles and bounded 2.5D building settings", () => {
    if (MAP_CONFIG.usesDevelopmentTiles) {
      expect(MAP_CONFIG.tileUrl).toBe(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      );
    } else {
      expect(typeof MAP_CONFIG.tileUrl).toBe("string");
    }
    expect(MAP_CONFIG.tileAttribution).toContain("OpenStreetMap");
    expect(MAP_CONFIG.buildingMinZoom).toBe(16);
    expect(MAP_CONFIG.buildingRadiusMetres).toBeLessThanOrEqual(
      MAP_CONFIG.buildingMaxRadiusMetres,
    );
  });

  it("validates route endpoints without changing the public destination", () => {
    const result = directionsQuerySchema.parse({
      originLongitude: "3.35",
      originLatitude: "6.52",
      destinationLongitude: "3.391234",
      destinationLatitude: "6.501234",
    });
    expect(result.destinationLongitude).toBe(3.391234);
    expect(() =>
      directionsQuerySchema.parse({
        originLongitude: "not-a-coordinate",
        originLatitude: "6.52",
        destinationLongitude: "3.39",
        destinationLatitude: "6.5",
      }),
    ).toThrow();
  });
});
