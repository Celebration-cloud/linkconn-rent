"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
<<<<<<< HEAD
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
=======
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
<<<<<<< HEAD
  CheckCircle2,
  Clock,
  FileCheck2,
  FileText,
  KeyRound,
  Lock,
  MapPin,
  MessageSquare,
  Receipt,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  UserCheck,
  UserRound,
  Users,
  Wallet,
  Wrench,
  Zap,
} from "lucide-react";

type Pathway = "tenant" | "landlord";

const TENANT_STEPS = [
  {
    num: "01",
    title: "Browse Verified Listings & True Move-In Costs",
    tag: "100% Verified Inventory",
    desc: "Search through apartments, duplexes, and studios with title-checked ownership. Review exact all-in costs upfront: Annual Rent, Caution Deposit, and Service Charge. No vague 'miscellaneous' line items.",
    icon: Search,
    perks: ["Zero fake listings", "No registration or form fees", "Full fee breakdown"],
    preview: {
      label: "Sample Verified Listing Card",
      title: "Luxury 2-Bedroom Serviced Apartment",
      location: "Lekki Phase 1, Lagos",
      rent: "₦4,500,000 / yr",
      caution: "₦450,000 (100% Escrow Protected)",
      agentFee: "₦0 (Direct Landlord)",
    },
  },
  {
    num: "02",
    title: "Book Direct Physical Inspections for ₦0",
    tag: "Free Viewing Guarantee",
    desc: "Schedule physical viewing appointments directly with the verified property owner or registered caretaker through our in-app calendar. Never pay ₦3,000–₦10,000 inspection fees to middlemen.",
    icon: CalendarDays,
    perks: ["Calendar slot picking", "Direct landlord chat", "Two-party GPS check-in"],
    preview: {
      label: "Viewing Confirmation Pass",
      title: "Inspection Appointment #8492",
      location: "Confirmed: Saturday, 11:30 AM",
      rent: "Host: Chief O. Adeleke (Owner)",
      caution: "Inspection Fee: ₦0.00",
      agentFee: "Direct WhatsApp/Call access",
    },
  },
  {
    num: "03",
    title: "Review & Sign Digital Tenancy Agreement",
    tag: "Legally Binding",
    desc: "Receive standard, legally vetted tenancy agreements compliant with Lagos State Tenancy Law and national statutes. Review clauses, sign electronically, and keep tamper-proof records.",
    icon: FileCheck2,
    perks: ["Standardized legal clauses", "Digital e-signature", "No 10% legal fee markup"],
    preview: {
      label: "Digital Agreement Summary",
      title: "Tenancy Agreement (12 Months)",
      location: "Commencement: 1st of Next Month",
      rent: "Notice Period: 3 Months",
      caution: "Repair Clause: Owner covers structural",
      agentFee: "Status: Ready for E-Sign",
    },
  },
  {
    num: "04",
    title: "Pay Rent via Protected Escrow Vault",
    tag: "Bank-Grade Escrow",
    desc: "Your rent and caution deposit are held securely in a regulated escrow vault. Funds are only disbursed to the landlord 24 hours AFTER you receive keys, conduct move-in inspection, and confirm condition.",
    icon: Wallet,
    perks: ["24-hour move-in protection", "Automated official invoice & receipt", "Caution deposit refund ledger"],
    preview: {
      label: "Escrow Status Monitor",
      title: "Escrow Vault Vault-TX-9023",
      location: "Vault Balance: ₦4,950,000",
      rent: "Release Condition: Move-in confirmed",
      caution: "Disbursement Window: 24h post-key handover",
      agentFee: "Protection: 100% Guaranteed",
    },
  },
  {
    num: "05",
    title: "Manage Living, Repairs & Renewals in One Cockpit",
    tag: "Ongoing Tenancy Care",
    desc: "Submit maintenance tickets with photos, track repair SLAs, download tax receipts, and handle 12-month lease renewals with one click from your tenant dashboard.",
    icon: Wrench,
    perks: ["Photo maintenance tickets", "Document vault", "One-click renewal notice"],
    preview: {
      label: "Tenant Active Portal",
      title: "Current Lease: Active (Month 4/12)",
      location: "Next Rent Due: In 8 Months",
      rent: "Active Repair: Plumbing Ticket (In Progress)",
      caution: "Caution Deposit: Locked & Intact",
      agentFee: "Landlord Response SLA: < 4 hours",
    },
  },
];

