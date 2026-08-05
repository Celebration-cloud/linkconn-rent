import type { Metadata } from "next";
import TrustAndSafetyClient from "@/components/sections/trust-and-safety-client";

export const metadata: Metadata = {
  title: "Trust & Safety | LinkConn Rent",
  description: "Learn how LinkConn Rent verifies landlords, inspects properties, holds rent in escrow, and prevents scams in Nigeria.",
};

export default function TrustAndSafetyPage() {
  return (
    <div className="min-h-screen bg-sand-100 pt-24">
      <TrustAndSafetyClient />
    </div>
  );
}
