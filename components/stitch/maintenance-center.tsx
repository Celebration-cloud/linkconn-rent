"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Clock3, Plus, Wrench } from "lucide-react";
import type { AppRole } from "@prisma/client";
import { toastError, toastSuccess } from "@/stores/toast-store";
import { Input, Select, Textarea } from "@/components/ui/form-controls";

type Activity = { id: string; fromStatus: string | null; toStatus: string | null; note: string | null; createdAt: string | Date; actor: { id: string; firstName: string; lastName: string } };
type Item = { id: string; leaseId: string | null; eligibilitySource: "Active lease" | "Legacy accepted-application record" | "Legacy record — eligibility unknown"; title: string; description: string | null; status: string; priority: string; createdAt: string | Date; updatedAt: string | Date; closedAt: string | Date | null; property: { id: string; title: string; location: string; owner: { id: string; firstName: string; lastName: string } }; requester: { id: string; firstName: string; lastName: string; email: string }; lease: { id: string; status: string } | null; activities: Activity[] };

export function MaintenanceCenter({ items, eligibleProperties, viewer, selected }: { items: Item[]; eligibleProperties: Array<{ id: string; title: string }>; viewer: { id: string; role: AppRole }; selected: Item | null }) {
  const router = useRouter();
  const [creating, setCreating] = useState(tenantEligible(viewer.role, eligibleProperties.length));
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const tenant = viewer.role === "Tenant";
  async function create(formData: FormData) {
    setBusy(true);
    const response = await fetch("/api/maintenance", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(formData)) });
    const result = await response.json() as { success: boolean; message: string; data?: { id: string } };
    setBusy(false);
    if (!result.success) return toastError("Request not created", result.message);
    toastSuccess("Maintenance request created", result.message); router.push(`/dashboard/maintenance/${result.data?.id}`); router.refresh();
  }
  async function update(status?: string) {
    if (!selected) return; setBusy(true);
    const response = await fetch(`/api/maintenance/${selected.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...(status ? { status } : {}), ...(note.trim() ? { note: note.trim() } : {}) }) });
    const result = await response.json() as { success: boolean; message: string }; setBusy(false);
    if (!result.success) return toastError("Request not updated", result.message);
    toastSuccess("Maintenance request updated", result.message); setNote(""); router.refresh();
  }
  return <div className="grid min-h-[36rem] border border-line bg-white lg:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)]">
    <aside className="border-b border-line lg:border-b-0 lg:border-r"><div className="flex items-center justify-between gap-3 border-b border-line p-4"><div><h1 className="font-extrabold text-ink">Maintenance</h1><p className="mt-1 text-xs text-muted">{items.length} linked request{items.length === 1 ? "" : "s"}</p></div>{tenant && eligibleProperties.length ? <button type="button" onClick={() => setCreating((value) => !value)} className="stitch-button-secondary"><Plus className="size-4" />New</button> : null}</div><nav aria-label="Maintenance requests">{items.map((item) => <Link key={item.id} href={`/dashboard/maintenance/${item.id}`} className={`block border-b border-line p-4 hover:bg-sand-50 ${selected?.id === item.id ? "bg-forest-50" : ""}`}><span className="flex items-start justify-between gap-2"><strong className="min-w-0 break-words text-sm text-ink">{item.title}</strong><span className="shrink-0 text-[10px] font-bold text-forest-700">{item.status}</span></span><span className="mt-1 block text-xs text-muted">{item.property.title}</span><span className="mt-2 block text-[10px] font-bold text-muted">{item.eligibilitySource}</span></Link>)}</nav>{!items.length ? <div className="p-8 text-center"><Wrench className="mx-auto size-7 text-forest-600" /><p className="mt-3 text-sm font-bold text-ink">No maintenance requests</p><p className="mt-1 text-xs text-muted">Active tenancy repairs will appear here.</p></div> : null}</aside>
    <main className="min-w-0 p-5 sm:p-7">{creating ? <form action={(data) => void create(data)} className="mb-7 border-b border-line pb-7"><h2 className="text-xl font-extrabold text-ink">Create maintenance request</h2><div className="mt-4 grid gap-4 sm:grid-cols-2"><label className="text-xs font-bold text-ink">Active tenancy<Select name="propertyId" required className="mt-1 w-full">{eligibleProperties.map((property) => <option key={property.id} value={property.id}>{property.title}</option>)}</Select></label><label className="text-xs font-bold text-ink">Priority<Select name="priority" className="mt-1 w-full"><option>Low</option><option>Medium</option><option>High</option></Select></label><label className="text-xs font-bold text-ink sm:col-span-2">Issue title<Input name="title" minLength={4} maxLength={140} required className="mt-1 w-full" /></label><label className="text-xs font-bold text-ink sm:col-span-2">What happened?<Textarea name="description" minLength={10} maxLength={3000} required className="mt-1 min-h-28 w-full" /></label></div><button disabled={busy} className="stitch-button mt-4">{busy ? "Creating…" : "Create maintenance request"}</button></form> : null}
      {selected ? <><header className="border-b border-line pb-5"><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><h2 className="break-words text-2xl font-extrabold text-ink">{selected.title}</h2><p className="mt-2 text-sm text-muted">{selected.property.title} · {selected.property.location}</p></div><span className="bg-sand-200 px-2 py-1 text-xs font-bold text-forest-800">{selected.status}</span></div><p className="mt-4 max-w-[72ch] whitespace-pre-wrap break-words text-sm leading-6 text-muted">{selected.description}</p><p className="mt-3 text-xs font-bold text-forest-700">Eligibility: {selected.eligibilitySource}</p></header><div className="grid gap-7 py-6 xl:grid-cols-[minmax(0,1fr)_18rem]"><section><h3 className="text-sm font-extrabold text-ink">Request history</h3><ol className="mt-4 space-y-4">{selected.activities.map((activity) => <li key={activity.id} className="flex gap-3"><Clock3 className="mt-1 size-4 shrink-0 text-forest-700" /><div className="min-w-0"><p className="text-sm font-bold text-ink">{activity.toStatus ?? "Note added"}</p>{activity.note ? <p className="mt-1 whitespace-pre-wrap break-words text-sm text-muted">{activity.note}</p> : null}<time className="mt-1 block text-xs text-muted">{activity.actor.firstName} {activity.actor.lastName} · {new Date(activity.createdAt).toLocaleString("en-NG")}</time></div></li>)}</ol></section><aside className="border-t border-line pt-5 xl:border-l xl:border-t-0 xl:pl-5 xl:pt-0"><h3 className="text-sm font-extrabold text-ink">Update request</h3><label className="mt-3 block text-xs font-bold text-ink">Activity note<Textarea value={note} onChange={(event) => setNote(event.target.value)} className="mt-1 min-h-24 w-full" minLength={2} maxLength={2000} /></label><button type="button" disabled={busy || note.trim().length < 2} onClick={() => void update()} className="stitch-button-secondary mt-3 w-full">Add note</button>{!tenant && selected.status === "Pending" ? <button type="button" disabled={busy} onClick={() => void update("InProgress")} className="stitch-button mt-2 w-full">Start work</button> : null}{!tenant && selected.status === "InProgress" ? <button type="button" disabled={busy} onClick={() => void update("Completed")} className="stitch-button mt-2 w-full">Complete repair</button> : null}{tenant && selected.status === "Pending" ? <button type="button" disabled={busy || note.trim().length < 2} onClick={() => void update("Closed")} className="stitch-button-secondary mt-2 w-full">Cancel request</button> : null}</aside></div></> : <div className="grid min-h-72 place-items-center text-center"><div><Wrench className="mx-auto size-7 text-muted" /><h2 className="mt-3 font-extrabold text-ink">Select a request</h2><p className="mt-1 text-sm text-muted">Open a request to review its full history.</p></div></div>}
    </main>
  </div>;
}

function tenantEligible(role: AppRole, eligibleCount: number) { return role === "Tenant" && eligibleCount > 0; }
