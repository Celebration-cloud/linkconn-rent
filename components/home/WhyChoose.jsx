"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Coins, PieChart, FileText } from "lucide-react";

const reasons = [
  {
    icon: ShieldCheck,
    title: "Verified Listings",
    desc: "Every property and landlord undergoes rigorous multi-layer verification before going live.",
    bg: "bg-green-50 dark:bg-green-950/30",
    iconBg: "bg-green-100 dark:bg-green-950 text-green-600 dark:text-green-400",
    accent: "text-green-600 dark:text-green-400",
    border: "hover:border-green-200 dark:hover:border-green-800",
    num: "01",
  },
  {
    icon: Coins,
    title: "Zero Hidden Fees",
    desc: "Bypass agent commissions entirely. Pay only your rent — directly to the landlord.",
    bg: "bg-indigo-50 dark:bg-indigo-950/30",
    iconBg:
      "bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400",
    accent: "text-indigo-600 dark:text-indigo-400",
    border: "hover:border-indigo-200 dark:hover:border-indigo-800",
    num: "02",
  },
  {
    icon: PieChart,
    title: "Seamless Management",
    desc: "Track rent payments, maintenance requests, and tenancy agreements from one dashboard.",
    bg: "bg-purple-50 dark:bg-purple-950/30",
    iconBg:
      "bg-purple-100 dark:bg-purple-950 text-purple-600 dark:text-purple-400",
    accent: "text-purple-600 dark:text-purple-400",
    border: "hover:border-purple-200 dark:hover:border-purple-800",
    num: "03",
  },
  {
    icon: FileText,
    title: "Digital Leases",
    desc: "Sign and store agreements digitally, with auto-renewal reminders and instant notifications.",
    bg: "bg-blue-50 dark:bg-blue-950/30",
    iconBg: "bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400",
    accent: "text-blue-600 dark:text-blue-400",
    border: "hover:border-blue-200 dark:hover:border-blue-800",
    num: "04",
  },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const card = {
  hidden: { opacity: 0, y: 28 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 80, damping: 14 },
  },
};

export default function WhyChoose() {
  return (
    <section className="w-full py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-widest mb-2">
            Why LinkConn
          </p>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
            The modern approach to Nigerian real estate
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium max-w-lg mx-auto">
            Everything you need to rent or list property safely — in one place.
          </p>
        </div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          initial="hidden"
          variants={container}
          viewport={{ once: true, margin: "-80px" }}
          whileInView="show"
        >
          {reasons.map((item) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={item.num}
                className={`relative p-8 rounded-3xl border border-transparent ${item.border} ${item.bg} transition-all duration-300 shadow-sm hover:shadow-md group cursor-default overflow-hidden`}
                variants={card}
                whileHover={{ y: -6 }}
              >
                {/* Ghost number */}
                <span
                  className={`absolute top-4 right-5 text-6xl font-black opacity-[0.06] select-none ${item.accent}`}
                >
                  {item.num}
                </span>

                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${item.iconBg}`}
                >
                  <Icon className="w-6 h-6" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
