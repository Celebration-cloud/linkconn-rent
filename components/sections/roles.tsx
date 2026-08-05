"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building2, ClipboardList, House, KeyRound, type LucideIcon } from "lucide-react";

type RoleName = "Tenant" | "Landlord" | "Property Manager" | "Admin";

const ROLES: { name: RoleName; desc: string; icon: LucideIcon }[] = [
  { name: "Tenant", desc: "Find & rent verified homes", icon: KeyRound },
  { name: "Landlord", desc: "List & manage properties", icon: House },
  { name: "Property Manager", desc: "Manage multiple portfolios", icon: ClipboardList },
  { name: "Admin", desc: "Moderate & verify the platform", icon: Building2 },
];

const detail: Record<RoleName, string[]> = {
  Tenant: ["Discover verified homes", "Save & compare listings", "Apply & track applications", "Pay rent & view receipts", "Submit maintenance requests"],
  Landlord: ["List & edit properties", "Track inquiries & tenants", "Monitor occupancy & income", "Manage leases digitally", "Get automated reminders"],
  "Property Manager": ["Manage multiple portfolios", "Bulk listing tools", "Assign & track repairs", "Consolidated analytics", "Team collaboration"],
  Admin: ["Verify identities & ownership", "Moderate & review listings", "Resolve reported scams", "Platform-wide analytics", "Manage user roles"],
};

export default function Roles() {
  const [active, setActive] = useState<RoleName>("Tenant");

  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-brandgreen-600">Built for everyone</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">One platform, four roles</h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="grid grid-cols-2 gap-4">
            {ROLES.map((r, i) => (
              <motion.button
                key={r.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                onClick={() => setActive(r.name)}
                className={`rounded-2xl border p-5 text-left transition-all cursor-pointer ${
                  active === r.name ? "border-brandgreen-500 bg-brandgreen-50 shadow-lg" : "border-navy-100 bg-white hover:border-navy-200"
                }`}
              >
                <r.icon className="size-7 text-primary" aria-hidden="true" />
                <div className="mt-3 font-bold text-navy-900">{r.name}</div>
                <div className="text-xs text-navy-500">{r.desc}</div>
              </motion.button>
            ))}
          </div>

          <div className="rounded-3xl bg-navy-900 p-8 text-white shadow-xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-2xl font-extrabold">{active}</h3>
                <p className="mt-1 text-sm text-navy-300">What you can do</p>
                <ul className="mt-6 space-y-3">
                  {detail[active].map((d, i) => (
                    <motion.li
                      key={d}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm font-medium"
                    >
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brandgreen-500 text-xs font-bold">{i + 1}</span>
                      {d}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
