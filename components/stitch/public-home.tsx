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
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CircleCheck,
  Eye,
  FileCheck2,
  Home,
  KeyRound,
  MapPin,
  MessageCircle,
  ReceiptText,
  Search,
  ShieldCheck,
  Sparkles,
  WalletCards,
  Wrench,
} from "lucide-react";
import type { Property } from "@/domain/types/property";
import { canListProperties } from "@/domain/constants/property-access";
import { useAuth } from "@/providers/auth-provider";
import { StitchPropertyCard } from "./property-card";
import { LINKCONN_ASSETS } from "@/domain/constants/linkconn-assets";
import { Input, Select } from "@/components/ui/form-controls";

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

export function PublicHome({ properties }: { properties: Property[] }) {
  const [period, setPeriod] = useState<"month" | "year">("year");
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

  return (
    <main id="main-content" className="overflow-clip bg-sand-50 pt-16">
      <section
        ref={heroRef}
        className="relative min-h-[68rem] overflow-hidden bg-forest-950 sm:min-h-[calc(100dvh-4rem)]"
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
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,35,26,0.92)_0%,rgba(8,35,26,0.72)_38%,rgba(8,35,26,0.18)_72%,rgba(8,35,26,0.08)_100%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(8,35,26,0.88)_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[0.11] [background-image:url('data:image/svg+xml,%3Csvg_viewBox=%220_0_180_180%22_xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter_id=%22n%22%3E%3CfeTurbulence_type=%22fractalNoise%22_baseFrequency=%22.9%22_numOctaves=%222%22_stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect_width=%22100%25%22_height=%22100%25%22_filter=%22url(%23n)%22_opacity=%22.6%22/%3E%3C/svg%3E')]" />

        <motion.div
          className="stitch-container relative z-10 flex min-h-[68rem] flex-col justify-center pb-[25rem] pt-16 sm:min-h-[calc(100dvh-4rem)] sm:pb-60 lg:pb-56"
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
            <motion.p
              variants={reveal}
              className="mb-6 inline-flex items-center gap-2 border-l-2 border-lime pl-3 text-xs font-bold tracking-[0.16em] text-sand-100"
            >
              <ShieldCheck className="size-4 text-lime" />
              Verified rentals built for Nigeria
            </motion.p>
            <motion.h1
              variants={reveal}
              className="max-w-3xl text-balance text-5xl font-extrabold leading-[0.95] tracking-[-0.065em] sm:text-6xl lg:text-[5.8rem]"
            >
              Rent directly.
              <span className="block text-lime">Know what is real.</span>
            </motion.h1>
            <motion.p
              variants={reveal}
              className="mt-7 max-w-xl text-pretty text-base leading-7 text-sand-200 sm:text-lg"
            >
              Find verified homes, speak directly with landlords, book
              viewings, review every fee, and manage rent from one secure
              place.
            </motion.p>
            <motion.div variants={reveal} className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/properties"
                className="stitch-button bg-lime px-6 text-forest-950 hover:bg-white"
              >
                Find a home <ArrowRight className="size-4" />
              </Link>
              {canList && (
                <Link
                  href="/dashboard/properties/new"
                  className="inline-flex min-h-11 items-center gap-2 border-b border-white/70 px-1 text-sm font-bold text-white transition hover:border-lime hover:text-lime"
                >
                  List a property directly
                </Link>
              )}
            </motion.div>
          </motion.div>
        </motion.div>

        <SearchPanel period={period} setPeriod={setPeriod} />
      </section>

      <section className="border-b border-line bg-sand-100">
        <div className="stitch-container grid gap-5 py-5 text-xs font-semibold text-muted sm:grid-cols-2 lg:grid-cols-4">
          {[
            [ShieldCheck, "Verified landlords"],
            [CheckCircle2, "Verified properties"],
            [WalletCards, "Transparent move-in costs"],
            [KeyRound, "No agent commissions"],
          ].map(([Icon, label]) => {
            const ItemIcon = Icon as typeof ShieldCheck;
            return (
              <div
                key={String(label)}
                className="flex items-center justify-center gap-2"
              >
                <ItemIcon className="size-4 text-forest-700" />
                {String(label)}
              </div>
            );
          })}
        </div>
      </section>

      <SectionReveal className="stitch-container py-20 sm:py-28">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-forest-700">
              Recently verified
            </p>
            <h2 className="mt-3 max-w-2xl text-4xl font-extrabold tracking-[-0.05em] text-ink sm:text-5xl">
              Homes with nothing hidden.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted">
              Real availability, explained charges, and verification history
              before you apply.
            </p>
          </div>
          <Link
            href="/properties"
            className="hidden items-center gap-2 text-sm font-bold text-forest-700 hover:text-forest-900 sm:flex"
          >
            View all homes <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {properties.slice(0, 3).map((property, index) => (
            <motion.div
              key={property.id}
              initial={reducedMotion ? false : { opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ delay: index * 0.08, duration: 0.65 }}
              whileHover={reducedMotion ? undefined : { y: -8 }}
            >
              <StitchPropertyCard property={property} compact />
            </motion.div>
          ))}
        </div>
      </SectionReveal>

      <ImageStory
        asset={LINKCONN_ASSETS.verification}
        eyebrow="Verification you can inspect"
        title="A badge should tell you what was checked."
        body="See identity, phone, email, property authority, address, media review, and the date of the latest verification—without exposing private ownership documents."
        points={[
          "Property authority reviewed",
          "Address and media checked",
          "Verification history stays visible",
        ]}
        href="/trust-and-safety"
        linkLabel="See how verification works"
      />

      <SectionReveal className="stitch-container py-20 sm:py-28">
        <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.14em] text-forest-700">
              Search where life happens
            </p>
            <h2 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] text-ink sm:text-5xl">
              Start with the neighbourhood, not an agent’s list.
            </h2>
          </div>
          <div className="grid grid-cols-2 border-l border-t border-line sm:grid-cols-4">
            {[
              ["Yaba", "Lagos"],
              ["Surulere", "Lagos"],
              ["Wuse", "Abuja"],
              ["Gwarinpa", "Abuja"],
              ["Bodija", "Ibadan"],
              ["Lekki", "Lagos"],
              ["Choba", "Port Harcourt"],
              ["Ikeja", "Lagos"],
            ].map(([area, city], index) => (
              <Link
                key={area}
                href={`/properties?location=${encodeURIComponent(area)}`}
                className="group min-h-32 border-b border-r border-line p-4 transition hover:bg-forest-900 hover:text-white"
              >
                <span className="text-xs tabular-nums text-muted group-hover:text-forest-200">
                  0{index + 1}
                </span>
                <strong className="mt-8 block text-lg">{area}</strong>
                <span className="text-xs text-muted group-hover:text-forest-200">
                  {city}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </SectionReveal>

      <ImageStory
        asset={LINKCONN_ASSETS.directViewing}
        eyebrow="Direct viewing"
        title="Meet the person responsible for the home."
        body="Choose a verified time, keep the conversation in one place, check in safely, and confirm the viewing together."
        points={[
          "No repeated inspection fees",
          "Approximate address until approval",
          "Two-party viewing confirmation",
        ]}
        href="/how-it-works"
        linkLabel="Follow the renter journey"
        reverse
        dark
      />

      <SectionReveal className="stitch-container py-20 sm:py-28">
        <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl bg-forest-900 p-7 text-white sm:p-10">
            <p className="text-xs font-bold tracking-[0.14em] text-lime">
              For renters
            </p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em]">
              One verified profile. More serious applications.
            </h2>
            <FlowList
              items={[
                ["01", "Search homes with complete costs"],
                ["02", "Book and confirm a safe viewing"],
                ["03", "Apply with your reusable renter profile"],
                ["04", "Review, sign, and make a protected payment"],
              ]}
            />
          </div>
          <div className="rounded-3xl bg-sand-200 p-7 sm:p-10">
            <p className="text-xs font-bold tracking-[0.14em] text-forest-700">
              For landlords
            </p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] text-ink">
              Fewer scattered messages. Better records.
            </h2>
            <FlowList
              dark
              items={[
                ["01", "Verify your identity and authority"],
                ["02", "Publish complete availability and fees"],
                ["03", "Review structured applications"],
                ["04", "Sign, collect rent, and manage the tenancy"],
              ]}
            />
          </div>
        </div>
      </SectionReveal>

      <ImageStory
        asset={LINKCONN_ASSETS.costs}
        eyebrow="Total move-in cost"
        title="Every charge has a name and an explanation."
        body="Rent, caution deposit, service charge, agreement fee, utility deposit, and platform charges are shown before you commit. “Miscellaneous” is not accepted."
        points={[
          "Compare by total move-in cost",
          "No vague fee labels",
          "Downloadable payment records",
        ]}
        href="/pricing"
        linkLabel="Review transparent pricing"
      />

      <section className="relative overflow-hidden bg-forest-950 py-20 text-white sm:py-28">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-2/3">
          <Image
            src={LINKCONN_ASSETS.payment.src}
            alt={LINKCONN_ASSETS.payment.alt}
            fill
            sizes="66vw"
            className="object-cover opacity-38"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-forest-950 via-forest-950/80 to-forest-950/20" />
        </div>
        <SectionReveal className="stitch-container relative">
          <div className="max-w-2xl">
            <p className="text-xs font-bold tracking-[0.14em] text-lime">
              Lease and protected payment
            </p>
            <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] sm:text-6xl">
              The agreement, payment, and receipt stay connected.
            </h2>
            <p className="mt-5 max-w-xl leading-7 text-forest-100">
              Review every version, record signatures, pay through the
              approved flow, and keep a clear activity history.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                [FileCheck2, "Versioned lease"],
                [WalletCards, "Protected Payment"],
                [ReceiptText, "Permanent receipts"],
              ].map(([Icon, label]) => {
                const ItemIcon = Icon as typeof FileCheck2;
                return (
                  <div
                    key={String(label)}
                    className="flex items-center gap-3 border-t border-white/20 py-4 text-sm font-bold"
                  >
                    <ItemIcon className="size-5 text-lime" />
                    {String(label)}
                  </div>
                );
              })}
            </div>
          </div>
        </SectionReveal>
      </section>

      <SectionReveal className="stitch-container py-20 sm:py-28">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr] lg:items-end">
          <div>
            <Sparkles className="size-7 text-forest-600" />
            <blockquote className="mt-7 max-w-4xl text-balance text-4xl font-extrabold leading-tight tracking-[-0.045em] text-ink sm:text-5xl">
              “I saw every fee before the viewing and kept the agreement,
              receipt, and landlord conversation in one place.”
            </blockquote>
            <p className="mt-6 text-sm font-bold text-forest-800">
              Amaka Okafor
            </p>
            <p className="text-sm text-muted">
              Verified renter · Yaba, Lagos
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              [Eye, "Verified viewing"],
              [MessageCircle, "Direct message"],
              [FileCheck2, "Signed lease"],
              [Wrench, "Tracked maintenance"],
            ].map(([Icon, label]) => {
              const ItemIcon = Icon as typeof Eye;
              return (
                <div key={String(label)} className="bg-sand-200 p-4">
                  <ItemIcon className="size-5 text-forest-700" />
                  <p className="mt-8 text-sm font-bold text-ink">
                    {String(label)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </SectionReveal>

      <section className="stitch-container pb-24">
        <div className="relative overflow-hidden rounded-[2rem] bg-forest-700 px-6 py-16 text-white sm:px-12 sm:py-20">
          <div className="absolute -right-20 -top-24 size-80 rounded-full border border-white/10" />
          <div className="absolute -bottom-40 right-24 size-96 rounded-full border border-lime/20" />
          <div className="relative max-w-3xl">
            <p className="text-xs font-bold tracking-[0.14em] text-lime">
              Start with proof
            </p>
            <h2 className="mt-4 text-balance text-4xl font-extrabold tracking-[-0.055em] sm:text-6xl">
              Find a home without paying for uncertainty.
            </h2>
            <p className="mt-5 max-w-xl text-sm leading-6 text-forest-100">
              Never send property money outside LinkConn Rent. No verified
              viewing, no property payment.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/properties"
                className="stitch-button bg-white text-forest-900 hover:bg-lime"
              >
                <Home className="size-4" /> Find a verified home
              </Link>
              {canList && (
                <Link
                  href="/dashboard/properties/new"
                  className="stitch-button border border-white/40 bg-transparent hover:bg-white/10"
                >
                  <CalendarDays className="size-4" /> List your property
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

function ImageStory({
  asset,
  eyebrow,
  title,
  body,
  points,
  href,
  linkLabel,
  reverse = false,
  dark = false,
}: {
  asset: { src: string; alt: string };
  eyebrow: string;
  title: string;
  body: string;
  points: string[];
  href: string;
  linkLabel: string;
  reverse?: boolean;
  dark?: boolean;
}) {
  const reducedMotion = useReducedMotion();
  return (
    <section className={dark ? "bg-forest-950 py-20 sm:py-28" : "py-20 sm:py-28"}>
      <div
        className={`stitch-container grid items-center gap-10 lg:grid-cols-2 ${
          dark ? "text-white" : ""
        }`}
      >
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, x: reverse ? 48 : -48 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          className={`relative aspect-[16/11] overflow-hidden rounded-[2rem] ${
            reverse ? "lg:order-2" : ""
          }`}
        >
          <motion.div
            className="absolute inset-0"
            whileHover={reducedMotion ? undefined : { scale: 1.035 }}
            transition={{ duration: 0.8 }}
          >
            <Image
              src={asset.src}
              alt={asset.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </motion.div>
        <motion.div
          initial={reducedMotion ? false : { opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, delay: 0.08 }}
          className="max-w-xl"
        >
          <p
            className={`text-xs font-bold tracking-[0.14em] ${
              dark ? "text-lime" : "text-forest-700"
            }`}
          >
            {eyebrow}
          </p>
          <h2 className="mt-4 text-balance text-4xl font-extrabold tracking-[-0.055em] sm:text-5xl">
            {title}
          </h2>
          <p
            className={`mt-5 leading-7 ${
              dark ? "text-forest-100" : "text-muted"
            }`}
          >
            {body}
          </p>
          <ul className="mt-7 space-y-3">
            {points.map((point) => (
              <li key={point} className="flex items-center gap-3 text-sm font-bold">
                <CircleCheck
                  className={`size-5 ${dark ? "text-lime" : "text-forest-600"}`}
                />
                {point}
              </li>
            ))}
          </ul>
          <Link
            href={href}
            className={`mt-8 inline-flex items-center gap-2 border-b pb-1 text-sm font-bold ${
              dark
                ? "border-lime text-lime"
                : "border-forest-600 text-forest-700"
            }`}
          >
            {linkLabel} <ArrowRight className="size-4" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function FlowList({
  items,
  dark = false,
}: {
  items: Array<[string, string]>;
  dark?: boolean;
}) {
  return (
    <ol className="mt-10">
      {items.map(([number, label]) => (
        <li
          key={number}
          className={`flex items-center gap-5 border-t py-4 text-sm font-bold ${
            dark ? "border-forest-900/15 text-ink" : "border-white/15 text-white"
          }`}
        >
          <span
            className={`text-xs tabular-nums ${
              dark ? "text-forest-700" : "text-lime"
            }`}
          >
            {number}
          </span>
          {label}
        </li>
      ))}
    </ol>
  );
}
