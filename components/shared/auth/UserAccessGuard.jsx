"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSession } from "@/lib/auth/client";

export default function UserAccessGuard({ children }) {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (isPending) return;

    const user = session?.user;

    if (!user) {
      router.replace("/auth/login");
      return;
    }

    router.replace("/dashboard");
  }, [isPending, session, router]);

  if (isPending) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-sm text-muted-foreground">
          Checking your access...
        </p>
      </div>
    );
  }

  return children;
}
