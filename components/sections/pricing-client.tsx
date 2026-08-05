"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthFlowStore } from "@/stores/auth-flow-store";
import { buildOnboardingNext, type SignupRole, type PlanKey } from "@/domain/billing";
import { Building2, Check, UserRound } from "lucide-react";

const landlordPlans = [
  {
    key: "landlord-standard",
    name: "Standard Free",
    monthlyPrice: 0,
    annualPrice: 0,
    desc: "Perfect for individual landlords with one or two residential homes.",
    features: [
      "Up to 2 active property listings",
      "Standard document verification audit",
      "Direct secure tenant chat",
      "Basic tenancy repair tracking",
    ],
    cta: "Start Free",
    popular: false,
  },
  {
    key: "landlord-featured",
    name: "Featured Pro",
    monthlyPrice: 15000,
    annualPrice: 12000, // 12000 per month if annual
    desc: "Best for active property managers and duplex caretakers.",
    features: [
      "Up to 10 active listings",
      "Featured placement in search index",
      "Free priority physical audits",
      "Automated rent invoicing via email/SMS",
      "WhatsApp priority customer support",
    ],
    cta: "Choose Pro",
    popular: true,
  },
  {
    key: "landlord-agency",
    name: "Agency Premium",
    monthlyPrice: 45000,
    annualPrice: 36050, // 36050 per month if annual
    desc: "For real estate agencies with multiple buildings and complexes.",
    features: [
      "Unlimited active property listings",
      "Instant 24-hour verification visits",
      "Dedicated account property manager",
      "Custom agency branding & logos",
      "Financial collection analytics dashboards",
    ],
    cta: "Join Premium",
    popular: false,
  },
];

