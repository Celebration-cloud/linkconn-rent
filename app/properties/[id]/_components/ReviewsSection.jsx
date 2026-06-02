"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

export default function ReviewsSection({ rating }) {
  return (
    <motion.section
      className="scroll-mt-24"
      id="Reviews"
      initial="hidden"
      variants={fadeUp}
      viewport={{ once: true }}
      whileInView="show"
    >
      <h2 className="text-3xl font-bold mb-4 text-blue-900 dark:text-blue-400">
        Reviews
      </h2>

      <div className="rounded-2xl bg-gray-50 dark:bg-neutral-900 border border-gray-200 dark:border-white/10 p-6 text-gray-700 dark:text-gray-300">
        <div className="flex items-center mb-4">
          <Star
            className="text-yellow-600 mr-2"
            fill="currentColor"
            size={18}
          />
          <span className="font-semibold">{rating || "0"}/5</span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            No reviews yet
          </span>
        </div>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Be the first to share your experience.
        </p>
      </div>
    </motion.section>
  );
}
