"use client";

import  Navbar  from "@/components/layout/Navbar";
import { AppFooter } from "@/components/layout/Footer";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { initPuter } from "@/lib/puterClient";
import { useEffect } from "react";
import Script from "next/script";

export default function AppWrapper({ children }) {
  const pathname = usePathname();
  useEffect(() => {
    initPuter();
  }, []);

  const hideFooterInDashboard = pathname.startsWith("/dashboard/tenant");
  const hiddenLayoutRoutes = ["/auth", "/onboarding"];
  const hideLayout = hiddenLayoutRoutes.some((route) =>
    pathname.startsWith(route)
  );

  return (
    <div className="relative flex flex-col min-h-screen">
      {!hideLayout && <Navbar />}

      <main
        className={clsx(
          "flex-grow",
          !hideLayout && "container mx-auto max-w-7xl pt-10"
        )}
      >
        {children}
      </main>

      {!hideFooterInDashboard && !hideLayout && <AppFooter />}
    </div>
  );
}
