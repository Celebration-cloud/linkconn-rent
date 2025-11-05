"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Select, SelectItem, Card, CardHeader, CardBody } from "@heroui/react";
import { tenantEmploymentSchema } from "@/lib/zodSchemas";
import { useEffect } from "react";
import { useTenantOnboardStore } from "@/store/tenantOnboardStore";

export default function TenantEmploymentPage() {
  const router = useRouter();
  const { identity, employment, setEmployment, step, setStep, preference } =
    useTenantOnboardStore();

  const form = useForm({
    resolver: zodResolver(tenantEmploymentSchema),
    defaultValues: employment || {
      employmentStatus: "",
      companyName: "",
      monthlyIncome: "",
      occupation: "",
      payslip: [],
      confirm: false,
    },
  });
    useEffect(() => {
      if (!identity) {
        router.replace("/onboarding/tenant/identity");
      } else if (!employment) {
        router.replace("/onboarding/tenant/employment");
      } else if (!preference) {
        router.replace("/onboarding/tenant/preference");
      } else {
        router.replace("/onboarding/tenant/success");
      }
    }, [identity, employment, preference, router]);

  useEffect(() => {
    setStep(2);
  }, [setStep]);

  const onSubmit = async (values) => {
    setEmployment(values);
    router.push("/onboarding/tenant/preference");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-lg"
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
        <CardHeader className="flex flex-col items-center gap-1 pb-2 border-border/60">
          <h2 className="text-xl font-semibold text-center tracking-tight">
            Employment & Financial Information
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            Provide details to verify your financial capability
          </p>
        </CardHeader>

        <CardBody>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Employment Status */}
            <div>
              <label>Employment Status</label>
              <Select
                {...form.register("employmentStatus")}
                placeholder="Select your employment status"
                className="mt-1"
              >
                <SelectItem key="Employed" value="Employed">
                  Employed
                </SelectItem>
                <SelectItem key="Self-employed" value="Self-employed">
                  Self-employed
                </SelectItem>
                <SelectItem key="Unemployed" value="Unemployed">
                  Unemployed
                </SelectItem>
              </Select>
              {form.formState.errors.employmentStatus && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.employmentStatus.message}
                </p>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label>Company Name (if applicable)</label>
              <Input
                {...form.register("companyName")}
                placeholder="e.g. Zenith Bank PLC"
                className="mt-1"
              />
            </div>

            {/* Occupation */}
            <div>
              <label>Occupation</label>
              <Input
                {...form.register("occupation")}
                placeholder="e.g. Software Engineer"
                className="mt-1"
              />
              {form.formState.errors.occupation && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.occupation.message}
                </p>
              )}
            </div>

            {/* Monthly Income */}
            <div>
              <label>Monthly Income (₦)</label>
              <Input
                {...form.register("monthlyIncome")}
                placeholder="e.g. ₦250,000"
                className="mt-1"
              />
              {form.formState.errors.monthlyIncome && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.monthlyIncome.message}
                </p>
              )}
            </div>

            {/* Payslip Upload */}
            <div>
              <label>Upload Payslip / Proof of Income</label>
              <Input
                type="file"
                multiple
                accept="application/pdf,image/*"
                {...form.register("payslip")}
                className="mt-1"
              />
              {form.formState.errors.payslip && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.payslip.message}
                </p>
              )}
            </div>

            {/* Confirm Checkbox */}
            <div className="flex items-center gap-2 mt-2">
              <input
                type="checkbox"
                {...form.register("confirm")}
                className="accent-primary"
              />
              <label className="text-sm text-muted-foreground">
                I confirm my employment and income details are accurate
              </label>
            </div>
            {form.formState.errors.confirm && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.confirm.message}
              </p>
            )}

            {/* Submit */}
            <Button type="submit" className="w-full mt-4">
              Continue to Preference Setup
            </Button>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  );
}
