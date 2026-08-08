"use client";

import dynamic from "next/dynamic";
import type { PropertyNavigationTarget, PropertyRoute } from "@/features/properties/types/navigation";
import type { MapUserLocation } from "@/components/stitch/property-map-canvas";

/* eslint-disable no-unused-vars */
type SelectProperty = (propertyId: string) => void;
/* eslint-enable no-unused-vars */

const NavigationMapCanvas = dynamic(
  () => import("./navigation-map-canvas").then((module) => module.NavigationMapCanvas),
  {
    ssr: false,
    loading: () => <div className="absolute inset-0 animate-pulse bg-surface-muted" aria-label="Loading directions map" />,
  },
);

export function NavigationMap(props: {
  targets: PropertyNavigationTarget[];
  selectedId: string | null;
  route: PropertyRoute | null;
  userLocation: MapUserLocation | null;
  onSelect?: SelectProperty;
  className?: string;
}) {
  return (
    <div className={`relative min-h-80 overflow-hidden rounded-2xl border border-line bg-surface-muted ${props.className ?? ""}`}>
      <NavigationMapCanvas {...props} />
    </div>
  );
}
