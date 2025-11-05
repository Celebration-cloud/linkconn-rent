"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function DashboardLayout({ children }) {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "loading") return;

    // No session, kick to login
    if (!session?.user) {
      router.replace("/auth/login");
      return;
    }

    // Missing role in URL
    if (!role) {
      router.replace("/");
      return;
    }
  }, [status, session, role, router]);

  return <div className="min-h-screen">{children}</div>;
}
