"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Bed, Bath, Area, Pin, Star, Heart, Verified } from "./icons";
import { formatNaira } from "@/domain/constants/property";
import type { Property } from "@/domain/types/property";
import { useRequireAuth } from "@/hooks/use-require-auth";

export default function PropertyCard({
  p,
  saved,
  onToggle,
  onOpen,
}: {
  p: Property;
  saved: boolean;
  onToggle: () => void;
  onOpen: () => void;
}) {
  const { requireAuth } = useRequireAuth();
  const handleToggle = () => requireAuth(onToggle);
  const handleOpen = () => requireAuth(onOpen);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.35 }}
      whileHover={{ y: -8 }}
      className="group overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm transition-shadow hover:shadow-2xl hover:shadow-navy-900/15"
    >
      <div className="relative overflow-hidden">
        <Image
          src={p.image}
          alt={p.title}
          width={1448}
          height={1086}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
          className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-wrap gap-2">
            {p.featured && (
              <span className="rounded-full bg-amber-brand-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white shadow">
                Featured
              </span>
            )}
            {p.verified && (
              <span className="flex items-center gap-1 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-brandgreen-700 shadow backdrop-blur">
                <Verified className="h-3.5 w-3.5" /> Verified
              </span>
            )}
          </div>
          <motion.button
            whileTap={{ scale: 0.8 }}
            onClick={handleToggle}
            className={`flex h-9 w-9 items-center justify-center rounded-full backdrop-blur transition-colors ${
              saved ? "bg-red-500 text-white" : "bg-white/90 text-navy-600 hover:text-red-500"
            }`}
            aria-label="Save"
          >
            <Heart className="h-4.5 w-4.5" filled={saved} />
          </motion.button>
        </div>
        <div className="absolute bottom-3 left-3 rounded-xl bg-navy-950/85 px-3 py-1.5 backdrop-blur">
          <span className="text-base font-extrabold text-white">{formatNaira(p.price)}</span>
          <span className="text-xs font-medium text-navy-200">/{p.period}</span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="rounded-md bg-navy-50 px-2 py-0.5 text-[11px] font-semibold text-navy-600">{p.type}</span>
          <span className="flex items-center gap-1 text-xs font-semibold text-amber-brand-600">
            <Star className="h-3.5 w-3.5" /> {p.rating}
          </span>
        </div>
        <h3 className="mt-2 truncate text-base font-bold text-navy-900">{p.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-navy-500">
          <Pin className="h-4 w-4 shrink-0 text-navy-400" /> {p.location}, {p.city}
        </p>

        <div className="mt-3 flex items-center gap-4 border-t border-navy-100 pt-3 text-xs font-medium text-navy-600">
          <span className="flex items-center gap-1.5"><Bed className="h-4 w-4 text-navy-400" /> {p.bedrooms}</span>
          <span className="flex items-center gap-1.5"><Bath className="h-4 w-4 text-navy-400" /> {p.bathrooms}</span>
          <span className="flex items-center gap-1.5"><Area className="h-4 w-4 text-navy-400" /> {p.area}m²</span>
        </div>

        <button
          onClick={handleOpen}
          className="mt-4 w-full rounded-xl bg-navy-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brandgreen-600"
        >
          View Details
        </button>
      </div>
    </motion.div>
  );
}
