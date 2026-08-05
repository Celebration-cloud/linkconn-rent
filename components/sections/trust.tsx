"use client";

import { motion } from "framer-motion";
import { Shield, Verified, Check } from "../shared/icons";
import { BadgeCheck, FileCheck2, IdCard, ShieldAlert, ShieldCheck, Star } from "lucide-react";

const items = [
  { title: "Identity Verification", desc: "Every user confirms a valid government ID before transacting.", icon: IdCard },
  { title: "Ownership Verification", desc: "Landlords submit title documents we cross-check before listings go live.", icon: FileCheck2 },
  { title: "Verified Badges", desc: "Look for the green badge — it means a property passed all checks.", icon: BadgeCheck },
  { title: "Fraud Detection", desc: "Smart signals flag duplicate, fake or suspicious listings automatically.", icon: ShieldAlert },
  { title: "Report & Moderation", desc: "One-tap reporting and a dedicated admin team reviewing 24/7.", icon: ShieldCheck },
  { title: "Reviews & Ratings", desc: "Honest tenant and landlord reviews build trust over time.", icon: Star },
];

export default function Trust() {
  return (
    <section id="trust" className="bg-sand-100 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-brandgreen-100 px-4 py-1.5 text-xs font-bold text-brandgreen-700">
              <Shield className="h-4 w-4" /> Trust & Safety First
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
              We kill fake listings & rental scams
            </h2>
            <p className="mt-4 max-w-md text-navy-600">
              Trust is our biggest differentiator. Multi-layer verification, fraud detection
              and active moderation mean what you see is what you get.
            </p>

            <div className="mt-6 space-y-3">
              {["100% of featured listings are verified", "Zero tolerance for fraudulent posts", "Dedicated dispute resolution team"].map((t) => (
                <div key={t} className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brandgreen-500 text-white">
                    <Check className="h-4 w-4" />
                  </span>
                  <span className="text-sm font-medium text-navy-700">{t}</span>
                </div>
              ))}
            </div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="mt-8 inline-flex items-center gap-3 rounded-2xl border border-navy-100 bg-white p-4 shadow-lg"
            >
              <Verified className="h-10 w-10" />
              <div>
                <div className="text-sm font-bold text-navy-900">Trust Score: A+</div>
                <div className="text-xs text-navy-500">Based on 8,900+ verified transactions</div>
              </div>
            </motion.div>
          </motion.div>

          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((it, i) => (
              <motion.div
                key={it.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 2) * 0.1 + Math.floor(i / 2) * 0.05 }}
                whileHover={{ y: -5 }}
                className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm transition-shadow hover:shadow-xl"
              >
                <it.icon className="size-6 text-primary" aria-hidden="true" />
                <h3 className="mt-3 text-sm font-bold text-navy-900">{it.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-navy-600">{it.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
