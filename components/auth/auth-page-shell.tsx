import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
<<<<<<< HEAD
import {
  BadgeCheck,
  Building2,
  CheckCircle2,
  Lock,
  PhoneCall,
  Scale,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
=======
import { Check, HelpCircle, ShieldCheck } from "lucide-react";
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
import { Logo } from "@/components/shared/icons";
import { LINKCONN_ASSETS } from "@/domain/constants/linkconn-assets";

type AuthPageShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  footerText: string;
  footerHref: string;
  footerLabel: string;
  children: ReactNode;
};

export default function AuthPageShell({
  eyebrow,
  title,
  description,
  footerText,
  footerHref,
  footerLabel,
  children,
}: AuthPageShellProps) {
  const isSignup = eyebrow === "Create account";
  const supportPoints = isSignup
    ? ["Choose the account role that matches your work", "Verify your email before protected access", "Continue with a role-specific onboarding checklist"]
    : ["Return to saved homes and conversations", "Open the workspace that matches your role", "Account status is checked before access"];

  return (
<<<<<<< HEAD
    <main id="main-content" className="min-h-dvh w-full bg-white grid lg:grid-cols-[minmax(24rem,0.9fr)_minmax(0,1.1fr)]">
      {/* ========================================================= */}
      {/* Left Brand & Trust Showcase Panel (Edge-to-Edge Desktop) */}
      {/* ========================================================= */}
      <aside className="relative flex flex-col justify-between overflow-hidden bg-forest-950 p-6 text-sand-50 sm:p-10 lg:p-12">
        {/* Ambient Proptech Glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 size-96 rounded-full bg-lime/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 size-96 rounded-full bg-emerald-500/10 blur-3xl" />

        {/* Logo Header */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex min-h-11 w-fit items-center" aria-label="LinkConn Rent home">
            <Logo variant="lockup" priority className="h-14 w-auto brightness-0 invert" sizes="124px" />
          </Link>
          <p className="mt-2 text-xs font-semibold text-forest-300">
            Nigeria&apos;s Verified Rental Operating System
          </p>
        </div>

        {/* Center Value Proposition & Live Telemetry */}
        <div className="relative z-10 my-8 space-y-6 max-w-lg">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full bg-lime/20 border border-lime/30 px-3 py-1 text-xs font-black text-lime">
              <Sparkles className="size-3.5" />
              <span>Direct Landlord Rentals</span>
            </div>
            <h2 className="mt-3.5 text-2xl font-black tracking-tight text-white sm:text-3xl lg:text-4xl leading-tight">
              Rent verified homes without agent stress.
            </h2>
            <p className="mt-3 text-xs leading-relaxed text-forest-200 sm:text-sm">
              Join thousands of tenants and landlords across Lagos and Abuja who manage secure leases with ₦0 hidden agency fees and escrow protection.
            </p>
          </div>

          {/* 4 Trust Pillars */}
          <div className="grid grid-cols-2 gap-3.5 border-y border-white/10 py-5 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="size-4 shrink-0 text-lime mt-0.5" />
              <div>
                <strong className="block text-white font-bold">100% Title Verified</strong>
                <span className="text-[11px] text-forest-300">Land registry &amp; NIN checked</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Zap className="size-4 shrink-0 text-lime mt-0.5" />
              <div>
                <strong className="block text-white font-bold">₦0 Agent Commission</strong>
                <span className="text-[11px] text-forest-300">Zero legal or caution markups</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Lock className="size-4 shrink-0 text-lime mt-0.5" />
              <div>
                <strong className="block text-white font-bold">Paystack Escrow</strong>
                <span className="text-[11px] text-forest-300">Funds locked until keys handed over</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Scale className="size-4 shrink-0 text-lime mt-0.5" />
              <div>
                <strong className="block text-white font-bold">48-Hour SLA</strong>
                <span className="text-[11px] text-forest-300">Dedicated dispute resolution</span>
              </div>
            </div>
          </div>

          {/* Verified Tenant Testimonial */}
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="size-8 grid place-items-center rounded-full bg-lime text-forest-950 font-black text-xs">
                AO
              </span>
              <div>
                <strong className="block text-xs font-bold text-white">Adeola &amp; Tunde O.</strong>
                <span className="block text-[10px] text-forest-300">Tenants · 3-Bed Duplex in Lekki Phase 1</span>
              </div>
              <BadgeCheck className="size-4 text-lime ml-auto" />
            </div>
            <p className="text-xs italic text-sand-200 leading-relaxed">
              &ldquo;We signed our lease and paid directly through LinkConn escrow. We saved over ₦500,000 in agency and legal fees on our new apartment.&rdquo;
            </p>
=======
    <main id="main-content" className="min-h-[100dvh] bg-sand-100 lg:grid lg:grid-cols-[minmax(19rem,.74fr)_minmax(0,1.26fr)]">
      <aside className="relative hidden min-h-dvh overflow-hidden bg-forest-950 text-white lg:flex lg:flex-col lg:justify-between lg:p-9 xl:p-12">
        <Image src={isSignup ? LINKCONN_ASSETS.landlordAdekunle.src : LINKCONN_ASSETS.tenantAmaka.src} alt="" fill priority className="object-cover opacity-35" sizes="38vw" />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-950/55 via-forest-950/70 to-forest-950" />
        <Link href="/" className="relative inline-flex min-h-11 w-fit items-center bg-sand-50 px-3" aria-label="LinkConn Rent home"><Logo variant="lockup" priority className="h-12 w-auto" sizes="112px" /></Link>
        <div className="relative max-w-md py-16">
          <ShieldCheck className="size-7 text-lime" aria-hidden="true" />
          <h2 className="mt-7 text-4xl font-extrabold leading-[1.02] tracking-[-.035em]">Your rental work should leave a clear record.</h2>
          <ul className="mt-8 space-y-4">{supportPoints.map((point) => <li key={point} className="flex items-start gap-3 text-sm leading-6 text-sand-200"><span className="mt-0.5 grid size-5 shrink-0 place-items-center bg-lime text-forest-950"><Check className="size-3.5" /></span>{point}</li>)}</ul>
        </div>
        <Link href="/help" className="relative inline-flex min-h-11 w-fit items-center gap-2 text-sm font-bold text-sand-200 hover:text-white"><HelpCircle className="size-4" />Need account help?</Link>
      </aside>

      <section className="flex min-h-dvh flex-col">
        <header className="flex min-h-20 items-center justify-between border-b border-line px-4 sm:px-8 lg:px-10">
          <Link href="/" className="inline-flex min-h-11 items-center lg:hidden" aria-label="LinkConn Rent home"><Logo variant="lockup" priority className="h-12 w-auto" sizes="112px" /></Link>
          <p className="ml-auto text-xs font-bold text-muted">{eyebrow}</p>
        </header>
        <div className="flex flex-1 items-center px-4 py-10 sm:px-8 lg:px-10 xl:px-16">
          <div className={`mx-auto w-full ${isSignup ? "max-w-4xl" : "max-w-lg"}`}>
            <div className="mb-8 border-b border-line pb-7">
              <h1 className="text-balance text-3xl font-extrabold tracking-[-.035em] text-ink sm:text-4xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">{description}</p>
            </div>
            {children}
            <div className="mt-7 flex flex-col gap-3 border-t border-line pt-5 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
              <p>{footerText} <Link className="font-extrabold text-forest-700 hover:underline" href={footerHref}>{footerLabel}</Link></p>
              <p className="inline-flex items-center gap-1.5 text-xs"><ShieldCheck className="size-4 text-forest-700" />Protected account flow</p>
            </div>
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
          </div>
        </div>

        {/* Footer Security Badges */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[11px] text-forest-300">
          <span className="flex items-center gap-1.5 font-semibold">
            <Shield className="size-3.5 text-lime" /> NDPR Compliant &amp; 256-Bit SSL
          </span>
          <span className="flex items-center gap-1 font-semibold">
            <PhoneCall className="size-3.5 text-lime" /> Support: 24/7
          </span>
        </div>
      </aside>

      {/* ========================================================= */}
      {/* Right Interactive Form Section (Edge-to-Edge) */}
      {/* ========================================================= */}
      <section className="flex flex-col justify-between p-6 sm:p-10 lg:p-14 overflow-y-auto bg-white min-h-dvh">
        <div className={`mx-auto w-full my-auto ${isSignup ? "max-w-xl" : "max-w-md"}`}>
          {/* Header */}
          <div className="mb-6">
            <span className="inline-block rounded-md bg-forest-100 px-2.5 py-0.5 text-[11px] font-black uppercase tracking-wider text-forest-900">
              {eyebrow}
            </span>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">
              {title}
            </h1>
            <p className="mt-1.5 text-xs sm:text-sm leading-relaxed text-muted">
              {description}
            </p>
          </div>

          {/* Interactive Form Body */}
          <div>{children}</div>

          {/* Footer Navigation */}
          <div className="mt-6 border-t border-line pt-4 text-center text-xs text-muted">
            {footerText}{" "}
            <Link
              className="font-bold text-forest-800 transition hover:text-forest-950 hover:underline ml-1"
              href={footerHref}
            >
              {footerLabel}
            </Link>
          </div>

          <p className="mt-4 flex items-center justify-center gap-1 text-center text-[10px] text-muted">
            <ShieldCheck className="size-3 text-forest-700" />
            Protected by LinkConn Rent identity and safety protocols.
          </p>
        </div>

        <div className="mt-8 border-t border-line pt-4 text-center text-[11px] text-muted">
          © {new Date().getFullYear()} LinkConn Rent. Built for Nigeria ·{" "}
          <Link href="/trust-and-safety" className="underline hover:text-forest-900">
            Trust &amp; Safety
          </Link>{" "}
          ·{" "}
          <Link href="/help" className="underline hover:text-forest-900">
            Help Center
          </Link>
        </div>
      </section>
    </main>
  );
}
