"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Bed, Bath, Area, Pin, Star, Verified, Close, Check, Chat } from "./icons";
import { formatNaira } from "@/domain/constants/property";
import type { Property } from "@/domain/types/property";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function PropertyModal({ p, onClose }: { p: Property | null; onClose: () => void }) {
  const { requireAuth } = useRequireAuth();

  return (
    <AnimatePresence>
      {p && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[60] flex items-end justify-center bg-navy-950/60 p-0 backdrop-blur-sm sm:items-center sm:p-6"
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 26, stiffness: 280 }}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white sm:rounded-3xl"
          >
            <div className="relative">
              <Image
                src={p.image}
                alt={p.title}
                width={1448}
                height={1086}
                sizes="(max-width: 768px) 100vw, 768px"
                className="h-64 w-full object-cover sm:h-72"
              />
              <button
                onClick={onClose}
                className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-navy-800 shadow backdrop-blur hover:bg-white"
              >
                <Close className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-4 flex gap-2">
                {p.verified && (
                  <span className="flex items-center gap-1 rounded-full bg-brandgreen-500 px-3 py-1 text-xs font-bold text-white shadow">
                    <Verified className="h-4 w-4" /> Verified Listing
                  </span>
                )}
              </div>
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="rounded-md bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-600">{p.type}</span>
                  <h2 className="mt-2 text-2xl font-extrabold text-navy-950">{p.title}</h2>
                  <p className="mt-1 flex items-center gap-1 text-sm text-navy-500">
                    <Pin className="h-4 w-4 text-navy-400" /> {p.location}, {p.city}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-extrabold text-brandgreen-600">{formatNaira(p.price)}</div>
                  <div className="text-xs text-navy-500">per {p.period}</div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { icon: Bed, label: "Bedrooms", v: p.bedrooms },
                  { icon: Bath, label: "Bathrooms", v: p.bathrooms },
                  { icon: Area, label: "Area", v: `${p.area}m²` },
                ].map((s) => (
                  <div key={s.label} className="rounded-2xl bg-navy-50 p-3 text-center">
                    <s.icon className="mx-auto h-5 w-5 text-navy-500" />
                    <div className="mt-1 text-lg font-bold text-navy-900">{s.v}</div>
                    <div className="text-[11px] text-navy-500">{s.label}</div>
                  </div>
                ))}
              </div>

              <p className="mt-5 text-sm leading-relaxed text-navy-600">{p.description}</p>

              <h4 className="mt-5 text-sm font-bold text-navy-900">Amenities</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {p.amenities.map((a) => (
                  <span key={a} className="flex items-center gap-1.5 rounded-full bg-brandgreen-50 px-3 py-1.5 text-xs font-medium text-brandgreen-700">
                    <Check className="h-3.5 w-3.5" /> {a}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-navy-100 bg-navy-50/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-navy-900 text-sm font-bold text-white">
                    {p.landlord.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-navy-900">{p.landlord}</div>
                    <div className="flex items-center gap-1 text-xs text-amber-brand-600">
                      <Star className="h-3.5 w-3.5" /> {p.rating} · Verified Landlord
                    </div>
                  </div>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-bold ${p.status === "Available" ? "bg-brandgreen-100 text-brandgreen-700" : "bg-navy-100 text-navy-600"}`}>
                  {p.status}
                </span>
              </div>

              <div className="mt-5 flex gap-3">
                <button onClick={() => requireAuth(() => alert("Opening chat with " + p.landlord))} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-brandgreen-500 py-3 text-sm font-bold text-white shadow-lg shadow-brandgreen-500/30 hover:bg-brandgreen-600">
                  <Chat className="h-5 w-5" /> Message Landlord
                </button>
                <button onClick={() => requireAuth(() => alert("Scheduling a viewing for " + p.title))} className="flex-1 rounded-xl border-2 border-navy-900 py-3 text-sm font-bold text-navy-900 hover:bg-navy-50">
                  Schedule Viewing
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
