"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle2, Home } from "lucide-react";

import Button from "@/components/ui/Button";
import { useTenantOnboardStore } from "@/store/tenantOnboardStore";

export default function TenantSuccessPage() {
  const router = useRouter();

  const { identity, employment, preference, resetOnboarding } =
    useTenantOnboardStore();

  console.log("✅ Onboarding Data:", {
    basicInfo: identity,
    employmentInfo: employment,
    preferenceInfo: preference,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      // resetOnboarding();
      router.push(`/pending/tenant`);
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <motion.div
      animate={{ scale: 1, opacity: 1 }}
      className="flex flex-col items-center text-center"
      initial={{ scale: 0.7, opacity: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 10 }}
    >
      <div className="bg-green-500/10 p-6 rounded-full mb-4">
        <CheckCircle2 className="w-16 h-16 text-green-500" />
      </div>

      <motion.h1
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-semibold mb-2"
        initial={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.3 }}
      >
        You’re all set! 🎉
      </motion.h1>

      <p className="text-muted-foreground max-w-md mb-8">
        Your tenant profile has been successfull. You’ll be redirected to your
        dashboard shortly.
      </p>

      <Button
        className="flex items-center gap-2"
        size="lg"
        onClick={() => router.push("/dashboard/tenant")}
      >
        <Home size={18} /> Go to Dashboard
      </Button>
      <p className="text-xs text-muted-foreground mt-4">
        Redirecting in 3 seconds...
      </p>
    </motion.div>
  );
}
