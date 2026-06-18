import Hero from "@/components/home/Hero";
import WhyChoose from "@/components/home/WhyChoose";
import Featured from "@/components/home/Featured";
import DashboardOverview from "@/components/home/DashboardOverview";
import TrustSafety from "@/components/home/TrustSafety";
import FairPriceTool from "@/components/home/FairPriceTool";
import PricingPlans from "@/components/home/PricingPlans";
import HowItWorks from "@/components/home/HowItWorks";
import Testimonials from "@/components/home/Testimonials";
import CTA from "@/components/home/CTA";

export const metadata = {
  title: "LinkConn Rent - Find your next home, verified & scam-free",
  description:
    "LinkConn Rent connects tenants directly with landlords across Nigeria. Discover verified listings, zero agent fees, and streamlined rent management.",
};

export default function HomePage() {
  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* Hero section with background, search bar and stats */}
      <Hero />

      {/* Why Choose LinkConn - Features Grid */}
      <WhyChoose />

      {/* Featured Properties Grid */}
      <Featured />

      {/* Dashboard Overview - Interactive landlord/tenant dashboard preview */}
      <DashboardOverview />

      {/* Trust & Safety First - Vetting and security grid */}
      <TrustSafety />

      {/* Fair Price Tool - AI dynamic rental estimator widget */}
      <FairPriceTool />

      {/* Simple, transparent pricing plans */}
      <PricingPlans />

      {/* How It Works - Step-by-step process */}
      <HowItWorks />

      {/* User testimonials */}
      <Testimonials />

      {/* Final Call to Action banner */}
      <CTA />
    </div>
  );
}
