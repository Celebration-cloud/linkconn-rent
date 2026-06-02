"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Spinner } from "@heroui/react";

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  useEffect(() => {
    if (role) {
      router.replace(`/onboarding/${role}`);
    } else {
      router.replace("/auth/signup");
    }
  }, [role, router]);

  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Spinner
        color="primary"
        label="Preparing your onboarding experience..."
      />
    </div>
  );
}
