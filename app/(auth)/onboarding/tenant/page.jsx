"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Select, SelectItem, Card, CardHeader, CardBody } from "@heroui/react";
import { useState, useEffect } from "react";
import { CheckCircle2 } from "lucide-react";

import { useSession } from "@/lib/auth/client";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { tenantIdentitySchema } from "@/lib/zodSchemas";
import { useTenantOnboardStore } from "@/store/tenantOnboardStore";
import { uploadFile } from "@/lib/puterClient";

export default function TenantIdentityPage() {
  const router = useRouter();
  const { data } = useSession();

  const [otpVerified, setOtpVerified] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [pinId, setPinId] = useState("");
  const [otp, setOtp] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const { identity, setIdentity, step, setStep, employment, preference } =
    useTenantOnboardStore();

  const form = useForm({
    resolver: zodResolver(tenantIdentitySchema),
    defaultValues: identity || {
      fullName: data?.user?.name || "",
      phone: "",
      address: "",
      idType: "",
      idUpload: [],
      confirm: false,
    },
  });

  const handleSendOtp = async () => {
    const phone = form.getValues("phone");

    if (!phone) return alert("Enter phone number first");

    const res = await fetch("/api/otp/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    });

    const result = await res.json();

    if (result.success) {
      setOtpSent(true);
      setPinId(result.pinId);
    } else {
      alert("Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    const res = await fetch("/api/otp/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pinId, pin: otp }),
    });

    const result = await res.json();

    if (result.verified) setOtpVerified(true);
    else alert("Invalid OTP");
  };

  useEffect(() => {
    setStep(1);
  }, [setStep]);

  const handleVerifyPhone = async () => {
    setTimeout(() => setOtpVerified(true), 1000);
  };

  const onSubmit = async (values) => {
    if (!otpVerified) {
      alert("Please verify your phone number first.");

      return;
    }

    setIsUploading(true);
    let uploadedUrl = null;

    if (values.idUpload?.[0]) {
      const file = values.idUpload[0];
      const path = `tenants/id_${Date.now()}_${file.name}`;

      try {
        const { url } = await uploadFile({ path, file });

        uploadedUrl = url;
      } catch (err) {
        console.error("ID upload failed:", err);
        alert("Failed to upload ID document. Please try again.");
        setIsUploading(false);

        return;
      }
    }

    setIdentity({
      ...values,
      idUpload: uploadedUrl,
    });
    setIsUploading(false);
    router.push("/onboarding/tenant/employment");
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-lg"
      initial={{ opacity: 0, y: 25 }}
      transition={{ duration: 0.5 }}
    >
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
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <div>
              <label>Full Name</label>
              <Input
                {...form.register("fullName")}
                className="mt-1"
                placeholder="e.g. John Doe"
              />
              {form.formState.errors.fullName && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.fullName.message}
                </p>
              )}
            </div>

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
                  onClick={otpSent ? handleVerifyOtp : handleSendOtp}
                >
                  {otpVerified ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : otpSent ? (
                    "Verify OTP"
                  ) : (
                    "Verify"
                  )}
                </Button>
              </div>
              {otpSent && !otpVerified && (
                <Input
                  className="mt-2"
                  maxLength={6}
                  placeholder="Enter OTP code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              )}
              {form.formState.errors.phone && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label>Address</label>
              <Input
                {...form.register("address")}
                className="mt-1"
                placeholder="e.g. 14 Opebi Road, Ikeja, Lagos"
              />
              {form.formState.errors.address && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div>
              <label>Identification Type</label>
              <Select
                {...form.register("idType")}
                className="mt-1"
                placeholder="Select ID type"
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

            <div>
              <label>Upload ID Document</label>
              <Input
                multiple
                accept="image/*,application/pdf"
                type="file"
                {...form.register("idUpload")}
                className="mt-1"
              />
              {form.formState.errors.idUpload && (
                <p className="text-red-500 text-sm mt-1">
                  {form.formState.errors.idUpload.message}
                </p>
              )}
            </div>

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

            <Button
              className="w-full mt-4"
              disabled={isUploading}
              type="submit"
            >
              {isUploading ? "Uploading ID..." : "Continue to Employment Info"}
            </Button>
          </form>
        </CardBody>
      </Card>
    </motion.div>
  );
}
