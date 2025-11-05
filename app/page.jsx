"use client";

import Hero from "@/components/home/Hero";
import Featured from "@/components/home/Featured";
import WhyChoose from "@/components/home/WhyChoose";
import HowItWorks from "@/components/home/HowItWorks";
import CTA from "@/components/home/CTA";
import Testimonials from "@/components/home/Testimonials"; // ✅ Import added

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center w-full">
      {/* Hero Section */}
      <Hero />

      {/* Featured Properties */}
      <section className="container mx-auto py-16 px-6">
        <h2 className="text-3xl font-semibold mb-8 text-center">
          Featured Properties
        </h2>
        <Featured />
      </section>

      {/* Why Choose Us */}
      <section className="container mx-auto py-16 px-6 bg-content2 rounded-xl">
        <h2 className="text-3xl font-semibold mb-8 text-center">
          Why Choose LinkConn Rent
        </h2>
        <WhyChoose />
      </section>

      {/* How It Works */}
      <section className="container mx-auto py-16 px-6">
        <h2 className="text-3xl font-semibold mb-8 text-center">
          How It Works
        </h2>
        <HowItWorks />
      </section>

      {/* ✅ Testimonials Section */}
      <Testimonials />

      {/* Call To Action */}
      <CTA />
    </div>
  );
}
