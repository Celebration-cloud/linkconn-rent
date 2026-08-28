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

<<<<<<< HEAD
import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  BadgeAlert,
  BadgeCheck,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  CreditCard,
  FileCheck2,
  Gem,
  Lock,
  MapPin,
  PhoneCall,
  Scale,
  ScanFace,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  WalletCards,
  Zap,
} from "lucide-react";
import { Input, Textarea } from "@/components/ui/form-controls";

const verifications = [
  {
    level: "Unverified",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    icon: CircleAlert,
    tag: "Stage 0",
    desc: "Initial listing upload. Basic property photos and descriptions submitted, but document audits and physical inspection have not yet completed. Direct escrow caution required.",
  },
  {
    level: "Partially Verified",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    icon: UserCheck,
    tag: "Stage 1: Identity Verified",
    desc: "Landlord identity verified via national NIN/BVN biometric matching. Contact information confirmed against official telecommunications and bank records.",
  },
  {
    level: "Fully Verified",
    color: "text-forest-800 bg-forest-50 border-forest-200",
    icon: BadgeCheck,
    tag: "Stage 2: Title & Premises Audited",
    desc: "Land title documents (C of O, Deed of Assignment, Governor's Consent) certified by our legal auditing team, and in-person physical inspection completed with GPS geotagging.",
  },
  {
    level: "Trusted Premier",
    color: "text-purple-700 bg-purple-50 border-purple-200",
    icon: Gem,
    tag: "Stage 3: Platinum Track Record",
    desc: "Reserved for top-tier verified landlords maintaining a 4.9+ rating, zero unresolved maintenance or dispute cases, and over 10+ completed tenancies via LinkConn Rent.",
  },
];

const safetyFaqs = [
  {
    q: "How does the Rent Escrow protection keep my money safe?",
    a: "When you pay rent via LinkConn Rent, your funds are safely locked in a regulated escrow vault. Funds are only disbursed to the landlord 24 hours AFTER you receive keys, enter the property, and confirm that the condition matches the listing details. This prevents fake agent disappearance and keyholder fraud.",
  },
  {
    q: "What happens during the on-site physical inspection by LinkConn?",
    a: "Our trained field auditors visit the actual property, verify geographic GPS coordinates, verify functioning utilities (water borehole, electricity prepaid meter), ensure the landlord/caretaker holds physical keys, and capture tamper-proof photos for the listing.",
  },
  {
    q: "Why should I never send money or chat outside LinkConn Rent?",
    a: "Scammers frequently attempt to take conversations to WhatsApp or offer 'offline discounts' in exchange for immediate direct transfers. If you transact outside LinkConn Rent, you lose the 100% Escrow Protection guarantee and dispute resolution coverage.",
  },
  {
    q: "How does the caution deposit refund process work upon moving out?",
    a: "At the end of your tenancy, an exit condition inspection is documented. If no tenant damages exist, your caution deposit is refunded directly from escrow within 14 days. Any proposed deductions require legitimate receipts and itemized invoices.",
  },
];

