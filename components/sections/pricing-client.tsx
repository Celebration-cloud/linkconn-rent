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
  const setRole = useAuthFlowStore((state) => state.setRole);
  const setPlan = useAuthFlowStore((state) => state.setPlan);
  const plans = PLAN_LIBRARY[role];

  function startSignup(planKey: PlanKey) {
    const period = role === "Tenant" ? "annual" : billingPeriod;
    const next = buildOnboardingNext({ role, planKey, billingPeriod: period });
    setRole(role);
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
        </div>

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
  );
}
