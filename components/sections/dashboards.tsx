"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { MAINTENANCE, PAYMENTS } from "@/domain/constants/mock-data";
import { formatNaira } from "@/domain/constants/property";
import { Wallet, Wrench, Chart, Doc, Bell } from "../shared/icons";

function CountUp({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const dur = 1200;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - t0) / dur, 1);
      setN(Math.floor((1 - Math.pow(1 - p, 3)) * value));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, value]);
  return <span ref={ref}>{prefix}{n.toLocaleString()}{suffix}</span>;
}

const tabs = ["Landlord", "Tenant"] as const;
type Tab = (typeof tabs)[number];

const landlordStats = [
  { label: "Total Properties", value: 14, icon: Chart, accent: "text-navy-900" },
  { label: "Active Listings", value: 9, icon: Bell, accent: "text-brandgreen-600" },
  { label: "Occupancy Rate", value: 82, suffix: "%", icon: Wallet, accent: "text-amber-brand-600" },
  { label: "Open Inquiries", value: 27, icon: Doc, accent: "text-navy-900" },
];

const statusStyle: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-brand-600",
  "In Progress": "bg-info-soft text-info",
  Completed: "bg-brandgreen-100 text-brandgreen-700",
  Closed: "bg-navy-100 text-navy-505",
  Paid: "bg-brandgreen-100 text-brandgreen-700",
  Due: "bg-amber-100 text-amber-brand-600",
  Overdue: "bg-red-100 text-red-600",
};

const months = [42, 55, 48, 70, 65, 88];

export default function DashboardsTeaser() {
  const [tab, setTab] = useState<Tab>("Landlord");

  return (
    <section id="dashboards" className="relative overflow-hidden bg-navy-950 py-24 text-white">
      <div
        className="absolute inset-0 opacity-20"
        style={{ backgroundImage: "url(/images/dashboard-bg.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950/80 to-navy-950" />

      <div className="relative mx-auto max-w-7xl px-5 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-bold uppercase tracking-widest text-brandgreen-400">Powerful Dashboards</span>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">Manage everything from one screen</h2>
          <p className="mt-4 text-navy-200">Real-time analytics, rent tracking and maintenance — purpose-built for landlords and tenants.</p>
        </div>

        {/* Tabs */}
        <div className="mt-10 flex justify-center">
          <div className="inline-flex rounded-full bg-white/10 p-1 backdrop-blur">
            {tabs.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="relative rounded-full px-6 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
              >
                {tab === t && (
                  <motion.span layoutId="dashTab" className="absolute inset-0 rounded-full bg-white" transition={{ type: "spring", damping: 24, stiffness: 280 }} />
                )}
                <span className={`relative ${tab === t ? "text-navy-900" : "text-white"}`}>{t} Dashboard</span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {tab === "Landlord" ? (
            <motion.div
              key="landlord"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="mt-10 grid gap-5 lg:grid-cols-3"
            >
              {/* Stats + chart */}
              <div className="lg:col-span-2 space-y-5">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {landlordStats.map((s) => (
                    <div key={s.label} className="rounded-2xl bg-white p-4 text-navy-900 shadow-lg">
                      <s.icon className={`h-6 w-6 ${s.accent}`} />
                      <div className="mt-3 text-2xl font-extrabold">
                        <CountUp value={s.value} suffix={s.suffix} />
                      </div>
                      <div className="text-[11px] font-medium text-navy-500">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl bg-white p-5 text-navy-900 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-bold">Rental Income</div>
                      <div className="text-2xl font-extrabold text-brandgreen-600">
                        <CountUp value={18400000} prefix="₦" />
                      </div>
                    </div>
                    <span className="rounded-full bg-brandgreen-100 px-3 py-1 text-xs font-bold text-brandgreen-700">+12.4% ↑</span>
                  </div>
                  <div className="mt-6 flex h-40 items-end justify-between gap-3">
                    {months.map((h, i) => (
                      <div key={i} className="flex flex-1 flex-col items-center gap-2">
                        <motion.div
                          initial={{ height: 0 }}
                          whileInView={{ height: `${h}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="w-full rounded-t-lg bg-gradient-to-t from-navy-900 to-brandgreen-500"
                        />
                        <span className="text-[10px] font-medium text-navy-400">{["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Payments list */}
              <div className="rounded-2xl bg-white p-5 text-navy-900 shadow-lg">
                <div className="flex items-center gap-2 font-bold"><Wallet className="h-5 w-5 text-brandgreen-600" /> Rent Tracking</div>
                <div className="mt-4 space-y-3">
                  {PAYMENTS.map((p, i) => (
                    <motion.div
                      key={p.id}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center justify-between rounded-xl bg-navy-50 p-3"
                    >
                      <div>
                        <div className="text-sm font-semibold">{p.tenant}</div>
                        <div className="text-[11px] text-navy-550">{p.property} · {p.due}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold">{formatNaira(p.amount)}</div>
                        <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle[p.status] || "bg-navy-100 text-navy-700"}`}>{p.status}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="tenant"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.4 }}
              className="mt-10 grid gap-5 lg:grid-cols-3"
            >
              <div className="lg:col-span-2 space-y-5">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Saved Homes", value: 6, icon: Bell },
                    { label: "Applications", value: 2, icon: Doc },
                    { label: "Days to Renewal", value: 84, icon: Wallet },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl bg-white p-4 text-navy-900 shadow-lg">
                      <s.icon className="h-6 w-6 text-brandgreen-600" />
                      <div className="mt-3 text-2xl font-extrabold"><CountUp value={s.value} /></div>
                      <div className="text-[11px] font-medium text-navy-500">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-2xl bg-white p-5 text-navy-900 shadow-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold"><Doc className="h-5 w-5 text-amber-brand-600" /> My Lease</div>
                    <span className="rounded-full bg-brandgreen-100 px-3 py-1 text-xs font-bold text-brandgreen-700">Active</span>
                  </div>
                  <div className="mt-4 rounded-xl bg-navy-50 p-4">
                    <div className="text-sm font-bold">3-Bedroom Duplex · Lekki Phase 1</div>
                    <div className="mt-1 text-xs text-navy-500">Landlord: Adeyemi Estates · {formatNaira(4500000)}/year</div>
                    <div className="mt-4">
                      <div className="flex justify-between text-[11px] font-medium text-navy-500">
                        <span>Lease progress</span><span>76% · expires Apr 2026</span>
                      </div>
                      <div className="mt-1 h-2 overflow-hidden rounded-full bg-navy-200">
                        <motion.div initial={{ width: 0 }} whileInView={{ width: "76%" }} viewport={{ once: true }} transition={{ duration: 1 }} className="h-full rounded-full bg-gradient-to-r from-brandgreen-500 to-amber-brand-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 text-navy-900 shadow-lg">
                <div className="flex items-center gap-2 font-bold"><Wrench className="h-5 w-5 text-amber-brand-600" /> Maintenance</div>
                <div className="mt-4 space-y-3">
                  {MAINTENANCE.map((m, i) => (
                    <motion.div
                      key={m.id}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.08 }}
                      className="rounded-xl bg-navy-50 p-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-semibold">{m.title}</div>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${statusStyle[m.status] || "bg-navy-100 text-navy-700"}`}>{m.status}</span>
                      </div>
                      <div className="mt-1 text-[11px] text-navy-500">{m.property} · {m.date} · {m.priority} priority</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
