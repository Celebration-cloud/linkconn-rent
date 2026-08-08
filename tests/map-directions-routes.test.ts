import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  getDrivingRoute,
  getDrivingDistanceMatrix,
  getPropertyNavigationTarget,
  getPropertyNavigationTargets,
} = vi.hoisted(() => ({
  getDrivingRoute: vi.fn(),
  getDrivingDistanceMatrix: vi.fn(),
  getPropertyNavigationTarget: vi.fn(),
  getPropertyNavigationTargets: vi.fn(),
}));

vi.mock("@/features/properties/server/directions-provider", () => ({
  DirectionsProviderError: class DirectionsProviderError extends Error {
    readonly statusCode: number;
    constructor(message: string, statusCode: number) {
      super(message);
      this.statusCode = statusCode;
    }
  },
  getDrivingRoute,
  getDrivingDistanceMatrix,
}));
vi.mock("@/features/properties/server/navigation-data", () => ({
  getPropertyNavigationTarget,
  getPropertyNavigationTargets,
}));

import { POST as directionsPost } from "@/app/api/maps/directions/route";
import { POST as distancesPost } from "@/app/api/maps/distances/route";

const propertyId = "11111111-1111-4111-8111-111111111111";
const otherId = "22222222-2222-4222-8222-222222222222";
const target = { propertyId, title: "Yaba home", location: "Yaba", latitude: 6.5, longitude: 3.4 };

describe("property directions route handlers", () => {
  beforeEach(() => vi.clearAllMocks());

  it("resolves an exact property destination server-side", async () => {
    getPropertyNavigationTarget.mockResolvedValue(target);
    getDrivingRoute.mockResolvedValue({
      geometry: { type: "LineString", coordinates: [[3.39, 6.51], [3.4, 6.5]] },
      origin: [3.39, 6.51],
      destination: [3.4, 6.5],
      distanceMetres: 2_000,
      durationSeconds: 300,
      steps: [],
    });
    const response = await directionsPost(new Request("http://localhost/api/maps/directions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ origin: { latitude: 6.51, longitude: 3.39 }, propertyId }),
    }));
    expect(response.status).toBe(200);
    expect(getDrivingRoute).toHaveBeenCalledWith({ latitude: 6.51, longitude: 3.39 }, target);
    expect(await response.json()).toMatchObject({ success: true, data: { distanceMetres: 2_000 } });
  });

  it("rejects malformed requests and unavailable exact coordinates", async () => {
    const malformed = await directionsPost(new Request("http://localhost/api/maps/directions", { method: "POST", body: JSON.stringify({ propertyId: "bad" }) }));
    expect(malformed.status).toBe(400);
    getPropertyNavigationTarget.mockResolvedValue(null);
    const unavailable = await directionsPost(new Request("http://localhost/api/maps/directions", {
      method: "POST",
      body: JSON.stringify({ origin: { latitude: 6.51, longitude: 3.39 }, propertyId }),
    }));
    expect(unavailable.status).toBe(404);
    const invalidJson = await directionsPost(new Request("http://localhost/api/maps/directions", {
      method: "POST",
      body: "{broken",
    }));
    expect(invalidJson.status).toBe(400);
  });

  it("keeps matrix results in requested order with null unmapped entries", async () => {
    getPropertyNavigationTargets.mockResolvedValue([target]);
    getDrivingDistanceMatrix.mockResolvedValue([{ distanceMetres: 2_000, durationSeconds: 300 }]);
    const response = await distancesPost(new Request("http://localhost/api/maps/distances", {
      method: "POST",
      body: JSON.stringify({ origin: { latitude: 6.51, longitude: 3.39 }, propertyIds: [otherId, propertyId] }),
    }));
    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      data: [
        { propertyId: otherId, distanceMetres: null, durationSeconds: null },
        { propertyId, distanceMetres: 2_000, durationSeconds: 300 },
      ],
    });
  });

  it("rejects more than four matrix destinations", async () => {
    const response = await distancesPost(new Request("http://localhost/api/maps/distances", {
      method: "POST",
      body: JSON.stringify({
        origin: { latitude: 6.51, longitude: 3.39 },
        propertyIds: Array.from({ length: 5 }, (_, index) => `${index + 1}1111111-1111-4111-8111-111111111111`),
      }),
    }));
    expect(response.status).toBe(400);
  });
});