const LANDLORD_STEPS = [
  {
    num: "01",
    title: "List Your Properties in Under 5 Minutes",
    tag: "Fast Onboarding",
    desc: "Upload photos, specify bedroom configurations, set rent pricing, service charge details, and house rules. Your property is immediately prepared for verification review.",
    icon: Building2,
    perks: ["Fast mobile listing flow", "Custom fee structuring", "High-res media support"],
    preview: {
      label: "Property Submission",
      title: "3-Bedroom Duplex with BQ",
      location: "Maitama, Abuja",
      rent: "Rent: ₦12,000,000 / yr",
      caution: "Service Charge: ₦1,500,000 / yr",
      agentFee: "Listing Status: Under Rapid Audit",
    },
  },
  {
    num: "02",
    title: "Pass Title & Ownership Verification",
    tag: "Verified Badge Badge",
    desc: "Upload your NIN/BVN and proof of ownership (C of O, Deed of Assignment, or Caretaker Authority). Verified landlords receive 3.8x more applications and top search index ranking.",
    icon: BadgeCheck,
    perks: ["Biometric identity check", "Title deed validation", "Verified Landlord badge"],
    preview: {
      label: "Verification Status",
      title: "Identity: NIN Biometric Matched",
      location: "Ownership: Deed of Assignment Audited",
      rent: "Physical Audit: Completed by Field Officer",
      caution: "Score: 100% Trust Rating",
      agentFee: "Badge Awarded: Verified Owner",
    },
  },
  {
    num: "03",
    title: "Review Screened, High-Quality Tenant Profiles",
    tag: "Pre-Screened Applicants",
    desc: "Receive applications with verified employment status, monthly income brackets, and national ID credentials. Filter out non-serious searchers without fielding 50 random calls.",
    icon: UserCheck,
    perks: ["Verified employment status", "Income-to-rent ratio", "Zero unsolicited calls"],
    preview: {
      label: "Applicant Review Card",
      title: "Applicant: Senior Software Engineer",
      location: "Employer: Tier-1 Tech Firm, VI",
      rent: "Monthly Income: ₦2,200,000 / mo",
      caution: "Income-to-Rent Ratio: 4.8x",
      agentFee: "Background: Clean & NIN Verified",
    },
  },
  {
    num: "04",
    title: "Automated Direct Rent Payouts & Receipts",
    tag: "Guaranteed Payout",
    desc: "Collect annual or bi-annual rent payments directly to your Nigerian commercial bank account. Automated digital receipts and tax-compliant statements are generated instantly.",
    icon: Receipt,
    perks: ["Direct settlement to any Nigerian bank", "Automated electronic receipts", "No commission deductions"],
    preview: {
      label: "Payout Ledger",
      title: "Settlement Ref #LK-90214",
      location: "Bank: Access Bank PLC (•••• 4920)",
      rent: "Disbursed Rent: ₦12,000,000.00",
      caution: "Platform Fee: ₦0.00",
      agentFee: "Settlement Speed: Instant 24h Post Move-in",
    },
  },
  {
    num: "05",
    title: "Streamline Repairs & Lease Renewals",
    tag: "Automated Management",
    desc: "Track tenant repair tickets with photographic evidence, assign trusted artisans, and send automated 60-day lease renewal notifications without hiring third-party estate agents.",
    icon: Scale,
    perks: ["Maintenance tracking dashboard", "Automated renewal alerts", "Multi-unit portfolio overview"],
    preview: {
      label: "Portfolio Overview",
      title: "Occupancy: 100% (6/6 Units Leased)",
      location: "On-Time Payment Rate: 100%",
      rent: "Upcoming Renewals: 2 in Q4",
      caution: "Open Maintenance: 0 Outstanding",
      agentFee: "Annual Savings vs Agent: ₦2,400,000",
    },
  },
];
=======
  FileCheck2,
  House,
  MessageSquare,
  ReceiptText,
  Search,
  UserRound,
  Wrench,
} from "lucide-react";
import { LINKCONN_ASSETS } from "@/domain/constants/linkconn-assets";

