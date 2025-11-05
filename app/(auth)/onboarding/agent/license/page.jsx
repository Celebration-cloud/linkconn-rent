"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Card, CardHeader, CardBody } from "@heroui/react";
import { agentLicenseSchema } from "@/lib/zodSchemas";
import { useAgentOnboardStore } from "@/store/useAgentOnboardStore";

export default function AgentLicensePage() {
  const router = useRouter();

  // Access store
  const licenseData = useAgentOnboardStore((state) => state.license);
  const setLicense = useAgentOnboardStore((state) => state.setLicense);
  const nextStep = useAgentOnboardStore((state) => state.nextStep);
  const step = useAgentOnboardStore((state) => state.step);
    const { identity, license, payout } = useAgentOnboardStore();

    useEffect(() => {
      if (!identity) {
        router.replace("/onboarding/agent"); // Step 1: Identity
      } else if (!license) {
        router.replace("/onboarding/agent/license"); // Step 2: License
      } else if (!payout) {
        router.replace("/onboarding/agent/payout"); // Step 3: Payout
      } else {
        router.replace("/onboarding/agent/success"); // Completed
      }
    }, [identity, license, payout, router]);


  const form = useForm({
    resolver: zodResolver(agentLicenseSchema),
    defaultValues: licenseData || {
      agencyName: "",
      cacNumber: "",
      licenseNumber: "",
      officeAddress: "",
      agencyEmail: "",
      documents: [],
    },
  });

  const onSubmit = async (values) => {
    // Save to store
    setLicense(values);

    // Advance step in store
    nextStep();

    // Navigate to payout page
    router.push("/onboarding/agent/payout");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
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
            Agency & License Verification
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            Submit your official business documents for validation
          </p>
        </CardHeader>

        <CardBody>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label>Agency Name</label>
              <Input
                {...form.register("agencyName")}
                placeholder="e.g. Trust Realtors Ltd"
                className="mt-1"
              />
              {form.formState.errors.agencyName && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.agencyName.message}
                </p>
              )}
            </div>

            <div>
              <label>CAC Number</label>
              <Input
                {...form.register("cacNumber")}
                placeholder="e.g. RC1234567"
                className="mt-1"
              />
              {form.formState.errors.cacNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.cacNumber.message}
                </p>
              )}
            </div>

            <div>
              <label>Real Estate License Number</label>
              <Input
                {...form.register("licenseNumber")}
                placeholder="e.g. AGT-4592"
                className="mt-1"
              />
              {form.formState.errors.licenseNumber && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.licenseNumber.message}
                </p>
              )}
            </div>

            <div>
              <label>Office Address</label>
              <Input
                {...form.register("officeAddress")}
                placeholder="e.g. 23 Allen Avenue, Ikeja, Lagos"
                className="mt-1"
              />
              {form.formState.errors.officeAddress && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.officeAddress.message}
                </p>
              )}
            </div>

            <div>
              <label>Agency Email</label>
              <Input
                {...form.register("agencyEmail")}
                placeholder="e.g. contact@trustrealtors.ng"
                className="mt-1"
              />
              {form.formState.errors.agencyEmail && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.agencyEmail.message}
                </p>
              )}
            </div>

            <div>
              <label>Upload Business Documents (CAC / License)</label>
              <Input
                type="file"
                multiple
                accept="application/pdf,image/*"
                {...form.register("documents")}
                className="mt-1"
              />
              {form.formState.errors.documents && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.documents.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full mt-4">
              Continue to Payout Setup
            </Button>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  );
}
