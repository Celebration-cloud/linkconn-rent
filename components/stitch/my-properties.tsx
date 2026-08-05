"use client";

import Image from "next/image";
import Link from "next/link";
import { Copy, MoreHorizontal, Plus, Search } from "lucide-react";
import { Input } from "@/components/ui/form-controls";
import { useEffect, useMemo, useState } from "react";
import { toastError, toastSuccess } from "@/stores/toast-store";
import { formatNaira } from "@/utils/map-property";

interface OwnedProperty {
  id: string; title: string; location: string; price: number; status: string; moderationStatus: string; images: string[];
  _count: { applications: number; maintenance: number };
}

export function MyProperties() {
  const [items, setItems] = useState<OwnedProperty[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  async function load() {
    const response = await fetch("/api/properties/mine", { cache: "no-store" });
    const result = (await response.json()) as { success: boolean; data?: OwnedProperty[]; message: string };
    result.success ? setItems(result.data || []) : toastError("Properties unavailable", result.message);
    setLoading(false);
  }
  useEffect(() => { void load(); }, []);
  const filtered = useMemo(() => items.filter((item) => item.title.toLowerCase().includes(query.toLowerCase()) && (filter === "All" || item.status === filter)), [items, query, filter]);
  async function action(id: string, value: "publish" | "archive" | "duplicate") {
    const response = await fetch(`/api/properties/${id}/actions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: value }) });
    const result = (await response.json()) as { success: boolean; message: string };
    result.success ? toastSuccess("Property updated", result.message) : toastError("Action failed", result.message);
    if (result.success) await load();
  }
  const revenue = items.filter((item) => item.status === "Rented").reduce((total, item) => total + item.price / 12, 0);
  return (
    <main id="main-content" className="min-h-[100dvh] bg-sand-50 pb-24">
      <div className="stitch-container py-7">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div><h1 className="text-2xl font-extrabold">My properties</h1><p className="mt-1 text-sm text-muted">Manage listings, track revenue, and resolve property issues.</p></div><Link href="/dashboard/properties/new" className="stitch-button"><Plus className="h-4 w-4" /> Add new property</Link></div>
        <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4"><PropertyMetric label="Total properties" value={String(items.length)} /><PropertyMetric label="Occupancy rate" value={`${items.length ? Math.round(items.filter((item) => item.status === "Rented").length / items.length * 100) : 0}%`} /><PropertyMetric label="Monthly revenue" value={formatNaira(revenue)} /><PropertyMetric label="Pending issues" value={String(items.reduce((total, item) => total + item._count.maintenance, 0))} /></div>
        <div className="mt-6 flex flex-col gap-3 rounded-xl border border-line bg-sand-100 p-3 sm:flex-row"><label className="flex-1"><span className="sr-only">Search your properties</span><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your properties..." leadingIcon={Search} /></label><div className="flex gap-2 overflow-auto">{["All", "Available", "Rented", "Draft", "Archived"].map((value) => <button key={value} onClick={() => setFilter(value)} className={`min-h-11 shrink-0 rounded-full px-4 text-xs font-bold ${filter === value ? "bg-forest-800 text-white" : "border border-line bg-white text-muted"}`}>{value}</button>)}</div></div>
        <div className="mt-4 overflow-hidden rounded-xl border border-line bg-white">{loading ? <div className="h-72 animate-pulse bg-sand-200" /> : filtered.length ? <div className="divide-y divide-line">{filtered.map((item) => <article key={item.id} className="grid gap-4 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center"><div className="flex min-w-0 items-center gap-3">{item.images[0] ? <Image src={item.images[0]} alt="" width={72} height={56} className="h-14 w-18 rounded-lg object-cover" /> : <div className="h-14 w-18 rounded-lg bg-sand-200" />}<div className="min-w-0"><h2 className="truncate text-sm font-extrabold">{item.title}</h2><p className="truncate text-xs text-muted">{item.location}</p></div></div><div><span className="rounded-full bg-forest-50 px-2 py-1 text-[10px] font-bold text-forest-800">{item.status}</span><p className="mt-2 text-sm font-extrabold">{formatNaira(item.price)}<span className="text-xs font-normal text-muted"> / yr</span></p></div><div className="flex gap-2"><button onClick={() => void action(item.id, "duplicate")} className="grid h-11 w-11 place-items-center rounded-lg border border-line" aria-label={`Duplicate ${item.title}`}><Copy className="h-4 w-4" /></button><button onClick={() => void action(item.id, item.status === "Archived" ? "publish" : "archive")} className="grid h-11 w-11 place-items-center rounded-lg border border-line" aria-label={`Change status for ${item.title}`}><MoreHorizontal className="h-4 w-4" /></button></div></article>)}</div> : <div className="grid min-h-72 place-items-center p-8 text-center"><div><h2 className="font-extrabold">No matching properties</h2><p className="mt-2 text-sm text-muted">Clear the filters or add your first property.</p></div></div>}</div>
      </div>
    </main>
  );
}
function PropertyMetric({ label, value }: { label: string; value: string }) { return <article className="rounded-xl border border-line bg-white p-4"><p className="text-xs text-muted">{label}</p><p className="mt-2 text-xl font-extrabold tabular-nums">{value}</p></article>; }
