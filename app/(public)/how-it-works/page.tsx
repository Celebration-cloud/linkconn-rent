import type { Metadata } from "next";
import HowItWorksClient from "@/components/sections/how-it-works-client";

export const metadata: Metadata = {
  title: "How It Works | LinkConn Rent",
  description: "Learn how LinkConn Rent connects tenants directly with verified landlords. Pay zero agency fees and manage rentals in Nigeria.",
};

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-sand-100 pt-24">
      <HowItWorksClient />
    </div>
  );
}
