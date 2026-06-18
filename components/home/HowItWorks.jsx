"use client";

import { motion } from "framer-motion";
import { UserPlus, Search, CreditCard } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Create Your Account",
    desc: "Sign up in seconds as a tenant or landlord. Verify your identity once and unlock the full platform — no middlemen, no hidden fees.",
    color: "bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400",
    borderColor: "border-green-200 dark:border-green-800",
    accentColor: "text-green-600 dark:text-green-400",
  },
  {
    step: "02",
    icon: Search,
    title: "Discover or List",
    desc: "Tenants browse verified homes with real photos and prices. Landlords publish listings and connect directly with serious, vetted tenants instantly.",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800",
    accentColor: "text-blue-600 dark:text-blue-400",
  },
  {
    step: "03",
    icon: CreditCard,
    title: "Manage Digitally",
    desc: "Pay rent, sign digital leases, track maintenance and manage tenancy agreements — all from a single secure dashboard built for Nigerian housing.",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400",
    borderColor: "border-purple-200 dark:border-purple-800",
    accentColor: "text-purple-600 dark:text-purple-400",
  },
];

export default function HowItWorks() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.18 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 12 },
    },
  };

  return (
    <section
      id="how-it-works"
      className="w-full py-24 bg-white dark:bg-slate-900"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-widest mb-2">
            Simple Process
          </p>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
            How It Works
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-xl mx-auto">
            From signup to signing your lease — it takes just three steps.
          </p>
        </div>

        {/* Steps Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 relative"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
        >
          {/* Connector line — visible on md+ */}
          <div className="hidden md:block absolute top-12 left-[16.66%] right-[16.66%] h-px bg-slate-200 dark:bg-slate-700 z-0" />

          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={i}
                className="relative bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-3xl p-8 shadow-sm hover:shadow-md transition-all duration-300 text-center group flex flex-col items-center z-10"
                variants={cardVariants}
                whileHover={{ y: -6 }}
              >
                {/* Step number badge */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${s.color} ${s.borderColor} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-7 h-7" />
                </div>

                {/* Step label */}
                <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${s.accentColor}`}>
                  Step {s.step}
                </span>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {s.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {s.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
