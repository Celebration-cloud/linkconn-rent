"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  CalendarDays,
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

export default function HowItWorksClient() {
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
          </div>
        </div>
      </section>

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
        </AnimatePresence>
      </section>

      <section className="stitch-container">
        <div className="grid gap-8 bg-forest-800 px-6 py-10 text-white sm:px-10 lg:grid-cols-[1fr_auto] lg:items-center">
          <div><h2 className="text-3xl font-extrabold tracking-[-.03em]">Start with the next accountable action.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-forest-100">Browse available homes or create the account that matches your role.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/properties" className="stitch-button bg-lime text-forest-950 hover:bg-white">Browse homes <ArrowRight className="size-4" /></Link><Link href="/signup" className="stitch-button border border-white/20 bg-transparent hover:bg-white/10">Create account</Link></div>
        </div>
      </section>
    </main>
  );
}
