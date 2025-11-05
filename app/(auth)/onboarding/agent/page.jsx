"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Select, SelectItem, Card, CardHeader, CardBody } from "@heroui/react";
import { agentIdentitySchema } from "@/lib/zodSchemas";
import { useAgentOnboardStore } from "@/store/useAgentOnboardStore";
import { useEffect } from "react";

export default function AgentIdentityPage() {
  const router = useRouter();

  // Get store state and actions
  const identityData = useAgentOnboardStore((state) => state.identity);
  const setIdentity = useAgentOnboardStore((state) => state.setIdentity);
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


  // Form setup with prefilled data if available
  const form = useForm({
    resolver: zodResolver(agentIdentitySchema),
    defaultValues: identityData || {
      fullName: "",
      phone: "",
      email: "",
      idType: "",
      idImage: [],
      passport: [],
    },
  });

  const onSubmit = (values) => {
    // Save to store
    setIdentity(values);
    nextStep();

    // Go to license step
    router.push("/onboarding/agent/license");
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
            Agent Identity Verification
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            Verify your identity to continue onboarding
          </p>
        </CardHeader>

        <CardBody>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label>Full Name</label>
              <Input
                {...form.register("fullName")}
                placeholder="Enter your full name"
                className="mt-1"
              />
              {form.formState.errors.fullName && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>

            <div>
              <label>Phone Number</label>
              <Input
                {...form.register("phone")}
                placeholder="08012345678"
                className="mt-1"
              />
              {form.formState.errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label>Email</label>
              <Input
                {...form.register("email")}
                placeholder="example@email.com"
                className="mt-1"
              />
              {form.formState.errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 text-sm font-medium">
                Identification Type
              </label>
              <Select
                placeholder="Select ID Type"
                className="mt-1"
                onChange={(e) => form.setValue("idType", e.target.value)}
                value={form.getValues("idType")}
              >
                <SelectItem key="nin" value="nin">
                  NIN
                </SelectItem>
                <SelectItem key="driver_license" value="driver_license">
                  Driver’s License
                </SelectItem>
                <SelectItem key="voter_card" value="voter_card">
                  Voter’s Card
                </SelectItem>
                <SelectItem key="passport" value="passport">
                  International Passport
                </SelectItem>
              </Select>
              {form.formState.errors.idType && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.idType.message}
                </p>
              )}
            </div>

            <div>
              <label>Upload ID Image</label>
              <Input
                type="file"
                accept="image/*"
                {...form.register("idImage")}
                className="mt-1"
              />
              {form.formState.errors.idImage && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.idImage.message}
                </p>
              )}
            </div>

            <div>
              <label>Upload Passport Photograph</label>
              <Input
                type="file"
                accept="image/*"
                {...form.register("passport")}
                className="mt-1"
              />
              {form.formState.errors.passport && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.passport.message}
                </p>
              )}
            </div>

            <Button type="submit" className="w-full mt-4">
              Continue to License Step
            </Button>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  );
}
