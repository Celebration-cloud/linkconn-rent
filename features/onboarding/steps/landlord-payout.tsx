"use client";

import { useFormContext } from "react-hook-form";
import { ChevronDown, Landmark, CreditCard, User } from "lucide-react";
import { NIGERIAN_BANKS, type LandlordPayoutData } from "@/schemas/onboarding";
import { useState } from "react";
import { Input } from "@/components/ui/form-controls";

export default function LandlordPayoutStep() {
  const {
    register,
    watch,
    setValue,
    formState,
  } = useFormContext<{ payout: LandlordPayoutData }>();
  const errors = formState.errors;

  const selectedBank = watch("payout.bankName");
  const [bankOpen, setBankOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <strong>Secure & Encrypted.</strong> Your bank details are stored with encryption and used only to process rental income payouts. You can update them anytime.
      </div>

      {/* Bank name — custom select */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800">
          <Landmark className="h-4 w-4 text-brandgreen-500" />
          Bank Name
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setBankOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-2xl border border-navy-200 bg-white px-4 py-3 text-sm text-navy-900 outline-none transition focus:border-navy-500 focus:ring-2 focus:ring-navy-100"
          >
            <span className={selectedBank ? "text-navy-900" : "text-navy-400"}>
              {selectedBank || "Select your bank"}
            </span>
            <ChevronDown className={`size-4 text-content-muted transition-transform ${bankOpen ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>

          {bankOpen && (
            <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-2xl border border-navy-200 bg-white shadow-lg">
              {NIGERIAN_BANKS.map((bank) => (
                <button
                  key={bank}
                  type="button"
                  onClick={() => {
                    setValue("payout.bankName", bank, { shouldValidate: true });
                    setBankOpen(false);
                  }}
                  className="flex w-full items-center px-4 py-2.5 text-sm text-navy-800 hover:bg-navy-50"
                >
                  {bank}
                </button>
              ))}
            </div>
          )}
        </div>
        {errors.payout?.bankName && (
          <p className="text-xs text-red-500">
            {String((errors.payout.bankName as { message?: string })?.message ?? "")}
          </p>
        )}
      </div>

      {/* Account number */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800" htmlFor="payout.accountNumber">
          <CreditCard className="h-4 w-4 text-brandgreen-500" />
          Account Number
        </label>
        <Input
          id="payout.accountNumber"
          {...register("payout.accountNumber")}
          placeholder="0123456789"
          maxLength={10}
          className="tracking-widest"
          invalid={Boolean(errors.payout?.accountNumber)}
        />
        {errors.payout?.accountNumber && (
          <p className="text-xs text-red-500">
            {String((errors.payout.accountNumber as { message?: string })?.message ?? "")}
          </p>
        )}
      </div>

      {/* Account name */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-semibold text-navy-800" htmlFor="payout.accountName">
          <User className="h-4 w-4 text-brandgreen-500" />
          Account Name
        </label>
        <Input
          id="payout.accountName"
          {...register("payout.accountName")}
          placeholder="Ada Okonkwo"
          invalid={Boolean(errors.payout?.accountName)}
        />
        {errors.payout?.accountName && (
          <p className="text-xs text-red-500">
            {String((errors.payout.accountName as { message?: string })?.message ?? "")}
          </p>
        )}
        <p className="text-xs text-navy-400">
          Must match the name on your bank account exactly.
        </p>
      </div>
    </div>
  );
}
