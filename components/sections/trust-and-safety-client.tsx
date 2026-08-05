"use client";

import type React from "react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BadgeCheck, CheckCircle2, CircleAlert, CreditCard, Gem, ScanFace, ShieldCheck } from "lucide-react";
import { Input, Textarea } from "@/components/ui/form-controls";

const verifications = [
  {
    level: "Unverified",
    color: "text-red-600 bg-red-50 border-red-100",
    icon: CircleAlert,
    desc: "Initial listing status. Property details are uploaded but have not undergone physical inspection or document checks. Exercise caution.",
  },
  {
    level: "Partially Verified",
    color: "text-amber-brand-700 bg-amber-brand-50 border-amber-brand-100",
    icon: CircleAlert,
    desc: "Landlord identity verified via national NIN/BVN data. Ownership papers uploaded and undergoing audit.",
  },
  {
    level: "Fully Verified",
    color: "text-brandgreen-700 bg-brandgreen-50 border-brandgreen-100",
    icon: BadgeCheck,
    desc: "Land title documents certified by our legal team. High trust listing.",
  },
  {
    level: "Trusted",
    color: "text-info bg-info-soft border-info/20",
    icon: Gem,
    desc: "Premium verified landlord status with a 4.8+ rating and 10+ successful, dispute-free tenancies completed via LinkConn Rent.",
  },
];

const safetyFaqs = [
  {
    q: "How does the Rent Escrow process work?",
    a: "When you pay rent via LinkConn Rent, the payment is held securely in escrow. It is released to the landlord only 24 hours after your move-in date, once you confirm the property condition matches the listing details. This prevents keyholder runaways and upfront fraud.",
  },
  {
    q: "Are there any physical inspections?",
    a: "Yes! Fully Verified properties undergo a physical check by our field inspectors. We verify the location coordinates, check basic utilities (water, power), and confirm the landlord is the actual caretaker.",
  },
  {
    q: "Why should I keep all messages in the chat?",
    a: "LinkConn Rent monitors chats for suspicious links and patterns to prevent fraud. Landlords requesting you to continue on WhatsApp, or offering offline discounts, might be attempting to bypass our escrow safety rules.",
  },
  {
    q: "How do I report a listing that seems fake?",
    a: "You can click 'Report Listing' on any property details page, or use the Report Scam form below. Our moderator team audits and removes flagged accounts in under 2 hours.",
  },
];

export default function TrustAndSafetyClient() {
  const [reportTitle, setReportTitle] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportTitle || !reportDesc) return;
    
    setReportSuccess(true);
    setReportTitle("");
    setReportDesc("");
    setTimeout(() => setReportSuccess(false), 5000);
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-12 lg:px-8 space-y-16">
      
      {/* Header section */}
      <div className="text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-brandgreen-600 bg-brandgreen-50 px-3.5 py-1.5 rounded-full">
          Platform Safety
        </span>
        <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
          Trust & Safety Guidelines
        </h1>
        <p className="mt-3 mx-auto max-w-xl text-sm leading-relaxed text-navy-500 font-semibold">
          Your protection is our highest priority. Learn how we eliminate rental scams and secure transactions in Nigeria.
        </p>
      </div>

      {/* Verification Level cards */}
      <div>
        <h2 className="text-xl font-extrabold text-navy-950 text-center sm:text-2xl">
          Verification Tiers Explained
        </h2>
        <p className="text-center text-xs text-navy-500 font-semibold mt-1.5 max-w-md mx-auto">
          We rate every property listing and landlord profile to show you the security level of each listing.
        </p>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {verifications.map((v) => (
            <div
              key={v.level}
              className={`rounded-2xl border p-5 bg-white shadow-sm flex flex-col justify-between`}
            >
              <div>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border ${v.color}`}>
                  <v.icon className="size-3.5" aria-hidden="true" /> {v.level}
                </span>
                <p className="mt-4 text-xs leading-relaxed text-navy-600 font-semibold">
                  {v.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Pillars */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-sm">
          <ShieldCheck className="size-7 text-primary" aria-hidden="true" />
          <h3 className="mt-4 text-base font-extrabold text-navy-950">Property Auditing</h3>
          <p className="mt-2 text-xs leading-relaxed text-navy-500 font-semibold">
            Our local field agents verify property details on-site. We confirm caretakers, take coordinates, and photograph utilities.
          </p>
        </div>
        <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-sm">
          <CreditCard className="size-7 text-primary" aria-hidden="true" />
          <h3 className="mt-4 text-base font-extrabold text-navy-950">Rent Escrow Holding</h3>
          <p className="mt-2 text-xs leading-relaxed text-navy-500 font-semibold">
            Funds remain safely locked in escrow and are released only 24 hours after checking in. No more disappearing landlords.
          </p>
        </div>
        <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-sm">
          <ScanFace className="size-7 text-primary" aria-hidden="true" />
          <h3 className="mt-4 text-base font-extrabold text-navy-950">Identity Verification</h3>
          <p className="mt-2 text-xs leading-relaxed text-navy-500 font-semibold">
            NIN, BVN, and CAC registrations of all landlords are audited against federal databases before listing approval.
          </p>
        </div>
      </div>

      {/* Report Form and Safety FAQs */}
      <div className="grid gap-8 md:grid-cols-2 items-start">
        
        {/* Scam report form */}
        <div className="rounded-3xl border border-navy-100 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-extrabold text-navy-950">Report Suspicious Activity</h3>
          <p className="mt-1 text-xs text-navy-500 font-semibold">
            Spotted a scam listing or a fraudulent landlord? Flag it instantly to our security team.
          </p>

          {reportSuccess ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 rounded-2xl bg-brandgreen-50 border border-brandgreen-200 p-6 text-center"
            >
              <CheckCircle2 className="mx-auto size-7 text-success" aria-hidden="true" />
              <h4 className="mt-2 text-sm font-bold text-brandgreen-950">Report Received</h4>
              <p className="mt-1 text-[11px] text-brandgreen-700 leading-normal">
                Our moderator team will review the details in under 2 hours. Thank you for keeping LinkConn Rent safe!
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleReportSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy-400">Subject / Listing ID</label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Fake listing at Lekki Phase 1"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="mt-2 text-xs font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy-400">Describe the Issue</label>
                <Textarea
                  rows={4}
                  required
                  placeholder="Please describe why this listing is suspicious (e.g. asking for offline BVN, fake pictures)..."
                  value={reportDesc}
                  onChange={(e) => setReportDesc(e.target.value)}
                  className="mt-2 min-h-28 resize-none text-xs font-semibold"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-xl bg-red-600 py-3 text-xs font-extrabold text-white shadow-md transition-colors hover:bg-red-750 cursor-pointer"
              >
                Submit Safety Report
              </button>
            </form>
          )}
        </div>

        {/* Safety FAQs */}
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-navy-950">Frequently Asked Questions</h3>
          
          <div className="space-y-3">
            {safetyFaqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-navy-100 bg-white overflow-hidden transition-all shadow-sm"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="flex w-full items-center justify-between p-4 text-left text-xs font-bold text-navy-900 hover:bg-navy-50 cursor-pointer select-none"
                  >
                    <span>{faq.q}</span>
                    <span>{isOpen ? "−" : "+"}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="border-t border-navy-50 p-4 text-xs leading-relaxed text-navy-500 font-semibold bg-navy-50/20">
                          {faq.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
