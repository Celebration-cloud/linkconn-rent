"use client";

import { motion } from "framer-motion";
import { Search, Verified, Chat, Wallet, Wrench, Doc, Bell, Heart } from "../shared/icons";

const features = [
  { icon: Search, title: "Smart Search", desc: "Filter by location, type, price range, bedrooms and amenities with advanced filtering.", color: "navy" },
  { icon: Verified, title: "Property Verification", desc: "Identity & ownership checks, verified badges and built-in fraud detection.", color: "green" },
  { icon: Chat, title: "Direct Messaging", desc: "Chat securely with landlords, request viewings and track inquiries in-app.", color: "amber" },
  { icon: Wallet, title: "Rent Management", desc: "Track due dates, payment history and pay via Paystack or Flutterwave.", color: "green" },
  { icon: Wrench, title: "Maintenance", desc: "Submit & track repair requests with photos, from pending to resolved.", color: "navy" },
  { icon: Doc, title: "Digital Leases", desc: "Sign, store and renew lease agreements with expiration reminders.", color: "amber" },
  { icon: Bell, title: "Smart Notifications", desc: "In-app, email and SMS alerts for rent, maintenance and lease events.", color: "green" },
  { icon: Heart, title: "Saved & Compare", desc: "Bookmark listings, compare side by side and get personalized picks.", color: "navy" },
];

const colorMap: Record<string, string> = {
  navy: "bg-navy-900 text-white",
  green: "bg-brandgreen-500 text-white",
  amber: "bg-amber-brand-500 text-white",
};

export default function Features() {
  return (
    <section id="how" className="relative bg-sand-100 py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-2xl text-center"
        >
          <span className="text-sm font-bold uppercase tracking-widest text-brandgreen-600">Everything in one place</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
            The complete rental toolkit
          </h2>
          <p className="mt-4 text-navy-600">
            From discovery to move-in to monthly rent — LinkConn Rent removes the friction
            and the middlemen from renting in Nigeria.
          </p>
        </motion.div>

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              whileHover={{ y: -6 }}
              className="group rounded-2xl border border-navy-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-xl hover:shadow-navy-900/10"
            >
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorMap[f.color]} shadow-lg transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-navy-900">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-navy-600">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
