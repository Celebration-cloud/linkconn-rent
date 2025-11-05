"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { Select, SelectItem, Card, CardHeader, CardBody } from "@heroui/react";
import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";
import { tenantIdentitySchema } from "@/lib/zodSchemas";
import { useTenantOnboardStore } from "@/store/tenantOnboardStore";
import { useSession } from "next-auth/react";
// import { initPuter, uploadFile } from "@/lib/puterClient";

export default function TenantIdentityPage() {
  const router = useRouter();
  const {data} = useSession();
  console.log("Session data:", data);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [pinId, setPinId] = useState("");
  const [otp, setOtp] = useState("");
  const { identity, setIdentity, step, setStep, employment, preference } =
    useTenantOnboardStore();

  const form = useForm({
    resolver: zodResolver(tenantIdentitySchema),
    defaultValues: identity || {
      fullName: data?.user?.name || "",
      phone: "",
      address: data?.user?.address || "",
      idType: "",
      idUpload: [],
      confirm: false,
    },
  });

  const handleSendOtp = async () => {
    const phone = form.getValues("phone");
    if (!phone) return alert("Enter phone number first");

    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    const data = await res.json();
    if (data.success) {
      setOtpSent(true);
      setPinId(data.pinId);
    } else {
      alert("Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    const res = await fetch("/api/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinId, pin: otp }),
    });

    const data = await res.json();
    if (data.verified) setOtpVerified(true);
    else alert("Invalid OTP");
  };

    useEffect(() => {
      if (!identity) {
        router.replace("/onboarding/tenant");
      } else if (!employment) {
        router.replace("/onboarding/tenant/employment");
      } else if (!preference) {
        router.replace("/onboarding/tenant/preference");
      } else {
        router.replace("/onboarding/tenant/success");
      }
    }, [identity, employment, preference, router]);

  // Restore step on mount
  useEffect(() => {
    setStep(1);
  }, [setStep]);

  const handleVerifyPhone = async () => {
    // Simulate OTP verification
    setTimeout(() => setOtpVerified(true), 1000);
  };

const onSubmit = async (values) => {
  if (!otpVerified) {
    alert("Please verify your phone number via OTP first.");
    return;
  }

  try {
    // await initPuter();

    // const files = values?.idUpload || [];
    // const uploadedFiles = [];

    // if (files.length > 0) {
    //   for (const file of files) {
    //     if (!file?.name) continue;

    //     const userId = data?.user?.id || "unknown_user";
    //     const safeName = file.name.replace(/[^\w.-]/g, "_"); // sanitize filename
    //     const path = `tenants/${userId}/ids/${safeName}`;

    //     console.log("⬆️ Uploading:", path);

    //     try {
    //       const { url } = await uploadFile({ path, file });
    //       if (url) uploadedFiles.push({ name: file.name, url });
    //     } catch (err) {
    //       console.error("❌ Upload failed:", err.message || err);
    //     }
    //   }

    // } else {
    //   console.warn("No ID files selected for upload.");
    // }

    // console.log("✅ Uploaded ID files:", uploadedFiles);

    setIdentity({
      ...values,
    });

    router.push("/onboarding/tenant/employment");
  } catch (err) {
    console.error("❌ Submission failed:", err.message || err);
    alert("Something went wrong during upload. Try again.");
  }
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
            Tenant Identity Verification
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            Verify your identity before accessing the tenant dashboard
          </p>
        </CardHeader>

        <CardBody>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Full Name */}
            <div>
              <label>Full Name</label>
              <Input
                {...form.register("fullName")}
                placeholder="e.g. John Doe"
                className="mt-1"
              />
              {form.formState.errors.fullName && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>

            {/* Phone + OTP */}
            <div>
              <label>Phone Number</label>
              <div className="flex gap-2 mt-1">
                <Input
                  {...form.register("phone")}
                  placeholder="e.g. 08012345678"
                />
                <Button
                  type="button"
                  variant={otpVerified ? "success" : "outline"}
                  onClick={handleVerifyPhone}
                >
                  {otpVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
              {form.formState.errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label>Address</label>
              <Input
                {...form.register("address")}
                placeholder="e.g. 14 Opebi Road, Ikeja, Lagos"
                className="mt-1"
              />
              {form.formState.errors.address && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            {/* ID Type */}
            <div>
              <label>Identification Type</label>
              <Select
                {...form.register("idType")}
                placeholder="Select ID type"
                className="mt-1"
              >
                <SelectItem key="NIN" value="NIN">
                  NIN
                </SelectItem>
                <SelectItem key="Driver’s License" value="Driver’s License">
                  Driver’s License
                </SelectItem>
                <SelectItem key="Voter’s Card" value="Voter’s Card">
                  Voter’s Card
                </SelectItem>
              </Select>
              {form.formState.errors.idType && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.idType.message}
                </p>
              )}
            </div>

            {/* ID Upload */}
            <div>
              <label>Upload ID Document</label>
              <Input
                type="file"
                multiple
                accept="image/*,application/pdf"
                {...form.register("idUpload")}
                className="mt-1"
              />
              {form.formState.errors.idUpload && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.idUpload.message}
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
                I confirm the above details are accurate
              </label>
            </div>
            {form.formState.errors.confirm && (
              <p className="text-red-500 text-sm mt-1">
                {form.formState.errors.confirm.message}
              </p>
            )}

            <Button type="submit" className="w-full mt-4">
              Continue to Employment Info
            </Button>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  );
}
