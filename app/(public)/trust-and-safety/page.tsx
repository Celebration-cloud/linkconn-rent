import type { Metadata } from "next";
import TrustAndSafetyClient from "@/components/sections/trust-and-safety-client";

export const metadata: Metadata = {
  title: "Trust & Safety | LinkConn Rent",
  description: "Understand LinkConn Rent verification levels, public location privacy, Protected Payment records, and practical rental safety checks.",
};

export default function TrustAndSafetyPage() {
  return <TrustAndSafetyClient />;
}
