"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Check,
  LocateFixed,
  MapPin,
  Navigation,
  Share2,
  ShieldCheck,
  Square,
  Trash2,
  X,
} from "lucide-react";
import type { Property } from "@/domain/types/property";
import type { PropertyNavigationTarget } from "@/features/properties/types/navigation";
import { Checkbox } from "@/components/ui/form-controls";
import { NavigationMap } from "@/features/properties/components/navigation-map";
import { useLivePropertyDirections } from "@/features/properties/hooks/use-live-property-directions";
import { usePropertyDistances } from "@/features/properties/hooks/use-property-distances";
import {
  getComparisonHighlights,
  rowHasDifferences,
  type ComparisonMetricKey,
} from "@/features/properties/utils/navigation";
import { formatNaira, getMoveInEstimate } from "@/utils/map-property";
import { toastSuccess } from "@/stores/toast-store";

type ComparisonRow = {
  label: string;
  values: string[];
  metric?: ComparisonMetricKey;
  kind?: "rules";
};

function fee(value: number | undefined) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? formatNaira(value)
    : "Unavailable";
}

function duration(seconds: number | null | undefined) {
  if (typeof seconds !== "number") return "Unavailable";
  const minutes = Math.max(1, Math.round(seconds / 60));
  return minutes >= 60 ? `${Math.floor(minutes / 60)} hr ${minutes % 60} min` : `${minutes} min`;
}

