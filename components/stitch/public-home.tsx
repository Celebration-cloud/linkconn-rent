"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import type { Variants } from "framer-motion";
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  Building2,
  Calculator,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleCheck,
  Clock,
  Eye,
  FileCheck2,
  HelpCircle,
  Home,
  KeyRound,
  Lock,
  MapPin,
  MessageCircle,
  ReceiptText,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  Users,
  WalletCards,
  Wrench,
  Zap,
} from "lucide-react";
import type { Property } from "@/domain/types/property";
import { canListProperties } from "@/domain/constants/property-access";
import { useAuth } from "@/providers/auth-provider";
import { StitchPropertyCard } from "./property-card";
import { LINKCONN_ASSETS } from "@/domain/constants/linkconn-assets";
import { Input, Select } from "@/components/ui/form-controls";
import { formatNaira } from "@/utils/map-property";

const reveal: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.72,
      ease: [0.22, 1, 0.36, 1] as const,
    },
  },
};

const NEIGHBORHOOD_GUIDES = [
  {
    area: "Lekki Phase 1",
    city: "Lagos",
    avgRent1Bed: "₦2.8M - ₦4.2M/yr",
    avgRent2Bed: "₦5.0M - ₦8.5M/yr",
    safetyScore: "98%",
    vibe: "Upscale, prime business & dining hub",
    listingsCount: "142 verified",
    tag: "High Demand",
  },
  {
    area: "Yaba & Akoka",
    city: "Lagos",
    avgRent1Bed: "₦1.2M - ₦2.2M/yr",
    avgRent2Bed: "₦2.5M - ₦4.0M/yr",
    safetyScore: "94%",
    vibe: "Tech corridor, central connectivity",
    listingsCount: "86 verified",
    tag: "Tech Hub",
  },
  {
    area: "Ikeja GRA & Allen",
    city: "Lagos",
    avgRent1Bed: "₦2.0M - ₦3.5M/yr",
    avgRent2Bed: "₦4.0M - ₦7.0M/yr",
    safetyScore: "96%",
    vibe: "Quiet residential, commercial access",
    listingsCount: "94 verified",
    tag: "Mainland Elite",
  },
  {
    area: "Wuse 2 & Maitama",
    city: "Abuja",
    avgRent1Bed: "₦3.5M - ₦6.0M/yr",
    avgRent2Bed: "₦7.0M - ₦14.0M/yr",
    safetyScore: "99%",
    vibe: "Diplomatic zone, top infrastructure",
    listingsCount: "68 verified",
    tag: "Capital Prime",
  },
];

const FAQS = [
  {
    question: "How does LinkConn Rent eliminate agent commission and viewing fees?",
    answer:
      "Traditional Nigerian rentals involve multiple middlemen charging 10% agency fees, 10% legal fees, and arbitrary 'inspection fees' (₦3,000–₦10,000 per viewing). LinkConn Rent directly connects tenants with verified property owners and approved caretakers. Viewings are 100% free to book, and lease generation is built into the platform at ₦0 commission.",
  },
  {
    question: "How does the Rent Escrow protection keep my money safe?",
    answer:
      "When you pay your rent and caution deposit through LinkConn Rent, your funds are held in a regulated escrow vault powered by certified payment infrastructure. Funds are only disbursed to the landlord 24 hours AFTER you receive keys, inspect the property, and confirm move-in condition matches the listing.",
  },
  {
    question: "What does the 'Verified Property' badge actually verify?",
    answer:
      "Our multi-layer verification includes: (1) Landlord identity verification via official NIN/BVN biometric matching, (2) Land title deed and management authority audit, (3) In-person physical property audit with GPS tagging, and (4) Utility and water infrastructure check.",
  },
  {
    question: "What happens to my caution deposit when moving out?",
    answer:
      "Caution deposits are tracked in an immutable ledger under the digital tenancy agreement. At lease termination, move-out condition is documented with time-stamped photos. Landlords must submit verified receipts for any legitimate repairs within 14 days, and remaining funds are refunded directly to the tenant's bank account.",
  },
  {
    question: "Can landlords unexpectedly hike rent mid-tenancy?",
    answer:
      "No. All leases on LinkConn Rent adhere strictly to Nigerian tenancy laws (including Lagos Tenancy Law 2011). Rent amounts and renewal terms are legally bound for the agreed tenancy period. Any proposed renewal increase requires standard statutory written notice before expiration.",
  },
];

