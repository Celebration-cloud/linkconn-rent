"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/providers/auth-provider";
import { BadgeCheck, BriefcaseBusiness, Building2, CalendarDays, CircleDollarSign, House, KeyRound, MessageSquare, Search, UserRound, Wrench } from "lucide-react";

const tenantSteps = [
  {
    num: "01",
    title: "Browse Verified Homes",
    desc: "Use our custom directory filters to find verified apartments, duplexes, or studios. Every listing goes through a strict identity and location audit.",
    icon: Search,
  },
  {
    num: "02",
    title: "Direct Landlord Chat",
    desc: "Connect directly with property managers without middleman interference. Clear all queries, negotiate pricing, and finalize terms directly in the app.",
    icon: MessageSquare,
  },
  {
    num: "03",
    title: "Schedule Inspections",
    desc: "Book physical inspect slots directly using our dashboard calendar widget. No agent registration fee or viewing fees required.",
    icon: CalendarDays,
  },
  {
    num: "04",
    title: "Pay Rent via Escrow",
    desc: "Rent payment is securely processed through Paystack/Flutterwave and held in escrow. Funds are released to the landlord only after you move in safely.",
    icon: KeyRound,
  },
  {
    num: "05",
    title: "Digital Tenancy Management",
    desc: "Submit maintenance requests, upload receipts, and manage automated rent renewal schedules inside your student/professional dashboard.",
    icon: BriefcaseBusiness,
  },
];

const landlordSteps = [
  {
    num: "01",
    title: "List Your Properties",
    desc: "Upload photos, location coordinates, rental price, and standard amenities. Setting up listings takes less than 5 minutes.",
    icon: House,
  },
  {
    num: "02",
    title: "Submit Ownership Verification",
    desc: "Provide basic identity and utility bills to earn the 'Verified Landlord' badge. Properties with verification badges secure tenants 3x faster.",
    icon: BadgeCheck,
  },
  {
    num: "03",
    title: "Chat with Screened Tenants",
    desc: "Receive text inquiries directly from verified tenants. Review their profiles, income range statements, and verification levels prior to responding.",
    icon: UserRound,
  },
  {
    num: "04",
    title: "Automated Rent Payouts",
    desc: "Receive payments safely into your bank account. Get automatic rent invoices sent to tenants 30 days before renewal due dates.",
    icon: CircleDollarSign,
  },
  {
    num: "05",
    title: "Track Maintenance Requests",
    desc: "Track tenant repair requests with structured statuses: Pending, In Progress, and Completed. Assign tasks to managers or mechanics easily.",
    icon: Wrench,
  },
];

export default function HowItWorksClient() {
  const { openAuth } = useAuth();
  const [activeTab, setActiveTab] = useState<"tenant" | "landlord">("tenant");

  const steps = activeTab === "tenant" ? tenantSteps : landlordSteps;

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8">
      {/* Hero Header */}
      <div className="text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-brandgreen-600 bg-brandgreen-50 px-3.5 py-1.5 rounded-full">
          Process Guide
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
          How LinkConn Rent Works
        </h1>
        <p className="mt-3 mx-auto max-w-xl text-sm leading-relaxed text-navy-500 font-semibold">
          We strip out agents and middlemen commissions to give you direct connection. Enjoy scam-free rentals across Nigeria.
        </p>
      </div>

      {/* Tab Selectors */}
      <div className="mt-10 flex justify-center">
        <div className="inline-flex rounded-2xl bg-white border border-navy-100 p-1.5 shadow-sm">
          <button
            onClick={() => setActiveTab("tenant")}
            className={`rounded-xl px-6 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "tenant"
                ? "bg-navy-950 text-white shadow-sm"
                : "text-navy-600 hover:text-navy-800"
            }`}
          >
            <span className="inline-flex items-center gap-1.5"><UserRound className="size-4" aria-hidden="true" /> For Tenants</span>
          </button>
          <button
            onClick={() => setActiveTab("landlord")}
            className={`rounded-xl px-6 py-2.5 text-xs font-bold transition-all cursor-pointer ${
              activeTab === "landlord"
                ? "bg-navy-950 text-white shadow-sm"
                : "text-navy-600 hover:text-navy-800"
            }`}
          >
            <span className="inline-flex items-center gap-1.5"><Building2 className="size-4" aria-hidden="true" /> For Landlords</span>
          </button>
        </div>
      </div>

      {/* Timeline steps */}
      <div className="mt-16 relative border-l-2 border-dashed border-navy-200 pl-6 md:pl-8 ml-3 sm:ml-6 space-y-12">
        <AnimatePresence mode="wait">
          {steps.map((s, idx) => (
            <motion.div
              key={s.num + activeTab}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.35, delay: idx * 0.08 }}
              className="relative"
            >
              {/* Bullet Node */}
              <div className="absolute -left-[45px] md:-left-[53px] flex h-10 w-10 md:h-12 md:w-12 items-center justify-center rounded-full bg-navy-950 text-white shadow-md font-bold text-sm border-4 border-sand-100">
                {s.num}
              </div>

              {/* Step Card */}
              <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <s.icon className="size-7 text-primary" aria-hidden="true" />
                  <h3 className="text-base font-extrabold text-navy-950">{s.title}</h3>
                </div>
                <p className="mt-3 text-xs leading-relaxed text-navy-600 font-semibold md:text-sm">
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Bottom CTA Block */}
      <div className="mt-16 rounded-3xl bg-gradient-to-br from-navy-900 to-navy-950 p-8 text-center text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-brandgreen-500/10 blur-2xl" />
        <h3 className="text-xl font-extrabold sm:text-2xl">
          {activeTab === "tenant" ? "Ready to find your dream apartment?" : "Start listing your properties today"}
        </h3>
        <p className="mt-2 text-xs text-navy-300 max-w-sm mx-auto font-medium">
          {activeTab === "tenant"
            ? "Sign up now and view properties free of agent commissions."
            : "Connect with verified tenants, manage invoicing, and track maintenance repairs."}
        </p>
        <button
          onClick={() => openAuth("pick")}
          className="mt-6 rounded-xl bg-brandgreen-500 px-6 py-3 text-xs font-bold text-white shadow-lg shadow-brandgreen-500/20 transition-colors hover:bg-brandgreen-600 cursor-pointer"
        >
          {activeTab === "tenant" ? "Get Started" : "List Your Home"}
        </button>
      </div>
    </div>
  );
}
