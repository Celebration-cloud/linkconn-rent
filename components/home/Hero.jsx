"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Building2,
  Coins,
  Search,
  ShieldCheck,
  Star,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

// ─── Animation Variants ──────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: "easeOut", delay },
  }),
};

const fadeLeft = {
  hidden: { opacity: 0, x: -40 },
  show: { opacity: 1, x: 0, transition: { duration: 0.65, ease: "easeOut" } },
};

const fadeRight = {
  hidden: { opacity: 0, x: 40 },
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.75, ease: "easeOut", delay: 0.15 },
  },
};

// ─── Stats data ───────────────────────────────────────────────────────────────
const stats = [
  { value: "12,400+", label: "Verified Homes" },
  { value: "₦0", label: "Agent Fees" },
  { value: "8,000+", label: "Happy Users" },
  { value: "100%", label: "Scam-free" },
];

export default function Hero() {
  const router = useRouter();
  const [location, setLocation] = useState("");
  const [propertyType, setPropertyType] = useState("Any Type");
  const [budget, setBudget] = useState("Any Budget");

  const handleSearch = (e) => {
    e.preventDefault();
    const query = new URLSearchParams();
    if (location) query.set("location", location);
    if (propertyType && propertyType !== "Any Type")
      query.set("type", propertyType.toLowerCase());
    if (budget && budget !== "Any Budget") {
      const map = {
        "Under 1M": "under_1m",
        "1M - 5M": "1m_5m",
        "Above 5M": "above_5m",
      };
      query.set("budget", map[budget] || budget);
    }
    router.push(`/properties?${query.toString()}`);
  };

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#f0f7ff] via-white to-[#f5fff8] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 pt-14 pb-28">

      {/* ── Decorative background blobs ─────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] bg-green-200/30 dark:bg-green-900/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 right-0 w-[420px] h-[420px] bg-blue-200/20 dark:bg-blue-900/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-100/20 dark:bg-emerald-900/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

        {/* ══════════════════════════════════════════════════════════════════
            LEFT COLUMN — Copy, search form, stats
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          className="flex flex-col items-start text-left"
          variants={fadeLeft}
          initial="hidden"
          animate="show"
        >

          {/* Live badge */}
          <motion.div
            className="inline-flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full border border-green-200 dark:border-green-800 shadow-sm mb-7"
            variants={fadeUp}
            custom={0}
            initial="hidden"
            animate="show"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-300 uppercase tracking-widest">
              Verified listings — No agent middleman
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            className="text-[2.8rem] sm:text-5xl lg:text-[3.6rem] font-extrabold text-slate-900 dark:text-white leading-[1.08] tracking-tight mb-5"
            variants={fadeUp}
            custom={0.05}
            initial="hidden"
            animate="show"
          >
            Find your next home,{" "}
            <span className="text-green-600 dark:text-green-400 brush-underline">
              verified
            </span>{" "}
            &amp; scam-free.
          </motion.h1>

          {/* Sub-copy */}
          <motion.p
            className="text-[1.05rem] text-slate-500 dark:text-slate-400 mb-9 max-w-[480px] leading-relaxed"
            variants={fadeUp}
            custom={0.1}
            initial="hidden"
            animate="show"
          >
            LinkConn Rent connects tenants directly with landlords across
            Nigeria. Browse{" "}
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              verified listings
            </span>
            , pay zero agent fees, and manage your tenancy digitally.
          </motion.p>

          {/* ── Search form ──────────────────────────────────────────────── */}
          <motion.form
            onSubmit={handleSearch}
            className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.10)] border border-slate-100 dark:border-slate-800 p-2 flex flex-col sm:flex-row items-stretch gap-2"
            variants={fadeUp}
            custom={0.18}
            initial="hidden"
            animate="show"
          >
            {/* Location */}
            <div className="flex-1 flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3 min-w-0">
              <MapPin className="w-4 h-4 text-green-500 shrink-0" />
              <div className="flex flex-col min-w-0">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.12em] mb-0.5">
                  Location
                </label>
                <input
                  className="text-[13px] font-semibold text-slate-800 dark:text-white bg-transparent outline-none placeholder:text-slate-300 dark:placeholder:text-slate-600 w-full truncate"
                  placeholder="Lagos, Abuja, PH…"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px bg-slate-100 dark:bg-slate-800 self-stretch my-1" />

            {/* Property Type */}
            <div className="flex-1 flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3 min-w-0">
              <Building2 className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="flex flex-col min-w-0 w-full">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.12em] mb-0.5">
                  Property Type
                </label>
                <select
                  className="text-[13px] font-semibold text-slate-800 dark:text-white bg-transparent outline-none appearance-none cursor-pointer w-full"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                >
                  <option className="dark:bg-slate-900">Any Type</option>
                  <option className="dark:bg-slate-900">Apartment</option>
                  <option className="dark:bg-slate-900">Duplex</option>
                  <option className="dark:bg-slate-900">Studio</option>
                </select>
              </div>
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px bg-slate-100 dark:bg-slate-800 self-stretch my-1" />

            {/* Budget */}
            <div className="flex-1 flex items-center gap-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl px-4 py-3 min-w-0">
              <Coins className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="flex flex-col min-w-0 w-full">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.12em] mb-0.5">
                  Budget / Year
                </label>
                <select
                  className="text-[13px] font-semibold text-slate-800 dark:text-white bg-transparent outline-none appearance-none cursor-pointer w-full"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                >
                  <option className="dark:bg-slate-900">Any Budget</option>
                  <option className="dark:bg-slate-900">Under 1M</option>
                  <option className="dark:bg-slate-900">1M - 5M</option>
                  <option className="dark:bg-slate-900">Above 5M</option>
                </select>
              </div>
            </div>

            {/* Search CTA */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 active:scale-95 text-white px-6 py-3 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-200 dark:shadow-green-900/30 cursor-pointer whitespace-nowrap shrink-0"
            >
              <Search className="w-4 h-4" />
              Search
            </button>
          </motion.form>

          {/* Quick-link tags */}
          <motion.div
            className="flex flex-wrap items-center gap-2 mt-4"
            variants={fadeUp}
            custom={0.24}
            initial="hidden"
            animate="show"
          >
            <span className="text-[11px] text-slate-400 font-medium mr-1">Popular:</span>
            {["Lagos Island", "Lekki", "Maitama", "Wuse II", "Victoria Island"].map(
              (city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setLocation(city);
                    router.push(
                      `/properties?location=${encodeURIComponent(city)}`
                    );
                  }}
                  className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-green-600 dark:hover:text-green-400 border border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-700 px-3 py-1 rounded-full transition-all cursor-pointer"
                >
                  {city}
                </button>
              )
            )}
          </motion.div>

          {/* ── Stats row ────────────────────────────────────────────────── */}
          <motion.div
            className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-x-8 gap-y-5"
            variants={fadeUp}
            custom={0.3}
            initial="hidden"
            animate="show"
          >
            {stats.map((s, i) => (
              <div key={i} className="flex flex-col">
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white leading-none">
                  {s.value}
                </span>
                <span className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {s.label}
                </span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ══════════════════════════════════════════════════════════════════
            RIGHT COLUMN — Image + floating cards
        ══════════════════════════════════════════════════════════════════ */}
        <motion.div
          className="relative hidden lg:flex items-center justify-center"
          variants={fadeRight}
          initial="hidden"
          animate="show"
        >
          {/* Ambient glow behind image */}
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-green-200/40 to-blue-200/20 dark:from-green-900/20 dark:to-blue-900/10 rounded-[2.5rem] blur-2xl scale-105" />

          {/* Main image */}
          <div className="relative w-full h-[500px] rounded-[2.5rem] overflow-hidden shadow-2xl ring-1 ring-slate-200/60 dark:ring-slate-700/40">
            <Image
              alt="Modern verified apartment building in Nigeria"
              className="object-cover scale-[1.06] hover:scale-[1.09] transition-transform duration-700"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC2KqtKwAyNBNuRATjt6kd0b5AlWWxQowPofxRXzsl-t2FgxpU-YXWZIIz3X11bj2K85McBLBRXL5zvUNdsDdKa9mGM2Lnr8DJzpQr9L6fyt5I3D-TfQncppVDRO_ZuD3OsKsyDaUKAZyfo1Bd808XNhnKWt1YA9IRSBETMe7fLFvrg9_uGBistTSDc0vyhJdWFZCG3vUSN621o_BP9xR8z3p0Q_UHCrw7av1tIGcYWcMqRMf4dDHzTDPnz-rep5RcV293Yuh5Zfi0"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Overlay gradient at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 via-transparent to-transparent" />

            {/* Bottom label inside image */}
            <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between">
              <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl px-4 py-2.5 shadow-lg">
                <p className="text-xs font-bold text-slate-900 dark:text-white">The Emerald Residences</p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <MapPin className="w-2.5 h-2.5" /> Ikoyi, Lagos
                </p>
              </div>
              <div className="bg-green-500 text-white rounded-xl px-3 py-2.5 shadow-lg text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide">From</p>
                <p className="text-sm font-extrabold">₦4.5M/yr</p>
              </div>
            </div>
          </div>

          {/* ── Floating card: Verified badge ─────────────────────────── */}
          <motion.div
            className="absolute -top-5 -left-6 bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5, ease: "easeOut" }}
          >
            <div className="w-9 h-9 rounded-xl bg-green-100 dark:bg-green-950 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-slate-900 dark:text-white">
                100% Verified
              </p>
              <p className="text-[9px] text-slate-400">Owner confirmed</p>
            </div>
          </motion.div>

          {/* ── Floating card: Rating ──────────────────────────────────── */}
          <motion.div
            className="absolute -bottom-4 -right-5 bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-xl border border-slate-100 dark:border-slate-700"
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.75, duration: 0.5, ease: "easeOut" }}
          >
            <div className="flex items-center gap-1 mb-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-3 h-3 fill-amber-400 text-amber-400"
                />
              ))}
            </div>
            <p className="text-[11px] font-extrabold text-slate-900 dark:text-white">
              4.9 / 5.0
            </p>
            <p className="text-[9px] text-slate-400">8,200+ reviews</p>
          </motion.div>

          {/* ── Floating card: Market trend ────────────────────────────── */}
          <motion.div
            className="absolute top-1/2 -translate-y-1/2 -right-8 bg-white dark:bg-slate-800 rounded-2xl px-4 py-3 shadow-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3"
            initial={{ opacity: 0, x: 20, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ delay: 0.9, duration: 0.5, ease: "easeOut" }}
          >
            <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-[11px] font-extrabold text-green-600 dark:text-green-400">
                +12.4%
              </p>
              <p className="text-[9px] text-slate-400">Market growth</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* ── Bottom wave separator ─────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none overflow-hidden leading-none">
        <svg
          viewBox="0 0 1440 48"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-12 text-white dark:text-slate-900"
          preserveAspectRatio="none"
        >
          <path
            d="M0,48 L0,24 C240,0 480,48 720,24 C960,0 1200,48 1440,24 L1440,48 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </section>
  );
}
