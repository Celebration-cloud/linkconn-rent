"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkle } from "../shared/icons";
import { CITIES, PROPERTY_TYPES, formatNaira } from "@/domain/constants/property";
import { Select } from "@/components/ui/form-controls";

const cityFactor: Record<string, number> = {
  Lagos: 1.4, Abuja: 1.3, "Port Harcourt": 1.0, Ibadan: 0.7, Enugu: 0.75, Kano: 0.6,
};
const typeBase: Record<string, number> = {
  Apartment: 1_600_000, Duplex: 3_400_000, "Self-Contain": 600_000, "Shared Apartment": 380_000,
  Studio: 850_000, Mansion: 16_000_000, Commercial: 5_000_000,
};

export default function AIEstimator() {
  const [city, setCity] = useState("Lagos");
  const [type, setType] = useState("Apartment");
  const [beds, setBeds] = useState(2);

  const estimate = useMemo(() => {
    const base = (typeBase[type] || 1_000_000) * (cityFactor[city] || 1.0);
    const v = base * (1 + (beds - 1) * 0.22);
    return {
      low: Math.round(v * 0.85 / 1000) * 1000,
      mid: Math.round(v / 1000) * 1000,
      high: Math.round(v * 1.18 / 1000) * 1000
    };
  }, [city, type, beds]);

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-navy-900 via-navy-900 to-navy-800 p-8 shadow-2xl sm:p-12">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-amber-brand-500/20 px-4 py-1.5 text-xs font-bold text-amber-brand-400">
                <Sparkle className="h-4 w-4" /> AI Rental Estimator · Coming Soon
              </div>
              <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Know a fair price before you list
              </h2>
              <p className="mt-4 text-navy-200">
                Our AI uses location, property type and live market trends to suggest a fair rent
                — protecting tenants from inflation and helping landlords price right.
              </p>

              <div className="mt-8 space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-navy-300">City</label>
                  <Select value={city} onChange={(e) => setCity(e.target.value)} className="mt-1.5 border-white/20 bg-white/10 text-white backdrop-blur focus:bg-white/15">
                    {CITIES.map((c) => <option key={c} className="text-navy-900">{c}</option>)}
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-navy-300">Type</label>
                    <Select value={type} onChange={(e) => setType(e.target.value)} className="mt-1.5 border-white/20 bg-white/10 text-white backdrop-blur focus:bg-white/15">
                      {PROPERTY_TYPES.map((t) => <option key={t} className="text-navy-900">{t}</option>)}
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wide text-navy-300">Bedrooms</label>
                    <div className="mt-1.5 flex items-center rounded-xl bg-white/10 backdrop-blur">
                      <button onClick={() => setBeds((b) => Math.max(1, b - 1))} className="px-4 py-3 text-lg font-bold text-white">−</button>
                      <span className="flex-1 text-center text-sm font-bold text-white">{beds}</span>
                      <button onClick={() => setBeds((b) => Math.min(8, b + 1))} className="px-4 py-3 text-lg font-bold text-white">+</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <motion.div
              key={estimate.mid}
              initial={{ scale: 0.96, opacity: 0.6 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 18 }}
              className="rounded-3xl bg-white p-7 text-center shadow-xl"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-navy-400">Estimated Annual Rent</p>
              <motion.div
                key={estimate.mid + "v"}
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="mt-2 text-4xl font-extrabold text-brandgreen-600 sm:text-5xl"
              >
                {formatNaira(estimate.mid)}
              </motion.div>
              <p className="mt-1 text-sm text-navy-500">per year</p>

              <div className="mt-6">
                <div className="flex justify-between text-xs font-semibold text-navy-500">
                  <span>{formatNaira(estimate.low)}</span>
                  <span>{formatNaira(estimate.high)}</span>
                </div>
                <div className="relative mt-2 h-2.5 rounded-full bg-navy-100">
                  <div className="absolute inset-y-0 left-[15%] right-[15%] rounded-full bg-gradient-to-r from-brandgreen-400 to-amber-brand-500" />
                  <motion.div layout className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-4 border-white bg-navy-900 shadow" style={{ left: "calc(50% - 10px)" }} />
                </div>
                <div className="mt-2 flex justify-between text-[10px] font-medium uppercase tracking-wide text-navy-400">
                  <span>Low</span><span>Fair Market</span><span>High</span>
                </div>
              </div>

              <div className="mt-6 rounded-xl bg-brandgreen-50 p-3 text-xs font-medium text-brandgreen-700">
                ✨ Based on 430 comparable listings in {city}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
