"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CalendarDays, Clock3, Home, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { AppRole } from "@prisma/client";
import type { ViewingAction, ViewingDetail, ViewingListItem } from "@/features/viewings/contracts";
import { toastError, toastSuccess } from "@/stores/toast-store";
import { Input, Textarea } from "@/components/ui/form-controls";

const LABELS: Record<ViewingAction, string> = { confirm: "Confirm viewing", reschedule: "Propose new time", accept_reschedule: "Accept new time", complete: "Mark completed", cancel: "Cancel viewing" };

export function ViewingWorkspace({ role, items, detail }: { role: AppRole; items: ViewingListItem[]; detail: ViewingDetail | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState<ViewingAction | null>(null);
  const [reason, setReason] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const owner = role === "Landlord" || role === "PropertyManager";
  const base = owner ? "/dashboard/calendar" : "/dashboard/viewings";
  async function mutate(action: ViewingAction) {
    if (!detail) return;
    if (action === "cancel" && reason.trim().length < 5) { toastError("Add a cancellation reason", "Explain why this viewing is being cancelled."); return; }
    if (action === "reschedule" && !scheduledAt) { toastError("Choose a new time", "Select a future viewing date and time."); return; }
    setBusy(action);
    const response = await fetch(`/api/viewings/${detail.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, expectedStatus: detail.status, idempotencyKey: crypto.randomUUID(), ...(reason.trim() ? { reason: reason.trim() } : {}), ...(scheduledAt ? { scheduledAt: new Date(scheduledAt).toISOString() } : {}) }) });
    const result = await response.json() as { success: boolean; message: string };
    setBusy(null);
    if (!result.success) { toastError("Viewing not updated", result.message); return; }
    toastSuccess("Viewing updated", result.message); router.refresh();
  }
  if (!items.length) return <section className="grid min-h-80 place-items-center border border-dashed border-line bg-white p-8 text-center"><div className="max-w-md"><CalendarDays className="mx-auto size-7 text-forest-700" /><h2 className="mt-4 text-xl font-extrabold text-ink">No viewings scheduled</h2><p className="mt-2 text-sm leading-6 text-muted">{owner ? "Viewing requests for your properties will appear here with their confirmed time and activity history." : "Request a viewing from an available property to start your schedule."}</p>{!owner ? <Link href="/properties" className="stitch-button mt-6">Browse homes<Home className="size-4" /></Link> : null}</div></section>;
  return <div className="grid min-h-[36rem] border border-line bg-white lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]"><aside className="border-b border-line lg:border-b-0 lg:border-r"><div className="border-b border-line p-4"><p className="text-sm font-extrabold text-ink">Viewing schedule</p><p className="mt-1 text-xs text-muted">{items.length} appointment{items.length === 1 ? "" : "s"}</p></div>{items.map((item) => <Link key={item.id} href={`${base}/${item.id}`} className={`block border-b border-line p-4 hover:bg-sand-50 ${detail?.id === item.id ? "bg-forest-50" : ""}`}><span className="flex justify-between gap-3"><strong className="text-sm text-ink">{item.property.title}</strong><span className="text-[11px] font-bold text-forest-700">{item.status}</span></span><span className="mt-2 block text-xs text-muted">{new Date(item.scheduledAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</span></Link>)}</aside><section className="p-5 sm:p-7">{detail ? <><div className="border-b border-line pb-6"><h2 className="text-2xl font-extrabold tracking-[-0.02em] text-ink">{detail.property.title}</h2><p className="mt-2 text-sm text-muted">{detail.property.location} · with {detail.participant.name}</p><p className="mt-4 flex items-center gap-2 text-sm font-bold text-forest-800"><CalendarDays className="size-4" />{new Date(detail.scheduledAt).toLocaleString("en-NG", { dateStyle: "full", timeStyle: "short" })}</p></div><div className="grid gap-7 py-6 xl:grid-cols-[minmax(0,1fr)_18rem]"><div><h3 className="text-sm font-extrabold text-ink">Viewing history</h3><ol className="mt-4 space-y-4">{detail.timeline.map((event) => <li key={event.id} className="flex gap-3"><Clock3 className="mt-1 size-4 shrink-0 text-forest-700" /><div><p className="text-sm font-bold text-ink">{event.toStatus ?? "Viewing activity"}</p><p className="mt-1 text-xs text-muted">{event.actorName} · {new Date(event.createdAt).toLocaleString("en-NG")}</p>{event.note ? <p className="mt-2 text-sm text-muted">{event.note}</p> : null}</div></li>)}</ol></div><aside className="border-t border-line pt-6 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0"><h3 className="text-sm font-extrabold text-ink">Next actions</h3>{detail.actions.includes("reschedule") ? <label className="mt-4 block text-xs font-bold text-ink">New date and time<Input type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} className="mt-2 w-full" /></label> : null}{detail.actions.includes("cancel") || detail.actions.includes("reschedule") ? <label className="mt-3 block text-xs font-bold text-ink">Reason<Textarea value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 min-h-20 w-full resize-y" /></label> : null}<div className="mt-3 space-y-2">{detail.actions.map((action) => <button key={action} type="button" disabled={busy !== null} onClick={() => void mutate(action)} className={action === "confirm" || action === "accept_reschedule" ? "stitch-button w-full" : "stitch-button-secondary w-full"}>{busy === action ? <RotateCcw className="size-4 animate-spin" /> : null}{LABELS[action]}</button>)}</div></aside></div></> : <div className="grid min-h-80 place-items-center text-center"><div><CalendarDays className="mx-auto size-6 text-muted" /><h2 className="mt-3 font-extrabold text-ink">Choose a viewing</h2><p className="mt-1 text-sm text-muted">Open an appointment to review its schedule.</p></div></div>}</section></div>;
}
