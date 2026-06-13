"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Select, SelectItem, Card, CardHeader, CardBody } from "@heroui/react";
import { Banknote } from "lucide-react";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { landlordPayoutSchema } from "@/lib/zodSchemas";
import { useLandlordOnboardStore } from "@/store/useLandlordOnboardStore";

export default function LandlordPayoutSetup() {
  const router = useRouter();
  const { payout, setPayout, step, nextStep } = useLandlordOnboardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(landlordPayoutSchema),
    defaultValues: payout || {
      bank: "",
      accountNumber: "",
      accountName: "",
      confirmOwnership: false,
    },
  });

  const verifyAccount = async () => {
    const bank = form.getValues("bank");
    const acc = form.getValues("accountNumber");

    if (!bank || acc.length !== 10) return;

    // Simulated account name fetch
    form.setValue("accountName", "John Doe");
  };

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    setPayout(values);

    const state = useLandlordOnboardStore.getState();
    const payload = {
      identity: state.identity,
      property: state.property,
      payout: values,
    };

    try {
      const res = await fetch("/api/onboarding/landlord", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Onboarding submission failed");
      }

      nextStep();
      router.push("/onboarding/landlord/success");
    } catch (err) {
      console.error("Landlord onboarding failed:", err);
      alert(err.message || "Failed to complete onboarding. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg"
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
    >
      {/* Step tracker */}
      <div className="mb-4 flex justify-between items-center">
        <div
          className={`w-1/3 h-2 rounded ${step >= 1 ? "bg-primary" : "bg-gray-300"}`}
        />
        <div
          className={`w-1/3 h-2 rounded ${step >= 2 ? "bg-primary" : "bg-gray-300"}`}
        />
        <div
          className={`w-1/3 h-2 rounded ${step >= 3 ? "bg-primary" : "bg-gray-300"}`}
        />
      </div>

      <Card className="shadow-lg border-border bg-card/60 backdrop-blur">
        <CardHeader className="flex flex-col items-center gap-1 pb-2">
          <Banknote className="w-8 h-8 text-primary" />
          <h2 className="text-xl font-semibold">Payout Account Setup</h2>
          <p className="text-sm text-muted-foreground text-center">
            Step 3 of 3 — Verify your bank for rent payments
          </p>
        </CardHeader>

        <CardBody>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            {/* Bank Name */}
            <div>
              <label>Bank Name</label>
              <Select {...form.register("bank")} placeholder="Select bank">
                {[
                  { code: "044", name: "Access Bank" },
                  { code: "058", name: "GTBank" },
                  { code: "011", name: "First Bank" },
                  { code: "033", name: "UBA" },
                  { code: "057", name: "Zenith Bank" },
                  { code: "232", name: "Sterling Bank" },
                ].map((bank) => (
                  <SelectItem key={bank.code} value={bank.name}>
                    {bank.name}
                  </SelectItem>
                ))}
              </Select>
              {form.formState.errors.bank && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.bank.message}
                </p>
              )}
            </div>

            {/* Account Number */}
            <div>
              <label>Account Number</label>
              <Input
                {...form.register("accountNumber")}
                className="mt-1"
                maxLength={10}
                placeholder="e.g. 0123456789"
                onBlur={verifyAccount}
              />
              {form.formState.errors.accountNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.accountNumber.message}
                </p>
              )}
            </div>

            {/* Account Name */}
            <div>
              <label>Account Name</label>
              <Input
                {...form.register("accountName")}
                className="mt-1 bg-muted cursor-not-allowed"
                placeholder="Account Name"
              />
              {form.formState.errors.accountName && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.accountName.message}
                </p>
              )}
            </div>

            {/* Confirm Ownership */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...form.register("confirmOwnership")}
                className="accent-primary"
              />
              <label>I confirm this account belongs to me</label>
            </div>
            {form.formState.errors.confirmOwnership && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.confirmOwnership.message}
              </p>
            )}

            <Button
              className="w-full mt-4"
              disabled={isSubmitting}
              type="submit"
            >
              {isSubmitting ? "Submitting..." : "Complete Onboarding"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  );
}