const journeys = {
  tenant: {
    title: "From shortlist to a recorded tenancy.",
    description:
      "Every stage keeps the home, the landlord, the viewing, the costs, and your messages connected.",
    image: LINKCONN_ASSETS.tenantStory,
    steps: [
      [Search, "Search with the real cost in view", "Filter homes by location and fit, then compare the listed rent with the available move-in fee breakdown."],
      [BadgeCheck, "Read the verification state", "Check the property and landlord status. Public locations stay approximate until the approved workflow releases an address."],
      [MessageSquare, "Keep questions with the record", "Message the landlord in LinkConn Rent so the conversation stays connected to the home you are considering."],
      [CalendarDays, "Book and track a viewing", "Request a viewing, follow its status, and keep any schedule change in one place."],
      [ReceiptText, "Apply and use Protected Payment", "Review the tenancy details before paying. Payment status and receipts remain attached to the property and account."],
    ],
  },
  landlord: {
    title: "From listing evidence to an active tenancy.",
    description:
      "Publish with clear authority, respond to qualified interest, and keep every operational hand-off traceable.",
    image: LINKCONN_ASSETS.landlordStory,
    steps: [
      [House, "Build a complete listing", "Add the home, amenities, images, rental period, and every required fee so tenants can judge the full cost."],
      [FileCheck2, "Submit identity and property evidence", "Provide the documents required for your role and follow the review state from the dashboard."],
      [MessageSquare, "Answer enquiries directly", "Keep tenant questions, applications, and viewing discussions attached to the right property."],
      [CalendarDays, "Manage viewings and applicants", "Confirm appointments, review applicants, and preserve the decision trail."],
      [Wrench, "Run the tenancy after move-in", "Track leases, payment records, and maintenance requests without moving the work into scattered chats."],
    ],
  },
} as const;
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac

const REQUIRED_DOCUMENTS = {
  tenant: [
    { title: "National Identification", desc: "Valid Nigerian NIN Slip, International Passport, or Voter's Card" },
    { title: "Proof of Employment or Income", desc: "Work ID card, official offer letter, or 3 months bank statement" },
    { title: "Guarantor Information", desc: "Name, phone, and professional contact of one verifiable reference" },
    { title: "Next of Kin Details", desc: "Emergency contact details for lease agreement records" },
  ],
  landlord: [
    { title: "Proof of Ownership / Authority", desc: "Deed of Assignment, Governor's Consent, C of O, or Letter of Administration" },
    { title: "National Identity Verification", desc: "NIN/BVN matching the property deed or registered company records" },
    { title: "Recent Utility Bill", desc: "Electricity (EKEDC, IKEDC, AEDC) or water bill for property address audit" },
    { title: "Settlement Bank Account", desc: "Active Nigerian commercial bank account for direct rent disbursement" },
  ],
};

export default function HowItWorksClient() {
<<<<<<< HEAD
  const [activeTab, setActiveTab] = useState<Pathway>("tenant");
  const steps = activeTab === "tenant" ? TENANT_STEPS : LANDLORD_STEPS;
  const docs = REQUIRED_DOCUMENTS[activeTab];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 space-y-20">
      {/* Hero Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-forest-600/30 bg-forest-900/10 px-4 py-1.5 text-xs font-bold text-forest-800">
          <ShieldCheck className="size-4 text-forest-700" />
          TRANSPARENT RENTAL OPERATING SYSTEM
        </div>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-ink sm:text-5xl lg:text-6xl">
          How LinkConn Rent Works
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          We replace predatory middlemen, fake listings, and unexpected viewing fees with direct, verified landlord connections and protected rent escrow.
        </p>

        {/* Tab Toggle */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-2xl border border-line bg-white p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("tenant")}
              className={`flex items-center gap-2 rounded-xl px-7 py-3 text-xs font-extrabold transition cursor-pointer ${
                activeTab === "tenant"
                  ? "bg-forest-950 text-white shadow-md"
                  : "text-muted hover:text-ink"
              }`}
            >
              <UserRound className="size-4 text-lime" /> For Tenants & Renters
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("landlord")}
              className={`flex items-center gap-2 rounded-xl px-7 py-3 text-xs font-extrabold transition cursor-pointer ${
                activeTab === "landlord"
                  ? "bg-forest-950 text-white shadow-md"
                  : "text-muted hover:text-ink"
              }`}
            >
              <Building2 className="size-4 text-lime" /> For Landlords & Caretakers
            </button>
