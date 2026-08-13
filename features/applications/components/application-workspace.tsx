"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Clock3, FileText, Home, MessageSquare, RotateCcw } from "lucide-react";
import { useState } from "react";
import type { AppRole } from "@prisma/client";
import type { ApplicationAction, ApplicationDetail, ApplicationListItem } from "@/features/applications/contracts";
import { toastError, toastSuccess } from "@/stores/toast-store";
import { Textarea } from "@/components/ui/form-controls";

const ACTION_LABELS: Record<ApplicationAction, string> = { shortlist: "Shortlist", accept: "Accept application", decline: "Decline application", withdraw: "Withdraw application" };

export function ApplicationWorkspace({ role, items, detail }: { role: AppRole; items: ApplicationListItem[]; detail: ApplicationDetail | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState<ApplicationAction | null>(null);
  const [reason, setReason] = useState("");
  const owner = role === "Landlord" || role === "PropertyManager";
  const base = owner ? "/dashboard/applicants" : "/dashboard/applications";

  async function mutate(action: ApplicationAction) {
    if (!detail) return;
    if (action === "decline" && reason.trim().length < 10) {
      toastError("Add a decision reason", "Give the applicant a clear reason of at least 10 characters.");
      return;
    }
    setBusy(action);
    const response = await fetch(`/api/applications/${detail.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, expectedStatus: detail.status, idempotencyKey: crypto.randomUUID(), ...(reason.trim() ? { reason: reason.trim() } : {}) }) });
    const result = await response.json() as { success: boolean; message: string };
    setBusy(null);
    if (!result.success) { toastError("Application not updated", result.message); return; }
    toastSuccess("Application updated", result.message);
    router.refresh();
  }

  if (!items.length) return <section className="grid min-h-80 place-items-center border border-dashed border-line bg-white p-8 text-center"><div className="max-w-md"><FileText className="mx-auto size-7 text-forest-700" /><h2 className="mt-4 text-xl font-extrabold text-ink">{owner ? "No applicants yet" : "No applications yet"}</h2><p className="mt-2 text-sm leading-6 text-muted">{owner ? "Applications for your available properties will appear here with their full decision history." : "When you apply for a verified home, its status and complete history will appear here."}</p>{!owner ? <Link href="/properties" className="stitch-button mt-6">Find a home<Home className="size-4" /></Link> : null}</div></section>;

  return <div className="grid min-h-[36rem] border border-line bg-white lg:grid-cols-[minmax(16rem,22rem)_minmax(0,1fr)]">
    <aside className="border-b border-line lg:border-b-0 lg:border-r"><div className="border-b border-line p-4"><p className="text-sm font-extrabold text-ink">{owner ? "Applicant queue" : "Your applications"}</p><p className="mt-1 text-xs text-muted">{items.length} record{items.length === 1 ? "" : "s"}</p></div><nav aria-label="Application records">{items.map((item) => <Link key={item.id} href={`${base}/${item.id}`} className={`block border-b border-line p-4 hover:bg-sand-50 ${detail?.id === item.id ? "bg-forest-50" : ""}`}><span className="flex items-start justify-between gap-3"><strong className="text-sm text-ink">{item.property.title}</strong><Status value={item.status} /></span><span className="mt-2 block text-xs text-muted">{item.participant.name} · {item.property.location}</span><span className="mt-3 flex items-center gap-1 text-[11px] font-bold text-forest-700">Open record<ArrowRight className="size-3" /></span></Link>)}</nav>
    </aside>
    <section className="min-w-0 p-5 sm:p-7">{detail ? <>
      <div className="flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-2xl font-extrabold tracking-[-0.02em] text-ink">{detail.property.title}</h2><p className="mt-2 text-sm text-muted">{detail.property.location} · ₦{detail.property.price.toLocaleString("en-NG")}/{detail.property.period}</p></div><Status value={detail.status} /></div>
      <div className="grid gap-6 py-6 md:grid-cols-2"><Facts title="Applicant" name={detail.tenant.name} verification={detail.tenant.verificationLevel} /><Facts title="Property owner" name={detail.landlord.name} verification={detail.landlord.verificationLevel} /></div>
      {detail.message ? <div className="border-y border-line py-5"><h3 className="text-sm font-extrabold text-ink">Application note</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{detail.message}</p></div> : null}
      <div className="grid gap-7 py-6 xl:grid-cols-[minmax(0,1fr)_18rem]"><div><h3 className="text-sm font-extrabold text-ink">Application history</h3><ol className="mt-4 space-y-4">{detail.timeline.map((event) => <li key={event.id} className="flex gap-3"><span className="mt-1 grid size-8 shrink-0 place-items-center rounded-lg bg-sand-200 text-forest-800"><Clock3 className="size-4" /></span><div><p className="text-sm font-bold text-ink">{event.toStatus ? `Status changed to ${event.toStatus}` : "Application activity"}</p><p className="mt-1 text-xs text-muted">{event.actorName} · {new Date(event.createdAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" })}</p>{event.note ? <p className="mt-2 text-sm leading-6 text-muted">{event.note}</p> : null}</div></li>)}</ol></div>
      <aside className="border-t border-line pt-6 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0"><h3 className="text-sm font-extrabold text-ink">Next actions</h3>{detail.conversation ? <Link href={detail.conversation.href} className="stitch-button-secondary mt-3 w-full"><MessageSquare className="size-4" />Open conversation</Link> : null}{detail.actions.includes("decline") ? <label className="mt-4 block text-xs font-bold text-ink">Decision reason<Textarea value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2 min-h-24 w-full resize-y" placeholder="Explain the evidence-based reason" /></label> : null}<div className="mt-3 space-y-2">{detail.actions.map((action) => <button key={action} type="button" disabled={busy !== null} onClick={() => void mutate(action)} className={action === "accept" ? "stitch-button w-full" : "stitch-button-secondary w-full"}>{busy === action ? <RotateCcw className="size-4 animate-spin" /> : null}{ACTION_LABELS[action]}</button>)}</div>{!detail.actions.length ? <p className="mt-3 text-sm leading-6 text-muted">This record is complete. Its history remains available.</p> : null}</aside></div>
    </> : <div className="grid min-h-80 place-items-center text-center"><div><FileText className="mx-auto size-6 text-muted" /><h2 className="mt-3 font-extrabold text-ink">Choose an application</h2><p className="mt-1 text-sm text-muted">Open a record to see its facts and history.</p></div></div>}</section>
  </div>;
}

function Status({ value }: { value: string }) { return <span className="shrink-0 rounded-md bg-sand-200 px-2 py-1 text-[11px] font-bold text-forest-800">{value}</span>; }
function Facts({ title, name, verification }: { title: string; name: string; verification: string }) { return <div><h3 className="text-xs font-bold text-muted">{title}</h3><p className="mt-2 font-extrabold text-ink">{name}</p><p className="mt-1 text-xs text-forest-700">{verification}</p></div>; }
