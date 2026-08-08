import { afterEach, describe, expect, it, vi } from "vitest";
import { getDrivingRoute } from "@/features/properties/server/directions-provider";

describe("directions provider", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("requests uncached turn steps and normalizes unknown maneuvers", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      code: "Ok",
      waypoints: [{ location: [3.39, 6.51] }, { location: [3.4, 6.5] }],
      routes: [{
        distance: 1_250.4,
        duration: 240.2,
        geometry: { type: "LineString", coordinates: [[3.39, 6.51], [3.4, 6.5]] },
        legs: [{ steps: [{ distance: 100, duration: 20, name: "Test Road", maneuver: { type: "mystery", location: [3.39, 6.51] } }] }],
      }],
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    const route = await getDrivingRoute({ latitude: 6.51, longitude: 3.39 }, { latitude: 6.5, longitude: 3.4 });
    const [endpoint, init] = fetchMock.mock.calls[0] as [URL, RequestInit];
    expect(endpoint.searchParams.get("steps")).toBe("true");
    expect(endpoint.searchParams.get("geometries")).toBe("geojson");
    expect(init.cache).toBe("no-store");
    expect(route.steps[0].instruction).toBe("Continue on Test Road");
    expect(route.distanceMetres).toBe(1_250);
  });
});
