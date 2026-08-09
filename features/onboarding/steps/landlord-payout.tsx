"use client";

import { useFormContext } from "react-hook-form";
import { Landmark, CreditCard, User } from "lucide-react";
import { NIGERIAN_BANKS, type LandlordPayoutData } from "@/schemas/onboarding";
import { FormField, Input, Select } from "@/components/ui/form-controls";

export default function LandlordPayoutStep() {
  const {
    register,
    formState,
  } = useFormContext<{ payout: LandlordPayoutData }>();
  const errors = formState.errors;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <strong>Secure & Encrypted.</strong> Your bank details are stored with encryption and used only to process rental income payouts. You can update them anytime.
      </div>

      <FormField label="Bank name" htmlFor="payout.bankName" required error={errors.payout?.bankName?.message}>
        <Select
          id="payout.bankName"
          {...register("payout.bankName")}
          leadingIcon={Landmark}
          invalid={Boolean(errors.payout?.bankName)}
        >
          <option value="">Select your bank</option>
          {NIGERIAN_BANKS.map((bank) => <option key={bank} value={bank}>{bank}</option>)}
        </Select>
      </FormField>

      {/* Account number */}
      <FormField label="Account number" htmlFor="payout.accountNumber" required error={errors.payout?.accountNumber?.message}>
        <Input
          id="payout.accountNumber"
          {...register("payout.accountNumber")}
          placeholder="0123456789"
          autoComplete="off"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={10}
          leadingIcon={CreditCard}
          className="tracking-widest"
          invalid={Boolean(errors.payout?.accountNumber)}
        />
      </FormField>

      {/* Account name */}
      <FormField label="Account name" htmlFor="payout.accountName" required error={errors.payout?.accountName?.message} hint="Must match the name on your bank account exactly.">
        <Input
          id="payout.accountName"
          {...register("payout.accountName")}
          placeholder="Ada Okonkwo"
          autoComplete="name"
          leadingIcon={User}
          invalid={Boolean(errors.payout?.accountName)}
        />
      </FormField>
    </div>
  );
}
