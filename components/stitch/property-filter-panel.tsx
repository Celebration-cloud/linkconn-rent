"use client";

import { LoaderCircle, RotateCcw } from "lucide-react";
import { Checkbox, Input, Select } from "@/components/ui/form-controls";

export const PROPERTY_TYPES = [
  "Apartment",
  "Duplex",
  "Studio",
  "Shared Apartment",
  "Mansion",
] as const;

export const PROPERTY_AMENITIES = [
  "24/7 Power",
  "Security",
  "Parking",
  "Borehole Water",
  "Air Conditioning",
  "Wifi Ready",
  "Furnished",
  "Swimming Pool",
] as const;

export type AdvancedFilterDraft = {
  minPrice: string;
  maxPrice: string;
  bathrooms: string;
  types: string[];
  amenities: string[];
};

/* eslint-disable no-unused-vars -- callback parameter labels document the component contract */
type PropertyFilterPanelProps = {
  draft: AdvancedFilterDraft;
  onChange: (draft: AdvancedFilterDraft) => void;
  onApply: () => void;
  onReset: () => void;
  onCancel: () => void;
  onRetryCount: () => void;
  resultCount: number | null;
  counting: boolean;
  countError: string | null;
  idPrefix: string;
  presentation?: "drawer" | "rail" | "deck";
};
/* eslint-enable no-unused-vars */

function toggleValue(values: string[], value: string) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : [...values, value];
}

export function PropertyFilterPanel({
  draft,
  onChange,
  onApply,
  onReset,
  onCancel,
  onRetryCount,
  resultCount,
  counting,
  countError,
  idPrefix,
  presentation = "drawer",
}: PropertyFilterPanelProps) {
  const isDrawer = presentation === "drawer";
  const isDeck = presentation === "deck";

  return (
    <div>
      <div className="flex items-center justify-end gap-3">
        <button
          type="button"
          onClick={onReset}
          className="inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-forest-700"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" /> Reset
        </button>
      </div>

      <div
        className={
          isDeck
            ? "mt-5 grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            : "mt-5 space-y-6"
        }
      >
        <fieldset>
          <legend className="mb-2 text-xs font-bold text-forest-900">Rent range</legend>
          <div className="grid grid-cols-2 gap-2">
            <Input
              id={`${idPrefix}-minimum-rent`}
              value={draft.minPrice}
              onChange={(event) => onChange({ ...draft, minPrice: event.target.value })}
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Minimum"
              aria-label="Minimum rent"
            />
            <Input
              id={`${idPrefix}-maximum-rent`}
              value={draft.maxPrice}
              onChange={(event) => onChange({ ...draft, maxPrice: event.target.value })}
              type="number"
              min="0"
              inputMode="numeric"
              placeholder="Maximum"
              aria-label="Maximum rent"
            />
          </div>
        </fieldset>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-forest-900">Bathrooms</span>
          <Select
            value={draft.bathrooms}
            onChange={(event) => onChange({ ...draft, bathrooms: event.target.value })}
          >
            <option value="">Any number</option>
            <option value="1">1 or more</option>
            <option value="2">2 or more</option>
            <option value="3">3 or more</option>
            <option value="4">4 or more</option>
          </Select>
        </label>

        <fieldset>
          <legend className="mb-2 text-xs font-bold text-forest-900">Property types</legend>
          <div className={isDeck ? "grid grid-cols-2 gap-x-4" : "space-y-1"}>
            {PROPERTY_TYPES.map((type) => (
              <label key={type} className="flex min-h-11 items-center gap-3 text-sm font-semibold text-forest-900">
                <Checkbox
                  checked={draft.types.includes(type)}
                  onChange={() => onChange({ ...draft, types: toggleValue(draft.types, type) })}
                />
                {type}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="mb-2 text-xs font-bold text-forest-900">Amenities</legend>
          <div className={isDeck ? "grid grid-cols-2 gap-x-4" : "grid grid-cols-1 gap-1"}>
            {PROPERTY_AMENITIES.map((amenity) => (
              <label key={amenity} className="flex min-h-11 items-center gap-3 text-sm font-semibold text-forest-900">
                <Checkbox
                  checked={draft.amenities.includes(amenity)}
                  onChange={() => onChange({ ...draft, amenities: toggleValue(draft.amenities, amenity) })}
                />
                {amenity}
              </label>
            ))}
          </div>
        </fieldset>

        {countError ? (
          <div className="rounded-lg border border-warning/30 bg-warning-muted p-3" role="alert">
            <p className="text-xs leading-5 text-content">{countError}</p>
            <button type="button" onClick={onRetryCount} className="mt-1 min-h-10 text-xs font-bold text-forest-700">
              Retry count
            </button>
          </div>
        ) : null}

        <div className={isDrawer ? "grid grid-cols-2 gap-2" : isDeck ? "flex items-end md:col-span-2 lg:col-span-3" : "block"}>
          {isDrawer ? (
            <button type="button" onClick={onCancel} className="stitch-button stitch-button-secondary w-full">
              Cancel
            </button>
          ) : null}
          <button type="button" onClick={onApply} className={isDeck ? "stitch-button ml-auto min-w-52" : "stitch-button w-full"} disabled={counting}>
            {counting ? (
              <><LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> Checking…</>
            ) : resultCount === null ? (
              "Show properties"
            ) : (
              `Show ${resultCount} ${resultCount === 1 ? "property" : "properties"}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
