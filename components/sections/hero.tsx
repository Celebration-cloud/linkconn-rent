"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Search, Verified, Star } from "../shared/icons";
import { CITIES, PROPERTY_TYPES } from "@/domain/constants/property";
import { Home, MapPin } from "lucide-react";
import { Select } from "@/components/ui/form-controls";

const stats = [
  { value: "12,400+", label: "Verified Homes" },
  { value: "₦0", label: "Agent Fees" },
  { value: "8,900+", label: "Happy Tenants" },
  { value: "36", label: "Cities Covered" },
];

export default function Hero() {
  const [city, setCity] = useState("");
  const [type, setType] = useState("");

  return (
    <section id="top" className="relative overflow-hidden bg-gradient-to-b from-sand-200 via-sand-100 to-sand-50 pt-28 pb-20 lg:pt-36">
      {/* decorative blobs */}
      <div className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-brandgreen-400/20 blur-3xl" />
      <div className="pointer-events-none absolute right-0 top-40 h-80 w-80 rounded-full bg-amber-brand-400/20 blur-3xl" />

      <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white/70 px-4 py-1.5 text-xs font-semibold text-navy-700 backdrop-blur"
          >
            <span className="flex h-2 w-2 rounded-full bg-brandgreen-500" />
            Rent direct from landlords — no agent wahala
          </motion.span>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-navy-950 sm:text-5xl lg:text-6xl"
          >
            Find your next home,
            <span className="relative whitespace-nowrap">
              {" "}
              <span className="relative z-10 text-brandgreen-600">verified</span>
              <motion.svg
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.8 }}
                viewBox="0 0 200 12"
                className="absolute -bottom-1 left-0 w-full"
              >
                <motion.path d="M2 8 Q100 2 198 8" stroke="#b8e36e" strokeWidth="4" fill="none" strokeLinecap="round" />
              </motion.svg>
            </span>{" "}
            & scam-free.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mt-5 max-w-lg text-lg leading-relaxed text-navy-600"
          >
            LinkConn Rent connects tenants directly with landlords across Nigeria.
            Discover verified listings, chat securely, and manage rent — all in one place.
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="mt-8 rounded-2xl border border-navy-100 bg-white p-2 shadow-xl shadow-navy-900/10"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="flex-1">
                <Select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  leadingIcon={MapPin}
                >
                  <option value="">Any City</option>
                  {CITIES.map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </Select>
              </div>
              <div className="flex-1">
                <Select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  leadingIcon={Home}
                >
                  <option value="">Any Type</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                </Select>
              </div>
              <motion.a
                href="#discover"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center justify-center gap-2 rounded-xl bg-brandgreen-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-brandgreen-500/30"
              >
                <Search className="h-5 w-5" /> Search
              </motion.a>
            </div>
          </motion.div>

          {/* stats */}
          <div className="mt-10 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 + i * 0.08 }}
              >
                <div className="text-2xl font-extrabold text-navy-900">{s.value}</div>
                <div className="text-xs font-medium text-navy-500">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* visual */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="relative"
        >
          <div className="relative overflow-hidden rounded-[2rem] border-4 border-white shadow-2xl shadow-navy-900/25">
            <Image
              src="/images/hero.jpg"
              alt="Modern apartment"
              width={1200}
              height={900}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="h-[460px] w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 to-transparent" />
          </div>

          {/* floating verified card */}
          <motion.div
            animate={{ y: [0, -12, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -left-4 top-10 flex items-center gap-3 rounded-2xl border border-navy-100 bg-white/95 p-3 shadow-xl backdrop-blur"
          >
            <Verified className="h-9 w-9" />
            <div>
              <div className="text-xs font-bold text-navy-900">Ownership Verified</div>
              <div className="text-[11px] text-navy-500">Title & ID confirmed</div>
            </div>
          </motion.div>

          {/* floating price card */}
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -right-3 bottom-12 rounded-2xl border border-navy-100 bg-white/95 p-4 shadow-xl backdrop-blur"
          >
            <div className="flex items-center gap-1 text-amber-brand-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-3.5 w-3.5" />
              ))}
            </div>
            <div className="mt-1 text-lg font-extrabold text-navy-900">₦4.5M<span className="text-xs font-medium text-navy-500">/yr</span></div>
            <div className="text-[11px] text-navy-500">3-Bed Duplex · Lekki</div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
