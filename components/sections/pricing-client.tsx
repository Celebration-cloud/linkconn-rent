"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Building2, Check, ReceiptText, ShieldCheck, UserRound } from "lucide-react";
import {
  PLAN_LIBRARY,
  buildOnboardingNext,
  getCheckoutAmount,
  getDisplayPrice,
  type BillingPeriod,
  type PlanKey,
  type SignupRole,
} from "@/domain/billing";
import { useAuthFlowStore } from "@/stores/auth-flow-store";
<<<<<<< HEAD
import { buildOnboardingNext, type SignupRole, type PlanKey } from "@/domain/billing";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Check,
  ChevronDown,
  CircleDollarSign,
  HelpCircle,
  Percent,
  Receipt,
  Scale,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
  Wallet,
  Zap,
} from "lucide-react";

const landlordPlans = [
  {
    key: "landlord-standard",
    name: "Standard Landlord",
    monthlyPrice: 0,
    annualPrice: 0,
    desc: "For individual property owners listing 1 or 2 residential apartments.",
    features: [
      "Up to 2 active verified listings",
      "Direct verified tenant chat",
      "Standard legal tenancy agreement generation",
      "Escrow rent collection & direct bank payout",
      "Basic repair ticket logging",
    ],
    cta: "Start Free",
    popular: false,
    badge: "100% Free Forever",
  },
  {
    key: "landlord-featured",
    name: "Featured Pro",
    monthlyPrice: 15000,
    annualPrice: 12000, // 12,000/mo billed annually
    desc: "For active property owners seeking top search ranking and priority audits.",
    features: [
      "Up to 10 active property listings",
      "Top priority search indexing & Featured badge",
      "Free 24h physical verification inspection",
      "Automated SMS & email rent invoices",
      "Advanced tenant screening & income validation",
      "Priority WhatsApp support desk",
    ],
    cta: "Choose Featured Pro",
    popular: true,
    badge: "Most Popular",
  },
  {
    key: "landlord-agency",
    name: "Agency Portfolio",
    monthlyPrice: 45000,
    annualPrice: 36000,
    desc: "For real estate firms, caretakers, and multi-unit estate managers.",
    features: [
      "Unlimited active property listings",
      "Multi-caretaker access & role permissions",
      "Instant on-demand field verification audits",
      "Custom agency branding on digital leases",
      "Comprehensive portfolio yield & occupancy analytics",
      "Dedicated account manager",
    ],
    cta: "Join Portfolio Plan",
    popular: false,
    badge: "Enterprise Grade",
  },
];

const tenantPlans = [
  {
    key: "tenant-standard",
    name: "Standard Searcher",
    price: 0,
    desc: "Always free for students, families, and professionals seeking homes.",
    features: [
      "Unlimited browsing of 1,200+ verified listings",
      "Direct chat with verified landlords & caretakers",
      "Book physical inspections for ₦0 fee",
      "100% Escrow rent & caution deposit protection",
      "Digital legal tenancy agreement e-signing",
    ],
    cta: "Browse Verified Homes Free",
    popular: false,
    badge: "Free For Renters",
  },
  {
    key: "tenant-premium",
    name: "Priority Renter",
    price: 4900,
    desc: "Secure competitive high-demand apartments before anyone else.",
    features: [
      "24-hour early access to freshly listed properties",
      "Verified Tenant Profile Badge (3x higher landlord acceptance)",
      "Instant SMS & WhatsApp matching alerts",
      "Priority verification & background check queue",
      "Unlimited saved properties & customized searches",
    ],
    cta: "Upgrade to Priority Renter",
    popular: true,
    badge: "Recommended for Movers",
  },
];

