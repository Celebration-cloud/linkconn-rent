"use client";

import { useFormContext } from "react-hook-form";
import { Briefcase, Building2, DollarSign } from "lucide-react";
import {
  EMPLOYMENT_LABELS,
  INCOME_RANGE_LABELS,
  employmentTypeEnum,
  incomeRangeEnum,
} from "@/schemas/onboarding";
import { cn } from "@/utils/cn";
import { Input } from "@/components/ui/form-controls";

export default function TenantEmploymentStep() {
  const {
    register,
    watch,
    setValue,
    formState,
  } = useFormContext<any>();
  const errors = formState.errors as any;

  const selectedEmployment = watch("employment.employmentType");
  const selectedIncome = watch("employment.incomeRange");
  const showEmployerFields =
    selectedEmployment === "Employed" ||
    selectedEmployment === "SelfEmployed" ||
    selectedEmployment === "Freelancer";

  return (
    <div className="space-y-6">
      {/* Employment type */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800">
          <Briefcase className="h-4 w-4 text-brandgreen-500" />
          Employment Status
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {employmentTypeEnum.options.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() =>
                setValue("employment.employmentType", type, {
                  shouldValidate: true,
                })
              }
              className={cn(
                "rounded-2xl border px-3 py-2.5 text-center text-xs font-medium transition-all",
                selectedEmployment === type
                  ? "border-brandgreen-500 bg-brandgreen-50 text-brandgreen-700"
                  : "border-navy-200 bg-white text-navy-600 hover:border-navy-400"
              )}
            >
              {EMPLOYMENT_LABELS[type]}
            </button>
          ))}
        </div>
        {errors.employment?.employmentType && (
          <p className="text-xs text-red-500">
            {String((errors.employment.employmentType as { message?: string })?.message ?? "")}
          </p>
        )}
      </div>

      {/* Employer fields — shown conditionally */}
      {showEmployerFields && (
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-navy-800" htmlFor="employment.employerName">
              <Building2 className="inline h-4 w-4 text-navy-400 mr-1" />
              {selectedEmployment === "SelfEmployed"
                ? "Business Name"
                : selectedEmployment === "Freelancer"
                ? "Primary Client / Platform"
                : "Employer Name"}
              <span className="font-normal text-navy-400 ml-1">(optional)</span>
            </label>
            <Input
              id="employment.employerName"
              {...register("employment.employerName")}
              placeholder="e.g. MTN Nigeria PLC"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-navy-800" htmlFor="employment.jobTitle">
              Job Title <span className="font-normal text-navy-400">(optional)</span>
            </label>
            <Input
              id="employment.jobTitle"
              {...register("employment.jobTitle")}
              placeholder="e.g. Software Engineer"
            />
          </div>
        </div>
      )}

      {/* Income range */}
      <div className="space-y-2">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800">
          <DollarSign className="h-4 w-4 text-brandgreen-500" />
          Monthly Income Range
        </label>
        <div className="space-y-2">
          {incomeRangeEnum.options.map((range) => (
            <button
              key={range}
              type="button"
              onClick={() =>
                setValue("employment.incomeRange", range, {
                  shouldValidate: true,
                })
              }
              className={cn(
                "flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-sm transition-all",
                selectedIncome === range
                  ? "border-brandgreen-500 bg-brandgreen-50 text-brandgreen-800"
                  : "border-navy-200 bg-white text-navy-700 hover:border-navy-400"
              )}
            >
              <span>{INCOME_RANGE_LABELS[range]}</span>
              <span
                className={cn(
                  "h-4 w-4 rounded-full border-2 transition-all",
                  selectedIncome === range
                    ? "border-brandgreen-500 bg-brandgreen-500"
                    : "border-navy-300 bg-white"
                )}
              />
            </button>
          ))}
        </div>
        {errors.employment?.incomeRange && (
          <p className="text-xs text-red-500">
            {String((errors.employment.incomeRange as { message?: string })?.message ?? "")}
          </p>
        )}
      </div>
    </div>
  );
}
