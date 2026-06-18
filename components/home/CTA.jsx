"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

export default function CTA() {
  return (
    <section className="w-full py-24 px-6 bg-white dark:bg-slate-950">
      <div className="max-w-5xl mx-auto">
        <motion.div
          className="relative bg-slate-900 rounded-[2rem] p-10 md:p-16 text-center text-white overflow-hidden shadow-2xl border border-slate-800"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Background radial accents */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-green-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-3xl" />
          </div>

          {/* Trust badge */}
          <div className="inline-flex items-center gap-1.5 bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6 border border-green-500/30">
            <ShieldCheck className="w-3 h-3" />
            Verified & Scam-Free
          </div>

          {/* Heading */}
          <h2 className="text-3xl md:text-5xl font-extrabold mb-5 leading-tight">
            Ready to simplify your{" "}
            <span className="text-green-400">rental life?</span>
          </h2>

          {/* Subtext */}
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join thousands of Nigerians finding homes and managing properties
            smarter — no agents, no stress, no scams.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <span className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-slate-950 px-8 py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg cursor-pointer">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
            <Link href="/properties">
              <span className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white px-8 py-3.5 rounded-xl font-semibold text-sm transition-all cursor-pointer">
                Browse Listings
              </span>
            </Link>
          </div>

          {/* Social proof */}
          <p className="mt-8 text-[11px] text-slate-500 font-medium">
            12,400+ verified homes · Zero agent fees · Trusted by 8,000+ users
          </p>
        </motion.div>
      </div>
    </section>
  );
}
