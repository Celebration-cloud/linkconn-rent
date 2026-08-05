"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Bath,
  BedDouble,
  CalendarDays,
  Check,
  MapPin,
  Share2,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import type { Property } from "@/domain/types/property";
import { formatNaira, getMoveInTotal } from "@/utils/map-property";
import { toastSuccess } from "@/stores/toast-store";

export function PropertyComparison({
  properties,
  initialSelectedIds,
}: {
  properties: Property[];
  initialSelectedIds?: string[];
}) {
  const [selectedIds, setSelectedIds] = useState(() => {
    const validIds = (initialSelectedIds || []).filter(
      (id, index, ids) =>
        ids.indexOf(id) === index && properties.some((property) => property.id === id),
    );
    return (validIds.length ? validIds : properties.slice(0, 3).map((property) => property.id)).slice(0, 4);
  });
  const selected = useMemo(
    () => selectedIds
      .map((id) => properties.find((property) => property.id === id))
      .filter((property): property is Property => Boolean(property)),
    [properties, selectedIds],
  );

  function remove(id: string) {
    setSelectedIds((current) => current.filter((item) => item !== id));
  }

  function share() {
    const url = new URL(window.location.href);
    url.searchParams.set("properties", selectedIds.join(","));
    void navigator.clipboard?.writeText(url.toString());
    toastSuccess("Comparison link copied", "Share this exact shortlist.");
  }

  const rows = [
    ["Rent", (property: Property) => formatNaira(property.price)],
    [
      "Total move-in",
      (property: Property) => formatNaira(getMoveInTotal(property)),
    ],
    ["Location", (property: Property) => `${property.location}, ${property.city}`],
    ["Bedrooms", (property: Property) => String(property.bedrooms)],
    ["Bathrooms", (property: Property) => String(property.bathrooms)],
    ["Size", (property: Property) => `${property.area} m²`],
    [
      "Service charge",
      (property: Property) => formatNaira(property.serviceCharge || 0),
    ],
    [
      "Verification",
      (property: Property) => property.verified ? "Verified" : "In review",
    ],
    [
      "Availability",
      (property: Property) => property.status === "Available" ? "Available" : "Rented",
    ],
  ] as const;

  return (
    <main id="main-content" className="min-h-[100dvh] bg-sand-50 pb-24 pt-16">
      <header className="border-b border-line bg-sand-100">
        <div className="stitch-container py-10">
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 text-xs font-bold text-forest-700"
          >
            <ArrowLeft className="size-4" /> Search results
          </Link>
          <div className="mt-5 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-forest-700">
                Compare up to four
              </p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.05em] text-ink">
                See the real difference.
              </h1>
              <p className="mt-2 text-sm text-muted">
                Rent alone does not show what moving in will cost.
              </p>
            </div>
            <button onClick={share} className="stitch-button stitch-button-secondary">
              <Share2 className="size-4" /> Share comparison
            </button>
          </div>
        </div>
      </header>

      <div className="stitch-container py-8">
        {selected.length ? (
          <div className="overflow-x-auto pb-4">
            <div
              className="grid min-w-[48rem] gap-px overflow-hidden rounded-2xl bg-line"
              style={{
                gridTemplateColumns: `12rem repeat(${selected.length}, minmax(12rem, 1fr))`,
              }}
            >
              <div className="bg-forest-950 p-5 text-white">
                <p className="text-xs font-bold text-lime">Shortlist</p>
                <p className="mt-2 text-sm text-forest-100">
                  Differences are highlighted through a shared set of facts.
                </p>
              </div>
              {selected.map((property) => (
                <article key={property.id} className="relative bg-white p-4">
                  <button
                    onClick={() => remove(property.id)}
                    className="absolute right-2 top-2 z-10 grid size-9 place-items-center rounded-full bg-white/95 text-red-700 shadow"
                    aria-label={`Remove ${property.title}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                    <Image
                      src={property.image}
                      alt={property.title}
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                  </div>
                  <h2 className="mt-4 text-base font-extrabold text-ink">
                    {property.title}
                  </h2>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                    <MapPin className="size-3.5" />
                    {property.location}
                  </p>
                  <Link
                    href={`/properties/${property.id}`}
                    className="stitch-button mt-4 w-full"
                  >
                    View home
                  </Link>
                </article>
              ))}

              {rows.flatMap(([label, read]) => [
                <div key={`${label}-label`} className="bg-sand-200 p-4 text-sm font-bold text-forest-900">
                  {label}
                </div>,
                ...selected.map((property) => (
                  <div
                    key={`${label}-${property.id}`}
                    className="bg-white p-4 text-sm font-semibold text-ink"
                  >
                    {label === "Verification" && property.verified ? (
                      <span className="inline-flex items-center gap-1.5 text-forest-700">
                        <ShieldCheck className="size-4" /> {read(property)}
                      </span>
                    ) : (
                      read(property)
                    )}
                  </div>
                )),
              ])}
            </div>
          </div>
        ) : (
          <section className="grid min-h-96 place-items-center rounded-3xl border border-dashed border-line bg-white p-8 text-center">
            <div>
              <Check className="mx-auto size-9 text-forest-600" />
              <h2 className="mt-4 text-2xl font-extrabold text-ink">
                Your comparison is empty
              </h2>
              <p className="mt-2 text-sm text-muted">
                Add homes from the search results to compare the complete cost.
              </p>
              <Link href="/properties" className="stitch-button mt-6">
                Find homes
              </Link>
            </div>
          </section>
        )}

        <section className="mt-10">
          <h2 className="text-2xl font-extrabold text-ink">
            Add another property
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {properties
              .filter((property) => !selectedIds.includes(property.id))
              .slice(0, 8)
              .map((property) => (
                <button
                  key={property.id}
                  onClick={() =>
                    setSelectedIds((current) =>
                      current.length < 4 ? [...current, property.id] : current,
                    )
                  }
                  disabled={selectedIds.length >= 4}
                  className="rounded-2xl border border-line bg-white p-4 text-left transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(18,55,42,0.1)] disabled:cursor-not-allowed disabled:opacity-45"
                >
                  <p className="text-sm font-extrabold text-ink">
                    {property.title}
                  </p>
                  <p className="mt-1 text-xs text-muted">{property.location}</p>
                  <span className="mt-5 inline-flex items-center gap-1 text-xs font-bold text-forest-700">
                    <Check className="size-4" /> Add to comparison
                  </span>
                </button>
              ))}
          </div>
        </section>

        <div className="mt-12 grid gap-4 sm:grid-cols-3">
          {[
            [BedDouble, "Compare space"],
            [Bath, "Compare facilities"],
            [CalendarDays, "Compare availability"],
          ].map(([Icon, label]) => {
            const ItemIcon = Icon as typeof BedDouble;
            return (
              <div key={String(label)} className="flex items-center gap-3 border-t border-line py-4">
                <ItemIcon className="size-5 text-forest-700" />
                <span className="text-sm font-bold text-ink">{String(label)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
