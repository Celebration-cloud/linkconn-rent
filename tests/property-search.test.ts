import { describe, expect, it } from "vitest";
import { FALLBACK_PROPERTIES } from "@/domain/constants/mock-properties";
import { propertySearchSchema } from "@/schemas/operating-system";
import { searchFallbackProperties } from "@/utils/property-search";

describe("property search query contract", () => {
  it("parses shareable list filters and preserves false booleans", () => {
    const result = propertySearchSchema.parse({
      q: "  Lagos duplex  ",
      types: "Apartment,Duplex,Apartment",
      amenities: "Parking,Security",
      bathrooms: "2",
      verified: "false",
      page: "3",
      pageSize: "12",
    });

    expect(result).toMatchObject({
      q: "Lagos duplex",
      types: ["Apartment", "Duplex"],
      amenities: ["Parking", "Security"],
      bathrooms: 2,
      verified: false,
      page: 3,
      pageSize: 12,
      mode: "list",
    });
  });

  it("normalizes the legacy move-in sort and singular property type", () => {
    const result = propertySearchSchema.parse({
      type: "Studio",
      sort: "lowest-move-in",
    });
    expect(result.sort).toBe("recommended");

    const page = searchFallbackProperties(FALLBACK_PROPERTIES, result);
    expect(page.items.every((property) => property.type === "Studio")).toBe(true);
  });

  it("rejects oversized list pages while permitting bounded map mode", () => {
    expect(() => propertySearchSchema.parse({ pageSize: "25" })).toThrow(
      "List pages can contain at most 24 properties",
    );
    expect(
      propertySearchSchema.parse({ mode: "map", pageSize: "200" }).pageSize,
    ).toBe(200);
  });
});

describe("deterministic fallback search", () => {
  it("searches titles, locations, cities, and descriptions", () => {
    const input = propertySearchSchema.parse({ q: "tech hub" });
    const result = searchFallbackProperties(FALLBACK_PROPERTIES, input);
    expect(result.items.map((property) => property.id)).toEqual(["fallback-4"]);
  });

  it("filters multi-value facets and reports pagination metadata", () => {
    const repeated = Array.from({ length: 30 }, (_, index) => ({
      ...FALLBACK_PROPERTIES[index % FALLBACK_PROPERTIES.length],
      id: `property-${String(index).padStart(2, "0")}`,
    }));
    const input = propertySearchSchema.parse({
      types: "Apartment,Duplex",
      verified: "true",
      page: "2",
      pageSize: "5",
      sort: "lowest-rent",
    });
    const result = searchFallbackProperties(repeated, input);

    expect(result.items).toHaveLength(5);
    expect(result.pagination).toMatchObject({
      page: 2,
      pageSize: 5,
      hasNextPage: true,
      hasPreviousPage: true,
    });
    expect(result.items.every((property) => property.verified)).toBe(true);
    expect(
      result.items.every((property) => ["Apartment", "Duplex"].includes(property.type)),
    ).toBe(true);
  });
});
