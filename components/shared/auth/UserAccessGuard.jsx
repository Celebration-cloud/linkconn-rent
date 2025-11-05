"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function UserAccessGuard({ children }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    const role = searchParams.get("role");
    const user = session?.user;

    // No user, send to login
    if (!user) {
      router.replace("/auth/login");
      return;
    }

    // Missing role param
    if (!role) {
      router.replace("/select-role");
      return;
    }

    const onboarded = user.onboarded;
    const verification = user.verification_status;

    if (!onboarded) {
      router.replace(`/onboarding/${role}`);
      return;
    }

    if (verification === "pending") {
      router.replace(`/pending/${role}`);
      return;
    }

    if (verification === "approved") {
      router.replace(`/dashboard/${role}`);
      return;
    }

    router.replace("/");
  }, [status, session, router, searchParams]);

  if (status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-sm text-muted-foreground">
          Checking your dashboard access...
        </p>
      </div>
    );
  }

  return children;
}
