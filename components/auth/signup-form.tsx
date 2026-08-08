"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { z } from "zod";
import { authClient } from "@/lib/neon-auth-client";
import { Check, Shield, Verified } from "@/components/shared/icons";
import { Input } from "@/components/ui/form-controls";
import {
  ROLE_OPTIONS,
  PLAN_LIBRARY,
  buildOnboardingNext,
  getBillingPeriod,
  getDefaultChoice,
  isBillingPeriod,
  isPlanKey,
  isSignupRole,
  type BillingPeriod,
  type PlanKey,
  type SignupRole,
} from "@/domain/billing";
import { useAuthFlowStore } from "@/stores/auth-flow-store";
import { toastError, toastSuccess } from "@/stores/toast-store";
import { getInternalRedirectPath } from "@/lib/security/internal-redirect";

const signupSchema = z
  .object({
    name: z.string().min(2, "Enter your full name"),
    email: z.string().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function PlanCard({
  title,
  description,
  price,
  selected,
  onClick,
  featured,
}: {
  title: string;
  description: string;
  price: string;
  selected: boolean;
  onClick: () => void;
  featured?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border p-4 text-left transition ${
        selected
          ? "border-brandgreen-500 bg-brandgreen-50 shadow-sm"
          : "border-navy-200 bg-white hover:border-navy-300"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-navy-950">{title}</div>
          <p className="mt-1 text-xs leading-5 text-navy-500">{description}</p>
        </div>
        <span className="text-sm font-black text-navy-950">{price}</span>
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-navy-500">
        <span>{featured ? "Popular" : "Plan"}</span>
        <span className={selected ? "text-brandgreen-700" : "text-navy-400"}>
          {selected ? "Selected" : "Tap to choose"}
        </span>
      </div>
    </button>
  );
}

export default function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const session = authClient.useSession();
  const initRef = useRef(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const isAdminInvitation = searchParams.get("adminInvite") === "1";

  const role = useAuthFlowStore((state) => state.role);
  const planKey = useAuthFlowStore((state) => state.planKey);
  const billingPeriod = useAuthFlowStore((state) => state.billingPeriod);
  const setRole = useAuthFlowStore((state) => state.setRole);
  const setPlan = useAuthFlowStore((state) => state.setPlan);
  const hydrateFromQuery = useAuthFlowStore((state) => state.hydrateFromQuery);
  const flow = useAuthFlowStore((state) => state);

  useEffect(() => {
    if (session.data) {
      router.replace(getInternalRedirectPath(searchParams.get("next"), "/dashboard"));
    }
  }, [router, searchParams, session.data]);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const queryRole = searchParams.get("role");
    const queryPlan = searchParams.get("plan");
    const queryBilling = searchParams.get("billing");

    const nextRole: SignupRole = isSignupRole(queryRole) ? queryRole : flow.role;
    const nextPlan: PlanKey = isPlanKey(queryPlan) && PLAN_LIBRARY[nextRole].some((item) => item.key === queryPlan)
      ? queryPlan
      : getDefaultChoice(nextRole).planKey;
    const nextBilling: BillingPeriod = isBillingPeriod(queryBilling)
      ? queryBilling
      : getBillingPeriod(nextRole, nextPlan);

    hydrateFromQuery({
      role: nextRole,
      planKey: nextPlan,
      billingPeriod: nextBilling,
    });
  }, [flow.planKey, flow.role, hydrateFromQuery, searchParams]);

  useEffect(() => {
    if (!isAdminInvitation) return;
    const invitedEmail = sessionStorage.getItem("linkconn-admin-invite-email");
    if (invitedEmail) queueMicrotask(() => setEmail(invitedEmail));
  }, [isAdminInvitation]);

  const selectedPlans = useMemo(() => PLAN_LIBRARY[role], [role]);
  const nextOnboarding = useMemo(
    () => buildOnboardingNext({ role, planKey, billingPeriod }),
    [billingPeriod, planKey, role]
  );
  const next = getInternalRedirectPath(searchParams.get("next"), isAdminInvitation ? "/admin-invite" : nextOnboarding);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const parsed = signupSchema.safeParse({ name, email, password, confirmPassword });
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message || "Check the form fields";
      setError(message);
      toastError("Signup failed", message);
      return;
    }
    if (isAdminInvitation && parsed.data.password.length < 12) {
      const message = "Administrator passwords must be at least 12 characters";
      setError(message);
      toastError("Signup failed", message);
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/custom/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: parsed.data.name,
        email: parsed.data.email,
        password: parsed.data.password,
        callbackURL: `/verify-email?next=${encodeURIComponent(next)}`,
      }),
    });

    const resData = await res.json();
    setLoading(false);

    if (!resData.success) {
      const message = resData.message || "Unable to create account";
      setError(message);
      toastError("Signup failed", message);
      return;
    }

    toastSuccess("Account created", "Check your inbox to verify your email.");

    if (!resData.data.user.emailVerified) {
      router.push(
        `/verify-email?email=${encodeURIComponent(parsed.data.email)}&next=${encodeURIComponent(next)}&sent=1`,
      );
      return;
    }

    if (resData.data?.token) {
      router.push(next);
      router.refresh();
      return;
    }

    setSuccess("Account created. Check your inbox for the 6-digit verification code.");
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-semibold text-navy-700">Full name</span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            autoComplete="name"
            placeholder="Ada Okafor"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-sm font-semibold text-navy-700">Email</span>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            readOnly={isAdminInvitation}
          />
        </label>
      </div>

      {!isAdminInvitation && <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-navy-700">Choose your role</span>
          <span className="text-xs font-medium text-navy-400">Required</span>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {ROLE_OPTIONS.map((choice) => (
            <button
              key={choice.role}
              type="button"
              onClick={() => setRole(choice.role)}
              className={`rounded-2xl border p-4 text-left transition ${
                role === choice.role
                  ? "border-navy-950 bg-navy-950 text-white shadow-sm"
                  : "border-navy-200 bg-white text-navy-800 hover:border-navy-300"
              }`}
            >
              <div className="text-sm font-bold">{choice.title}</div>
              <p className={`mt-1 text-xs leading-5 ${role === choice.role ? "text-white/75" : "text-navy-500"}`}>
                {choice.description}
              </p>
            </button>
          ))}
        </div>
      </div>}

      {!isAdminInvitation && <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-navy-700">Choose your plan</span>
          <span className="text-xs font-medium text-navy-400">
            {role === "Landlord" ? "Billing selects monthly or annual" : "Annual billing"}
          </span>
        </div>
        <div className="grid gap-3">
          {selectedPlans.map((plan) => {
            const displayPrice =
              plan.priceMonthly === 0 && plan.priceAnnual === 0
                ? "Free"
                : role === "Tenant"
                  ? `₦${plan.priceAnnual.toLocaleString("en-NG")}`
                  : billingPeriod === "monthly"
                    ? `₦${plan.priceMonthly.toLocaleString("en-NG")}/mo`
                    : `₦${plan.priceAnnual.toLocaleString("en-NG")}/mo billed yearly`;

            return (
              <PlanCard
                key={plan.key}
                title={plan.name}
                description={plan.description}
                price={displayPrice}
                selected={planKey === plan.key}
                featured={plan.popular}
                onClick={() =>
                  setPlan(
                    plan.key,
                    role === "Landlord" && plan.key !== "landlord-standard"
                      ? billingPeriod
                      : getBillingPeriod(role, plan.key)
                  )
                }
              />
            );
          })}
        </div>
      </div>}

      {!isAdminInvitation && role === "Landlord" && (
        <div className="flex items-center justify-between rounded-2xl border border-navy-100 bg-navy-50/70 px-4 py-3">
          <div>
            <div className="text-sm font-semibold text-navy-900">Billing cycle</div>
            <p className="text-xs text-navy-500">Monthly saves flexibility. Annual is cheaper over a year.</p>
          </div>
          <button
            type="button"
            onClick={() => setPlan(planKey, billingPeriod === "monthly" ? "annual" : "monthly")}
            className="rounded-full bg-white px-4 py-2 text-xs font-bold text-navy-800 shadow-sm ring-1 ring-navy-200 transition hover:bg-navy-50"
          >
            {billingPeriod === "monthly" ? "Switch to annual" : "Switch to monthly"}
          </button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-navy-700">Password</span>
          <Input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            placeholder={isAdminInvitation ? "At least 12 characters" : "At least 8 characters"}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-navy-700">Confirm password</span>
          <Input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
          />
        </label>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-brandgreen-200 bg-brandgreen-50 px-4 py-3 text-sm text-brandgreen-900"
        >
          <div className="flex items-start gap-2">
            <Verified className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{success}</p>
          </div>
        </motion.div>
      )}

      <motion.button
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-navy-950 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-navy-950/15 transition-colors hover:bg-navy-900 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Creating account..." : "Create account"}
      </motion.button>

      <div className="grid gap-3 rounded-2xl border border-navy-100 bg-navy-50/70 p-4 text-sm text-navy-600">
        <div className="flex items-start gap-2">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-brandgreen-600" />
          <p>{isAdminInvitation ? "Your role is granted only after the one-time invitation is accepted." : "Your role and plan are saved in session-scoped flow state and carried through verification."}</p>
        </div>
        <div className="flex items-start gap-2">
          <Check className="mt-0.5 h-4 w-4 shrink-0 text-brandgreen-600" />
          <p>We will redirect you back to onboarding after email verification.</p>
        </div>
      </div>
    </form>
  );
}
