"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PropertyCard from "../shared/property-card";
import PropertyModal from "../shared/property-modal";
import { PROPERTY_TYPES, CITIES } from "@/domain/constants/property";
import type { Property } from "@/domain/types/property";
import { Heart } from "../shared/icons";
import { Select } from "@/components/ui/form-controls";
import { Search } from "lucide-react";

const priceRanges = [
  { label: "Any Price", min: 0, max: Infinity },
  { label: "Under ₦1M", min: 0, max: 1_000_000 },
  { label: "₦1M – ₦3M", min: 1_000_000, max: 3_000_000 },
  { label: "₦3M – ₦6M", min: 3_000_000, max: 6_000_000 },
  { label: "₦6M+", min: 6_000_000, max: Infinity },
];

export default function Discover({ initialProperties }: { initialProperties: Property[] }) {
  const [city, setCity] = useState("All");
  const [type, setType] = useState("All");
  const [range, setRange] = useState(0);
  const [bedrooms, setBedrooms] = useState(0);
  const [saved, setSaved] = useState<number[]>([]);
  const [active, setActive] = useState<Property | null>(null);

  const filtered = useMemo(() => {
    const r = priceRanges[range];
    return initialProperties.filter(
      (p) =>
        (city === "All" || p.city === city) &&
        (type === "All" || p.type === type) &&
        p.price >= r.min &&
        p.price <= r.max &&
        (bedrooms === 0 || p.bedrooms >= bedrooms)
    );
  }, [city, type, range, bedrooms, initialProperties]);

  // Convert id string hash to dynamic toggle
  const toggle = (id: number) =>
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const chip = (activeState: boolean) =>
    `rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
      activeState ? "bg-navy-900 text-white" : "bg-white text-navy-600 hover:bg-navy-100 border border-navy-100"
    }`;

  return (
    <section id="discover" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-sm font-bold uppercase tracking-widest text-brandgreen-600">Discover</span>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
              Verified homes, ready to rent
            </h2>
          </motion.div>
          <div className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-semibold text-red-500">
            <Heart className="h-4 w-4" filled /> {saved.length} saved
          </div>
        </div>

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 space-y-4 rounded-3xl border border-navy-100 bg-navy-50/40 p-5"
        >
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-navy-400">City</p>
            <div className="flex flex-wrap gap-2">
              <button className={chip(city === "All")} onClick={() => setCity("All")}>All</button>
              {CITIES.map((c) => (
                <button key={c} className={chip(city === c)} onClick={() => setCity(c)}>{c}</button>
              ))}
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-navy-400">Type</p>
              <Select value={type} onChange={(e) => setType(e.target.value)}>
                <option>All</option>
                {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
              </Select>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-navy-400">Price Range</p>
              <Select value={range} onChange={(e) => setRange(Number(e.target.value))}>
                {priceRanges.map((r, i) => <option key={r.label} value={i}>{r.label}</option>)}
              </Select>
            </div>
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide text-navy-400">Min Bedrooms</p>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4].map((b) => (
                  <button key={b} onClick={() => setBedrooms(b)} className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors cursor-pointer ${bedrooms === b ? "bg-brandgreen-500 text-white" : "bg-white text-navy-600 border border-navy-100"}`}>
                    {b === 0 ? "Any" : `${b}+`}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <p className="mt-6 text-sm font-medium text-navy-500">{filtered.length} {filtered.length === 1 ? "property" : "properties"} found</p>

        <motion.div layout className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((p, idx) => (
              <PropertyCard
                key={p.id}
                p={p}
                saved={saved.includes(idx)}
                onToggle={() => toggle(idx)}
                onOpen={() => setActive(p)}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {filtered.length === 0 && (
          <div className="mt-10 rounded-3xl border border-dashed border-navy-200 bg-navy-50 py-16 text-center">
            <Search className="mx-auto size-9 text-content-muted" aria-hidden="true" />
            <p className="mt-3 font-semibold text-navy-700">No properties match your filters</p>
            <p className="text-sm text-navy-500">Try widening your search</p>
          </div>
        )}
      </div>

      <PropertyModal p={active} onClose={() => setActive(null)} />
    </section>
  );
}
