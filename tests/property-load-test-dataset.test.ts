import { describe, expect, it } from "vitest";
import {
  generatePropertyLoadTestDataset,
  getPropertyLoadTestIds,
  LOAD_TEST_OWNER_EMAILS,
  PROPERTY_LOAD_TEST_SIZE,
  type LoadTestOwner,
} from "@/scripts/property-load-test/dataset";
import { AMENITIES, CITIES, PROPERTY_TYPES } from "@/domain/constants/property";

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

const owners: LoadTestOwner[] = LOAD_TEST_OWNER_EMAILS.map((email, index) => ({
  email,
  id: `owner-${index}`,
}));

describe("500-property load-test dataset", () => {
  it("is deterministic and uses unique UUIDs and titles", () => {
    const first = generatePropertyLoadTestDataset(owners);
    const second = generatePropertyLoadTestDataset(owners);
    expect(first).toEqual(second);
    expect(first).toHaveLength(PROPERTY_LOAD_TEST_SIZE);
    expect(new Set(first.map((property) => property.id)).size).toBe(PROPERTY_LOAD_TEST_SIZE);
    expect(new Set(first.map((property) => property.title)).size).toBe(PROPERTY_LOAD_TEST_SIZE);
    expect(getPropertyLoadTestIds()).toEqual(first.map((property) => property.id));
    expect(first.every((property) => /^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(String(property.id)))).toBe(true);
  });

  it("covers all searchable facets with valid public records", () => {
    const properties = generatePropertyLoadTestDataset(owners);
    expect(new Set(properties.map((property) => property.city))).toEqual(new Set(CITIES));
    expect(new Set(properties.map((property) => property.type))).toEqual(new Set(PROPERTY_TYPES));
    expect(new Set(properties.flatMap((property) => stringList(property.amenities)))).toEqual(new Set(AMENITIES));
    expect(new Set(properties.map((property) => property.period))).toEqual(new Set(["month", "year"]));
    expect(new Set(properties.map((property) => property.verified))).toEqual(new Set([true, false]));
    expect(
      properties.every(
        (property) =>
          property.status === "Available" &&
          property.moderationStatus === "Approved" &&
          Number.isFinite(property.price) &&
          Number(property.price) >= 0 &&
          Number(property.cautionFee) >= 0 &&
          Number(property.legalFee) >= 0 &&
          Number(property.agencyFee) >= 0 &&
          Number(property.serviceCharge) >= 0 &&
          Number(property.latitude) >= -90 &&
          Number(property.latitude) <= 90 &&
          Number(property.longitude) >= -180 &&
          Number(property.longitude) <= 180 &&
          stringList(property.images).length > 0 &&
          stringList(property.images).every((image) => image.startsWith("/images/")),
      ),
    ).toBe(true);
    expect(
      new Set(properties.map((property) => `${property.latitude}:${property.longitude}`)).size,
    ).toBe(PROPERTY_LOAD_TEST_SIZE);
    expect(
      new Set(properties.map((property) => `${property.publicLatitude}:${property.publicLongitude}`)).size,
    ).toBe(PROPERTY_LOAD_TEST_SIZE);
  });

  it("shares the dataset evenly across the six existing landlords", () => {
    const properties = generatePropertyLoadTestDataset(owners);
    const counts = owners.map(
      (owner) => properties.filter((property) => property.ownerId === owner.id).length,
    );
    expect(counts).toEqual([84, 84, 83, 83, 83, 83]);
  });

  it("refuses to generate records without all required owners", () => {
    expect(() => generatePropertyLoadTestDataset(owners.slice(0, 5))).toThrow(
      "Expected 6 eligible property owners",
    );
  });
});
