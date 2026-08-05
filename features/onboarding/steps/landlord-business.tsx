"use client";

import { useFormContext } from "react-hook-form";
import { Building2, Home, Hash } from "lucide-react";
import { PROPERTY_TYPES } from "@/schemas/onboarding";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/form-controls";

export default function LandlordBusinessStep() {
  const {
    register,
    watch,
    setValue,
    formState,
  } = useFormContext<any>();
  const errors = formState.errors as any;

  const selectedTypes: string[] = watch("business.propertyTypesOffered") ?? [];

  function toggleType(type: string) {
    const next = selectedTypes.includes(type)
      ? selectedTypes.filter((t) => t !== type)
      : [...selectedTypes, type];
    setValue("business.propertyTypesOffered", next, { shouldValidate: true });
  }

  return (
    <div className="space-y-6">
      {/* Business name */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800" htmlFor="business.businessName">
          <Building2 className="h-4 w-4 text-brandgreen-500" />
          Business / Agency Name{" "}
          <span className="font-normal text-navy-400">(optional)</span>
        </label>
        <Input
          id="business.businessName"
          {...register("business.businessName")}
          placeholder="e.g. Okonkwo Properties Ltd."
        />
      </div>

      {/* Property count */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800" htmlFor="business.propertyCount">
          <Hash className="h-4 w-4 text-brandgreen-500" />
          Number of Properties You Manage
        </label>
        <Input
          id="business.propertyCount"
          {...register("business.propertyCount")}
          type="number"
          min={1}
          placeholder="e.g. 5"
          invalid={Boolean(errors.business?.propertyCount)}
        />
        {errors.business?.propertyCount && (
          <p className="text-xs text-red-500">
            {String((errors.business.propertyCount as { message?: string })?.message ?? "")}
          </p>
        )}
      </div>

      {/* Property types offered */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800">
          <Home className="h-4 w-4 text-brandgreen-500" />
          Types of Properties You List
        </label>
        <p className="text-xs text-navy-400">Select all that apply</p>
        <div className="flex flex-wrap gap-2">
          {PROPERTY_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => toggleType(type)}
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
        {errors.business?.propertyTypesOffered && (
          <p className="text-xs text-red-500">
            {String((errors.business.propertyTypesOffered as { message?: string })?.message ?? "")}
          </p>
        )}
      </div>
    </div>
  );
}
