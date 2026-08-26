"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { z } from "zod";
import { authClient } from "@/lib/neon-auth-client";
import {
  Building2,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Home,
  LockKeyhole,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  Wallet,
} from "lucide-react";
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
      className={`w-full p-4 text-left border transition relative rounded-xl ${
        selected
          ? "border-forest-900 bg-forest-50/80 shadow-xs ring-1 ring-forest-900"
          : "border-[#d6ddd5] bg-white hover:bg-[#f8faf7] hover:border-forest-400"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-forest-950">{title}</span>
            {featured && (
              <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-black uppercase text-forest-950">
                Popular
              </span>
            )}
          </div>
          <p className="mt-1 text-xs leading-relaxed text-muted">{description}</p>
        </div>
        <span className="text-sm font-black tabular-nums text-forest-950 shrink-0">{price}</span>
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] font-bold">
        <span className="text-muted">Membership Tier</span>
        <span className={selected ? "text-forest-900 font-extrabold flex items-center gap-1" : "text-muted"}>
          {selected ? <><Check className="size-3.5" /> Selected</> : "Tap to choose"}
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
  const [showPassword, setShowPassword] = useState(false);
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
        ...(!isAdminInvitation ? { role } : {}),
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
      {/* Name and Email */}
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold text-forest-950">Full legal name</span>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            type="text"
            autoComplete="name"
            placeholder="e.g. Adaora Okafor"
            leadingIcon={User}
            required
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1.5 block text-xs font-bold text-forest-950">Email address</span>
          <Input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoComplete="email"
            placeholder="e.g. adaora@example.com"
            readOnly={isAdminInvitation}
            leadingIcon={Mail}
            required
          />
        </label>
      </div>

      {/* Role Selection */}
      {!isAdminInvitation && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-forest-950">I am joining LinkConn Rent as:</span>
            <span className="text-[11px] font-semibold text-forest-700">Select persona</span>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {ROLE_OPTIONS.map((choice) => {
              const isSelected = role === choice.role;
              return (
                <button
                  key={choice.role}
                  type="button"
                  onClick={() => setRole(choice.role)}
                  className={`p-3.5 text-left border rounded-xl transition ${
                    isSelected
                      ? "border-forest-950 bg-forest-950 text-white shadow-sm ring-1 ring-forest-900"
                      : "border-[#d6ddd5] bg-white text-ink hover:bg-[#f8faf7] hover:border-forest-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black">{choice.title}</span>
                    <span className={`size-4 grid place-items-center rounded-full text-[10px] ${
                      isSelected ? "bg-lime text-forest-950 font-black" : "border border-muted"
                    }`}>
                      {isSelected ? "✓" : ""}
                    </span>
                  </div>
                  <p className={`mt-1 text-[11px] leading-relaxed ${isSelected ? "text-forest-200" : "text-muted"}`}>
                    {choice.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Plan Selection */}
      {!isAdminInvitation && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-forest-950">Select your membership plan:</span>
            <span className="text-[11px] text-muted font-medium">
              {role === "Landlord" ? "Monthly or Annual available" : "100% Free for Tenants"}
            </span>
          </div>
          <div className="grid gap-2">
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
        </div>
      )}

      {/* Landlord Billing Cycle Switcher */}
      {!isAdminInvitation && role === "Landlord" && (
        <div className="flex items-center justify-between rounded-xl border border-[#d6ddd5] bg-sand-100 p-3">
          <div>
            <div className="text-xs font-extrabold text-forest-950">Billing Cycle</div>
            <p className="text-[11px] text-muted">Annual billing saves up to 20% on landlord management fees.</p>
          </div>
          <button
            type="button"
            onClick={() => setPlan(planKey, billingPeriod === "monthly" ? "annual" : "monthly")}
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-black text-forest-900 border border-[#d6ddd5] hover:bg-sand-50 transition"
          >
            {billingPeriod === "monthly" ? "Switch to Annual" : "Switch to Monthly"}
          </button>
        </div>
      )}

      {/* Passwords */}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block relative">
          <span className="mb-1.5 block text-xs font-bold text-forest-950">Password</span>
          <div className="relative">
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder={isAdminInvitation ? "Min 12 characters" : "Min 8 characters"}
              leadingIcon={LockKeyhole}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-bold text-forest-950">Confirm password</span>
          <Input
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat password"
            leadingIcon={LockKeyhole}
            required
          />
        </label>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-900 flex items-center gap-2"
        >
          <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
          <p>{success}</p>
        </motion.div>
      )}

      <motion.button
        whileTap={{ scale: 0.99 }}
        type="submit"
        disabled={loading}
        className="stitch-button w-full justify-center py-3 text-sm font-black disabled:cursor-not-allowed disabled:opacity-70 shadow-sm"
      >
        {loading ? "Creating your secure account..." : "Create Account & Continue"}
      </motion.button>

      <div className="rounded-xl border border-forest-100 bg-forest-50/70 p-3.5 text-xs text-forest-950 space-y-1.5">
        <div className="flex items-start gap-2">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-forest-700" />
          <p className="leading-relaxed">
            {isAdminInvitation
              ? "Your role is granted after one-time invitation acceptance."
              : "We will send a 6-digit confirmation code to verify your inbox before activating your dashboard."}
          </p>
        </div>
      </div>
    </form>
  );
}
