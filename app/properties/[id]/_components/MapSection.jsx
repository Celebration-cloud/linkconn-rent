"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  FeatureGroup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-fullscreen";
import "leaflet-fullscreen/dist/leaflet.fullscreen.css";
import { Copy } from "lucide-react";
import RouteInfoCard from "./RouteInfoCard";

/* Marker fix for Next */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function RecenterMap({ lat, lng }) {
  const map = useMap();

  useEffect(() => {
    if (!lat || !lng) return;
    map.setView([lat, lng], map.getZoom(), { animate: true });
  }, [lat, lng, map]);

  return null;
}

function MapPanes() {
  const map = useMap();

  useEffect(() => {
    if (!map.getPane("routes")) {
      map.createPane("routes");
      map.getPane("routes").style.zIndex = 450;
    }
  }, [map]);

  return null;
}

export default function MapSection({
  lat,
  lng,
  address,
  city,
  country,
  userLocation: initialUserLocation,
}) {
  const [userLocation, setUserLocation] = useState(initialUserLocation ?? null);
  const [route, setRoute] = useState([]);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeDuration, setRouteDuration] = useState(null);
  const [routeSteps, setRouteSteps] = useState([]);
  const [weather] = useState({ temp: 30, condition: "Sunny" });
  const [darkMode, setDarkMode] = useState(false);

  const routeAbortRef = useRef(null);

  /* Dark mode sync */
  useEffect(() => {
    const sync = () =>
      setDarkMode(document.documentElement.classList.contains("dark"));

    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  /* User location tracking */
  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) =>
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        }),
      () => {},
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  /* Routing */
  useEffect(() => {
    if (!userLocation || !lat || !lng) return;

    routeAbortRef.current?.abort();
    const controller = new AbortController();
    routeAbortRef.current = controller;

    const loadRoute = async () => {
      const coords = `${userLocation.lng},${userLocation.lat};${lng},${lat}`;
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true`,
        { signal: controller.signal }
      );

      if (!res.ok) return;

      const data = await res.json();
      const r = data?.routes?.[0];
      if (!r) return;

      setRoute(r.geometry.coordinates.map(([x, y]) => [y, x]));
      setRouteDistance((r.distance / 1000).toFixed(1));
      setRouteDuration(Math.ceil(r.duration / 60));

      const steps = [];
      r.legs.forEach((leg) =>
        leg.steps.forEach((step) => steps.push(step.maneuver.instruction))
      );
      setRouteSteps(steps);
    };

    loadRoute();

    return () => controller.abort();
  }, [userLocation, lat, lng]);

  const copyLink = async () => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(
      `${window.location.origin}?lat=${lat}&lng=${lng}`
    );
  };

  const tileLayers = useMemo(
    () => (
      <>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          opacity={darkMode ? 0 : 1}
        />
        <TileLayer
          attribution='&copy; <a href="https://stadiamaps.com/">Stadia</a>'
          url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
          opacity={darkMode ? 1 : 0}
        />
      </>
    ),
    [darkMode]
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="relative rounded-2xl overflow-hidden">
        <MapContainer
          center={[lat, lng]}
          zoom={14}
          scrollWheelZoom
          fullscreenControl
          className="h-80 w-full"
        >
          {tileLayers}
          <MapPanes />

          <Marker position={[lat, lng]}>
            <Popup>
              <strong>{address}</strong>
              <br />
              <span>
                {city}, {country}
              </span>
            </Popup>
          </Marker>

          {userLocation && (
            <Marker position={[userLocation.lat, userLocation.lng]}>
              <Popup>Your location</Popup>
            </Marker>
          )}

          {route.length > 0 && (
            <FeatureGroup pane="routes">
              <Polyline
                positions={route}
                color={darkMode ? "#22d3ee" : "#2563EB"}
                weight={4}
                opacity={0.85}
              />
            </FeatureGroup>
          )}

          <RecenterMap lat={lat} lng={lng} />
        </MapContainer>

        <div className="absolute top-4 right-4 z-[1000]">
          <button
            onClick={copyLink}
            title="Copy location link"
            className="bg-white/90 dark:bg-default-800 p-2 rounded-full shadow-lg"
          >
            <Copy size={18} />
          </button>
        </div>
      </div>

      <RouteInfoCard
        userLocation={userLocation}
        routeDistance={routeDistance}
        routeDuration={routeDuration}
        routeSteps={routeSteps}
        weather={weather}
      />
    </div>
  );
}
