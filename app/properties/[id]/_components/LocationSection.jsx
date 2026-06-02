"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import dynamic from "next/dynamic";

const MapSection = dynamic(() => import("./MapSection"), { ssr: false });

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function LocationSection({ property }) {
  if (!property) return null;

  const { address, city, state, lat, lng, country } = property;

  return (
    <motion.section
      id="Location"
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true }}
      className="scroll-mt-24"
    >
      <h2 className="text-3xl font-bold mb-4 text-blue-900 dark:text-blue-400">
        Location
      </h2>

      <div className="rounded-2xl bg-white/80 dark:bg-black/60 border border-gray-200 dark:border-white/10 p-6 backdrop-blur-xl">
        <div className="flex items-center mb-4 text-gray-700 dark:text-gray-300">
          <MapPin
            size={20}
            className="mr-2 text-yellow-700 dark:text-yellow-600 shrink-0"
          />
          <span className="truncate">
            {address || "N/A"}, {city || "N/A"}, {state || "N/A"}
          </span>
        </div>

        <div className="rounded-xl overflow-hidden h-64 relative border border-gray-200 dark:border-white/10">
          <div className="inset-0">
            <MapSection
              lat={lat}
              lng={lng}
              address={address}
              city={city}
              country={country}
            />
          </div>
        </div>
      </div>
    </motion.section>
  );
}
