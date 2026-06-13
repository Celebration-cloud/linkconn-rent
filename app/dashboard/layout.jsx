"use client";

import { useSession } from "@/lib/auth/client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function DashboardLayout({ children }) {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      router.push("/auth/login");
      return;
    }

    async function checkProfile() {
      try {
        const res = await fetch("/api/auth/profile");
        const json = await res.json();
        
        if (json.success && json.data) {
          const uProfile = json.data;
          setProfile(uProfile);
          
          const role = uProfile.role || "tenant";
          
          if (!uProfile.onboarded) {
            router.push(`/onboarding/${role}`);
            return;
          }
          
          if (!uProfile.verified) {
            router.push(`/pending/${role}`);
            return;
          }
          
          // Verify they aren't accessing another role's dashboard
          if (pathname.startsWith("/dashboard/") && !pathname.startsWith(`/dashboard/${role}`)) {
            router.push(`/dashboard/${role}`);
            return;
          }
        } else {
          // Fallback to onboarding if no profile found
          router.push("/onboarding/tenant");
        }
      } catch (err) {
        console.error("Error checking profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    }

    checkProfile();
  }, [session, isPending, pathname, router]);

  if (isPending || loadingProfile) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-sm text-muted-foreground">Loading dashboard...</p>
      </div>
    );
  }

  return <div className="min-h-screen">{children}</div>;
}
