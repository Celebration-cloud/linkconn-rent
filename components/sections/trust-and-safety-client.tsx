import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  CircleAlert,
  EyeOff,
  FileCheck2,
  MapPin,
  MessageSquareWarning,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { LINKCONN_ASSETS } from "@/domain/constants/linkconn-assets";
import { VERIFICATION_LEVELS } from "@/domain/constants/permissions";
import type { VerificationLevel } from "@/domain/types/auth";

const levels: Array<{ level: VerificationLevel; icon: typeof ShieldCheck; meaning: string }> = [
  { level: "Unverified", icon: CircleAlert, meaning: "The account exists, but the identity workflow is not complete. Treat claims as unconfirmed." },
  { level: "Partially Verified", icon: FileCheck2, meaning: "The account has completed an early verification step. Review the exact status before acting." },
  { level: "Fully Verified", icon: BadgeCheck, meaning: "The required identity checks for this level have been approved and recorded." },
  { level: "Trusted", icon: ShieldCheck, meaning: "Verified identity is joined with the relevant property authority and positive platform history." },
];

const safeguards = [
  [MapPin, "Approximate public locations", "Search and map results do not publish a landlord's exact coordinates. Address release follows the approved viewing workflow."],
  [ReceiptText, "Protected Payment records", "Use the platform payment flow and wait for the provider-confirmed status. Keep receipts with the tenancy record."],
  [EyeOff, "Private evidence stays private", "Identity and ownership documents are available only to authorized reviewers and are never placed in shared public caches."],
  [MessageSquareWarning, "Suspicious requests belong in support", "Keep conversations in the platform and create a support record when payment, identity, or viewing instructions do not match the listing."],
] as const;

export default function TrustAndSafetyClient() {
  return (
    <main id="main-content" className="bg-sand-50 pb-24 pt-16">
      <section className="relative overflow-hidden bg-forest-950 text-white">
        <div className="absolute inset-y-0 right-0 hidden w-1/2 lg:block">
          <Image src={LINKCONN_ASSETS.verification.src} alt={LINKCONN_ASSETS.verification.alt} fill priority className="object-cover" sizes="50vw" />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/35 to-transparent" />
        </div>
        <div className="stitch-container relative grid min-h-[34rem] items-end py-16 sm:py-24 lg:grid-cols-2">
          <div className="max-w-2xl">
            <h1 className="text-balance text-5xl font-extrabold leading-[.98] tracking-[-.04em] sm:text-6xl">Know what has been checked—and what has not.</h1>
            <p className="mt-6 max-w-xl text-pretty text-base leading-7 text-sand-300">Verification is a recorded state, not a promise that removes every rental risk. Read the level, inspect the home, keep communication on-platform, and confirm payment status.</p>
          </div>
        </div>
      </section>

      <section className="stitch-container py-16 sm:py-20">
        <div className="grid gap-8 lg:grid-cols-[.68fr_1.32fr]">
          <div><h2 className="text-3xl font-extrabold tracking-[-.03em] text-ink sm:text-4xl">Verification levels in plain language</h2><p className="mt-4 max-w-xl text-sm leading-6 text-muted">The badge tells you the review stage. Open the related profile or listing details for the facts behind it.</p></div>
          <div className="border-t border-line">
            {levels.map(({ level, icon: Icon, meaning }) => <article key={level} className="grid gap-4 border-b border-line py-6 sm:grid-cols-[3rem_12rem_1fr] sm:items-start"><span className="grid size-11 place-items-center bg-forest-100 text-forest-900"><Icon className="size-5" /></span><div><h3 className="font-extrabold text-ink">{level}</h3><p className="mt-1 text-xs text-forest-700">{VERIFICATION_LEVELS[level].description}</p></div><p className="text-sm leading-6 text-muted">{meaning}</p></article>)}
          </div>
        </div>
      </section>

      <section className="bg-sand-200 py-16 sm:py-20">
        <div className="stitch-container">
          <div className="max-w-3xl"><h2 className="text-3xl font-extrabold tracking-[-.03em] text-ink sm:text-4xl">Four safeguards you can see</h2><p className="mt-4 text-sm leading-6 text-muted">Each one leaves a clearer boundary or record around the rental decision.</p></div>
          <div className="mt-9 grid gap-px bg-line md:grid-cols-2">{safeguards.map(([Icon, title, copy]) => <article key={title} className="min-h-56 bg-white p-6 sm:p-8"><Icon className="size-6 text-forest-700" /><h3 className="mt-8 text-xl font-extrabold tracking-[-.02em] text-ink">{title}</h3><p className="mt-3 max-w-xl text-sm leading-6 text-muted">{copy}</p></article>)}</div>
        </div>
      </section>

      <section className="stitch-container py-16 sm:py-20">
        <div className="grid border border-error/25 bg-white lg:grid-cols-[.72fr_1.28fr]">
          <div className="bg-error-soft/45 p-6 text-error sm:p-9"><CircleAlert className="size-7" /><h2 className="mt-8 text-3xl font-extrabold tracking-[-.03em]">Pause before you pay.</h2><p className="mt-4 text-sm leading-6">Do not send money because a message creates urgency. Confirm the listing, viewing, fee breakdown, recipient, and provider result first.</p></div>
          <div className="p-6 sm:p-9"><h3 className="text-xl font-extrabold text-ink">Create a record when something is wrong</h3><p className="mt-3 max-w-2xl text-sm leading-6 text-muted">The help centre creates a support reference for suspicious listings, account access, payment questions, viewing safety, and disputes.</p><div className="mt-6 flex flex-wrap gap-3"><Link href="/help" className="stitch-button">Open help centre <ArrowRight className="size-4" /></Link><Link href="/properties" className="stitch-button stitch-button-secondary">Return to verified homes</Link></div></div>
        </div>
      </section>
    </main>
  );
}
