"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "@/providers/auth-provider";
import Toaster from "@/components/shared/toaster";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}
