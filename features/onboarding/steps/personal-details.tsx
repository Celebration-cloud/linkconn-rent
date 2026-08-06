"use client";

import { useFormContext } from "react-hook-form";
import { User, Phone, ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/form-controls";
import type { PersonalDetailsData } from "@/schemas/onboarding";

export default function PersonalDetailsStep() {
  const {
    register,
    formState,
  } = useFormContext<{ personal: PersonalDetailsData }>();
  const errors = formState.errors;

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-4">
        {/* First name */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-navy-800" htmlFor="personal.firstName">
            First Name
          </label>
          <Input
              id="personal.firstName"
              {...register("personal.firstName")}
              placeholder="Ada"
              leadingIcon={User}
              invalid={Boolean(errors.personal?.firstName)}
            />
          {errors.personal?.firstName && (
            <p className="text-xs text-red-500">
              {String((errors.personal.firstName as { message?: string })?.message ?? "")}
            </p>
          )}
        </div>

        {/* Last name */}
        <div className="space-y-1.5">
          <label className="text-sm font-semibold text-navy-800" htmlFor="personal.lastName">
            Last Name
          </label>
          <Input
              id="personal.lastName"
              {...register("personal.lastName")}
              placeholder="Okonkwo"
              leadingIcon={User}
              invalid={Boolean(errors.personal?.lastName)}
            />
          {errors.personal?.lastName && (
            <p className="text-xs text-red-500">
              {String((errors.personal.lastName as { message?: string })?.message ?? "")}
            </p>
          )}
        </div>
      </div>

      {/* Phone */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-navy-800" htmlFor="personal.phone">
          Phone Number
        </label>
        <Input
            id="personal.phone"
            {...register("personal.phone")}
            placeholder="+234 801 234 5678"
            type="tel"
            leadingIcon={Phone}
            invalid={Boolean(errors.personal?.phone)}
          />
        {errors.personal?.phone && (
          <p className="text-xs text-red-500">
            {String((errors.personal.phone as { message?: string })?.message ?? "")}
          </p>
        )}
      </div>

      {/* NIN */}
      <div className="space-y-1.5">
        <label className="text-sm font-semibold text-navy-800" htmlFor="personal.nin">
          <span>NIN</span>{" "}
          <span className="font-normal text-navy-400">(required for identity verification)</span>
        </label>
        <Input
            id="personal.nin"
            {...register("personal.nin")}
            placeholder="12345678901"
            maxLength={11}
            leadingIcon={ShieldCheck}
            invalid={Boolean(errors.personal?.nin)}
          />
        {errors.personal?.nin && (
          <p className="text-xs text-red-500">
            {String((errors.personal.nin as { message?: string })?.message ?? "")}
          </p>
        )}
        <p className="text-xs text-navy-400">
          Your NIN is encrypted and only used for identity verification.
        </p>
      </div>
    </div>
  );
}
