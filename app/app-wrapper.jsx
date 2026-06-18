"use client";

import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useEffect } from "react";

import { initPuter } from "@/lib/puterClient";
import { AppFooter } from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";

export default function AppWrapper({ children }) {
  const pathname = usePathname();

  useEffect(() => {
    initPuter();
  }, []);

  const hideFooterInDashboard =
    pathname?.startsWith("/dashboard/tenant") || false;
  const hiddenLayoutRoutes = ["/auth", "/onboarding"];
  const hideLayout = pathname
    ? hiddenLayoutRoutes.some((route) => pathname.startsWith(route))
    : false;

  // Homepage needs full-width edge-to-edge sections — skip the container constraint
  const isHomePage = pathname === "/";

  return (
    <div className="relative flex flex-col min-h-screen">
      {!hideLayout && <Navbar />}

      <main
        className={clsx(
          "flex-grow",
          !hideLayout && !isHomePage && "container mx-auto max-w-7xl pt-10",
        )}
      >
        {children}
      </main>

      {!hideFooterInDashboard && !hideLayout && <AppFooter />}
    </div>
  );
}