const comparisonMatrix = [
  { feature: "Agent Commission Markup", traditional: "10% of Annual Rent (₦300k+)", linkconn: "₦0 (Direct Landlord)" },
  { feature: "Legal Agreement Fee", traditional: "10% of Annual Rent (₦300k+)", linkconn: "Included Free" },
  { feature: "Inspection / Viewing Fee", traditional: "₦3,000 - ₦10,000 per viewing", linkconn: "₦0 Free Booking" },
  { feature: "Caution Deposit Safety", traditional: "Cash held by agent/landlord", linkconn: "100% Locked in Escrow" },
  { feature: "Deed & Ownership Audit", traditional: "Unverified / Risk of scam", linkconn: "Title Checked & Geotagged" },
  { feature: "Move-in Scam Protection", traditional: "Zero recourse if scammed", linkconn: "24h Move-in Guarantee" },
];

const pricingFaqs = [
  {
    q: "Are there any hidden agency, agreement, or registration charges?",
    a: "None whatsoever. LinkConn Rent is strictly structured to eliminate middleman commission. Renters pay zero percent in agent fees. You only pay the listed rent amount, caution deposit, and service charge directly to the escrow vault.",
  },
  {
    q: "How does the annual landlord discount work?",
    a: "When you select the Annual billing option, you receive a 20% discount on the monthly rate, billed as a single annual payment.",
  },
  {
    q: "Can I cancel or upgrade my Landlord subscription at any time?",
    a: "Yes. You can upgrade, downgrade, or cancel any paid tier directly in your Billing & Workspace settings at any time without penalties.",
  },
  {
    q: "Why do tenants use the Priority Renter upgrade?",
    a: "In fast-moving markets like Lekki, Yaba, or Wuse 2, prime units are taken within 48 hours. Priority Renter alerts you the moment a verified listing is approved and awards your profile a Verified Tenant badge, giving landlords instant confidence to accept your application.",
  },
];

