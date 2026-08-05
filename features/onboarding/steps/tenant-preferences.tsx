"use client";

import { useFormContext } from "react-hook-form";
import { MapPin, Home, Banknote, Calendar } from "lucide-react";
import { NIGERIAN_CITIES, PROPERTY_TYPES } from "@/schemas/onboarding";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/form-controls";

export default function TenantPreferencesStep() {
  const {
    register,
    formState,
    watch,
    setValue,
  } = useFormContext<any>();
  const errors = formState.errors as any;

  const selectedLocations: string[] = watch("preferences.preferredLocations") ?? [];
  const selectedTypes: string[] = watch("preferences.preferredTypes") ?? [];

  function toggleItem(
    field: "preferences.preferredLocations" | "preferences.preferredTypes",
    value: string,
    current: string[]
  ) {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    setValue(field, next, { shouldValidate: true });
  }

  return (
    <div className="space-y-6">
      {/* Preferred locations */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800">
          <MapPin className="h-4 w-4 text-brandgreen-500" />
          Preferred Locations
        </label>
        <p className="text-xs text-navy-400">Select all cities you&apos;d like to live in</p>
        <div className="flex flex-wrap gap-2">
          {NIGERIAN_CITIES.map((city) => (
            <button
              key={city}
              type="button"
              onClick={() =>
                toggleItem("preferences.preferredLocations", city, selectedLocations)
              }
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                selectedLocations.includes(city)
                  ? "border-brandgreen-500 bg-brandgreen-50 text-brandgreen-700"
                  : "border-navy-200 bg-white text-navy-600 hover:border-navy-400"
              )}
            >
              {city}
            </button>
          ))}
        </div>
        {errors.preferences?.preferredLocations && (
          <p className="text-xs text-red-500">
            {String((errors.preferences.preferredLocations as { message?: string })?.message ?? "")}
          </p>
        )}
      </div>

      {/* Preferred property types */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800">
          <Home className="h-4 w-4 text-brandgreen-500" />
          Property Types
        </label>
        <p className="text-xs text-navy-400">What kinds of homes are you looking for?</p>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                toggleItem("preferences.preferredTypes", type, selectedTypes)
              }
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                selectedTypes.includes(type)
                  ? "border-brandgreen-500 bg-brandgreen-50 text-brandgreen-700"
                  : "border-navy-200 bg-white text-navy-600 hover:border-navy-400"
              )}
            >
              {type}
            </button>
          ))}
        </div>
        {errors.preferences?.preferredTypes && (
          <p className="text-xs text-red-500">
            {String((errors.preferences.preferredTypes as { message?: string })?.message ?? "")}
          </p>
        )}
      </div>

      {/* Budget range */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800">
          <Banknote className="h-4 w-4 text-brandgreen-500" />
          Monthly Budget Range (₦) <span className="font-normal text-navy-400">(optional)</span>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Input
              {...register("preferences.budgetMin")}
              type="number"
              placeholder="Min e.g. 50000"
            />
          </div>
          <div>
            <Input
              {...register("preferences.budgetMax")}
              type="number"
              placeholder="Max e.g. 200000"
            />
          </div>
        </div>
      </div>

      {/* Move-in date */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800" htmlFor="preferences.moveInDate">
          <Calendar className="h-4 w-4 text-brandgreen-500" />
          Earliest Move-in Date <span className="font-normal text-navy-400">(optional)</span>
        </label>
        <Input
          id="preferences.moveInDate"
          {...register("preferences.moveInDate")}
          type="date"
        />
      </div>
    </div>
  );
}
