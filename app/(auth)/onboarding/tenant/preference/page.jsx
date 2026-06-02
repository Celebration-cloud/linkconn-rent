"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectItem,
  Input,
  NumberInput,
  DatePicker,
  Card,
  CardHeader,
  CardBody,
} from "@heroui/react";
import { getLocalTimeZone, today } from "@internationalized/date";

import Button from "@/components/ui/Button";
import { siteConfig } from "@/config/site";
import { tenantPreferenceSchema } from "@/lib/zodSchemas";
import { useTenantOnboardStore } from "@/store/tenantOnboardStore";

export default function TenantPreference() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { preference, setPreference, step, setStep, reset } =
    useTenantOnboardStore();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(tenantPreferenceSchema),
    defaultValues: preference || {
      location: "",
      minBudget: "",
      maxBudget: "",
      propertyType: "",
      moveInDate: "",
      agreeToPolicy: false,
    },
  });

  useEffect(() => {
    setStep(3);
  }, [setStep]);

  const onSubmit = async (values) => {
    setLoading(true);
    setPreference(values);

    console.log("✅ Tenant Preferences:", values);

    // Optionally send all onboarding data to backend here
    // const payload = useTenantOnboardStore.getState();
    // await fetch("/api/onboarding/tenant", { method: "POST", body: JSON.stringify(payload) });

    setTimeout(() => {
      router.push("/onboarding/tenant/success");
    }, 1000);
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
        <CardHeader className="flex flex-col items-center gap-1 pb-2 border-border/60">
          <h2 className="text-xl font-semibold text-center tracking-tight flex items-center gap-2">
            Rent Preference Setup
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            Help us match you with the best properties
          </p>
        </CardHeader>

        <CardBody>
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
            {/* Location */}
            <Input
              label="Preferred Location"
              placeholder="e.g., Lagos, Abuja"
              variant="bordered"
              {...register("location")}
              errorMessage={errors.location?.message}
              isInvalid={!!errors.location}
            />

            {/* Budget */}
            <div className="grid grid-cols-2 gap-4">
              <NumberInput
                errorMessage={errors.minBudget?.message}
                isInvalid={!!errors.minBudget}
                label="Min Budget (₦)"
                placeholder="50000"
                variant="bordered"
                onChange={(val) =>
                  setValue("minBudget", Number(val), { shouldValidate: true })
                }
              />
              <NumberInput
                errorMessage={errors.maxBudget?.message}
                isInvalid={!!errors.maxBudget}
                label="Max Budget (₦)"
                placeholder="150000"
                variant="bordered"
                onChange={(val) =>
                  setValue("maxBudget", Number(val), { shouldValidate: true })
                }
              />
            </div>

            {/* Property Type */}
            <Select
              errorMessage={errors.propertyType?.message}
              isInvalid={!!errors.propertyType}
              label="Property Type"
              placeholder="Select property type"
              variant="bordered"
              onChange={(e) =>
                setValue("propertyType", e.target.value, {
                  shouldValidate: true,
                })
              }
            >
              {siteConfig.propertyTypes.map((group) => (
                <>
                  <SelectItem
                    key={`category-${group.category.toLowerCase()}`}
                    disabled
                    className={`text-xs font-semibold ${group.color} opacity-80 mt-2`}
                  >
                    • {group.category}
                  </SelectItem>
                  {group.items.map((item) => (
                    <SelectItem key={item.key}>{item.label}</SelectItem>
                  ))}
                </>
              ))}
            </Select>

            {/* Move-in Date */}
            <DatePicker
              errorMessage={errors.moveInDate?.message}
              isInvalid={!!errors.moveInDate}
              label="Move-in Date"
              minValue={today(getLocalTimeZone())} // ✅ prevent past dates
              placeholder="Select move-in date"
              variant="bordered"
              onChange={(date) =>
                setValue("moveInDate", date?.toString() || "", {
                  shouldValidate: true,
                })
              }
            />

            {/* Agreement */}
            <div className="flex items-start gap-2 mt-3">
              <input
                type="checkbox"
                {...register("agreeToPolicy")}
                className="mt-1 accent-primary"
              />
              <label className="text-sm">
                I agree to the{" "}
                <span className="text-primary font-medium cursor-pointer">
                  terms & tenancy verification policy
                </span>
              </label>
            </div>
            {errors.agreeToPolicy && (
              <p className="text-red-500 text-sm">
                {errors.agreeToPolicy.message}
              </p>
            )}

            <Button
              className="w-full mt-4"
              disabled={loading}
              size="lg"
              type="submit"
            >
              {loading ? "Saving Preferences..." : "Finish Onboarding"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  );
}