export default function PricingClient() {
  const router = useRouter();
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annual">("annual");
  const [roleMode, setRoleMode] = useState<"landlord" | "tenant">("landlord");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
=======

const pricingNotes = [
  ["Property charges stay visible", "Rent and listing-specific charges are shown separately from the LinkConn Rent plan."],
  ["Payment status stays provider-controlled", "The platform records the provider result and does not represent an unconfirmed payment as complete."],
  ["Free remains a real route", "Tenants and small landlords can begin with the standard plan before choosing paid tools."],
] as const;

export default function PricingClient() {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
  const [role, setRoleMode] = useState<SignupRole>("Landlord");
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>("annual");
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
  const setRole = useAuthFlowStore((state) => state.setRole);
  const setPlan = useAuthFlowStore((state) => state.setPlan);
  const plans = PLAN_LIBRARY[role];

  function startSignup(planKey: PlanKey) {
    const period = role === "Tenant" ? "annual" : billingPeriod;
    const next = buildOnboardingNext({ role, planKey, billingPeriod: period });
    setRole(role);
<<<<<<< HEAD
    setPlan(plan, role === "Landlord" ? billingPeriod : "annual");
    router.push(
      `/signup?role=${role}&plan=${plan}&billing=${role === "Landlord" ? billingPeriod : "annual"}&next=${encodeURIComponent(next)}`
    );
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-20">
      {/* Header text */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-forest-600/30 bg-forest-900/10 px-4 py-1.5 text-xs font-bold text-forest-800">
          <Percent className="size-4 text-forest-700" />
          TRANSPARENT REVENUE MODEL
=======
    setPlan(planKey, period);
    router.push(`/signup?role=${role}&plan=${planKey}&billing=${period}&next=${encodeURIComponent(next)}`);
  }

  return (
    <main id="main-content" className="bg-sand-50 pb-24 pt-16">
      <section className="border-b border-forest-800 bg-forest-950 text-white">
        <div className="stitch-container grid gap-10 py-16 sm:py-24 lg:grid-cols-[1fr_.72fr] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-balance text-5xl font-extrabold leading-[.98] tracking-[-.04em] sm:text-6xl">Choose the tools your rental work needs.</h1>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-sand-300">Start free, compare the included workflow, and see the billing period before creating an account.</p>
          </div>
          <div className="border border-white/15 p-5"><ReceiptText className="size-5 text-lime" /><p className="mt-4 text-sm font-bold">Plan price is not property cost.</p><p className="mt-2 text-sm leading-6 text-sand-300">Each listing keeps rent and move-in charges in its own breakdown.</p></div>
        </div>
      </section>

      <section className="stitch-container py-14 sm:py-20">
        <div className="flex flex-col gap-5 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
          <div><h2 className="text-3xl font-extrabold tracking-[-.03em] text-ink sm:text-4xl">Plans by role</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Only the options relevant to your account are shown.</p></div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="segmented-control" aria-label="Choose account role">
              <button type="button" aria-pressed={role === "Landlord"} onClick={() => setRoleMode("Landlord")}><Building2 className="mr-2 inline size-4" />Landlord</button>
              <button type="button" aria-pressed={role === "Tenant"} onClick={() => setRoleMode("Tenant")}><UserRound className="mr-2 inline size-4" />Tenant</button>
            </div>
            {role === "Landlord" ? <div className="segmented-control" aria-label="Choose billing period"><button type="button" aria-pressed={billingPeriod === "monthly"} onClick={() => setBillingPeriod("monthly")}>Monthly</button><button type="button" aria-pressed={billingPeriod === "annual"} onClick={() => setBillingPeriod("annual")}>Annual</button></div> : null}
          </div>
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-5xl lg:text-6xl">
          Zero Agent Fees. Predictable Pricing.
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          We believe renting a home in Nigeria shouldn&apos;t cost 20% in agent commissions. Start completely free or upgrade for powerful property management tools.
        </p>

<<<<<<< HEAD
        {/* Role & Period Selectors */}
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <div className="inline-flex rounded-2xl border border-line bg-white p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setRoleMode("landlord")}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-extrabold transition cursor-pointer ${
                roleMode === "landlord"
                  ? "bg-forest-950 text-white shadow-md"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Building2 className="size-4 text-lime" /> For Landlords & Caretakers
            </button>
            <button
              type="button"
              onClick={() => setRoleMode("tenant")}
              className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-xs font-extrabold transition cursor-pointer ${
                roleMode === "tenant"
                  ? "bg-forest-950 text-white shadow-md"
                  : "text-muted hover:text-ink"
              }`}
            >
              <UserRound className="size-4 text-lime" /> For Tenants & Searchers
            </button>
          </div>

          {roleMode === "landlord" && (
            <div className="flex items-center gap-3 rounded-2xl border border-line bg-sand-100 px-4 py-2 text-xs font-bold">
              <span className={billingPeriod === "monthly" ? "text-forest-950" : "text-muted"}>
                Monthly
              </span>
              <button
                type="button"
                onClick={() => setBillingPeriod((p) => (p === "monthly" ? "annual" : "monthly"))}
                className="relative h-6 w-11 rounded-full bg-forest-900 transition cursor-pointer"
                aria-label="Toggle annual billing"
              >
                <motion.span
                  layout
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-lime shadow-sm ${
                    billingPeriod === "annual" ? "left-[22px]" : "left-0.5"
                  }`}
                />
              </button>
              <span className={`flex items-center gap-1.5 ${billingPeriod === "annual" ? "text-forest-950" : "text-muted"}`}>
                Annual <span className="rounded-full bg-lime px-2 py-0.5 text-[9px] font-black uppercase text-forest-950">Save 20%</span>
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Grid of pricing options */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
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
                    className={`relative rounded-3xl border bg-white p-7 shadow-sm flex flex-col justify-between transition hover:shadow-md ${
                      plan.popular ? "border-forest-600 ring-2 ring-forest-600/20" : "border-line"
                    }`}
                  >
                    {plan.popular && (
                      <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-forest-950 border border-lime/40 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-lime shadow-sm">
                        {plan.badge}
                      </span>
                    )}

                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-black text-ink">{plan.name}</h3>
                        {!plan.popular && (
                          <span className="rounded-md bg-sand-200 px-2 py-0.5 text-[10px] font-bold text-forest-800">
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-xs text-muted leading-relaxed">{plan.desc}</p>

                      <div className="mt-6 flex items-baseline">
                        <span className="text-3xl font-black text-ink">{formatPrice(price)}</span>
                        {price > 0 && (
                          <span className="text-xs font-bold text-muted ml-1.5">/month</span>
                        )}
                      </div>
                      {price > 0 && billingPeriod === "annual" && (
                        <div className="text-[11px] font-bold text-forest-700 mt-1">
                          Billed annually (₦{(price * 12).toLocaleString("en-NG")} / year)
                        </div>
                      )}

                      <ul className="mt-6 space-y-3 border-t border-line pt-6">
                        {plan.features.map((f) => (
                          <li key={f} className="flex items-start gap-2.5 text-xs text-ink">
                            <Check className="mt-0.5 size-4 shrink-0 text-forest-600" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      type="button"
                      onClick={() => startSignup("Landlord", plan.key as PlanKey)}
                      className={`mt-8 w-full rounded-xl py-3.5 text-xs font-extrabold transition cursor-pointer ${
                        plan.popular
                          ? "bg-forest-950 text-lime hover:bg-forest-900 shadow-md"
                          : "bg-sand-200 text-forest-950 hover:bg-sand-300"
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
                  className={`relative rounded-3xl border bg-white p-7 shadow-sm flex flex-col justify-between transition hover:shadow-md md:col-span-1 ${
                    plan.popular ? "border-forest-600 ring-2 ring-forest-600/20" : "border-line"
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-forest-950 border border-lime/40 px-3.5 py-1 text-[10px] font-black uppercase tracking-wider text-lime shadow-sm">
                      {plan.badge}
                    </span>
                  )}

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-ink">{plan.name}</h3>
                      {!plan.popular && (
                        <span className="rounded-md bg-sand-200 px-2 py-0.5 text-[10px] font-bold text-forest-800">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-xs text-muted leading-relaxed">{plan.desc}</p>

                    <div className="mt-6 flex items-baseline">
                      <span className="text-3xl font-black text-ink">{formatPrice(plan.price)}</span>
                      {plan.price > 0 && (
                        <span className="text-xs font-bold text-muted ml-1.5">/year flat fee</span>
                      )}
                    </div>

                    <ul className="mt-6 space-y-3 border-t border-line pt-6">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-start gap-2.5 text-xs text-ink">
                          <Check className="mt-0.5 size-4 shrink-0 text-forest-600" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => startSignup("Tenant", plan.key as PlanKey)}
                    className={`mt-8 w-full rounded-xl py-3.5 text-xs font-extrabold transition cursor-pointer ${
                      plan.popular
                        ? "bg-forest-950 text-lime hover:bg-forest-900 shadow-md"
                        : "bg-sand-200 text-forest-950 hover:bg-sand-300"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </motion.div>
              ))}
        </AnimatePresence>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="rounded-3xl border border-line bg-white p-6 sm:p-10 shadow-sm max-w-5xl mx-auto">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-forest-700">
            Head-to-Head Comparison
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            Traditional Nigerian Agents vs LinkConn Rent
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-muted">
            See exactly why thousands of renters and landlords have migrated away from street agents.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="py-3 font-bold">Feature / Guarantee</th>
                <th className="py-3 font-bold text-red-700">Traditional Street Agents</th>
                <th className="py-3 font-bold text-forest-800">LinkConn Rent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {comparisonMatrix.map((row) => (
                <tr key={row.feature} className="hover:bg-sand-50 transition">
                  <td className="py-3.5 font-bold text-ink">{row.feature}</td>
                  <td className="py-3.5 text-red-600 font-semibold">{row.traditional}</td>
                  <td className="py-3.5 text-forest-900 font-bold flex items-center gap-1.5">
                    <BadgeCheck className="size-4 text-forest-700 shrink-0" />
                    {row.linkconn}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-forest-700">
            Got Questions?
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            Pricing & Payment FAQs
          </h2>
        </div>

        <div className="space-y-3 mt-6">
          {pricingFaqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div
                key={faq.q}
                className="rounded-2xl border border-line bg-white overflow-hidden transition shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left text-sm font-bold text-ink hover:bg-sand-50 cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`size-4 text-muted transition-transform ${
                      isOpen ? "rotate-180 text-forest-700" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="border-t border-line p-5 text-xs leading-relaxed text-muted bg-sand-50/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
=======
        <motion.div
          key={`${role}-${billingPeriod}`}
          initial={reducedMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reducedMotion ? 0 : .3, ease: [0.22, 1, 0.36, 1] }}
          className={`mt-8 grid gap-5 ${plans.length === 2 ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}
        >
          {plans.map((plan) => {
            const period = role === "Tenant" ? "annual" : billingPeriod;
            const displayPrice = getDisplayPrice(plan, period);
            const checkoutAmount = getCheckoutAmount(plan, period);
            return (
              <article key={plan.key} className={`flex min-h-[32rem] flex-col border bg-white p-6 sm:p-7 ${plan.popular ? "border-forest-800" : "border-line"}`}>
                <div className="flex items-start justify-between gap-4"><div><h3 className="text-xl font-extrabold tracking-[-.02em] text-ink">{plan.name}</h3><p className="mt-2 text-sm leading-6 text-muted">{plan.description}</p></div>{plan.popular ? <span className="bg-lime px-2.5 py-1 text-[10px] font-extrabold text-forest-950">Recommended</span> : null}</div>
                <div className="mt-8 border-y border-line py-5"><p className="text-4xl font-extrabold tabular-nums tracking-[-.035em] text-forest-950">{displayPrice === 0 ? "Free" : `₦${displayPrice.toLocaleString("en-NG")}`}</p><p className="mt-1 text-xs text-muted">{displayPrice === 0 ? "No plan charge" : role === "Tenant" ? "per year" : period === "monthly" ? "per month" : `per month · ₦${checkoutAmount.toLocaleString("en-NG")} billed yearly`}</p></div>
                <ul className="mt-6 flex-1 space-y-4">{plan.features.map((feature) => <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-forest-950"><span className="mt-0.5 grid size-5 shrink-0 place-items-center bg-forest-100"><Check className="size-3.5" /></span>{feature}</li>)}</ul>
                <button type="button" onClick={() => startSignup(plan.key)} className={plan.popular ? "stitch-button mt-8 w-full bg-forest-950" : "stitch-button stitch-button-secondary mt-8 w-full"}>{plan.cta}<ArrowRight className="size-4" /></button>
              </article>
            );
          })}
        </motion.div>
      </section>

      <section className="stitch-container grid border-y border-line lg:grid-cols-3">
        {pricingNotes.map(([title, copy], index) => <article key={title} className={`p-6 sm:p-8 ${index ? "border-t border-line lg:border-l lg:border-t-0" : ""}`}><ShieldCheck className="size-5 text-forest-700" /><h2 className="mt-5 text-lg font-extrabold text-ink">{title}</h2><p className="mt-2 text-sm leading-6 text-muted">{copy}</p></article>)}
      </section>

      <section className="stitch-container pt-16"><div className="grid gap-8 bg-sand-200 p-6 sm:p-10 lg:grid-cols-[.8fr_1.2fr]"><div><h2 className="text-3xl font-extrabold tracking-[-.03em] text-ink">Before you choose</h2><p className="mt-3 text-sm leading-6 text-muted">Plan features help operate the account. Property rent, deposits, legal fees, service charges, and other disclosed listing costs remain separate.</p></div><dl className="grid gap-px bg-line sm:grid-cols-2"><div className="bg-white p-5"><dt className="text-xs font-bold text-muted">Billing choice</dt><dd className="mt-2 text-sm font-extrabold text-ink">Confirmed during onboarding</dd></div><div className="bg-white p-5"><dt className="text-xs font-bold text-muted">Need help deciding?</dt><dd className="mt-2"><button type="button" onClick={() => router.push("/help")} className="text-sm font-extrabold text-forest-700 hover:underline">Open the help centre</button></dd></div></dl></div></section>
    </main>
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
  );
}
