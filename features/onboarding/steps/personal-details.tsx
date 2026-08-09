"use client";

import { useFormContext } from "react-hook-form";
import { User, Phone, ShieldCheck } from "lucide-react";
import { FormField, Input } from "@/components/ui/form-controls";
import type { PersonalDetailsData } from "@/schemas/onboarding";

export default function PersonalDetailsStep() {
  const {
    register,
    formState,
  } = useFormContext<{ personal: PersonalDetailsData }>();
  const errors = formState.errors;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* First name */}
        <FormField label="First name" htmlFor="personal.firstName" required error={errors.personal?.firstName?.message}>
          <Input
            id="personal.firstName"
            {...register("personal.firstName")}
            autoComplete="given-name"
            placeholder="Ada"
            leadingIcon={User}
            invalid={Boolean(errors.personal?.firstName)}
            aria-describedby="personal.firstName-description"
          />
        </FormField>

        {/* Last name */}
        <FormField label="Last name" htmlFor="personal.lastName" required error={errors.personal?.lastName?.message}>
          <Input
            id="personal.lastName"
            {...register("personal.lastName")}
            autoComplete="family-name"
            placeholder="Okonkwo"
            leadingIcon={User}
            invalid={Boolean(errors.personal?.lastName)}
            aria-describedby="personal.lastName-description"
          />
        </FormField>
      </div>

      {/* Phone */}
      <FormField label="Phone number" htmlFor="personal.phone" required error={errors.personal?.phone?.message}>
        <Input
          id="personal.phone"
          {...register("personal.phone")}
          autoComplete="tel"
          inputMode="tel"
          placeholder="+234 801 234 5678"
          type="tel"
          leadingIcon={Phone}
          invalid={Boolean(errors.personal?.phone)}
          aria-describedby="personal.phone-description"
        />
      </FormField>

      {/* NIN */}
      <FormField
        label="NIN"
        htmlFor="personal.nin"
        required
        error={errors.personal?.nin?.message}
        hint="Your 11-digit NIN is encrypted and only used for identity verification."
      >
        <Input
          id="personal.nin"
          {...register("personal.nin")}
          autoComplete="off"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="12345678901"
          maxLength={11}
          leadingIcon={ShieldCheck}
          invalid={Boolean(errors.personal?.nin)}
          aria-describedby="personal.nin-description"
        />
      </FormField>
    </div>
  );
}
