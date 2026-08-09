"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, BadgeCheck, CreditCard, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import OnboardingWizard from "@/features/onboarding/onboarding-wizard";
import type { Role } from "@/domain/types/auth";
import {
  PLAN_LIBRARY,
  getDefaultChoice,
  isBillingPeriod,
  isPlanKey,
  isSignupRole,
} from "@/domain/billing";
import { useAuthFlowStore } from "@/stores/auth-flow-store";
import Link from "next/link";
import { Logo } from "@/components/shared/icons";

const SKIP_ONBOARDING_ROLES: Role[] = ["Admin", "Super Admin", "Moderator", "Property Manager"];

export default function OnboardingPage() {
  const { user, isLoadingProfile } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialized = useRef(false);

  const storedRole = useAuthFlowStore((state) => state.role);
  const storedPlanKey = useAuthFlowStore((state) => state.planKey);
  const storedBilling = useAuthFlowStore((state) => state.billingPeriod);
  const hydrateFromQuery = useAuthFlowStore((state) => state.hydrateFromQuery);
  const role = useMemo(() => {
    const queryRole = searchParams.get("role");
    if (isSignupRole(queryRole)) return queryRole;
    return storedRole || (user?.role === "Landlord" ? "Landlord" : "Tenant");
  }, [searchParams, storedRole, user?.role]);

  const plan = useMemo(() => {
    const queryPlan = searchParams.get("plan");
    if (isPlanKey(queryPlan) && PLAN_LIBRARY[role].some((item) => item.key === queryPlan)) return queryPlan;
    return storedPlanKey || getDefaultChoice(role).planKey;
  }, [role, searchParams, storedPlanKey]);

  const billingPeriod = useMemo(() => {
    const queryBilling = searchParams.get("billing");
    if (isBillingPeriod(queryBilling)) return queryBilling;
    return storedBilling || getDefaultChoice(role).billingPeriod;
  }, [role, searchParams, storedBilling]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    hydrateFromQuery({ role, planKey: plan, billingPeriod });
  }, [billingPeriod, hydrateFromQuery, plan, role]);

  useEffect(() => {
    if (!user) return;
    if (SKIP_ONBOARDING_ROLES.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [router, user]);

  if (isLoadingProfile || !user) {
    return (
      <section className="grid min-h-[100dvh] place-items-center bg-sand-50 px-4">
          <div className="rounded-xl border border-line bg-white px-8 py-10 text-center shadow-sm">
            <Loader2 className="mx-auto h-8 w-8 animate-spin text-forest-700" />
            <p className="mt-4 text-sm font-medium text-muted">Loading your verification workspace...</p>
          </div>
      </section>
    );
  }

  if (SKIP_ONBOARDING_ROLES.includes(user.role)) {
    return null;
  }

  const planMeta = PLAN_LIBRARY[role].find((item) => item.key === plan) || PLAN_LIBRARY[role][0];
  const isLandlord = role === "Landlord";
  const stepHints = isLandlord
    ? [
        { title: "Identity", body: "NIN is mandatory before you continue.", icon: ShieldCheck },
        { title: "Business", body: "Tell us what property types you manage.", icon: BadgeCheck },
        { title: "Payout", body: "Add your settlement account for rent collection.", icon: CreditCard },
      ]
    : [
        { title: "Identity", body: "NIN is mandatory before you continue.", icon: ShieldCheck },
        { title: "Preferences", body: "Tell us where and what you want to rent.", icon: Sparkles },
        { title: "Income", body: "Confirm your affordability range.", icon: CreditCard },
      ];

  return (
    <main id="main-content" className="min-h-[100dvh] overflow-x-clip bg-sand-50 pb-8">
      <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
        <div className="stitch-container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center" aria-label="LinkConn Rent home">
            <Logo variant="lockup" priority className="h-12 w-auto" sizes="102px" />
          </Link>
          <button
            type="submit"
            form="onboarding-form"
            name="intent"
            value="save-exit"
            className="min-h-11 rounded-lg px-3 text-sm font-bold text-muted hover:bg-sand-100 hover:text-forest-800"
          >
            Save &amp; exit
          </button>
        </div>
      </header>
      <div className="stitch-container grid min-w-0 gap-8 py-6 lg:grid-cols-[17rem_minmax(0,1fr)] lg:py-12">
        <aside className="hidden lg:sticky lg:top-24 lg:block lg:max-h-[calc(100dvh-7rem)] lg:overflow-y-auto lg:pr-2">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-forest-700">Verification</p>
          <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">Set up your {role.toLowerCase()} profile</h1>
          <p className="mt-3 text-sm leading-6 text-muted">We verify the details that keep applications and rent transactions safer.</p>

          <ol className="mt-8 space-y-5">
            {stepHints.map((item, index) => {
              const Icon = item.icon;
              return (
                <li key={item.title} className="flex gap-3">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${index === 0 ? "bg-forest-700 text-white" : "bg-forest-100 text-forest-700"}`}>
                    {index === 0 ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-forest-950">{item.title}</p>
                    <p className="mt-0.5 text-xs leading-5 text-muted">{item.body}</p>
                  </div>
                </li>
              );
            })}
          </ol>

          <div className="mt-8 rounded-xl border border-line bg-sand-100 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-forest-700">Selected plan</p>
            <p className="mt-2 font-extrabold text-ink">{planMeta.name}</p>
            <p className="mt-1 text-xs leading-5 text-muted">{planMeta.description}</p>
            <div className="mt-3 flex items-center gap-2 text-xs font-bold text-forest-800">
              {planMeta.priceMonthly === 0 && planMeta.priceAnnual === 0 ? "No payment required" : "Checkout follows verification"}
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </aside>

        <section className="h-fit min-w-0 rounded-xl border border-line bg-white p-5 shadow-[0_8px_30px_rgba(18,55,42,0.07)] sm:p-7">
          <div className="mb-6 border-b border-line pb-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.16em] text-forest-700">Identity verification</span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                Verify your identity
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">Your NIN and contact details are encrypted in transit and reviewed before approval.</p>
            </div>
          </div>

          <OnboardingWizard role={role} />
        </section>
      </div>
    </main>
  );
}
