import { describe, expect, it } from "vitest";
import {
  buildOverpassQuery,
  convertOverpassBuildings,
  normalizeBuildingHeight,
} from "@/lib/map-buildings";
import { buildingsQuerySchema } from "@/schemas/map-buildings";

describe("Leaflet 2.5D building data", () => {
  it("validates a bounded query and rejects an excessive radius", () => {
    expect(
      buildingsQuerySchema.parse({
        latitude: "6.5244",
        longitude: "3.3792",
        radius: "300",
      }),
    ).toEqual({
      latitude: 6.5244,
      longitude: 3.3792,
      radius: 300,
    });
    expect(() =>
      buildingsQuerySchema.parse({
        latitude: 6.5,
        longitude: 3.4,
        radius: 401,
      }),
    ).toThrow();
  });

  it("normalizes explicit height, levels, defaults, and caps", () => {
    expect(normalizeBuildingHeight({ height: "12.5 m" })).toBe(12.5);
    expect(normalizeBuildingHeight({ "building:levels": "4" })).toBe(12);
    expect(normalizeBuildingHeight(undefined)).toBe(6);
    expect(normalizeBuildingHeight({ height: "500" })).toBe(120);
  });

  it("converts ways and outer relation members into capped GeoJSON", () => {
    const data = convertOverpassBuildings(
      {
        elements: [
          {
            type: "way",
            id: 10,
            tags: { building: "yes", "building:levels": "3" },
            geometry: [
              { lat: 6.5, lon: 3.4 },
              { lat: 6.5, lon: 3.401 },
              { lat: 6.501, lon: 3.401 },
            ],
          },
          {
            type: "relation",
            id: 20,
            tags: { building: "apartments", height: "18" },
            members: [
              {
                type: "way",
                role: "outer",
                geometry: [
                  { lat: 6.51, lon: 3.41 },
                  { lat: 6.51, lon: 3.411 },
                  { lat: 6.511, lon: 3.411 },
                ],
              },
              {
                type: "way",
                role: "inner",
                geometry: [
                  { lat: 6.51, lon: 3.41 },
                  { lat: 6.51, lon: 3.411 },
                  { lat: 6.511, lon: 3.411 },
                ],
              },
            ],
          },
        ],
      },
      2,
    );

    expect(data.type).toBe("FeatureCollection");
    expect(data.features).toHaveLength(2);
    expect(data.features[0].geometry.coordinates[0]).toHaveLength(4);
    expect(data.features.map((feature) => feature.properties.heightMetres)).toEqual([
      9, 18,
    ]);
  });

  it("builds a coordinate-bounded Overpass query without private metadata", () => {
    const query = buildOverpassQuery({
      latitude: 6.5244,
      longitude: 3.3792,
      radius: 300,
    });
    expect(query).toContain('way["building"](around:300,6.5244,3.3792)');
    expect(query).toContain("out tags geom");
    expect(query).not.toContain("address");
  });
});
