"use client";

import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";

const testimonials = [
  {
    name: "Ada E.",
    role: "Tenant, Lagos",
    rating: 5,
    comment:
      "I found my apartment in Lekki within 48 hours — no agent, no stress. The platform showed me exactly what I'd pay, no hidden fees. Absolutely love it.",
  },
  {
    name: "Tunde K.",
    role: "Landlord, Abuja",
    rating: 5,
    comment:
      "Managing tenants has never been easier. I see payments, maintenance requests, and lease dates all at a glance. My occupancy rate jumped to 100%.",
  },
  {
    name: "Maria O.",
    role: "Property Manager, Port Harcourt",
    rating: 5,
    comment:
      "LinkConn Rent keeps me organized every month. The rent reminders save me so many awkward calls, and my tenants appreciate the full transparency too.",
  },
];

export default function Testimonials() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 80, damping: 12 },
    },
  };

  return (
    <section className="w-full py-24 bg-slate-50/50 dark:bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-16">
          <p className="text-green-600 dark:text-green-400 text-xs font-bold uppercase tracking-widest mb-2">
            Testimonials
          </p>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-3">
            What our users say
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">
            Real stories from real people across Nigeria.
          </p>
        </div>

        {/* Cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
              variants={cardVariants}
              whileHover={{ y: -4 }}
            >
              {/* Quote icon */}
              <Quote className="w-8 h-8 text-green-200 dark:text-green-900 mb-4 shrink-0" />

              {/* Stars */}
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star
                    key={si}
                    className="w-4 h-4 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Comment */}
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex-grow mb-6 italic">
                &ldquo;{t.comment}&rdquo;
              </p>

              {/* Author */}
              <div className="border-t border-slate-100 dark:border-slate-700 pt-5 flex items-center gap-3">
                {/* Avatar placeholder */}
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-teal-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {t.name}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    {t.role}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
