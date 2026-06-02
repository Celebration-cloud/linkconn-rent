"use client";

import { Sun, Cloud, Navigation } from "lucide-react";

export default function RouteInfoCard({
  userLocation,
  routeDistance,
  routeDuration,
  routeSteps,
  weather,
}) {
  return (
    <div className="bg-white/95 dark:bg-default-800/95 rounded-xl shadow-lg backdrop-blur-md p-4 w-64 max-h-80 overflow-auto text-sm">
      {userLocation ? (
        <>
          <div className="flex items-center gap-2 text-default-700 dark:text-default-200 mb-2">
            <Navigation className="text-primary flex-shrink-0" size={16} />
            <span className="font-medium">Distance:</span>
            <span>
              {routeDistance ? `${routeDistance} km` : "Calculating..."}
            </span>
          </div>
          {routeDuration && (
            <div className="text-default-700 dark:text-default-200 mb-2">
              <span className="font-medium">Estimated travel time:</span>{" "}
              {routeDuration} min
            </div>
          )}
          {weather && (
            <div className="flex items-center gap-2 text-default-700 dark:text-default-200 mb-2">
              {weather.condition === "Sunny" ? (
                <Sun className="text-yellow-500 flex-shrink-0" size={16} />
              ) : (
                <Cloud className="text-blue-400 flex-shrink-0" size={16} />
              )}
              <span className="font-medium">Weather:</span>
              <span>
                {weather.temp}°C, {weather.condition}
              </span>
            </div>
          )}
          <div className="text-xs text-default-500 dark:text-default-400 mb-1">
            Route follows roads for accurate distance
          </div>
          <div className="text-xs text-default-500 dark:text-default-400">
            <strong>Directions:</strong>
            <ol className="list-decimal pl-4 mt-1 space-y-1">
              {routeSteps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
          </div>
        </>
      ) : (
        <div className="text-default-600 dark:text-default-400 text-xs">
          Allow location access to see distance
        </div>
      )}
    </div>
  );
}