const TESTIMONIALS = [
  {
    name: "Dr. Babatunde Adeyemi",
    role: "Verified Landlord",
    location: "Lekki Phase 1, Lagos",
    tenancies: "4 properties managed",
    comment:
      "Before LinkConn, agents brought unqualified tenants and made false promises. With LinkConn, I screen verified working professionals, receive automated rent deposits, and manage all repair tickets in one dashboard without phone calls at midnight.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    name: "Chidimma Nwosu",
    role: "Verified Renter",
    location: "Yaba, Lagos",
    tenancies: "2-year tenant",
    comment:
      "I saved ₦650,000 in agent and legal commission on my 2-bedroom apartment. Booking the inspection took 30 seconds, the landlord met me in person, and paying through escrow gave me 100% peace of mind.",
    avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
  {
    name: "Engr. Farouk Usman",
    role: "Verified Renter",
    location: "Wuse 2, Abuja",
    tenancies: "Relocated from Kano",
    comment:
      "Relocating across states to Abuja was terrifying because of fake agents. LinkConn verified the title deed, verified the landlord's NIN, and I signed my digital tenancy agreement before arriving. Seamless experience!",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    rating: 5,
  },
];

export function PublicHome({ properties }: { properties: Property[] }) {
  const [period, setPeriod] = useState<"month" | "year">("year");
  const [calcRent, setCalcRent] = useState<number>(3500000);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const { user, isLoadingProfile, profileError } = useAuth();
  const canList = Boolean(
    user &&
      !isLoadingProfile &&
      !profileError &&
      canListProperties(user.role),
  );
  const heroRef = useRef<HTMLElement>(null);
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.03, 1.1]);
  const copyY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const copyOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  // Savings calculations
  const traditionalAgentFee = Math.round(calcRent * 0.1);
  const traditionalLegalFee = Math.round(calcRent * 0.1);
  const traditionalInspectionFees = 25000;
  const totalTraditionalExtra = traditionalAgentFee + traditionalLegalFee + traditionalInspectionFees;

  return (
    <main id="main-content" className="overflow-clip bg-sand-50 pt-16">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="relative min-h-[72rem] overflow-hidden bg-forest-950 sm:min-h-[calc(100dvh-4rem)]"
      >
        <motion.div
          className="absolute inset-0"
          style={
            reducedMotion
              ? undefined
              : { y: imageY, scale: imageScale, willChange: "transform" }
          }
        >
          <Image
            src={LINKCONN_ASSETS.hero.src}
            alt={LINKCONN_ASSETS.hero.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover object-[62%_50%]"
          />
        </motion.div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,35,26,0.94)_0%,rgba(8,35,26,0.78)_42%,rgba(8,35,26,0.22)_76%,rgba(8,35,26,0.12)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_50%,rgba(8,35,26,0.92)_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.11] [background-image:url('data:image/svg+xml,%3Csvg_viewBox=%220_0_180_180%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22n%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%22.9%22_numOctaves=%222%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22100%25%22_height=%22100%25%22_filter=%22url(%23n)%22_opacity=%22.6%22/%3E%3C/svg%3E')]" />

        <motion.div
          className="stitch-container relative z-10 flex min-h-[68rem] flex-col justify-center pb-[26rem] pt-16 sm:min-h-[calc(100dvh-4rem)] sm:pb-64 lg:pb-60"
          style={
            reducedMotion
              ? undefined
              : { y: copyY, opacity: copyOpacity, willChange: "transform" }
          }
        >
          <motion.div
            initial={reducedMotion ? false : "hidden"}
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.1 } },
            }}
            className="max-w-3xl text-white"
          >
            <motion.div
              variants={reveal}
              className="mb-6 inline-flex flex-wrap items-center gap-2 rounded-full border border-lime/30 bg-forest-900/80 px-3.5 py-1.5 backdrop-blur-md"
            >
              <ShieldCheck className="size-4 text-lime" />
              <span className="text-xs font-bold tracking-wide text-sand-100">
                Nigeria&apos;s 1st Direct Rental & Escrow Platform
              </span>
              <span className="rounded-full bg-lime px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-forest-950">
                0% Agency Fees
              </span>
            </motion.div>
            <motion.h1
              variants={reveal}
              className="max-w-3xl text-balance text-5xl font-black leading-[0.94] tracking-[-0.065em] sm:text-6xl lg:text-[5.6rem]"
            >
              Rent directly from verified landlords.
              <span className="block text-lime">Pay zero agent fees.</span>
            </motion.h1>
            <motion.p
              variants={reveal}
              className="mt-7 max-w-xl text-pretty text-base leading-7 text-sand-200 sm:text-lg"
            >
              Search verified homes with title-checked ownership, book free physical inspections, sign digital legal leases, and pay rent through protected escrow.
            </motion.p>
            <motion.div variants={reveal} className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/properties"
                className="stitch-button bg-lime px-7 py-3.5 text-base font-extrabold text-forest-950 shadow-[0_12px_32px_rgba(184,227,110,0.35)] hover:bg-white transition-all hover:scale-[1.02]"
              >
                Explore Verified Homes <ArrowRight className="size-4" />
              </Link>
              {canList ? (
                <Link
                  href="/dashboard/properties/new"
                  className="stitch-button border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md hover:bg-white/20"
                >
                  List a Property <CalendarDays className="size-4" />
                </Link>
              ) : (
                <Link
                  href="/signup?role=Landlord"
                  className="stitch-button border border-white/40 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-md hover:bg-white/20"
                >
                  List as Landlord <Building2 className="size-4" />
                </Link>
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        <SearchPanel period={period} setPeriod={setPeriod} />
      </section>

      {/* Live Platform Proof Bar */}
      <section className="border-b border-line bg-white shadow-xs">
        <div className="stitch-container grid grid-cols-2 gap-6 py-6 sm:grid-cols-4 lg:divide-x lg:divide-line">
          {[
            {
              icon: ShieldCheck,
              value: "₦1.8B+",
              label: "Tenancy Volume Escrowed",
              desc: "100% scam-free guarantee",
            },
            {
              icon: TrendingDown,
              value: "₦0",
              label: "Middleman Commission",
              desc: "Save 10–20% on every lease",
            },
            {
              icon: BadgeCheck,
              value: "1,240+",
              label: "Verified Properties",
              desc: "Deed & physical audit pass",
            },
            {
              icon: Clock,
              value: "< 48h",
              label: "Inspection to Lease",
              desc: "Instant digital signing",
            },
          ].map((stat, i) => {
            const StatIcon = stat.icon;
            return (
              <div
                key={stat.label}
                className={`flex items-start gap-3.5 ${i > 0 ? "lg:pl-6" : ""}`}
              >
                <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-forest-50 text-forest-700">
                  <StatIcon className="size-5" />
                </div>
                <div>
                  <p className="text-xl font-black tabular-nums tracking-tight text-ink sm:text-2xl">
                    {stat.value}
                  </p>
                  <p className="text-xs font-bold text-forest-900">{stat.label}</p>
                  <p className="text-[11px] text-muted">{stat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Verified Homes */}
      <SectionReveal className="stitch-container py-20 sm:py-28">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-bold tracking-[0.14em] text-forest-700">
              <Sparkles className="size-4 text-forest-600" />
              HANDPICKED & AUDITED
            </div>
            <h2 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-[-0.05em] text-ink sm:text-4xl lg:text-5xl">
              Freshly Verified Listings
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted">
              Inspect confirmed availability, verified title deeds, clear breakdown of caution deposits, and book direct landlord viewings.
            </p>
          </div>
          <Link
            href="/properties"
            className="inline-flex items-center gap-2 rounded-xl border border-line bg-white px-5 py-2.5 text-sm font-bold text-forest-700 shadow-xs transition hover:border-forest-600 hover:text-forest-900"
          >
            Explore All 1,200+ Homes <ArrowRight className="size-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {properties.slice(0, 3).map((property, index) => (
            <motion.div
              key={property.id}
              initial={reducedMotion ? false : { opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.08, duration: 0.65 }}
              whileHover={reducedMotion ? undefined : { y: -6 }}
            >
              <StitchPropertyCard property={property} compact />
            </motion.div>
          ))}
        </div>
      </SectionReveal>

      {/* Interactive Rent Savings Calculator */}
      <SectionReveal className="stitch-container py-12">
        <div className="overflow-hidden rounded-3xl border border-forest-900/10 bg-gradient-to-br from-forest-950 via-forest-900 to-forest-950 p-6 text-white shadow-2xl sm:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-lime/20 px-3.5 py-1 text-xs font-bold text-lime">
                <Calculator className="size-3.5" />
                COMMISSION SAVINGS CALCULATOR
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                See what traditional agents take from your pocket.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-sand-200">
                In Nigeria, agents charge 10% agency fee, 10% legal fee, and upfront inspection fees. On LinkConn Rent, you pay <strong>₦0 commission</strong>.
              </p>

              <div className="mt-8 rounded-2xl bg-white/10 p-5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <label htmlFor="rent-slider" className="text-xs font-bold uppercase tracking-wider text-sand-300">
                    Annual Target Rent
                  </label>
                  <span className="text-xl font-black text-lime tabular-nums">
                    {formatNaira(calcRent)}
                  </span>
                </div>
                <input
                  id="rent-slider"
                  type="range"
                  min={500000}
                  max={20000000}
                  step={250000}
                  value={calcRent}
                  onChange={(e) => setCalcRent(Number(e.target.value))}
                  className="mt-4 h-2 w-full cursor-pointer appearance-none rounded-lg bg-forest-800 accent-lime"
                />
                <div className="mt-2 flex justify-between text-[11px] font-bold text-forest-300">
                  <span>₦500k/yr</span>
                  <span>₦5M/yr</span>
                  <span>₦10M/yr</span>
                  <span>₦20M/yr</span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl sm:p-8">
              <h3 className="text-xs font-bold uppercase tracking-wider text-sand-300">
                Extra Cost Comparison
              </h3>

              <div className="mt-5 space-y-3.5 text-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-sand-200">Traditional Agency Fee (10%)</span>
                  <span className="font-bold text-red-300 tabular-nums">
                    +{formatNaira(traditionalAgentFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-sand-200">Traditional Legal Fee (10%)</span>
                  <span className="font-bold text-red-300 tabular-nums">
                    +{formatNaira(traditionalLegalFee)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-sand-200">Multiple Viewing/Form Fees</span>
                  <span className="font-bold text-red-300 tabular-nums">
                    +{formatNaira(traditionalInspectionFees)}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="font-bold text-lime">LinkConn Platform Fee</span>
                  <span className="font-extrabold text-lime">₦0 (FREE)</span>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-lime/15 p-4 text-center border border-lime/30">
                <p className="text-xs font-semibold text-sand-200">Total Money Kept in Your Bank</p>
                <p className="mt-1 text-3xl font-black text-lime tabular-nums sm:text-4xl">
                  {formatNaira(totalTraditionalExtra)}
                </p>
                <p className="mt-1 text-[11px] text-forest-200">
                  Enough to cover interior furnishing or 2+ months of utility bills.
                </p>
              </div>

              <Link
                href="/properties"
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-lime py-3 text-center text-sm font-extrabold text-forest-950 transition hover:bg-white"
              >
                Find Homes and Keep Your Savings <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* 4-Layer Institutional Verification Grid */}
      <SectionReveal className="stitch-container py-20 sm:py-28">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3.5 py-1 text-xs font-bold text-forest-800">
            <Lock className="size-3.5 text-forest-700" />
            SECURITY ARCHITECTURE
          </span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-ink sm:text-4xl lg:text-5xl">
            The 4-Layer Fraud Prevention Shield
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-muted">
            We don&apos;t just post pictures. We verify ownership, physical premises, and protect payments with bank-grade escrow.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              step: "01",
              title: "Identity & Biometric Check",
              desc: "Every landlord validates their identity via NIN/BVN biometric match against government records to prevent impersonation.",
              icon: ShieldCheck,
              tag: "KYC Verified",
            },
            {
              step: "02",
              title: "Land Title & Authority Audit",
              desc: "Deed of Assignment, Governor's Consent, or Caretaker Power of Attorney is legally audited prior to listing activation.",
              icon: FileCheck2,
              tag: "Title Verified",
            },
            {
              step: "03",
              title: "On-Site Physical Inspection",
              desc: "Field agents audit physical condition, take GPS geotagged media, and verify access keys to eliminate phantom apartments.",
              icon: MapPin,
              tag: "Premises Verified",
            },
            {
              step: "04",
              title: "Escrow Deposit Lock",
              desc: "Rent and caution deposits are locked in escrow and only released 24 hours after tenant moves in and confirms satisfaction.",
              icon: WalletCards,
              tag: "Payment Protected",
            },
          ].map((item) => {
            const ItemIcon = item.icon;
            return (
              <div
                key={item.step}
                className="group relative rounded-2xl border border-line bg-white p-6 shadow-xs transition hover:border-forest-600 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-forest-200 tabular-nums">
                    {item.step}
                  </span>
                  <span className="rounded-full bg-forest-50 px-2.5 py-0.5 text-[10px] font-bold text-forest-700">
                    {item.tag}
                  </span>
                </div>
                <div className="mt-4 grid size-12 place-items-center rounded-xl bg-forest-50 text-forest-700 group-hover:bg-forest-900 group-hover:text-lime transition">
                  <ItemIcon className="size-6" />
                </div>
                <h3 className="mt-4 text-base font-bold text-ink">{item.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </SectionReveal>

      {/* Neighborhood Spotlight & Price Index */}
      <SectionReveal className="stitch-container py-12">
        <div className="rounded-3xl border border-line bg-sand-100 p-6 sm:p-10">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-bold tracking-[0.14em] text-forest-700 uppercase">
                Rental Price Index
              </span>
              <h2 className="mt-2 text-3xl font-extrabold tracking-[-0.04em] text-ink sm:text-4xl">
                Explore Prime Neighborhoods
              </h2>
              <p className="mt-2 text-xs text-muted">
                Transparent market rental rates with verified safety indicators and active listing inventory.
              </p>
            </div>
            <Link
              href="/properties"
              className="text-xs font-bold text-forest-700 hover:text-forest-900 hover:underline"
            >
              View all locations →
            </Link>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {NEIGHBORHOOD_GUIDES.map((nh) => (
              <Link
                key={nh.area}
                href={`/properties?location=${encodeURIComponent(nh.area)}`}
                className="group rounded-2xl border border-line bg-white p-5 shadow-xs transition hover:border-forest-600 hover:-translate-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="rounded-md bg-sand-200 px-2 py-0.5 text-[10px] font-bold text-forest-800">
                    {nh.tag}
                  </span>
                  <span className="text-[11px] font-bold text-muted">{nh.city}</span>
                </div>
                <h3 className="mt-3 text-lg font-bold text-ink group-hover:text-forest-700">
                  {nh.area}
                </h3>
                <p className="mt-1 text-xs text-muted line-clamp-1">{nh.vibe}</p>

                <div className="mt-4 space-y-1.5 border-t border-line pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted">1-Bed Avg:</span>
                    <span className="font-bold text-ink">{nh.avgRent1Bed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">2-Bed Avg:</span>
                    <span className="font-bold text-ink">{nh.avgRent2Bed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted">Safety Index:</span>
                    <span className="font-bold text-forest-700">{nh.safetyScore}</span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-dashed border-line pt-3 text-[11px] font-bold text-forest-700">
                  <span>{nh.listingsCount}</span>
                  <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition">
                    Browse <ArrowRight className="size-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </SectionReveal>

      {/* Dual Journey: Renters vs Landlords */}
      <SectionReveal className="stitch-container py-20 sm:py-28">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* For Renters */}
          <div className="rounded-3xl bg-forest-950 p-8 text-white sm:p-12 flex flex-col justify-between shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-lime/20 px-3 py-1 text-xs font-bold text-lime">
                <Users className="size-3.5" /> FOR RENTERS & TENANTS
              </div>
              <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
                Rent safely in 4 straightforward steps.
              </h2>
              <p className="mt-3 text-sm text-sand-200">
                No middleman markup. No arbitrary viewing fees. Real Nigerian properties.
              </p>

              <ol className="mt-8 space-y-4">
                {[
                  {
                    step: "01",
                    title: "Filter by exact all-in move-in budget",
                    desc: "See full rent + caution + service charge upfront with zero hidden line items.",
                  },
                  {
                    step: "02",
                    title: "Book direct landlord inspections for ₦0",
                    desc: "Pick verified calendar slots and meet the actual property owner/caretaker.",
                  },
                  {
                    step: "03",
                    title: "Digital tenancy agreement & legal signing",
                    desc: "Review standardized legal clauses compliant with state tenancy law.",
                  },
                  {
                    step: "04",
                    title: "Move in with escrow protection",
                    desc: "Funds are released only when keys are in hand and property condition confirmed.",
                  },
                ].map((item) => (
                  <li key={item.step} className="flex items-start gap-4 border-t border-white/15 pt-4">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-lime text-xs font-black text-forest-950">
                      {item.step}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-white">{item.title}</p>
                      <p className="mt-0.5 text-xs text-sand-300">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-10">
              <Link
                href="/properties"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-lime py-3 text-center text-sm font-extrabold text-forest-950 transition hover:bg-white"
              >
                Find Your Next Home <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* For Landlords */}
          <div className="rounded-3xl border border-line bg-white p-8 sm:p-12 flex flex-col justify-between shadow-sm">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-forest-100 px-3 py-1 text-xs font-bold text-forest-800">
                <Building2 className="size-3.5 text-forest-700" /> FOR LANDLORDS & MANAGERS
              </div>
              <h2 className="mt-5 text-3xl font-extrabold tracking-[-0.04em] text-ink sm:text-4xl">
                Fill vacancies 3x faster with vetted tenants.
              </h2>
              <p className="mt-3 text-sm text-muted">
                Ditch disorganized WhatsApp chats and unauthorized agent sub-leasing.
              </p>

              <ol className="mt-8 space-y-4">
                {[
                  {
                    step: "01",
                    title: "Publish verified listing in under 5 minutes",
                    desc: "Upload photos, set exact rent terms, and request our free verification badge.",
                  },
                  {
                    step: "02",
                    title: "Receive pre-screened tenant applications",
                    desc: "Review verified employment, income brackets, and national ID before chatting.",
                  },
                  {
                    step: "03",
                    title: "Automated direct rent payouts",
                    desc: "Funds transfer directly into your Nigerian bank account with automated digital receipts.",
                  },
                  {
                    step: "04",
                    title: "Centralized maintenance & renewal manager",
                    desc: "Track tenant repair tickets with photos and manage 12-month lease renewals automatically.",
                  },
                ].map((item) => (
                  <li key={item.step} className="flex items-start gap-4 border-t border-line pt-4">
                    <span className="grid size-7 shrink-0 place-items-center rounded-full bg-forest-900 text-xs font-black text-white">
                      {item.step}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-ink">{item.title}</p>
                      <p className="mt-0.5 text-xs text-muted">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>

            <div className="mt-10">
              <Link
                href="/signup?role=Landlord"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest-900 py-3 text-center text-sm font-extrabold text-white transition hover:bg-forest-800"
              >
                List Your Property For Free <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </SectionReveal>

      {/* Verified Reviews & Social Proof */}
      <SectionReveal className="stitch-container py-16">
        <div className="text-center">
          <span className="text-xs font-bold uppercase tracking-widest text-forest-700">
            Real Stories
          </span>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Trusted by Verified Renters & Property Owners
          </h2>
          <p className="mx-auto mt-2 max-w-lg text-xs text-muted">
            See how Nigerians are securing homes without the fear of fake agents and double-letting scams.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-line bg-white p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Sparkles key={i} className="size-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="mt-4 text-sm leading-relaxed text-ink italic">
                  &ldquo;{t.comment}&rdquo;
                </p>
              </div>

              <div className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                <div className="relative size-11 overflow-hidden rounded-full border border-forest-600 bg-forest-100">
                  <Image
                    src={t.avatar}
                    alt={t.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink">{t.name}</p>
                  <p className="text-[11px] font-semibold text-forest-700 flex items-center gap-1">
                    <BadgeCheck className="size-3 text-forest-700" /> {t.role} · {t.location}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionReveal>

      {/* Nigerian Tenancy Law & FAQ Accordion */}
      <SectionReveal className="stitch-container py-20">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-forest-700">
              <Scale className="size-3.5" /> Legal & Transparency
            </span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-xs text-muted">
              Clear answers on rental rights, escrow release, caution deposits, and verification.
            </p>
          </div>

          <div className="mt-10 space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className="rounded-2xl border border-line bg-white transition shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left font-bold text-ink cursor-pointer"
                  >
                    <span className="text-sm sm:text-base">{faq.question}</span>
                    <ChevronDown
                      className={`size-5 text-muted transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-forest-700" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-line px-5 pb-5 pt-3 text-xs leading-relaxed text-muted sm:text-sm">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      {/* Final High-Impact CTA */}
      <section className="stitch-container pb-24">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-forest-950 via-forest-900 to-forest-950 px-6 py-16 text-white sm:px-14 sm:py-20 shadow-2xl">
          <div className="absolute -right-20 -top-24 size-80 rounded-full border border-white/10" />
          <div className="absolute -bottom-40 right-24 size-96 rounded-full border border-lime/20" />
          <div className="relative max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-lime/20 px-3.5 py-1 text-xs font-bold text-lime">
              <Zap className="size-3.5" /> ZERO AGENT FEES GUARANTEE
            </div>
            <h2 className="mt-5 text-balance text-3xl font-black tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              Ready to rent without the headache of fake agents?
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-sand-200">
              Join thousands of Nigerians renting directly from verified landlords. Never pay arbitrary inspection fees or loose caution deposits again.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/properties"
                className="stitch-button bg-lime px-8 py-3.5 text-base font-extrabold text-forest-950 shadow-lg hover:bg-white transition hover:scale-[1.02]"
              >
                <Home className="size-4" /> Browse Verified Homes
              </Link>
              {canList ? (
                <Link
                  href="/dashboard/properties/new"
                  className="stitch-button border border-white/40 bg-transparent px-7 py-3.5 text-sm font-bold text-white hover:bg-white/10"
                >
                  <CalendarDays className="size-4" /> List Your Property
                </Link>
              ) : (
                <Link
                  href="/signup?role=Landlord"
                  className="stitch-button border border-white/40 bg-transparent px-7 py-3.5 text-sm font-bold text-white hover:bg-white/10"
                >
                  <Building2 className="size-4" /> Become a Verified Landlord
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function SearchPanel({
  period,
  setPeriod,
}: {
  period: "month" | "year";
  // eslint-disable-next-line no-unused-vars
  setPeriod(...args: ["month" | "year"]): void;
}) {
  return (
    <motion.form
      action="/properties"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.45, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className="stitch-container absolute inset-x-0 bottom-5 z-20"
    >
      <div className="rounded-2xl border border-white/30 bg-sand-50/96 p-3 shadow-[0_24px_70px_rgba(8,35,26,0.35)] backdrop-blur-xl">
        <div className="grid gap-2 lg:grid-cols-[1.5fr_0.85fr_0.65fr_0.8fr_auto]">
          <label>
            <span className="mb-1 block px-1 text-[10px] font-bold tracking-wide text-forest-800">
              Where
            </span>
            <Input
              className="border-transparent"
              name="location"
              placeholder="Yaba, Wuse, Lekki…"
              leadingIcon={MapPin}
            />
          </label>
          <label>
            <span className="mb-1 block px-1 text-[10px] font-bold tracking-wide text-forest-800">
              Property
            </span>
            <Select
              className="border-transparent"
              name="type"
              defaultValue=""
            >
              <option value="">Any type</option>
              <option>Apartment</option>
              <option>Duplex</option>
              <option>Studio</option>
              <option>Shared Apartment</option>
            </Select>
          </label>
          <label>
            <span className="mb-1 block px-1 text-[10px] font-bold tracking-wide text-forest-800">
              Bedrooms
            </span>
            <Select
              className="border-transparent"
              name="bedrooms"
              defaultValue=""
            >
              <option value="">Any</option>
              <option value="1">1+</option>
              <option value="2">2+</option>
              <option value="3">3+</option>
            </Select>
          </label>
          <div>
            <span className="mb-1 block px-1 text-[10px] font-bold tracking-wide text-forest-800">
              Pay
            </span>
            <div className="grid min-h-11 grid-cols-2 rounded-lg bg-sand-200 p-1 text-xs font-bold">
              {(["month", "year"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPeriod(value)}
                  className={`rounded-md px-2 transition ${
                    period === value
                      ? "bg-white text-forest-800 shadow-sm"
                      : "text-muted"
                  }`}
                >
                  {value === "month" ? "Monthly" : "Yearly"}
                </button>
              ))}
            </div>
          </div>
          <input type="hidden" name="period" value={period} />
          <button className="stitch-button self-end px-6" type="submit">
            <Search className="size-4" /> Search
          </button>
        </div>
      </div>
    </motion.form>
  );
}

function SectionReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.section
      initial={reducedMotion ? false : { opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.13 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}
