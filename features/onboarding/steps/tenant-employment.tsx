"use client";

import { useFormContext } from "react-hook-form";
import { Briefcase, Building2, DollarSign } from "lucide-react";
import {
  EMPLOYMENT_LABELS,
  INCOME_RANGE_LABELS,
  employmentTypeEnum,
  incomeRangeEnum,
  type TenantEmploymentData,
} from "@/schemas/onboarding";
import { FormField, Input } from "@/components/ui/form-controls";
import { RadioCardGroup } from "@/features/onboarding/components/choice-groups";
import { employmentUsesOrganizationDetails } from "@/features/onboarding/utils/form-values";

export default function TenantEmploymentStep() {
  const {
    register,
    watch,
    setValue,
    formState,
  } = useFormContext<{ employment: TenantEmploymentData }>();
  const errors = formState.errors;

  const selectedEmployment = watch("employment.employmentType");
  const selectedIncome = watch("employment.incomeRange");
  const showEmployerFields = employmentUsesOrganizationDetails(selectedEmployment);

  return (
    <div className="space-y-6">
      {/* Employment type */}
      <RadioCardGroup
        name="employment.employmentType"
        legend={<span className="flex items-center gap-1.5"><Briefcase className="size-4 text-forest-600" aria-hidden="true" />Employment status</span>}
        columns
        options={employmentTypeEnum.options.map((type) => ({ value: type, label: EMPLOYMENT_LABELS[type] }))}
        value={selectedEmployment}
        onChange={(value) => {
          setValue("employment.employmentType", value, { shouldValidate: true, shouldDirty: true });
          if (!employmentUsesOrganizationDetails(value)) {
            setValue("employment.employerName", "", { shouldDirty: true });
            setValue("employment.jobTitle", "", { shouldDirty: true });
          }
        }}
        error={errors.employment?.employmentType?.message}
      />

      {/* Employer fields — shown conditionally */}
      {showEmployerFields && (
        <div className="space-y-4">
          <FormField
            label={selectedEmployment === "SelfEmployed"
                ? "Business Name"
                : selectedEmployment === "Freelancer"
                ? "Primary Client / Platform"
                : "Employer Name"}
            htmlFor="employment.employerName"
            hint="Optional"
          >
            <Input
              id="employment.employerName"
              {...register("employment.employerName")}
              placeholder="e.g. MTN Nigeria PLC"
              leadingIcon={Building2}
            />
          </FormField>
          <FormField label="Job title" htmlFor="employment.jobTitle" hint="Optional">
            <Input
              id="employment.jobTitle"
              {...register("employment.jobTitle")}
              placeholder="e.g. Software Engineer"
            />
          </FormField>
        </div>
      )}

      {/* Income range */}
      <RadioCardGroup
        name="employment.incomeRange"
        legend={<span className="flex items-center gap-1.5"><DollarSign className="size-4 text-forest-600" aria-hidden="true" />Monthly income range</span>}
        options={incomeRangeEnum.options.map((range) => ({ value: range, label: INCOME_RANGE_LABELS[range] }))}
        value={selectedIncome}
        onChange={(value) => setValue("employment.incomeRange", value, { shouldValidate: true, shouldDirty: true })}
        error={errors.employment?.incomeRange?.message}
      />
    </div>
  );
}
