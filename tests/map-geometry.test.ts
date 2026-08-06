import { describe, expect, it } from "vitest";
import {
  addBoundsToQuery,
  distanceBetweenMetres,
} from "@/features/properties/utils/map-geometry";

describe("property map geometry", () => {
  it("measures equal and nearby coordinates", () => {
    const lagos = { latitude: 6.5244, longitude: 3.3792 };
    expect(distanceBetweenMetres(lagos, lagos)).toBe(0);
    expect(
      distanceBetweenMetres(lagos, { latitude: 6.5344, longitude: 3.3792 }),
    ).toBeGreaterThan(1_100);
  });

  it("commits bounds without dropping active filters", () => {
    const query = addBoundsToQuery(new URLSearchParams("q=lekki&page=3"), {
      north: 7,
      south: 6,
      east: 4,
      west: 3,
    });
    expect(query.get("q")).toBe("lekki");
    expect(query.get("mode")).toBe("map");
    expect(query.has("page")).toBe(false);
  });
});
