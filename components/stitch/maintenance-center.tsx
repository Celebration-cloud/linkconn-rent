"use client";

import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock3, Plus, Wrench } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/icons";
import { toastError, toastSuccess } from "@/stores/toast-store";

interface MaintenanceItem {
  id: string; title: string; description?: string; status: string; priority: string; createdAt: string;
  property: { title: string; location: string };
  activities: Array<{ id: string; note?: string; toStatus?: string; createdAt: string }>;
}

export function MaintenanceCenter() {
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("active");
  async function load() {
    const response = await fetch("/api/maintenance", { cache: "no-store" });
    const result = (await response.json()) as { success: boolean; data?: MaintenanceItem[]; message: string };
    if (result.success) setItems(result.data || []); else toastError("Unable to load requests", result.message);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);
  const filtered = items.filter((item) => status === "active" ? !["Completed", "Closed"].includes(item.status) : ["Completed", "Closed"].includes(item.status));
  function newRequest() {
    toastSuccess("Maintenance reporting", "Start from an accepted tenancy in your dashboard to create a property-linked report.");
  }
  return (
    <main id="main-content" className="min-h-[100dvh] bg-sand-50 pb-24">
      <header className="sticky top-0 z-20 flex h-16 items-center border-b border-line bg-sand-50 px-4"><Link href="/dashboard" className="grid h-11 w-11 place-items-center rounded-full hover:bg-sand-200" aria-label="Back"><ArrowLeft className="h-5 w-5" /></Link><h1 className="mx-auto text-lg font-extrabold">Maintenance</h1><Link href="/" className="grid size-11 place-items-center rounded-lg hover:bg-sand-100" aria-label="LinkConn Rent home"><Logo variant="mark" priority className="size-9" sizes="36px" /></Link></header>
      <div className="mx-auto max-w-3xl p-4">
        <div className="flex items-center justify-between"><h2 className="text-xl font-extrabold">Maintenance center</h2><span className="rounded-full bg-forest-100 px-3 py-1 text-xs font-bold text-forest-800">{filtered.length} open</span></div>
        <div className="mt-5 grid grid-cols-2 rounded-lg bg-sand-200 p-1"><button onClick={() => setStatus("active")} className={`min-h-11 rounded-md text-sm font-bold ${status === "active" ? "bg-white text-forest-800 shadow-sm" : "text-muted"}`}>Active requests</button><button onClick={() => setStatus("past")} className={`min-h-11 rounded-md text-sm font-bold ${status === "past" ? "bg-white text-forest-800 shadow-sm" : "text-muted"}`}>Past requests</button></div>
        <div className="mt-5 space-y-4">{loading ? Array.from({ length: 2 }).map((_, index) => <div key={index} className="h-40 animate-pulse rounded-xl bg-sand-200" />) : filtered.length ? filtered.map((item) => <article key={item.id} className={`rounded-xl border-l-2 bg-white p-4 shadow-sm ${item.priority === "High" ? "border-red-500" : "border-forest-600"}`}><div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-bold uppercase tracking-wider text-muted">{item.property.title}</p><h3 className="mt-1 font-extrabold text-ink">{item.title}</h3></div><span className="rounded-full bg-sand-200 px-2 py-1 text-[10px] font-bold">{item.status}</span></div><p className="mt-3 text-xs leading-5 text-muted">{item.description}</p><div className="mt-5 flex items-center gap-2 text-xs font-bold text-forest-700">{item.status === "Completed" ? <CheckCircle2 className="h-4 w-4" /> : <Clock3 className="h-4 w-4" />}{item.activities.length} activity updates</div></article>) : <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-line bg-white p-8 text-center"><div><Wrench className="mx-auto h-8 w-8 text-forest-600" /><h3 className="mt-3 font-extrabold">No {status} requests</h3><p className="mt-1 text-sm text-muted">Everything looks settled for now.</p></div></div>}</div>
      </div>
      <button onClick={newRequest} className="stitch-button fixed bottom-6 right-4 shadow-xl sm:right-8"><Plus className="h-4 w-4" /> New report</button>
    </main>
  );
}
