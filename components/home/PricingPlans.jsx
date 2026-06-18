"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Free",
    subtitle: "For tenants & casual landlords",
    price: "₦0",
    frequency: "/forever",
    features: [
      "Basic property listings",
      "Full property search",
      "Secure messaging",
      "Save & compare homes",
    ],
    cta: "Start Free",
    premium: false,
  },
  {
    name: "Premium Landlord",
    subtitle: "Fill vacancies faster",
    price: "₦7,500",
    frequency: "/month",
    features: [
      "Everything in Free",
      "Featured listings boost",
      "Enhanced search visibility",
      "Advanced dashboard analytics",
      "Priority landlord support",
      "Automated rent reminders",
    ],
    cta: "Go Premium",
    badge: "Most Popular",
    premium: true,
  },
  {
    name: "Verification",
    subtitle: "Build instant trust",
    price: "₦5,000",
    frequency: "/listing",
    features: [
      "Identity verification check",
      "Property ownership check",
      "Verified green badge status",
      "Higher search ranking order",
      "Dedicated dispute resolution support",
    ],
    cta: "Verify Listing",
    premium: false,
  },
];

export default function PricingPlans() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 12 }
    }
  };

  return (
    <section className="py-24 bg-slate-50/50 dark:bg-slate-900/40 w-full relative">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-widest mb-2">Pricing</p>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">Simple, transparent plans</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">No hidden agent fees. Pay only for the extra power you need.</p>
        </div>

        {/* Plan Cards Grid */}
        <motion.div 
          className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-left"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {plans.map((plan, i) => (
            <motion.div
              key={i}
              className={`rounded-3xl p-8 card-shadow transition-all duration-300 relative ${
                plan.premium 
                  ? "bg-slate-900 dark:bg-slate-950 text-white shadow-2xl border border-slate-700 md:-translate-y-4 md:scale-105 z-10" 
                  : "bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-100 dark:border-slate-700 mt-4"
              }`}
              variants={cardVariants}
              whileHover={{ y: plan.premium ? -10 : -2 }}
            >
              {/* Most Popular Badge */}
              {plan.badge && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-green-500 text-slate-950 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-md">
                  {plan.badge}
                </div>
              )}

              <h3 className={`text-xl font-bold mb-1 ${plan.premium ? "text-white" : "text-slate-900 dark:text-white"}`}>
                {plan.name}
              </h3>
              <p className={`text-xs mb-6 ${plan.premium ? "text-slate-400" : "text-slate-500 dark:text-slate-400"}`}>
                {plan.subtitle}
              </p>
              
              <div className="text-4xl font-extrabold mb-1">
                {plan.price}
                <span className={`text-sm font-medium ${plan.premium ? "text-slate-400" : "text-slate-400 dark:text-slate-500"}`}>
                  {plan.frequency}
                </span>
              </div>

              {/* Features List */}
              <ul className="space-y-4 my-8">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      plan.premium 
                        ? "bg-green-500/20 text-green-400" 
                        : "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400"
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                    <span className={`text-sm ${plan.premium ? "text-slate-300" : "text-slate-600 dark:text-slate-300"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <button
                className={`w-full font-bold py-3 rounded-xl transition-all cursor-pointer shadow-md ${
                  plan.premium
                    ? "bg-green-500 hover:bg-green-400 text-slate-950"
                    : "bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
