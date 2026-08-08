import { describe, expect, it } from "vitest";
import type { Property } from "@/domain/types/property";
import {
  findActiveRouteStepIndex,
  formatManeuverInstruction,
  getComparisonHighlights,
  hasArrived,
  rowHasDifferences,
  shouldReroute,
} from "@/features/properties/utils/navigation";
import { mapNavigationTarget } from "@/features/properties/utils/navigation-target";

function property(id: string, price: number, area: number, moveInEstimate: number | null): Property {
  return {
    id,
    title: id,
    type: "Apartment",
    location: "Yaba",
    city: "Lagos",
    price,
    period: "year",
    bedrooms: 2,
    bathrooms: 2,
    toilets: 3,
    area,
    image: "/images/prop1.jpg",
    amenities: [],
    moveInEstimate,
    verified: true,
    featured: false,
    landlord: "Owner",
    rating: 4.5,
    status: "Available",
    description: "Property",
  };
}

describe("property navigation utilities", () => {
  it("maps only finite exact navigation coordinates", () => {
    expect(mapNavigationTarget({ id: "one", title: "One", location: "Yaba", latitude: 6.5, longitude: 3.4 })).toEqual({
      propertyId: "one",
      title: "One",
      location: "Yaba",
      latitude: 6.5,
      longitude: 3.4,
    });
    expect(mapNavigationTarget({ id: "one", title: "One", location: "Yaba", latitude: null, longitude: 3.4 })).toBeNull();
    expect(mapNavigationTarget({ id: "one", title: "One", location: "Yaba", latitude: 91, longitude: 3.4 })).toBeNull();
  });

  it("formats known and unknown maneuvers safely", () => {
    expect(formatManeuverInstruction({ type: "turn", modifier: "left", roadName: "Herbert Macaulay Way" })).toBe("Turn left onto Herbert Macaulay Way");
    expect(formatManeuverInstruction({ type: "unexpected", roadName: "Kingsway" })).toBe("Continue on Kingsway");
    expect(formatManeuverInstruction({ type: "arrive" })).toContain("arrived");
  });

  it("uses movement, elapsed time, and materially better accuracy for rerouting", () => {
    const previous = { latitude: 6.5, longitude: 3.4, accuracyMetres: 80, requestedAt: 1_000 };
    expect(shouldReroute({ previous, current: { latitude: 6.50001, longitude: 3.4, accuracyMetres: 80 }, now: 20_000 })).toBe(false);
    expect(shouldReroute({ previous, current: { latitude: 6.501, longitude: 3.4, accuracyMetres: 80 }, now: 20_000 })).toBe(true);
    expect(shouldReroute({ previous, current: { latitude: 6.5, longitude: 3.4, accuracyMetres: 40 }, now: 2_000 })).toBe(true);
  });

  it("caps arrival tolerance and advances by the nearest route segment", () => {
    expect(hasArrived({ latitude: 6.5, longitude: 3.4, accuracyMetres: 500 }, { latitude: 6.5005, longitude: 3.4 })).toBe(true);
    const geometry = { type: "LineString" as const, coordinates: [[3.4, 6.5], [3.401, 6.5], [3.402, 6.5], [3.403, 6.5]] as [number, number][] };
    const steps = [
      { instruction: "Start", maneuverType: "depart", modifier: null, roadName: "", location: [3.4, 6.5] as [number, number], distanceMetres: 100, durationSeconds: 10 },
      { instruction: "Turn", maneuverType: "turn", modifier: "right", roadName: "", location: [3.402, 6.5] as [number, number], distanceMetres: 100, durationSeconds: 10 },
      { instruction: "Arrive", maneuverType: "arrive", modifier: null, roadName: "", location: [3.403, 6.5] as [number, number], distanceMetres: 0, durationSeconds: 0 },
    ];
    expect(findActiveRouteStepIndex({ latitude: 6.5, longitude: 3.4022 }, geometry, steps)).toBe(1);
  });

  it("finds comparison winners, ties, and changed rows", () => {
    const highlights = getComparisonHighlights(
      [property("one", 2_000_000, 90, 3_000_000), property("two", 1_500_000, 120, 3_000_000)],
      { one: 5_000, two: 8_000 },
    );
    expect([...highlights.rent]).toEqual(["two"]);
    expect([...highlights.moveIn].sort()).toEqual(["one", "two"]);
    expect([...highlights.area]).toEqual(["two"]);
    expect([...highlights.distance]).toEqual(["one"]);
    expect(rowHasDifferences(["Yes", "No"])).toBe(true);
    expect(rowHasDifferences(["Yes", "Yes"])).toBe(false);
  });
});
