"use client";

import { useFormContext } from "react-hook-form";
import { MapPin, Home, Banknote, Calendar } from "lucide-react";
import {
  NIGERIAN_CITIES,
  PROPERTY_TYPES,
  type TenantPreferencesData,
} from "@/schemas/onboarding";
import { FormField, Input } from "@/components/ui/form-controls";
import { CheckboxChipGroup } from "@/features/onboarding/components/choice-groups";
import { normalizeOptionalNumberInput } from "@/features/onboarding/utils/form-values";

export default function TenantPreferencesStep() {
  const {
    register,
    formState,
    watch,
    setValue,
  } = useFormContext<{ preferences: TenantPreferencesData }>();
  const errors = formState.errors;

  const selectedLocations: string[] = watch("preferences.preferredLocations") ?? [];
  const selectedTypes: string[] = watch("preferences.preferredTypes") ?? [];

  return (
    <div className="space-y-6">
      <CheckboxChipGroup
        name="preferences.preferredLocations"
        legend={<span className="flex items-center gap-1.5"><MapPin className="size-4 text-forest-600" aria-hidden="true" />Preferred locations</span>}
        hint="Select all cities you would like to live in."
        options={NIGERIAN_CITIES.map((city) => ({ value: city, label: city }))}
        values={selectedLocations}
        onChange={(values) => setValue("preferences.preferredLocations", values, { shouldValidate: true, shouldDirty: true })}
        error={errors.preferences?.preferredLocations?.message}
      />

      {/* Preferred property types */}
      <CheckboxChipGroup
        name="preferences.preferredTypes"
        legend={<span className="flex items-center gap-1.5"><Home className="size-4 text-forest-600" aria-hidden="true" />Property types</span>}
        hint="Select every home type that works for you."
        options={PROPERTY_TYPES.map((type) => ({ value: type, label: type }))}
        values={selectedTypes}
        onChange={(values) => setValue("preferences.preferredTypes", values, { shouldValidate: true, shouldDirty: true })}
        error={errors.preferences?.preferredTypes?.message}
      />

      {/* Budget range */}
      <fieldset className="space-y-2">
        <legend className="flex items-center gap-1.5 text-sm font-semibold text-content">
          <Banknote className="h-4 w-4 text-brandgreen-500" />
          Monthly Budget Range (₦) <span className="font-normal text-navy-400">(optional)</span>
        </legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <FormField label="Minimum" htmlFor="preferences.budgetMin" error={errors.preferences?.budgetMin?.message}>
            <Input
              id="preferences.budgetMin"
              {...register("preferences.budgetMin", {
                setValueAs: normalizeOptionalNumberInput,
              })}
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              placeholder="Min e.g. 50000"
              invalid={Boolean(errors.preferences?.budgetMin)}
            />
          </FormField>
          <FormField label="Maximum" htmlFor="preferences.budgetMax" error={errors.preferences?.budgetMax?.message}>
            <Input
              id="preferences.budgetMax"
              {...register("preferences.budgetMax", {
                setValueAs: normalizeOptionalNumberInput,
              })}
              type="number"
              inputMode="numeric"
              min={0}
              step={1000}
              placeholder="Max e.g. 200000"
              invalid={Boolean(errors.preferences?.budgetMax)}
            />
          </FormField>
        </div>
      </fieldset>

      {/* Move-in date */}
      <FormField label="Earliest move-in date (optional)" htmlFor="preferences.moveInDate" error={errors.preferences?.moveInDate?.message}>
        <Input
          id="preferences.moveInDate"
          {...register("preferences.moveInDate")}
          type="date"
          leadingIcon={Calendar}
          invalid={Boolean(errors.preferences?.moveInDate)}
        />
      </FormField>
    </div>
  );
}
