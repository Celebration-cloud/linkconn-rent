import type { Metadata } from "next";
import PricingClient from "@/components/sections/pricing-client";

export const metadata: Metadata = {
  title: "Pricing Plans | LinkConn Rent",
  description: "Check pricing plans for Landlords and Tenants on LinkConn Rent. Pay zero agent commissions and search verified properties across Nigeria.",
};

export default function PricingPage() {
  return <PricingClient />;
}
