"use client";

import { motion } from "framer-motion";
import { Arrow } from "../shared/icons";
import { useAuth } from "@/providers/auth-provider";

export default function CTA() {
  const { user, openAuth } = useAuth();

  return (
    <section className="bg-sand-100 pb-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-forest-800 via-forest-700 to-forest-500 px-8 py-16 text-center shadow-[0_24px_70px_rgba(18,55,42,0.22)] sm:px-16"
        >
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/15 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-72 w-72 rounded-full bg-amber-brand-400/30 blur-3xl" />
          <h2 className="relative text-3xl font-extrabold tracking-tight text-white sm:text-5xl">
            Find homes faster.<br />Find tenants easier.
          </h2>
          <p className="relative mx-auto mt-5 max-w-xl text-lg text-white/90">
            Join thousands of Nigerians renting and managing properties the transparent way — no agents, no scams.
          </p>
          <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => openAuth(user ? "account" : "pick")}
              className="flex items-center gap-2 rounded-full bg-navy-950 px-7 py-3.5 text-sm font-bold text-white shadow-xl cursor-pointer"
            >
              {user ? "Open My Account" : "Create Free Account"} <Arrow className="h-5 w-5" />
            </motion.button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
