"use client";

import { Fragment, useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import { Chip, Input } from "@heroui/react";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function FlyToLocation({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) map.flyTo(position, 15, { duration: 1.2 });
  }, [position, map]);
  return null;
}

function getDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

export default function PropertyMap({ properties }) {
  const [selectedProperty, setSelectedProperty] = useState(properties?.[0]);
  const [userLocation, setUserLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [maxDistance, setMaxDistance] = useState(10); // Default radius 10 km

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const htmlClass = document.documentElement.classList;
      setDarkMode(htmlClass.contains("dark"));
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    setDarkMode(document.documentElement.classList.contains("dark"));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.warn("Location access denied:", err.message),
        { enableHighAccuracy: true }
      );
    }
  }, []);

  useEffect(() => {
    if (userLocation && selectedProperty) {
      const d = getDistanceKm(
        userLocation[0],
        userLocation[1],
        selectedProperty.lat,
        selectedProperty.lng
      );
      setDistance(d);
    }
  }, [userLocation, selectedProperty]);

  const defaultPosition = userLocation || [6.5244, 3.3792];
  const mapUrl = darkMode
    ? "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const lineColor = darkMode ? "#22d3ee" : "#2563EB";
  const faintColor = darkMode ? "#38bdf8" : "#93c5fd";

  // Filter nearby properties
  const nearbyProperties = userLocation
    ? properties.filter(
        (p) =>
          getDistanceKm(userLocation[0], userLocation[1], p.lat, p.lng) <=
          maxDistance
      )
    : properties;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 py-6 max-h-[calc(100vh-100px)] overflow-y-auto scrollbar-hide">
      <>
        <div className="relative flex-1 w-full col-span-2 rounded-lg overflow-hidden border border-border z-0 min-h-[50vh] sm:min-h-[55vh] md:min-h-[60vh] lg:min-h-[65vh]">
          <MapContainer
            center={defaultPosition}
            zoom={13}
            scrollWheelZoom
            className="h-full w-full rounded-md opacity-0.95 z-0"
            fullscreenControl
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
              url={mapUrl}
            />

            {userLocation && (
              <Marker position={userLocation}>
                <Popup>You are here</Popup>
              </Marker>
            )}

            {userLocation &&
              nearbyProperties.map((p) => {
                const dist = getDistanceKm(
                  userLocation[0],
                  userLocation[1],
                  p.lat,
                  p.lng
                );
                const midLat = (userLocation[0] + p.lat) / 2;
                const midLng = (userLocation[1] + p.lng) / 2;

                return (
                  <Fragment key={p.id}>
                    <Polyline
                      positions={[userLocation, [p.lat, p.lng]]}
                      color={faintColor}
                      weight={2}
                      opacity={0.5}
                      dashArray="4,8"
                    />
                    <Marker
                      position={[midLat, midLng]}
                      icon={L.divIcon({
                        className: "text-xs font-medium",
                        html: `<div style="
                          background:${darkMode ? "#0f172a" : "#fff"};
                          color:${darkMode ? "#22d3ee" : "#2563EB"};
                          border:1px solid ${darkMode ? "#22d3ee44" : "#2563EB44"};
                          border-radius:6px;
                          padding:2px 5px;
                          white-space:nowrap;
                          box-shadow:0 1px 4px rgba(0,0,0,0.2);
                        ">${dist} km</div>`,
                      })}
                    />
                  </Fragment>
                );
              })}

            {userLocation && selectedProperty && (
              <>
                <Polyline
                  positions={[
                    userLocation,
                    [selectedProperty.lat, selectedProperty.lng],
                  ]}
                  color={lineColor}
                  weight={4}
                  opacity={0.9}
                />
              </>
            )}

            {nearbyProperties.map((p) => (
              <Marker
                key={p.id}
                position={[p.lat, p.lng]}
                eventHandlers={{ click: () => setSelectedProperty(p) }}
              >
                <Popup>
                  <strong>{p.title}</strong>
                  <br />
                  {p.address || `${p.city}, ${p.state}`}
                  <br />₦{Number(p.price).toLocaleString()}
                  <br />
                  <Chip size="sm" color="primary" variant="flat">
                    {p.purpose}
                  </Chip>{" "}
                  <Chip size="sm" color="secondary" variant="flat">
                    {p.type}
                  </Chip>
                </Popup>
              </Marker>
            ))}

            {selectedProperty && (
              <FlyToLocation
                position={[selectedProperty.lat, selectedProperty.lng]}
              />
            )}
          </MapContainer>
        </div>
      </>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-lg">Nearby Properties</h4>

          <div className="flex items-center gap-2">
            <Input
              label="Max Distance"
              type="number"
              min={1}
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              size="sm"
              className="w-28"
              endContent={
                <span className="text-xs text-muted-foreground">km</span>
              }
            />
          </div>
        </div>

        <div className="space-y-2 overflow-y-auto styled-scrollbar max-h-[65vh] pr-1">
          {nearbyProperties.length > 0 ? (
            nearbyProperties.map((p) => (
              <div
                key={p.id}
                onClick={() => setSelectedProperty(p)}
                className={`p-3 border rounded-md cursor-pointer transition-colors ${
                  selectedProperty?.id === p.id
                    ? "bg-primary/10 border-primary"
                    : "bg-card/40 hover:bg-card/70"
                }`}
              >
                <p className="font-medium line-clamp-1">{p.title}</p>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {p.address || `${p.city}, ${p.state}`}
                </p>
                <p className="text-sm font-semibold mt-1">
                  ₦{Number(p.price).toLocaleString()}
                </p>
                {userLocation && (
                  <p className="text-xs mt-1">
                    {getDistanceKm(
                      userLocation[0],
                      userLocation[1],
                      p.lat,
                      p.lng
                    )}{" "}
                    km away
                  </p>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">
              No properties found within {maxDistance} km.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
