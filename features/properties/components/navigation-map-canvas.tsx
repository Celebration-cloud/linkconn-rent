"use client";

import L from "leaflet";
import { useEffect } from "react";
import {
  Circle,
  CircleMarker,
  MapContainer,
  Marker,
  Polyline,
  TileLayer,
  Tooltip,
  useMap,
  ZoomControl,
} from "react-leaflet";
import type { PropertyNavigationTarget, PropertyRoute } from "@/features/properties/types/navigation";
import type { MapUserLocation } from "@/components/stitch/property-map-canvas";
import { MAP_CONFIG } from "@/lib/map-config";

/* eslint-disable no-unused-vars */
type SelectProperty = (propertyId: string) => void;
/* eslint-enable no-unused-vars */

function FitMap({ targets, route, userLocation }: {
  targets: PropertyNavigationTarget[];
  route: PropertyRoute | null;
  userLocation: MapUserLocation | null;
}) {
  const map = useMap();
  useEffect(() => {
    const points = route?.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude] as [number, number])
      ?? [
        ...targets.map((target) => [target.latitude, target.longitude] as [number, number]),
        ...(userLocation ? [[userLocation.latitude, userLocation.longitude] as [number, number]] : []),
      ];
    if (points.length === 1) map.setView(points[0], 15, { animate: false });
    else if (points.length > 1) map.fitBounds(points, { padding: [48, 48], maxZoom: 15, animate: false });
  }, [map, route, targets, userLocation]);
  return null;
}

function markerIcon(selected: boolean) {
  return L.divIcon({
    className: "linkconn-property-marker-shell",
    html: `<span class="block size-10 rounded-full border-[3px] border-white ${selected ? "bg-[#006041]" : "bg-[#B8E36E]"} shadow-lg" aria-hidden="true"></span>`,
    iconSize: [40, 40],
    iconAnchor: [20, 38],
  });
}

export function NavigationMapCanvas({ targets, selectedId, route, userLocation, onSelect }: {
  targets: PropertyNavigationTarget[];
  selectedId: string | null;
  route: PropertyRoute | null;
  userLocation: MapUserLocation | null;
  onSelect?: SelectProperty;
}) {
  return (
    <MapContainer
      center={[targets[0]?.latitude ?? MAP_CONFIG.center.latitude, targets[0]?.longitude ?? MAP_CONFIG.center.longitude]}
      zoom={targets.length ? 14 : MAP_CONFIG.defaultZoom}
      minZoom={MAP_CONFIG.minZoom}
      maxZoom={MAP_CONFIG.maxZoom}
      zoomControl={false}
      className="h-full w-full bg-surface-muted"
    >
      <TileLayer url={MAP_CONFIG.tileUrl} attribution={MAP_CONFIG.tileAttribution} maxZoom={MAP_CONFIG.maxZoom} />
      <ZoomControl position="bottomright" />
      <FitMap targets={targets} route={route} userLocation={userLocation} />
      {route ? (
        <Polyline
          positions={route.geometry.coordinates.map(([longitude, latitude]) => [latitude, longitude])}
          pathOptions={{ color: "#237A57", weight: 6, lineCap: "round", lineJoin: "round" }}
        />
      ) : null}
      {targets.map((target) => (
        <Marker
          key={target.propertyId}
          position={[target.latitude, target.longitude]}
          icon={markerIcon(target.propertyId === selectedId)}
          keyboard
          eventHandlers={{ click: () => onSelect?.(target.propertyId) }}
          title={`Exact destination for ${target.title}`}
        >
          <Tooltip direction="top"><strong>{target.title}</strong><br />Exact directions destination</Tooltip>
        </Marker>
      ))}
      {userLocation ? (
        <>
          <Circle
            center={[userLocation.latitude, userLocation.longitude]}
            radius={userLocation.accuracyMetres}
            pathOptions={{ color: "#006041", fillColor: "#B8E36E", fillOpacity: 0.12, weight: 1 }}
          />
          <CircleMarker
            center={[userLocation.latitude, userLocation.longitude]}
            radius={9}
            pathOptions={{ color: "#fff", fillColor: "#006041", fillOpacity: 1, weight: 4 }}
          ><Tooltip>Your live location</Tooltip></CircleMarker>
        </>
      ) : null}
    </MapContainer>
  );
}
