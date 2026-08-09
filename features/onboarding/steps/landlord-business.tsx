"use client";

import { useFormContext } from "react-hook-form";
import { Building2, Home, Hash } from "lucide-react";
import { PROPERTY_TYPES, type LandlordBusinessData } from "@/schemas/onboarding";
import { FormField, Input } from "@/components/ui/form-controls";
import { CheckboxChipGroup } from "@/features/onboarding/components/choice-groups";

export default function LandlordBusinessStep() {
  const {
    register,
    watch,
    setValue,
    formState,
  } = useFormContext<{ business: LandlordBusinessData }>();
  const errors = formState.errors;

  const selectedTypes: string[] = watch("business.propertyTypesOffered") ?? [];

  return (
    <div className="space-y-6">
      {/* Business name */}
      <FormField label="Business / agency name" htmlFor="business.businessName" hint="Optional. Enter this only when you manage properties through a business or agency.">
        <Input
          id="business.businessName"
          {...register("business.businessName")}
          placeholder="e.g. Okonkwo Properties Ltd."
          leadingIcon={Building2}
        />
      </FormField>

      {/* Property count */}
      <FormField label="Number of properties you manage" htmlFor="business.propertyCount" required error={errors.business?.propertyCount?.message}>
        <Input
          id="business.propertyCount"
          {...register("business.propertyCount")}
          type="number"
          inputMode="numeric"
          min={1}
          step={1}
          placeholder="e.g. 5"
          leadingIcon={Hash}
          invalid={Boolean(errors.business?.propertyCount)}
        />
      </FormField>

      {/* Property types offered */}
      <CheckboxChipGroup
        name="business.propertyTypesOffered"
        legend={<span className="flex items-center gap-1.5"><Home className="size-4 text-forest-600" aria-hidden="true" />Types of properties you list</span>}
        hint="Select all that apply."
        options={PROPERTY_TYPES.map((type) => ({ value: type, label: type }))}
        values={selectedTypes}
        onChange={(values) => setValue("business.propertyTypesOffered", values, { shouldValidate: true, shouldDirty: true })}
        error={errors.business?.propertyTypesOffered?.message}
      />
    </div>
  );
}
