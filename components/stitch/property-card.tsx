import Image from "next/image";
import Link from "next/link";
import { Bath, BedDouble, Heart, MapPin, Scale, ShieldCheck } from "lucide-react";
import type { Property, PropertyCostView } from "@/domain/types/property";
import { formatNaira, getMoveInEstimate } from "@/utils/map-property";

export function StitchPropertyCard({
  property,
  compact = false,
  saved = false,
  saving = false,
  compareSelected = false,
  onToggleSaved,
  onToggleCompare,
  onOpenDetails,
  detailsHref,
  costView = "rent",
  eager = false,
}: {
  property: Property;
  compact?: boolean;
  saved?: boolean;
  saving?: boolean;
  compareSelected?: boolean;
  onToggleSaved?: () => void;
  onToggleCompare?: () => void;
  onOpenDetails?: () => void;
  detailsHref?: string;
  costView?: PropertyCostView;
  eager?: boolean;
}) {
  const moveInEstimate = getMoveInEstimate(property);
  const showingMoveIn = costView === "move-in";
  const moveInAvailable = moveInEstimate !== null;
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-sand-50 transition duration-200 hover:-translate-y-0.5 hover:border-forest-300 hover:shadow-[0_12px_30px_rgba(18,55,42,0.09)]">
      <div className={`relative overflow-hidden ${compact ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        <Image
          src={property.image}
          alt={`${property.title} in ${property.location}`}
          fill
          className="object-cover transition duration-500 group-hover:scale-[1.03]"
          sizes={compact ? "(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 300px" : "(max-width: 768px) 100vw, 33vw"}
          loading={eager ? "eager" : "lazy"}
        />
        {onToggleSaved ? (
          <button
            type="button"
            onClick={onToggleSaved}
            disabled={saving}
            aria-label={`${saved ? "Remove" : "Save"} ${property.title}`}
            aria-pressed={saved}
            className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full border border-white/70 bg-white/95 text-forest-900 shadow-sm backdrop-blur transition hover:bg-white disabled:opacity-60"
          >
            <Heart className="h-4 w-4" fill={saved ? "currentColor" : "none"} />
          </button>
        ) : null}
        {property.verified && (
          <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-md bg-sand-50/95 px-2 py-1 text-[11px] font-bold text-forest-800 shadow-sm">
            <ShieldCheck className="h-3.5 w-3.5" />
            Verified property
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="hidden text-[11px] font-bold uppercase tracking-[0.12em] text-forest-700 md:block">
              {showingMoveIn ? "Estimated move-in" : "Rent"}
            </p>
            <p className="text-lg font-extrabold tabular-nums tracking-[-0.03em] text-ink md:mt-1">
              {showingMoveIn
                ? moveInAvailable
                  ? formatNaira(moveInEstimate)
                  : "Unavailable"
                : formatNaira(property.price)}
              {!showingMoveIn ? (
                <span className="ml-1 text-xs font-semibold text-muted">/{property.period === "month" ? "mo" : "yr"}</span>
              ) : null}
            </p>
            <h3 className="mt-1 text-sm font-bold text-forest-950">{property.title}</h3>
          </div>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
          <MapPin className="h-3.5 w-3.5 shrink-0" />
          {property.location}, {property.city}
        </p>

        <div className="mt-4 flex items-center gap-4 border-t border-line pt-3 text-xs font-semibold text-muted">
          <span className="inline-flex items-center gap-1.5"><BedDouble className="h-4 w-4" />{property.bedrooms} beds</span>
          <span className="inline-flex items-center gap-1.5"><Bath className="h-4 w-4" />{property.bathrooms} baths</span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg bg-sand-100 px-3 py-2">
          <span className="text-[11px] font-semibold text-muted">
            {showingMoveIn ? "Listed rent" : "Estimated move-in"}
          </span>
          <span className="text-xs font-extrabold tabular-nums text-forest-900">
            {showingMoveIn
              ? `${formatNaira(property.price)}/${property.period === "month" ? "mo" : "yr"}`
              : moveInAvailable
                ? formatNaira(moveInEstimate)
                : "Fee estimate unavailable"}
          </span>
        </div>

        <p className={`mt-2 hidden text-[11px] font-semibold md:block ${moveInAvailable ? "text-forest-700" : "text-muted"}`}>
          {moveInAvailable ? "Rent and declared fees included" : "Some move-in fees have not been declared"}
        </p>

        <div className="mt-3 grid grid-cols-1 gap-2 md:mt-4 md:grid-cols-2">
          {onToggleCompare ? (
            <button
              type="button"
              onClick={onToggleCompare}
              aria-pressed={compareSelected}
              className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border px-2 text-xs font-bold transition ${
                compareSelected
                  ? "border-forest-700 bg-forest-50 text-forest-800"
                  : "border-line bg-white text-muted hover:border-forest-300 hover:text-forest-800"
              }`}
            >
              <Scale className="size-4" aria-hidden="true" />
              {compareSelected ? "Selected" : "Compare"}
            </button>
          ) : null}

          <Link
            href={detailsHref || `/properties/${property.id}`}
            onClick={onOpenDetails}
            className={`${onToggleCompare ? "" : "md:col-span-2"} inline-flex min-h-11 items-center justify-center rounded-lg bg-forest-700 px-3 text-sm font-bold text-white transition hover:bg-forest-900`}
          >
            View details
          </Link>
        </div>
      </div>
    </article>
  );
}
