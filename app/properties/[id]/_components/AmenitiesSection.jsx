"use client";

import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function AmenitiesSection({ amenities = [] }) {
  if (!amenities.length) return null;

  return (
    <motion.section
      className="scroll-mt-24"
      id="Amenities"
      initial="hidden"
      variants={fadeUp}
      viewport={{ once: true }}
      whileInView="show"
    >
      <h2 className="text-3xl font-bold mb-4 text-blue-900 dark:text-blue-400">
        Amenities
      </h2>

      <div className="flex flex-wrap gap-2">
        {amenities.map((item, index) => (
          <motion.span
            key={item}
            animate={{ opacity: 1, y: 0 }}
            className="
              px-3 py-1 rounded-full
              bg-black/5 dark:bg-white/5
              border border-black/10 dark:border-white/10
              text-sm text-gray-900 dark:text-gray-200
              hover:text-yellow-700 dark:hover:text-yellow-400
              transition
            "
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: 0.05 * index }}
            whileHover={{
              scale: 1.05,
              backgroundColor: "rgba(234,179,8,0.15)",
            }}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </motion.span>
        ))}
      </div>
    </motion.section>
  );
}