=======
  const [audience, setAudience] = useState<keyof typeof journeys>("tenant");
  const reducedMotion = useReducedMotion();
  const journey = journeys[audience];

  return (
    <main id="main-content" className="bg-sand-50 pb-24 pt-16">
      <section className="bg-forest-950 text-white">
        <div className="stitch-container grid gap-10 py-16 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:items-end">
          <div>
            <h1 className="max-w-4xl text-balance text-5xl font-extrabold leading-[.98] tracking-[-.04em] sm:text-6xl">
              A rental journey with a record at every step.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-base leading-7 text-sand-300 sm:text-lg">
              LinkConn Rent connects discovery, verification, conversations, viewings, applications, payments, and ongoing tenancy work.
            </p>
          </div>
          <div className="grid grid-cols-2 border border-white/15 text-sm">
            <div className="border-r border-white/15 p-5"><strong className="block text-white">Approximate locations</strong><span className="mt-1 block text-sand-300">Public until release is approved</span></div>
            <div className="p-5"><strong className="block text-white">Recorded decisions</strong><span className="mt-1 block text-sand-300">Statuses stay connected</span></div>
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
          </div>
        </div>
      </section>

<<<<<<< HEAD
      {/* Step by Step Timeline with Interactive Previews */}
      <div className="space-y-8">
        <AnimatePresence mode="wait">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            return (
              <motion.div
                key={step.num + activeTab}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.4, delay: index * 0.08 }}
                className="overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="grid lg:grid-cols-[1.2fr_0.8fr]">
                  {/* Step Description */}
                  <div className="p-6 sm:p-10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="grid size-9 place-items-center rounded-xl bg-forest-950 text-xs font-black text-lime">
                          {step.num}
                        </span>
                        <span className="rounded-full bg-forest-50 px-3 py-1 text-[11px] font-bold text-forest-700">
                          {step.tag}
                        </span>
                      </div>

                      <h2 className="mt-4 text-xl font-black text-ink sm:text-2xl">
                        {step.title}
                      </h2>
                      <p className="mt-3 text-xs leading-relaxed text-muted sm:text-sm">
                        {step.desc}
                      </p>

                      {/* Key Highlights */}
                      <div className="mt-6 flex flex-wrap gap-2">
                        {step.perks.map((perk) => (
                          <span
                            key={perk}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-sand-100 px-2.5 py-1 text-[11px] font-bold text-forest-900"
                          >
                            <CheckCircle2 className="size-3 text-forest-600" /> {perk}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-line text-xs font-bold text-muted flex items-center gap-2">
                      <Clock className="size-3.5 text-forest-700" /> Average turnaround:{" "}
                      <span className="text-forest-950 font-extrabold">Instant to &lt; 24h</span>
                    </div>
                  </div>

                  {/* Visual Preview Card */}
                  <div className="border-t border-line bg-forest-950 p-6 text-white lg:border-l lg:border-t-0 sm:p-8 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-white/15 pb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-lime">
                          {step.preview.label}
                        </span>
                        <StepIcon className="size-4 text-lime" />
                      </div>

                      <div className="mt-4 space-y-3">
                        <p className="text-sm font-extrabold text-white">
                          {step.preview.title}
                        </p>
                        <p className="text-xs text-sand-300">
                          {step.preview.location}
                        </p>

                        <div className="rounded-xl bg-white/10 p-3.5 space-y-2 text-xs backdrop-blur-md">
                          <div className="flex justify-between">
                            <span className="text-sand-300">Primary Term:</span>
                            <span className="font-bold text-white">{step.preview.rent}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sand-300">Security / Escrow:</span>
                            <span className="font-bold text-lime">{step.preview.caution}</span>
                          </div>
                          <div className="flex justify-between border-t border-white/10 pt-2">
                            <span className="text-sand-300">Middleman Fee:</span>
                            <span className="font-bold text-white">{step.preview.agentFee}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between text-[11px] text-forest-300">
                      <span className="flex items-center gap-1">
                        <Lock className="size-3 text-lime" /> End-to-end encrypted
                      </span>
                      <span>Verified System</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
=======
      <section className="stitch-container py-16 sm:py-20">
        <div className="flex flex-col gap-6 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-3xl font-extrabold tracking-[-.03em] text-ink sm:text-4xl">Choose your side of the journey</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">The workflow changes by role, but the record stays connected.</p>
          </div>
          <div className="segmented-control" aria-label="Choose a journey">
            <button type="button" aria-pressed={audience === "tenant"} onClick={() => setAudience("tenant")}><UserRound className="mr-2 inline size-4" />Tenant</button>
            <button type="button" aria-pressed={audience === "landlord"} onClick={() => setAudience("landlord")}><Building2 className="mr-2 inline size-4" />Landlord</button>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={audience}
            initial={reducedMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -10 }}
            transition={{ duration: reducedMotion ? 0 : .32, ease: [0.22, 1, 0.36, 1] }}
            className="grid gap-10 pt-10 lg:grid-cols-[.82fr_1.18fr]"
          >
            <div className="lg:sticky lg:top-24 lg:h-fit">
              <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-forest-900">
                <Image src={journey.image.src} alt={journey.image.alt} fill className="object-cover" sizes="(max-width:1024px) 100vw, 38vw" />
                <div className="absolute inset-0 bg-gradient-to-t from-forest-950/80 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white sm:p-8"><h2 className="text-3xl font-extrabold tracking-[-.03em]">{journey.title}</h2><p className="mt-3 text-sm leading-6 text-sand-200">{journey.description}</p></div>
              </div>
            </div>
            <ol className="border-t border-line">
              {journey.steps.map(([Icon, title, copy], index) => (
                <li key={title} className="grid gap-4 border-b border-line py-6 sm:grid-cols-[3rem_1fr] sm:py-8">
                  <span className="grid size-11 place-items-center bg-forest-100 text-forest-900"><Icon className="size-5" aria-hidden="true" /></span>
                  <div><p className="text-xs font-extrabold tabular-nums text-forest-700">Step {index + 1} of {journey.steps.length}</p><h3 className="mt-2 text-xl font-extrabold tracking-[-.02em] text-ink">{title}</h3><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{copy}</p></div>
                </li>
              ))}
            </ol>
          </motion.div>
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
        </AnimatePresence>
      </section>

<<<<<<< HEAD
      {/* Document Requirements Checklist */}
      <div className="rounded-3xl border border-line bg-sand-100 p-8 sm:p-12">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-forest-700">
            Preparation Guide
          </span>
          <h2 className="mt-2 text-2xl font-extrabold text-ink sm:text-3xl">
            {activeTab === "tenant" ? "What Renters Need to Prepare" : "What Landlords Need to Verify"}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-xs text-muted">
            Having these standard documents ready ensures your verification badge is approved in under 2 hours.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {docs.map((doc, i) => (
            <div key={doc.title} className="rounded-2xl border border-line bg-white p-5 shadow-xs">
              <span className="text-xs font-black text-forest-700">0{i + 1}</span>
              <h3 className="mt-2 text-sm font-bold text-ink">{doc.title}</h3>
              <p className="mt-1 text-xs text-muted leading-relaxed">{doc.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Conversion Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-forest-950 via-forest-900 to-forest-950 p-8 text-center text-white shadow-xl sm:p-12 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full bg-lime/20 px-3.5 py-1 text-xs font-bold text-lime">
            <Zap className="size-3.5" /> 100% FREE TO GET STARTED
          </div>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl">
            {activeTab === "tenant"
              ? "Ready to find your next home without agent hassle?"
              : "Ready to list your rental property directly?"}
          </h2>
          <p className="mt-3 text-sm text-sand-200">
            {activeTab === "tenant"
              ? "Browse over 1,200+ verified homes with free inspection booking and escrow rent safety."
              : "Reach thousands of pre-screened professionals and manage tenancies with automated rent payouts."}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            {activeTab === "tenant" ? (
              <Link
                href="/properties"
                className="stitch-button bg-lime px-8 py-3 text-sm font-extrabold text-forest-950 hover:bg-white transition"
              >
                Browse Verified Homes <ArrowRight className="size-4" />
              </Link>
            ) : (
              <Link
                href="/signup?role=Landlord"
                className="stitch-button bg-lime px-8 py-3 text-sm font-extrabold text-forest-950 hover:bg-white transition"
              >
                List Property for Free <ArrowRight className="size-4" />
              </Link>
            )}
            <Link
              href="/trust-and-safety"
              className="stitch-button border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white hover:bg-white/20"
            >
              Read Trust & Safety Standards
            </Link>
          </div>
        </div>
      </div>
    </div>
=======
      <section className="stitch-container">
        <div className="grid gap-8 bg-forest-800 px-6 py-10 text-white sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><h2 className="text-3xl font-extrabold tracking-[-.03em]">Start with the next accountable action.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-forest-100">Browse available homes or create the account that matches your role.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/properties" className="stitch-button bg-lime text-forest-950 hover:bg-white">Browse homes <ArrowRight className="size-4" /></Link><Link href="/signup" className="stitch-button border border-white/20 bg-transparent hover:bg-white/10">Create account</Link></div>
        </div>
      </section>
    </main>
>>>>>>> 362c8a8f9856d33b209f9781c5013ef48e47c6ac
  );
}