export function PropertyComparison({
  properties,
  initialSelectedIds,
  navigationTargets,
}: {
  properties: Property[];
  initialSelectedIds?: string[];
  navigationTargets: PropertyNavigationTarget[];
}) {
  const [selectedIds, setSelectedIds] = useState(() => {
    const validIds = (initialSelectedIds || []).filter(
      (id, index, ids) => ids.indexOf(id) === index && properties.some((property) => property.id === id),
    );
    return (validIds.length ? validIds : properties.slice(0, 3).map((property) => property.id)).slice(0, 4);
  });
  const [activeId, setActiveId] = useState<string | null>(selectedIds[0] ?? null);
  const [differencesOnly, setDifferencesOnly] = useState(false);
  const selected = useMemo(
    () => selectedIds.map((id) => properties.find((property) => property.id === id)).filter((property): property is Property => Boolean(property)),
    [properties, selectedIds],
  );
  const selectedTargets = useMemo(
    () => selectedIds.flatMap((id) => {
      const target = navigationTargets.find((candidate) => candidate.propertyId === id);
      return target ? [target] : [];
    }),
    [navigationTargets, selectedIds],
  );
  const effectiveActiveId = activeId && selectedIds.includes(activeId) ? activeId : selectedIds[0] ?? null;
  const activeTarget = selectedTargets.find((target) => target.propertyId === effectiveActiveId) ?? selectedTargets[0] ?? null;
  const directions = useLivePropertyDirections(activeTarget);
  const distances = usePropertyDistances(selectedTargets.map((target) => target.propertyId), directions.location);
  const distanceById = Object.fromEntries(distances.results.map((result) => [result.propertyId, result.distanceMetres]));
  const durationById = Object.fromEntries(distances.results.map((result) => [result.propertyId, result.durationSeconds]));
  const highlights = getComparisonHighlights(selected, distanceById);

  function remove(id: string) {
    const nextIds = selectedIds.filter((item) => item !== id);
    directions.stop("Active destination changed.");
    setSelectedIds(nextIds);
    if (effectiveActiveId === id) setActiveId(nextIds[0] ?? null);
  }

  function activate(id: string) {
    if (id === effectiveActiveId) return;
    directions.stop("Select Start directions for the new destination.");
    setActiveId(id);
  }

  function share() {
    const url = new URL(window.location.href);
    url.searchParams.set("properties", selectedIds.join(","));
    void navigator.clipboard?.writeText(url.toString());
    toastSuccess("Comparison link copied", "Share this exact shortlist.");
  }

  const amenityUnion = [...new Set(selected.flatMap((property) => property.amenities))].sort();
  const sections: Array<{ title: string; rows: ComparisonRow[] }> = [
    {
      title: "Cost",
      rows: [
        { label: "Rent", values: selected.map((property) => formatNaira(property.price)), metric: "rent" },
        { label: "Rent period", values: selected.map((property) => `Per ${property.period}`) },
        { label: "Caution fee", values: selected.map((property) => fee(property.cautionFee)) },
        { label: "Legal fee", values: selected.map((property) => fee(property.legalFee)) },
        { label: "Agency fee", values: selected.map((property) => fee(property.agencyFee)) },
        { label: "Service charge", values: selected.map((property) => fee(property.serviceCharge)) },
        {
          label: "Total move-in",
          values: selected.map((property) => {
            const estimate = getMoveInEstimate(property);
            return estimate === null ? "Unavailable" : formatNaira(estimate);
          }),
          metric: "moveIn",
        },
      ],
    },
    {
      title: "Space",
      rows: [
        { label: "Property type", values: selected.map((property) => property.type) },
        { label: "Bedrooms", values: selected.map((property) => String(property.bedrooms)) },
        { label: "Bathrooms", values: selected.map((property) => String(property.bathrooms)) },
        { label: "Toilets", values: selected.map((property) => String(property.toilets)) },
        { label: "Area", values: selected.map((property) => `${property.area} m²`), metric: "area" },
      ],
    },
    {
      title: "Trust and listing",
      rows: [
        { label: "Verification", values: selected.map((property) => property.verified ? "Verified" : "In review") },
        { label: "Availability", values: selected.map((property) => property.status) },
        { label: "Featured", values: selected.map((property) => property.featured ? "Featured" : "Standard") },
        { label: "Landlord", values: selected.map((property) => property.landlord || "Not provided") },
        { label: "Rating", values: selected.map((property) => `${property.rating.toFixed(1)} / 5`) },
      ],
    },
    {
      title: "Location",
      rows: [
        { label: "Full location", values: selected.map((property) => `${property.location}, ${property.city}`) },
        {
          label: "Road distance",
          values: selected.map((property) => typeof distanceById[property.id] === "number" ? `${(distanceById[property.id]! / 1000).toFixed(1)} km` : "Use my location"),
          metric: "distance",
        },
        { label: "Driving time", values: selected.map((property) => duration(durationById[property.id])) },
      ],
    },
    {
      title: "Amenities",
      rows: amenityUnion.map((amenity) => ({
        label: amenity,
        values: selected.map((property) => property.amenities.includes(amenity) ? "Yes" : "No"),
      })),
    },
    {
      title: "House rules",
      rows: [{
        label: "Rules",
        kind: "rules",
        values: selected.map((property) => (property.houseRules?.length ? property.houseRules : ["No rules provided"]).join("\n")),
      }],
    },
  ];

  return (
    <main id="main-content" className="min-h-[100dvh] bg-sand-50 pb-24 pt-16">
      <header className="border-b border-line bg-sand-100">
        <div className="stitch-container py-10">
          <Link href="/properties" className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-forest-700"><ArrowLeft className="size-4" /> Search results</Link>
          <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div><p className="text-xs font-bold tracking-[0.14em] text-forest-700">Compare up to four</p><h1 className="mt-2 text-4xl font-extrabold tracking-[-0.05em] text-ink">See the real difference.</h1><p className="mt-2 text-sm text-muted">Compare complete costs, space, trust, amenities, and real driving distance.</p></div>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-bold text-forest-900">
                <Checkbox checked={differencesOnly} onChange={(event) => setDifferencesOnly(event.target.checked)} /> Show differences only
              </label>
              <button onClick={share} className="stitch-button stitch-button-secondary"><Share2 className="size-4" /> Share comparison</button>
            </div>
          </div>
        </div>
      </header>

      <div className="stitch-container py-8">
        {selected.length ? (
          <>
            <section aria-labelledby="comparison-map-heading">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div><h2 id="comparison-map-heading" className="text-2xl font-extrabold text-ink">Distance and directions</h2><p className="mt-1 text-sm text-muted">Select a home on the map or in the table, then start live directions.</p></div>
                {!directions.tracking ? (
                  <button onClick={directions.start} disabled={!activeTarget || directions.routing} className="stitch-button"><LocateFixed className="size-4" /> {directions.routing ? "Calculating…" : "Use my location"}</button>
                ) : (
                  <button onClick={() => directions.stop()} className="stitch-button stitch-button-secondary"><Square className="size-4" /> Stop directions</button>
                )}
              </div>
              {selectedTargets.length ? (
                <NavigationMap className="mt-5 h-[28rem]" targets={selectedTargets} selectedId={activeTarget?.propertyId ?? null} route={directions.route} userLocation={directions.location} onSelect={activate} />
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-line bg-white p-6"><p className="font-bold text-ink">Directions unavailable</p><p className="mt-2 text-sm text-muted">None of these homes has verified exact coordinates.</p></div>
              )}
              {directions.activeStep ? (
                <div className="mt-4 rounded-2xl bg-forest-950 p-5 text-white"><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-lime"><Navigation className="size-4" /> Current direction</p><p className="mt-2 text-lg font-extrabold">{directions.activeStep.instruction}</p>{directions.upcomingStep ? <p className="mt-2 text-sm text-forest-100">Then: {directions.upcomingStep.instruction}</p> : null}</div>
              ) : null}
              <p className={`mt-3 text-sm ${directions.error || distances.error ? "text-error" : "text-muted"}`} role="status" aria-live="polite">{directions.error || distances.error || directions.status}</p>
            </section>

            <div className="mt-8 overflow-x-auto pb-4">
              <div className="grid min-w-[48rem] gap-px overflow-hidden rounded-2xl bg-line" style={{ gridTemplateColumns: `12rem repeat(${selected.length}, minmax(12rem, 1fr))` }}>
                <div className="bg-forest-950 p-5 text-white"><p className="text-xs font-bold text-lime">Shortlist</p><p className="mt-2 text-sm text-forest-100">Best values are highlighted without hiding the original facts.</p></div>
                {selected.map((property) => (
                  <article key={property.id} className={`relative bg-white p-4 ${effectiveActiveId === property.id ? "ring-2 ring-inset ring-forest-700" : ""}`}>
                    <button onClick={() => remove(property.id)} className="absolute right-2 top-2 z-10 grid size-11 place-items-center rounded-full bg-white/95 text-red-700 shadow" aria-label={`Remove ${property.title}`}><Trash2 className="size-4" /></button>
                    <button onClick={() => activate(property.id)} className="w-full text-left" aria-pressed={effectiveActiveId === property.id}>
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl"><Image src={property.image} alt={property.title} fill sizes="240px" className="object-cover" /></div>
                      <h2 className="mt-4 text-base font-extrabold text-ink">{property.title}</h2>
                      <p className="mt-1 flex items-center gap-1 text-xs text-muted"><MapPin className="size-3.5" />{property.location}</p>
                    </button>
                    <Link href={`/properties/${property.id}`} className="stitch-button mt-4 w-full">View home</Link>
                  </article>
                ))}

                {sections.flatMap((section) => {
                  const visibleRows = section.rows.filter((row) => !differencesOnly || rowHasDifferences(row.values));
                  if (!visibleRows.length) return [];
                  return [
                    <div key={`${section.title}-heading`} className="col-span-full bg-sand-300 px-4 py-3 text-xs font-extrabold uppercase tracking-[0.12em] text-forest-900">{section.title}</div>,
                    ...visibleRows.flatMap((row) => [
                      <div key={`${section.title}-${row.label}-label`} className="bg-sand-200 p-4 text-sm font-bold text-forest-900">{row.label}</div>,
                      ...selected.map((property, index) => {
                        const highlighted = row.metric ? highlights[row.metric].has(property.id) : false;
                        return (
                          <div key={`${section.title}-${row.label}-${property.id}`} className={`bg-white p-4 text-sm font-semibold text-ink ${highlighted ? "bg-lime/20 ring-1 ring-inset ring-lime" : ""}`}>
                            {row.kind === "rules" ? (
                              <details><summary className="cursor-pointer font-bold text-forest-700">View rules</summary><ul className="mt-2 space-y-1 text-xs font-normal text-muted">{row.values[index].split("\n").map((rule) => <li key={rule}>• {rule}</li>)}</ul></details>
                            ) : row.label === "Verification" && property.verified ? (
                              <span className="inline-flex items-center gap-1.5 text-forest-700"><ShieldCheck className="size-4" /> {row.values[index]}</span>
                            ) : row.values[index] === "Yes" ? (
                              <span className="inline-flex items-center gap-1.5 text-forest-700"><Check className="size-4" /> Yes</span>
                            ) : row.values[index] === "No" ? (
                              <span className="inline-flex items-center gap-1.5 text-muted"><X className="size-4" /> No</span>
                            ) : (
                              <>{row.values[index]}{highlighted ? <span className="ml-2 rounded-full bg-lime px-2 py-0.5 text-[10px] font-extrabold text-forest-950">Best</span> : null}</>
                            )}
                          </div>
                        );
                      }),
                    ]),
                  ];
                })}
              </div>
            </div>
          </>
        ) : (
          <section className="grid min-h-96 place-items-center rounded-3xl border border-dashed border-line bg-white p-8 text-center"><div><Check className="mx-auto size-9 text-forest-600" /><h2 className="mt-4 text-2xl font-extrabold text-ink">Your comparison is empty</h2><p className="mt-2 text-sm text-muted">Add homes from the search results to compare them.</p><Link href="/properties" className="stitch-button mt-6">Find homes</Link></div></section>
        )}

        <section className="mt-10"><h2 className="text-2xl font-extrabold text-ink">Add another property</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {properties.filter((property) => !selectedIds.includes(property.id)).slice(0, 8).map((property) => (
            <button key={property.id} onClick={() => setSelectedIds((current) => current.length < 4 ? [...current, property.id] : current)} disabled={selectedIds.length >= 4} className="min-h-28 rounded-2xl border border-line bg-white p-4 text-left transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(18,55,42,0.1)] disabled:cursor-not-allowed disabled:opacity-45"><p className="text-sm font-extrabold text-ink">{property.title}</p><p className="mt-1 text-xs text-muted">{property.location}</p><span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-forest-700"><Check className="size-4" /> Add to comparison</span></button>
          ))}
        </div></section>
      </div>
    </main>
  );
}