const tenantPlans = [
  {
    key: "tenant-standard",
    name: "Standard Searcher",
    price: 0,
    desc: "Always free for students and young professionals seeking homes.",
    features: [
      "Unlimited browsing of listings",
      "Direct chat with verified landlords",
      "Schedule inspection slots free",
      "Rent escrow payment security",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    key: "tenant-premium",
    name: "Premium Match",
    price: 4900, // single-time yearly fee or flat fee
    desc: "Secure properties faster with automated priority matching.",
    features: [
      "24-hour early access to new listings",
      "Verified Tenant profile badge",
      "Instant email/SMS matching alerts",
      "Unlimited saved searches and bookmarks",
      "Priority background check review",
    ],
    cta: "Upgrade Now",
    popular: true,
  },
];

const pricingFaqs = [
  {
    q: "Are there any hidden agent fees or agreement charges?",
    a: "Absolutely none. LinkConn Rent is built to eliminate agent commissions entirely. You only pay the listed rent amount + any optional premium package upgrades you select.",
  },
  {
    q: "How does the annual discount work?",
    a: "Choosing the annual option bills you once for 12 months at a 20% discounted monthly rate, saving you money over the year.",
  },
  {
    q: "Can I cancel my Landlord subscription?",
    a: "Yes. You can upgrade, downgrade, or cancel your Featured Pro or Agency plans at any time in your Billing settings. Cancelled plans remain active until the end of the current cycle.",
  },
  {
    q: "Do I have to pay to message landlords?",
    a: "No, messaging landlords and scheduling property viewings is 100% free under the Standard Searcher plan.",
  },
];

export default function PricingClient() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");
  const [roleMode, setRoleMode] = useState<"landlord" | "tenant">("landlord");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const setRole = useAuthFlowStore((state) => state.setRole);
  const setPlan = useAuthFlowStore((state) => state.setPlan);

  const formatPrice = (p: number) => {
    if (p === 0) return "Free";
    return "₦" + p.toLocaleString("en-NG");
  };

  const startSignup = (role: SignupRole, plan: PlanKey) => {
    const next = buildOnboardingNext({
      role,
      planKey: plan,
      billingPeriod: role === "Landlord" ? billingPeriod : "annual",
    });
    setRole(role);
    setPlan(plan, role === "Landlord" ? billingPeriod : "annual");
    router.push(`/signup?role=${role}&plan=${plan}&billing=${role === "Landlord" ? billingPeriod : "annual"}&next=${encodeURIComponent(next)}`);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8 space-y-16">
      
      {/* Header text */}
      <div className="text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-brandgreen-600 bg-brandgreen-50 px-3.5 py-1.5 rounded-full">
          Subscription Tiers
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
          Fair, Transparent Pricing
        </h1>
        <p className="mt-3 mx-auto max-w-xl text-sm leading-relaxed text-navy-500 font-semibold">
          No agent commissions, no inspection fees. Choose a plan to elevate your experience or start completely free.
        </p>
      </div>

      {/* Switch selectors */}
      <div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
        {/* Landlord vs Tenant role toggle */}
        <div className="inline-flex rounded-2xl bg-white border border-navy-100 p-1.5 shadow-sm">
          <button
            onClick={() => setRoleMode("landlord")}
            className={`rounded-xl px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
              roleMode === "landlord"
                ? "bg-navy-950 text-white shadow-sm"
                : "text-navy-600 hover:text-navy-800"
            }`}
          >
            <span className="inline-flex items-center gap-1.5"><Building2 className="size-4" aria-hidden="true" /> I am a Landlord</span>
          </button>
          <button
            onClick={() => setRoleMode("tenant")}
            className={`rounded-xl px-5 py-2 text-xs font-bold transition-all cursor-pointer ${
              roleMode === "tenant"
                ? "bg-navy-950 text-white shadow-sm"
                : "text-navy-600 hover:text-navy-800"
            }`}
          >
            <span className="inline-flex items-center gap-1.5"><UserRound className="size-4" aria-hidden="true" /> I am a Tenant</span>
          </button>
        </div>

        {/* Monthly vs Annual toggle (Only shown for landlord plans) */}
        {roleMode === "landlord" && (
          <div className="flex items-center gap-3">
            <span className={`text-xs font-bold ${billingPeriod === "monthly" ? "text-navy-900" : "text-navy-400"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingPeriod((p) => (p === "monthly" ? "annual" : "monthly"))}
              className="relative h-6 w-11 rounded-full bg-navy-200 transition-colors cursor-pointer"
            >
              <motion.span
                layout
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow ${
                  billingPeriod === "annual" ? "left-[22px]" : "left-0.5"
                }`}
              />
            </button>
            <span className={`text-xs font-bold flex items-center gap-1.5 ${billingPeriod === "annual" ? "text-navy-900" : "text-navy-400"}`}>
              Annual <span className="rounded-full bg-brandgreen-100 text-brandgreen-700 px-2 py-0.5 text-[9px] font-black uppercase">Save 20%</span>
            </span>
          </div>
        )}
      </div>

      {/* Grid of pricing options */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto justify-center">
        <AnimatePresence mode="wait">
          {roleMode === "landlord"
            ? landlordPlans.map((plan) => {
                const price = billingPeriod === "monthly" ? plan.monthlyPrice : plan.annualPrice;
                return (
                  <motion.div
                    key={plan.name}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className={`relative rounded-3xl border bg-white p-6 shadow-sm flex flex-col justify-between ${
                      plan.popular ? "border-brandgreen-500 ring-2 ring-brandgreen-500/10" : "border-navy-100"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brandgreen-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                        Most Popular
                      </span>
                    )}

                    <div>
                      <h3 className="text-base font-extrabold text-navy-950">{plan.name}</h3>
                      <p className="mt-2 text-xs text-navy-500 leading-relaxed font-semibold">{plan.desc}</p>
                      
                      <div className="mt-5 flex items-baseline">
                        <span className="text-3xl font-black text-navy-950">{formatPrice(price)}</span>
                        {price > 0 && (
                          <span className="text-xs font-bold text-navy-400 ml-1">/mo</span>
                        )}
                      </div>
                      {price > 0 && billingPeriod === "annual" && (
                        <div className="text-[10px] font-bold text-brandgreen-600 mt-1">
                          Billed yearly (₦{(price * 12).toLocaleString("en-NG")} / year)
                        </div>
                      )}

                      <ul className="mt-6 space-y-3.5 border-t border-navy-50 pt-5">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2.5 text-xs font-semibold text-navy-700">
                            <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden="true" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                    onClick={() => startSignup("Landlord", plan.key as PlanKey)}
                      className={`mt-8 w-full rounded-xl py-3 text-xs font-extrabold shadow-sm transition-colors cursor-pointer ${
                        plan.popular
                          ? "bg-brandgreen-500 text-white hover:bg-brandgreen-600"
                          : "bg-navy-900 text-white hover:bg-navy-950"
                      }`}
                    >
                      {plan.cta}
                    </button>
                  </motion.div>
                );
              })
            : tenantPlans.map((plan) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className={`relative rounded-3xl border bg-white p-6 shadow-sm flex flex-col justify-between md:col-span-1 ${
                    plan.popular ? "border-brandgreen-500 ring-2 ring-brandgreen-500/10" : "border-navy-100"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-brandgreen-500 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white">
                      Best Value
                    </span>
                  )}

                  <div>
                    <h3 className="text-base font-extrabold text-navy-950">{plan.name}</h3>
                    <p className="mt-2 text-xs text-navy-500 leading-relaxed font-semibold">{plan.desc}</p>
                    
                    <div className="mt-5 flex items-baseline">
                      <span className="text-3xl font-black text-navy-950">{formatPrice(plan.price)}</span>
                      {plan.price > 0 && (
                        <span className="text-xs font-bold text-navy-400 ml-1">/year</span>
                      )}
                    </div>

                    <ul className="mt-6 space-y-3.5 border-t border-navy-50 pt-5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-xs font-semibold text-navy-700">
                          <Check className="mt-0.5 size-3.5 shrink-0 text-success" aria-hidden="true" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => startSignup("Tenant", plan.key as PlanKey)}
                    className={`mt-8 w-full rounded-xl py-3 text-xs font-extrabold shadow-sm transition-colors cursor-pointer ${
                      plan.popular
                        ? "bg-brandgreen-500 text-white hover:bg-brandgreen-600"
                        : "bg-navy-900 text-white hover:bg-navy-950"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </motion.div>
              ))}
        </AnimatePresence>
      </div>

      {/* Frequently Asked Questions */}
      <div className="border-t border-navy-100 pt-12 max-w-3xl mx-auto space-y-6">
        <h2 className="text-xl font-extrabold text-navy-950 text-center sm:text-2xl">
          Pricing FAQs
        </h2>
        <div className="space-y-3 mt-8">
          {pricingFaqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={i}
                className="rounded-2xl border border-navy-100 bg-white overflow-hidden transition-all shadow-sm"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="flex w-full items-center justify-between p-4 text-left text-xs font-bold text-navy-900 hover:bg-navy-50 cursor-pointer select-none"
                >
                  <span>{faq.q}</span>
                  <span>{isOpen ? "−" : "+"}</span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: "auto" }}
                      exit={{ height: 0 }}
                      className="overflow-hidden"
                    >
                      <p className="border-t border-navy-50 p-4 text-xs leading-relaxed text-navy-500 font-semibold bg-navy-50/20">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
