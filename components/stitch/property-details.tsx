"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bath,
  BedDouble,
  CalendarDays,
  Check,
  Heart,
  Home,
  MapPin,
  MessageCircle,
  Ruler,
  Share2,
  ShieldCheck,
} from "lucide-react";
import type { Property } from "@/domain/types/property";
import type { PropertyNavigationTarget } from "@/features/properties/types/navigation";
import { PropertyDirectionsSection } from "@/features/properties/components/property-directions-section";
import { formatNaira, getMoveInEstimate } from "@/utils/map-property";
import { toastError, toastSuccess } from "@/stores/toast-store";
import { StitchPropertyCard } from "./property-card";

async function readJson(response: Response) {
  return response.json() as Promise<{ success: boolean; message: string; data?: { conversationId?: string } }>;
}

export function PropertyDetails({
  property,
  relatedProperties,
  navigationTarget,
  returnTo = "/properties",
}: {
  property: Property;
  relatedProperties: Property[];
  navigationTarget: PropertyNavigationTarget | null;
  returnTo?: string;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const gallery = useMemo(
    () => Array.from(new Set([property.image, ...(property.images || []), "/images/hero.jpg", "/images/dashboard-bg.jpg"])).slice(0, 4),
    [property.image, property.images],
  );

  const run = async (key: string, url: string, body: Record<string, unknown>) => {
    setBusy(key);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await readJson(response);
      if (response.status === 401) {
        router.push(`/login?next=${encodeURIComponent(`/properties/${property.id}`)}`);
        return;
      }
      if (!result.success) throw new Error(result.message);
      toastSuccess("Saved", result.message);
      if (result.data?.conversationId) router.push(`/messages?conversation=${result.data.conversationId}`);
    } catch (error) {
      toastError("Action failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const moveInEstimate = getMoveInEstimate(property);
  const moveInRows = moveInEstimate === null
    ? []
    : [
        [property.period === "month" ? "Monthly rent" : "Annual rent", property.price],
        ["Caution deposit", property.cautionFee as number],
        ["Legal fee", property.legalFee as number],
        ["Agency fee", property.agencyFee as number],
        ["Service charge", property.serviceCharge as number],
      ] as const;

  return (
    <main id="main-content" className="min-h-screen bg-sand-50 pb-20 pt-20">
      <div className="stitch-container">
        <nav className="py-5 text-xs font-semibold text-muted">
          <Link href={returnTo} className="hover:text-forest-800">Properties</Link>
          <span className="mx-2">/</span>
          <span>{property.location}</span>
        </nav>

        <section className="grid gap-3 overflow-hidden rounded-xl lg:grid-cols-[1.55fr_1fr]">
          <div className="relative min-h-80 lg:min-h-[30rem]">
            <Image src={gallery[0]} alt={property.title} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 62vw" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {gallery.slice(1).map((image, index) => (
              <div key={image} className={`relative min-h-40 overflow-hidden ${index === 2 ? "col-span-2" : ""}`}>
                <Image src={image} alt={`${property.title} view ${index + 2}`} fill className="object-cover" sizes="(max-width: 1024px) 50vw, 20vw" />
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-10 py-10 lg:grid-cols-[1fr_23rem]">
          <article>
            <div className="flex flex-col justify-between gap-5 border-b border-line pb-7 sm:flex-row sm:items-start">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {property.verified && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-forest-100 px-2 py-1 text-xs font-bold text-forest-800">
                      <ShieldCheck className="h-4 w-4" /> Verified property
                    </span>
                  )}
                  <span className="text-xs font-semibold text-muted">Response history stays with this listing</span>
                </div>
                <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.045em] text-ink sm:text-4xl">{property.title}</h1>
                <p className="mt-3 flex items-center gap-1.5 text-sm text-muted">
                  <MapPin className="h-4 w-4 text-forest-700" /> {property.location}, {property.city}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toastSuccess("Link copied", "The property link is ready to share.");
                  }}
                  className="stitch-button stitch-button-secondary"
                >
                  <Share2 className="h-4 w-4" /> Share
                </button>
                <button
                  onClick={() => {
                    setSaved((value) => !value);
                    void run("save", "/api/saved-properties", { propertyId: property.id });
                  }}
                  className="stitch-button stitch-button-secondary"
                  aria-pressed={saved}
                >
                  <Heart className={`h-4 w-4 ${saved ? "fill-forest-700" : ""}`} /> Save
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-b border-line py-6 sm:grid-cols-4">
              {[
                [BedDouble, `${property.bedrooms} bedrooms`],
                [Bath, `${property.bathrooms} bathrooms`],
                [Ruler, `${property.area} m²`],
                [HomeIcon, property.type],
              ].map(([Icon, text]) => {
                const ItemIcon = Icon as typeof BedDouble;
                return (
                  <div key={String(text)} className="flex items-center gap-2 text-sm font-semibold text-forest-900">
                    <ItemIcon className="h-5 w-5 text-forest-700" /> {String(text)}
                  </div>
                );
              })}
            </div>

            <section className="border-b border-line py-8">
              <h2 className="text-2xl font-extrabold tracking-tight text-ink">About the property</h2>
              <p className="mt-4 max-w-3xl text-pretty text-base leading-8 text-muted">{property.description}</p>
            </section>

            <section className="border-b border-line py-8">
              <h2 className="text-2xl font-extrabold tracking-tight text-ink">Amenities</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {property.amenities.map((amenity) => (
                  <div key={amenity} className="flex items-center gap-2 text-sm font-semibold text-forest-900">
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-forest-100"><Check className="h-3.5 w-3.5" /></span>
                    {amenity}
                  </div>
                ))}
              </div>
            </section>

            <PropertyDirectionsSection target={navigationTarget} />

            <section className="py-8">
              <h2 className="text-2xl font-extrabold tracking-tight text-ink">House rules</h2>
              <ul className="mt-4 space-y-3 text-sm leading-6 text-muted">
                {(property.houseRules?.length ? property.houseRules : ["No smoking indoors", "Keep shared areas tidy", "Viewing appointments require confirmation"]).map((rule) => (
                  <li key={rule} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-forest-700" />{rule}</li>
                ))}
              </ul>
            </section>
          </article>

          <aside className="h-fit lg:sticky lg:top-24">
            <div className="stitch-card p-5">
              <p className="text-3xl font-extrabold tabular-nums tracking-tight text-forest-900">{formatNaira(property.price)}</p>
              <p className="mt-1 text-xs font-semibold text-muted">per {property.period}</p>
              <button
                disabled={busy === "apply"}
                onClick={() => run("apply", "/api/applications", { propertyId: property.id, message: "I would like to apply for this property.", idempotencyKey: crypto.randomUUID() })}
                className="stitch-button mt-5 w-full disabled:opacity-60"
              >
                Apply to rent
              </button>
              <button
                disabled={busy === "viewing"}
                onClick={() => run("viewing", "/api/viewings", { propertyId: property.id, scheduledAt: new Date(Date.now() + 86400000 * 2).toISOString(), idempotencyKey: crypto.randomUUID() })}
                className="stitch-button stitch-button-secondary mt-3 w-full disabled:opacity-60"
              >
                <CalendarDays className="h-4 w-4" /> Book viewing
              </button>
              <button
                disabled={busy === "message"}
                onClick={() => run("message", "/api/conversations", { propertyId: property.id })}
                className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 text-sm font-bold text-forest-700 hover:text-forest-900 disabled:opacity-60"
              >
                <MessageCircle className="h-4 w-4" /> Message landlord
              </button>
            </div>

            <div className="mt-5 overflow-hidden rounded-xl border border-line bg-white">
              <div className="bg-forest-900 px-5 py-4 text-white">
                <p className="text-xs font-bold text-forest-200">Move-in breakdown</p>
                <p className="mt-2 text-2xl font-extrabold">
                  {moveInEstimate === null
                    ? "Fee estimate unavailable"
                    : formatNaira(moveInEstimate)}
                </p>
              </div>
              <dl className="p-5">
                {moveInRows.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 border-b border-line py-3 text-sm last:border-0">
                    <dt className="text-muted">{label}</dt>
                    <dd className="font-bold tabular-nums text-ink">{formatNaira(value)}</dd>
                  </div>
                ))}
                {moveInEstimate === null ? (
                  <p className="py-3 text-sm leading-6 text-muted">
                    The listing does not yet contain a complete, valid fee breakdown.
                  </p>
                ) : null}
              </dl>
            </div>
          </aside>
        </div>

        {relatedProperties.length > 0 && (
          <section className="border-t border-line py-12">
            <h2 className="text-2xl font-extrabold tracking-tight text-ink">Similar verified homes</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-3">
              {relatedProperties.slice(0, 3).map((item) => <StitchPropertyCard key={item.id} property={item} compact />)}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const HomeIcon = Home;
