import type { Role } from "@/domain/types/auth";

export type SignupRole = Extract<Role, "Tenant" | "Landlord">;

export type BillingPeriod = "monthly" | "annual";

export type PlanKey =
  | "tenant-standard"
  | "tenant-premium"
  | "landlord-standard"
  | "landlord-featured"
  | "landlord-agency";

export type PlanChoice = {
  role: SignupRole;
  planKey: PlanKey;
  billingPeriod: BillingPeriod;
};

export type PlanMeta = {
  key: PlanKey;
  role: SignupRole;
  name: string;
  description: string;
  features: string[];
  cta: string;
  popular: boolean;
  priceMonthly: number;
  priceAnnual: number;
};

export const ROLE_OPTIONS: Array<{
  role: SignupRole;
  title: string;
  description: string;
}> = [
  {
    role: "Tenant",
    title: "Tenant",
    description: "Search, save, and apply for verified homes.",
  },
  {
    role: "Landlord",
    title: "Landlord",
    description: "List homes, manage tenants, and get paid.",
  },
];

export const PLAN_LIBRARY: Record<SignupRole, PlanMeta[]> = {
  Tenant: [
    {
      key: "tenant-standard",
      role: "Tenant",
      name: "Standard Searcher",
      description: "Always free for tenants getting started.",
      features: [
        "Unlimited browsing of listings",
        "Direct chat with verified landlords",
        "Schedule inspection slots free",
        "Rent escrow payment security",
      ],
      cta: "Start Free",
      popular: false,
      priceMonthly: 0,
      priceAnnual: 0,
    },
    {
      key: "tenant-premium",
      role: "Tenant",
      name: "Premium Match",
      description: "Priority access and faster matching.",
      features: [
        "24-hour early access to new listings",
        "Verified Tenant profile badge",
        "Instant email and SMS matching alerts",
        "Unlimited saved searches and bookmarks",
        "Priority background check review",
      ],
      cta: "Upgrade Now",
      popular: true,
      priceMonthly: 4900,
      priceAnnual: 4900,
    },
  ],
  Landlord: [
    {
      key: "landlord-standard",
      role: "Landlord",
      name: "Standard Free",
      description: "For individual landlords with a small portfolio.",
      features: [
        "Up to 2 active property listings",
        "Standard document verification audit",
        "Direct secure tenant chat",
        "Basic tenancy repair tracking",
      ],
      cta: "Start Free",
      popular: false,
      priceMonthly: 0,
      priceAnnual: 0,
    },
    {
      key: "landlord-featured",
      role: "Landlord",
      name: "Featured Pro",
      description: "Best for active landlords and caretakers.",
      features: [
        "Up to 10 active listings",
        "Featured placement in search results",
        "Free priority physical audits",
        "Automated rent invoicing via email and SMS",
        "Priority support",
      ],
      cta: "Choose Pro",
      popular: true,
      priceMonthly: 15000,
      priceAnnual: 12000,
    },
    {
      key: "landlord-agency",
      role: "Landlord",
      name: "Agency Premium",
      description: "For real estate teams with multiple buildings.",
      features: [
        "Unlimited active property listings",
        "Instant 24-hour verification visits",
        "Dedicated account property manager",
        "Custom agency branding",
        "Financial collection analytics",
      ],
      cta: "Join Premium",
      popular: false,
      priceMonthly: 45000,
      priceAnnual: 36050,
    },
  ],
};

export function isSignupRole(value: string | null): value is SignupRole {
  return value === "Tenant" || value === "Landlord";
}

export function isBillingPeriod(value: string | null): value is BillingPeriod {
  return value === "monthly" || value === "annual";
}

export function isPlanKey(value: string | null): value is PlanKey {
  return (
    value === "tenant-standard" ||
    value === "tenant-premium" ||
    value === "landlord-standard" ||
    value === "landlord-featured" ||
    value === "landlord-agency"
  );
}

export function getDefaultPlanKey(role: SignupRole): PlanKey {
  return role === "Tenant" ? "tenant-standard" : "landlord-standard";
}

export function getPlanMeta(role: SignupRole, planKey: PlanKey): PlanMeta {
  const plan = PLAN_LIBRARY[role].find((item) => item.key === planKey);
  return plan || PLAN_LIBRARY[role][0];
}

export function getBillingPeriod(role: SignupRole, planKey: PlanKey): BillingPeriod {
  if (role === "Tenant") return "annual";
  if (planKey === "landlord-standard") return "annual";
  return "annual";
}

export function getDisplayPrice(plan: PlanMeta, billingPeriod: BillingPeriod): number {
  if (plan.priceMonthly === 0 && plan.priceAnnual === 0) return 0;
  if (plan.role === "Tenant") return plan.priceAnnual;
  return billingPeriod === "monthly" ? plan.priceMonthly : plan.priceAnnual;
}

export function getCheckoutAmount(plan: PlanMeta, billingPeriod: BillingPeriod): number {
  if (plan.priceMonthly === 0 && plan.priceAnnual === 0) return 0;
  if (plan.role === "Tenant") return plan.priceAnnual;
  return billingPeriod === "monthly" ? plan.priceMonthly : plan.priceAnnual * 12;
}

export function formatPlanLabel(plan: PlanMeta, billingPeriod: BillingPeriod): string {
  const price = getDisplayPrice(plan, billingPeriod);
  return price === 0 ? "Free" : `₦${price.toLocaleString("en-NG")}`;
}

export function buildOnboardingNext(choice: PlanChoice): string {
  const params = new URLSearchParams({
    role: choice.role,
    plan: choice.planKey,
    billing: choice.billingPeriod,
  });

  return `/onboarding?${params.toString()}`;
}

export function getDefaultChoice(role: SignupRole): PlanChoice {
  const planKey = getDefaultPlanKey(role);
  return {
    role,
    planKey,
    billingPeriod: getBillingPeriod(role, planKey),
  };
}
