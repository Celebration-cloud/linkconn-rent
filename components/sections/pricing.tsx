"use client";

import { motion } from "framer-motion";
import { Check } from "../shared/icons";

const plans = [
  {
    name: "Free",
    price: "₦0",
    period: "forever",
    desc: "For tenants & casual landlords",
    features: ["Basic property listings", "Full property search", "Secure messaging", "Save & compare homes"],
    cta: "Start Free",
    highlight: false,
  },
  {
    name: "Premium Landlord",
    price: "₦7,500",
    period: "/month",
    desc: "Sell vacancies faster",
    features: ["Everything in Free", "Featured listings", "Enhanced visibility", "Advanced analytics", "Priority support", "Automated rent reminders"],
    cta: "Go Premium",
    highlight: true,
  },
  {
    name: "Verification",
    price: "₦5,000",
    period: "/listing",
    desc: "Build instant trust",
    features: ["Identity verification", "Property ownership check", "Verified green badge", "Higher search ranking", "Fraud protection"],
    cta: "Get Verified",
    highlight: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="bg-sand-100 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-brandgreen-600">Pricing</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">Simple, transparent plans</h2>
          <p className="mt-4 text-navy-600">No hidden agent fees. Pay only for the extra power you need.</p>
        </div>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className={`relative flex flex-col rounded-3xl p-7 shadow-sm transition-shadow hover:shadow-2xl ${
                p.highlight ? "bg-navy-900 text-white ring-2 ring-brandgreen-500" : "border border-navy-100 bg-white"
              }`}
            >
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-brandgreen-500 px-4 py-1 text-xs font-bold text-white shadow-lg">
                  Most Popular
                </span>
              )}
              <h3 className={`text-lg font-bold ${p.highlight ? "text-white" : "text-navy-900"}`}>{p.name}</h3>
              <p className={`mt-1 text-sm ${p.highlight ? "text-navy-300" : "text-navy-500"}`}>{p.desc}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className={`text-4xl font-extrabold ${p.highlight ? "text-white" : "text-navy-950"}`}>{p.price}</span>
                <span className={`mb-1 text-sm ${p.highlight ? "text-navy-300" : "text-navy-500"}`}>{p.period}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm">
                    <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${p.highlight ? "bg-brandgreen-500 text-white" : "bg-brandgreen-100 text-brandgreen-700"}`}>
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className={p.highlight ? "text-navy-100" : "text-navy-700"}>{f}</span>
                  </li>
                ))}
              </ul>

              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`mt-7 rounded-xl py-3 text-sm font-bold transition-colors cursor-pointer ${
                  p.highlight ? "bg-brandgreen-500 text-white hover:bg-brandgreen-400" : "bg-navy-900 text-white hover:bg-navy-800"
                }`}
              >
                {p.cta}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
