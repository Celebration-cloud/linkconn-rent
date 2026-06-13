"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { CheckCircle2, Home } from "lucide-react";

import Button from "@/components/ui/Button";
import { useLandlordOnboardStore } from "@/store/useLandlordOnboardStore";

export default function LandlordSuccessPage() {
  const router = useRouter();
  const { identity, property, payout, resetOnboarding } =
    useLandlordOnboardStore();

  console.log("✅ Landlord Onboarding Data:", {
    identityInfo: identity,
    propertyInfo: property,
    payoutInfo: payout,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      resetOnboarding(); // clear onboarding state
      router.push(`/pending/landlord`); // redirect to dashboard
    }, 3000);

    return () => clearTimeout(timer);
  }, [router, resetOnboarding]);

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
        Property Submitted Successfully 🎉
      </motion.h1>

      <p className="text-muted-foreground max-w-md mb-8">
        Your property is under verification. Once approved, it will appear on
        the marketplace and be visible to potential tenants. Verification may
        take <strong>24–48 hours</strong>.
      </p>

      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row gap-4 w-full justify-center"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.6 }}
      >
        <Button
          className="w-full sm:w-auto flex items-center gap-2"
          size="lg"
          onClick={() => router.push("/dashboard")}
        >
          <Home size={18} /> Go to Dashboard
        </Button>

        <Button
          className="w-full sm:w-auto flex items-center gap-2"
          size="lg"
          variant="outline"
          onClick={() => router.push("/")}
        >
          Back to Home
        </Button>
      </motion.div>

      <p className="text-xs text-muted-foreground mt-4">
        Redirecting in 3 seconds...
      </p>
    </motion.div>
  );
}
