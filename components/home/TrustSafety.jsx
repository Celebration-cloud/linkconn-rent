"use client";

import { motion } from "framer-motion";
import {
  ShieldCheck, UserCheck, Home, BadgeCheck,
  ShieldAlert, Siren, Star, Check,
} from "lucide-react";

const safetyFeatures = [
  { icon: UserCheck, title: "Identity Verification", desc: "Every user confirms a valid government ID before any transaction.", color: "text-blue-500" },
  { icon: Home, title: "Ownership Verification", desc: "Landlords submit title documents we cross-check before listings go live.", color: "text-amber-600" },
  { icon: BadgeCheck, title: "Verified Badges", desc: "The green badge means a property passed every check — guaranteed.", color: "text-green-500" },
  { icon: ShieldAlert, title: "Fraud Detection", desc: "Smart signals flag duplicate, fake or suspicious listings automatically.", color: "text-rose-500" },
  { icon: Siren, title: "Report & Moderation", desc: "One-tap reporting with a dedicated admin team on duty 24 / 7.", color: "text-indigo-500" },
  { icon: Star, title: "Reviews & Ratings", desc: "Mutual tenant and landlord reviews build an accountable trust layer.", color: "text-yellow-500" },
];

const bullets = [
  "100% of featured listings are verified",
  "Zero tolerance for fraudulent posts",
  "Dedicated dispute resolution team",
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.09 } },
};
const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 80, damping: 14 } },
};

export default function TrustSafety() {
  return (
    <section className="w-full py-24 bg-slate-50 dark:bg-slate-900/60">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-14 items-start">

        {/* ── Left: copy ─────────────────────────────────────────────── */}
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -28 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
        >
          {/* Label */}
          <div className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-950 text-green-700 dark:text-green-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3 h-3" />
            Trust &amp; Safety First
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white mb-5 leading-tight">
            We kill fake listings &amp; rental scams
          </h2>
          <p className="text-slate-600 dark:text-slate-300 mb-8 leading-relaxed text-[15px]">
            Multi-layer verification, AI fraud detection, and active 24/7 moderation mean what you see is exactly what you get.
          </p>

          {/* Bullets */}
          <ul className="space-y-3 mb-8">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3 h-3 stroke-[3]" />
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{b}</span>
              </li>
            ))}
          </ul>

          {/* Trust score badge */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 w-fit">
            <div className="w-11 h-11 bg-green-50 dark:bg-green-950 rounded-xl flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">Trust Score: A+</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">Based on 8,000+ verified transactions</p>
            </div>
          </div>
        </motion.div>

        {/* ── Right: feature grid ─────────────────────────────────────── */}
        <motion.div
          className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4"
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
        >
          {safetyFeatures.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={i}
                variants={item}
                whileHover={{ y: -4 }}
                className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 hover:border-green-200 dark:hover:border-green-900 hover:shadow-md transition-all"
              >
                <div className={`${f.color} mb-3`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5">{f.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>

      </div>
    </section>
  );
}