export default function TrustAndSafetyClient() {
  const [reportTitle, setReportTitle] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle || !reportDesc) return;
    
    setReportSuccess(true);
    setReportTitle("");
    setReportDesc("");
    setTimeout(() => setReportSuccess(false), 6000);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-20">
      {/* Header section */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-forest-600/30 bg-forest-900/10 px-4 py-1.5 text-xs font-bold text-forest-800">
          <ShieldCheck className="size-4 text-forest-700" />
          ZERO TOLERANCE FRAUD POLICY
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-5xl lg:text-6xl">
          Trust & Safety Center
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          How LinkConn Rent eliminates fake landlords, phantom listings, and deposit theft across Nigeria.
        </p>
      </div>

      {/* Verification Level cards */}
      <div>
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-forest-700">
            Trust Classification
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            Verification Tiers Explained
          </h2>
          <p className="mx-auto mt-2 max-w-md text-xs text-muted">
            Every property listing and landlord profile is clearly badged with its verified audit status.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {verifications.map((v) => {
            const ItemIcon = v.icon;
            return (
              <div
                key={v.level}
                className="rounded-3xl border border-line bg-white p-6 shadow-xs flex flex-col justify-between transition hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${v.color}`}>
                      <ItemIcon className="size-3.5" /> {v.level}
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] font-bold uppercase tracking-wider text-forest-700">
                    {v.tag}
                  </p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">
                    {v.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3 Core Trust Pillars */}
      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-3xl border border-line bg-white p-8 shadow-xs">
          <div className="grid size-12 place-items-center rounded-2xl bg-forest-50 text-forest-700">
            <ScanFace className="size-6" />
          </div>
          <h3 className="mt-5 text-lg font-black text-ink">NIN & BVN Biometric Verification</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Landlords and property managers must validate national identity credentials matched with Nigerian federal databases prior to publishing listings.
          </p>
        </div>
        <div className="rounded-3xl border border-line bg-white p-8 shadow-xs">
          <div className="grid size-12 place-items-center rounded-2xl bg-forest-50 text-forest-700">
            <MapPin className="size-6" />
          </div>
          <h3 className="mt-5 text-lg font-black text-ink">Physical On-Site Inspection</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Field agents verify the exact property address, test water/power fixtures, confirm caretaker authorization, and geotag listing coordinates.
          </p>
        </div>
        <div className="rounded-3xl border border-line bg-white p-8 shadow-xs">
          <div className="grid size-12 place-items-center rounded-2xl bg-forest-50 text-forest-700">
            <Lock className="size-6" />
          </div>
          <h3 className="mt-5 text-lg font-black text-ink">Regulated Rent Escrow Vault</h3>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Rent and caution deposits remain in escrow until you safely move in and verify the property condition. 100% money-back safety guarantee.
          </p>
        </div>
      </div>

      {/* Scam Report Form and Safety FAQs */}
      <div className="grid gap-8 lg:grid-cols-2 items-start">
        {/* Scam report form */}
        <div className="rounded-3xl border border-line bg-white p-7 sm:p-9 shadow-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-red-600 uppercase tracking-wider">
            <ShieldAlert className="size-4" /> Incident Response Desk
          </div>
          <h3 className="mt-2 text-xl font-black text-ink">Report Suspicious Activity</h3>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            Spotted a suspicious listing, unauthorized agent, or someone asking for offline payments? Submit an instant report for immediate investigation.
          </p>

          {reportSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 rounded-2xl bg-forest-50 border border-forest-200 p-6 text-center"
            >
              <CheckCircle2 className="mx-auto size-8 text-forest-700" />
              <h4 className="mt-2 text-base font-extrabold text-forest-950">Safety Report Received</h4>
              <p className="mt-1 text-xs text-forest-800 leading-normal">
                Our security and moderation desk will audit the record within 2 hours. Thank you for protecting the LinkConn Rent community!
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleReportSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900">
                  Subject or Property Listing ID
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Suspicious request for offline fee in Lekki Phase 1"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="mt-2 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-forest-900">
                  Description of Issue / Evidence
                </label>
                <Textarea
                  rows={4}
                  required
                  placeholder="Please describe why this listing or user is suspicious (e.g. asking for offline bank transfer, mismatched photos, refusal of in-app inspection)..."
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  className="mt-2 min-h-28 resize-none text-xs"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-red-600 py-3.5 text-xs font-extrabold text-white shadow-sm transition hover:bg-red-700 cursor-pointer"
              >
                Submit Incident Report to Security Desk
              </button>
            </form>
          )}
        </div>

        {/* Safety FAQs */}
        <div className="space-y-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-forest-700">
              Security Answers
            </span>
            <h3 className="mt-1 text-xl font-black text-ink">Frequently Asked Questions</h3>
          </div>
          
          <div className="space-y-3 pt-2">
            {safetyFaqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-line bg-white overflow-hidden transition shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between p-4 text-left text-xs sm:text-sm font-bold text-ink hover:bg-sand-50 cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`size-4 text-muted transition-transform ${
                        isOpen ? "rotate-180 text-forest-700" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-line p-4 text-xs leading-relaxed text-muted bg-sand-50/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
=======
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
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
  );
}
