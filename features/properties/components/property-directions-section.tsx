"use client";

import { LocateFixed, Navigation, RefreshCw, Square } from "lucide-react";
import type { PropertyNavigationTarget } from "@/features/properties/types/navigation";
import { useLivePropertyDirections } from "@/features/properties/hooks/use-live-property-directions";
import { NavigationMap } from "./navigation-map";

function formatDuration(seconds: number) {
  const minutes = Math.max(1, Math.round(seconds / 60));
  return minutes >= 60 ? `${Math.floor(minutes / 60)} hr ${minutes % 60} min` : `${minutes} min`;
}

export function PropertyDirectionsSection({ target }: { target: PropertyNavigationTarget | null }) {
  const directions = useLivePropertyDirections(target);
  if (!target) {
    return (
      <section className="border-b border-line py-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-ink">Location and directions</h2>
        <div className="mt-5 rounded-2xl border border-dashed border-line bg-surface-muted p-6">
          <p className="font-bold text-ink">Directions unavailable</p>
          <p className="mt-2 text-sm leading-6 text-muted">This listing does not have verified exact coordinates. We will never substitute a city-centre location.</p>
        </div>
      </section>
    );
  }
  return (
    <section className="border-b border-line py-8" data-directions-state={directions.arrived ? "arrived" : directions.tracking ? "tracking" : "idle"}>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">Location and directions</h2>
          <p className="mt-2 text-sm text-muted">Navigate to the verified exact property destination.</p>
        </div>
        {!directions.tracking ? (
          <button onClick={directions.start} disabled={directions.routing} className="stitch-button">
            {directions.error ? <RefreshCw className="size-4" /> : <LocateFixed className="size-4" />}
            {directions.routing ? "Calculating…" : directions.error ? "Retry directions" : "Start directions"}
          </button>
        ) : (
          <button onClick={() => directions.stop()} className="stitch-button stitch-button-secondary">
            <Square className="size-4" /> Stop directions
          </button>
        )}
      </div>
      <NavigationMap
        className="mt-5 h-[26rem]"
        targets={[target]}
        selectedId={target.propertyId}
        route={directions.route}
        userLocation={directions.location}
      />
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl bg-surface-muted p-4"><p className="text-xs font-bold text-muted">Road distance</p><p className="mt-1 font-extrabold text-ink">{directions.route ? `${(directions.route.distanceMetres / 1000).toFixed(1)} km` : "—"}</p></div>
        <div className="rounded-xl bg-surface-muted p-4"><p className="text-xs font-bold text-muted">Driving time</p><p className="mt-1 font-extrabold text-ink">{directions.route ? formatDuration(directions.route.durationSeconds) : "—"}</p></div>
        <div className="rounded-xl bg-surface-muted p-4"><p className="text-xs font-bold text-muted">Location accuracy</p><p className="mt-1 font-extrabold text-ink">{directions.location ? `±${Math.round(directions.location.accuracyMetres)} m` : "Permission required"}</p></div>
      </div>
      {directions.activeStep ? (
        <div className="mt-4 rounded-2xl bg-forest-950 p-5 text-white">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-lime"><Navigation className="size-4" /> Current direction</p>
          <p className="mt-2 text-lg font-extrabold">{directions.activeStep.instruction}</p>
          {directions.upcomingStep ? <p className="mt-2 text-sm text-forest-100">Then: {directions.upcomingStep.instruction}</p> : null}
        </div>
      ) : null}
      <p className={`mt-3 text-sm ${directions.error ? "text-error" : "text-muted"}`} role="status" aria-live="polite">{directions.status}</p>
    </section>
  );
}
