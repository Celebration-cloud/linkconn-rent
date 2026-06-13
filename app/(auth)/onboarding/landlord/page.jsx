"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Select, SelectItem } from "@heroui/select";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { landlordIdentitySchema } from "@/lib/zodSchemas";
import { useLandlordOnboardStore } from "@/store/useLandlordOnboardStore";
import { uploadFile } from "@/lib/puterClient";

export default function LandlordIdentityPage() {
  const router = useRouter();
  const { identity, setIdentity, nextStep, step } = useLandlordOnboardStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { property, payout } = useLandlordOnboardStore();

  useEffect(() => {
    if (!identity) {
      router.replace("/onboarding/landlord"); // Step 1
    } else if (!property) {
      router.replace("/onboarding/landlord/property"); // Step 2
    } else if (!payout) {
      router.replace("/onboarding/landlord/payout"); // Step 3
    } else {
      router.replace("/onboarding/landlord/success"); // Completed
    }
  }, [identity, property, payout, router]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(landlordIdentitySchema),
    defaultValues: identity || {
      fullName: "",
      phone: "",
      address: "",
      idType: "nin",
      idFile: null,
      landDoc: null,
    },
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    let idUrl = null;
    let docUrl = null;

    try {
      if (data.idFile?.[0]) {
        const file = data.idFile[0];
        const path = `landlords/id_${Date.now()}_${file.name}`;
        const { url } = await uploadFile({ path, file });
        idUrl = url;
      }

      if (data.landDoc?.[0]) {
        const file = data.landDoc[0];
        const path = `landlords/doc_${Date.now()}_${file.name}`;
        const { url } = await uploadFile({ path, file });
        docUrl = url;
      }
    } catch (err) {
      console.error("Landlord file upload failed:", err);
      alert("Failed to upload verification documents. Please try again.");
      setIsSubmitting(false);
      return;
    }

    // Save to Zustand
    setIdentity({
      ...data,
      idFile: idUrl,
      landDoc: docUrl,
    });

    setIsSubmitting(false);
    nextStep();
    router.push("/onboarding/landlord/property");
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg bg-card rounded-2xl p-6"
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

      <h1 className="text-2xl font-semibold mb-6 text-center">
        Landlord Identity Verification
      </h1>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {/* Full Name */}
        <div>
          <label className="block mb-1 text-sm font-medium">Full Name</label>
          <Controller
            control={control}
            name="fullName"
            render={({ field }) => <Input placeholder="John Doe" {...field} />}
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Phone */}
        <div>
          <label className="block mb-1 text-sm font-medium">Phone Number</label>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <Input placeholder="08123456789" {...field} />
            )}
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block mb-1 text-sm font-medium">Address</label>
          <Controller
            control={control}
            name="address"
            render={({ field }) => (
              <Input
                placeholder="No 5, Adewale Street, Ikeja, Lagos"
                {...field}
              />
            )}
          />
          {errors.address && (
            <p className="text-red-500 text-xs mt-1">
              {errors.address.message}
            </p>
          )}
        </div>

        {/* ID Type */}
        <div>
          <label className="block mb-1 text-sm font-medium">ID Type</label>
          <Controller
            control={control}
            name="idType"
            render={({ field }) => (
              <Select
                selectedKeys={[field.value]}
                onSelectionChange={(keys) => field.onChange([...keys][0])}
              >
                <SelectItem key="nin">National ID (NIN)</SelectItem>
                <SelectItem key="drivers_license">Driver’s License</SelectItem>
                <SelectItem key="voters_card">Voter’s Card</SelectItem>
                <SelectItem key="passport">International Passport</SelectItem>
              </Select>
            )}
          />
          {errors.idType && (
            <p className="text-red-500 text-xs mt-1">{errors.idType.message}</p>
          )}
        </div>

        {/* Upload ID */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Upload ID Image
          </label>
          <Controller
            control={control}
            name="idFile"
            render={({ field }) => (
              <Input
                accept="image/*,application/pdf"
                type="file"
                onChange={(e) => field.onChange(e.target.files)}
              />
            )}
          />
          {errors.idFile && (
            <p className="text-red-500 text-xs mt-1">{errors.idFile.message}</p>
          )}
        </div>

        {/* Upload Land Document */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Upload Verified Land Document
          </label>
          <Controller
            control={control}
            name="landDoc"
            render={({ field }) => (
              <Input
                accept="image/*,application/pdf"
                type="file"
                onChange={(e) => field.onChange(e.target.files)}
              />
            )}
          />
          {errors.landDoc && (
            <p className="text-red-500 text-xs mt-1">
              {errors.landDoc.message}
            </p>
          )}
        </div>

        <Button className="w-full mt-6" disabled={isSubmitting} type="submit">
          {isSubmitting ? "Verifying..." : "Continue to Property Setup"}
        </Button>
      </form>
    </motion.div>
  );
}
