"use client";

import { useState, useTransition } from "react";
import { Headphones, Search, UserRoundCheck, Wrench } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import { useAuth } from "@/providers/auth-provider";
import { toastError, toastSuccess } from "@/stores/toast-store";

type Pagination = { page: number; pageSize: number; totalItems: number; totalPages: number };
type Actor = { firstName: string; lastName: string };
type Activity = { id: string; fromStatus?: string | null; toStatus?: string | null; note?: string | null; createdAt: Date; actor: Actor };
type SupportItem = {
  id: string; reference: string; name: string; email: string; category: string; subject: string; message: string;
  status: string; createdAt: Date; updatedAt: Date; assignedTo?: ({ id: string } & Actor) | null; activities: Activity[];
  profile?: { id: string; firstName: string; lastName: string; role: string } | null;
};
type MaintenanceItem = {
  id: string; title: string; description?: string | null; priority: string; status: string; createdAt: Date; updatedAt: Date;
  property: { id: string; title: string; location: string; owner: Actor };
  requester: { id: string; firstName: string; lastName: string; email: string };
  activities: Activity[];
};
type QueueData = { items: SupportItem[] | MaintenanceItem[]; pagination: Pagination };

const SUPPORT_STATUSES = ["Open", "InProgress", "WaitingOnCustomer", "Resolved", "Closed"];
const MAINTENANCE_STATUSES = ["Pending", "InProgress", "Completed", "Closed"];

export function OperationsQueue({ kind, data }: { kind: "support" | "maintenance"; data: QueueData }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { user } = useAuth();
  const [pending, startTransition] = useTransition();
  const requestedId = params.get("item");
  const selectedId = data.items.some((item) => item.id === requestedId) ? requestedId : data.items[0]?.id ?? "";
  const [nextStatus, setNextStatus] = useState("");
  const [reason, setReason] = useState("");
  const selected = data.items.find((item) => item.id === selectedId);
  const support = kind === "support";
  const title = support ? "Support queue" : "Maintenance oversight";
  const description = support
    ? "Assign customer issues, record internal context, and move every ticket toward a clear outcome."
    : "Monitor repair requests across the platform and intervene with a complete operational record.";

  function select(id: string) {
    const next = new URLSearchParams(params);
    next.set("item", id);
    router.replace(`${pathname}?${next}`, { scroll: false });
  }

  async function mutate(body: object) {
    if (!selected) return;
    try {
      const response = await fetch(`/api/admin/${kind}/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const result = await response.json() as { success: boolean; message: string };
      if (!response.ok || !result.success) {
        toastError("Action not completed", result.message || "The record could not be updated.");
        return;
      }
      toastSuccess("Record updated", result.message);
      setNextStatus("");
      setReason("");
      startTransition(() => router.refresh());
    } catch {
      toastError("Connection problem", "The request could not reach the server. Try again.");
    }
  }

  return (
    <div className="admin-canvas">
      <header className="admin-page-heading">
        <div><h1>{title}</h1><p>{description}</p></div>
        <div className="admin-record-count"><span>Records</span><strong>{data.pagination.totalItems}</strong></div>
      </header>
      <form method="get" className="admin-filter-bar">
        <label className="min-w-0 flex-1"><span className="sr-only">Search {title}</span><Input name="query" defaultValue={params.get("query") ?? ""} leadingIcon={Search} placeholder={support ? "Search reference, subject, name or email" : "Search request, property or requester"} /></label>
        <label><span className="sr-only">Status</span><Select name="status" defaultValue={params.get("status") ?? ""}><option value="">All statuses</option>{(support ? SUPPORT_STATUSES : MAINTENANCE_STATUSES).map((status) => <option key={status}>{status}</option>)}</Select></label>
        <button className="stitch-button">Apply filters</button>
      </form>

      <div className="mt-4 grid min-h-[34rem] min-w-0 border border-[#d6ddd5] bg-white lg:grid-cols-[23rem_minmax(0,1fr)]">
        <section className="min-w-0 border-b border-[#d6ddd5] lg:border-b-0 lg:border-r">
          <div className="border-b border-[#d6ddd5] px-4 py-3 text-xs font-bold text-muted">Showing {data.items.length} of {data.pagination.totalItems}</div>
          <div className="max-h-[48rem] overflow-y-auto">
            {data.items.length ? data.items.map((item) => {
              const isSupport = "reference" in item;
              const active = item.id === selectedId;
              return <button key={item.id} onClick={() => select(item.id)} className={`group flex w-full items-start gap-3 border-b border-[#e3e8e2] p-4 text-left transition-colors ${active ? "bg-forest-50" : "hover:bg-[#f7f9f6]"}`}>
                <span className={`mt-1 grid size-8 shrink-0 place-items-center ${active ? "bg-forest-800 text-white" : "bg-sand-200 text-forest-800"}`}>{isSupport ? <Headphones className="size-4" /> : <Wrench className="size-4" />}</span>
                <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><strong className="truncate text-sm">{isSupport ? item.subject : item.title}</strong><Status value={item.status} /></span><span className="mt-1 block truncate text-xs text-muted">{isSupport ? `${item.reference} · ${item.name}` : `${item.property.title} · ${item.requester.firstName} ${item.requester.lastName}`}</span><span className="mt-2 block text-[10px] text-muted">Updated {new Date(item.updatedAt).toLocaleString("en-NG")}</span></span>
              </button>;
            }) : <Empty kind={kind} />}
          </div>
          <Pager pagination={data.pagination} />
        </section>

        <section className="min-w-0 p-4 sm:p-6">
          {selected ? <>
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#d6ddd5] pb-5"><div className="min-w-0"><div className="flex items-center gap-2"><Status value={selected.status} />{"priority" in selected && <Status value={selected.priority} />}</div><h2 className="mt-3 break-words text-2xl font-extrabold tracking-[-0.025em]">{"subject" in selected ? selected.subject : selected.title}</h2><p className="mt-1 break-all text-sm text-muted">{"reference" in selected ? `${selected.reference} · ${selected.email}` : `${selected.requester.email} · ${selected.property.location}`}</p></div></div>
            <div className="grid gap-6 py-6 xl:grid-cols-[minmax(0,1fr)_18rem]">
              <div className="min-w-0"><h3 className="text-sm font-extrabold">Initial report</h3><p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-muted">{"message" in selected ? selected.message : selected.description || "No description was supplied."}</p>{"property" in selected && <dl className="mt-5 grid gap-3 border-t border-[#e3e8e2] pt-5 sm:grid-cols-2"><Fact label="Property" value={selected.property.title} /><Fact label="Owner" value={`${selected.property.owner.firstName} ${selected.property.owner.lastName}`} /><Fact label="Requester" value={`${selected.requester.firstName} ${selected.requester.lastName}`} /><Fact label="Priority" value={selected.priority} /></dl>}
                <h3 className="mt-7 text-sm font-extrabold">Activity</h3><div className="mt-3 space-y-0">{selected.activities.length ? selected.activities.map((activity, index) => <article key={activity.id} className="relative border-l border-[#cfd8cf] pb-5 pl-5 last:pb-0"><span className="absolute -left-1 top-1 size-2 bg-forest-700" /><p className="text-xs font-bold">{activity.actor.firstName} {activity.actor.lastName}{activity.toStatus ? ` moved the record to ${activity.toStatus}` : " added a note"}</p>{activity.note && <p className="mt-1 text-sm leading-6 text-muted">{activity.note}</p>}<time className="mt-1 block text-[10px] text-muted">{new Date(activity.createdAt).toLocaleString("en-NG")}{index === selected.activities.length - 1 ? " · Latest" : ""}</time></article>) : <p className="text-sm text-muted">No activity has been recorded yet.</p>}</div>
              </div>
              <aside className="h-fit border border-[#d6ddd5] bg-[#f8faf7] p-4"><h3 className="text-sm font-extrabold">Operator actions</h3>{support && <div className="mt-4 border border-[#d6ddd5] bg-white p-3"><p className="text-[10px] font-bold uppercase tracking-[.08em] text-muted">Current owner</p><p className="mt-1 text-sm font-bold">{"assignedTo" in selected && selected.assignedTo ? `${selected.assignedTo.firstName} ${selected.assignedTo.lastName}` : "Unassigned"}</p></div>}{support && <button disabled={pending || !user?.id || ("assignedTo" in selected && Boolean(selected.assignedTo && selected.assignedTo.id !== user?.id))} onClick={() => void mutate({ action: "assign" })} className="stitch-button-secondary mt-3 min-h-11 w-full"><UserRoundCheck className="size-4" />{"assignedTo" in selected && selected.assignedTo?.id === user?.id ? "Assigned to you" : "Assign to me"}</button>}<label className="mt-4 block text-xs font-bold">Next status<Select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} className="mt-2"><option value="">Choose status</option>{(support ? SUPPORT_STATUSES : MAINTENANCE_STATUSES).filter((status) => status !== selected.status).map((status) => <option key={status}>{status}</option>)}</Select></label><label className="mt-4 block text-xs font-bold">Audit reason<Textarea value={reason} onChange={(event) => setReason(event.target.value)} className="mt-2" minLength={8} maxLength={1000} placeholder="Explain the operational decision" /></label><button disabled={pending || !nextStatus || reason.trim().length < 8} onClick={() => void mutate(support ? { action: "status", status: nextStatus, reason: reason.trim() } : { status: nextStatus, reason: reason.trim() })} className="stitch-button mt-4 min-h-11 w-full">{pending ? "Saving…" : "Save decision"}</button>{support && <button disabled={pending || reason.trim().length < 2} onClick={() => void mutate({ action: "note", note: reason.trim() })} className="stitch-button-secondary mt-2 min-h-11 w-full">Add as internal note</button>}</aside>
            </div>
          </> : <Empty kind={kind} detail />}
        </section>
      </div>
    </div>
  );
}

function Status({ value }: { value: string }) {
  const tone = /critical|high|failed|overdue|closed/i.test(value) ? "bg-red-50 text-red-800" : /resolved|completed|approved|active/i.test(value) ? "bg-forest-100 text-forest-900" : /pending|open|waiting/i.test(value) ? "bg-amber-50 text-amber-900" : "bg-sand-200 text-forest-900";
  return <span className={`inline-flex shrink-0 px-2 py-1 text-[10px] font-extrabold ${tone}`}>{value.replace(/([a-z])([A-Z])/g, "$1 $2")}</span>;
}
function Fact({ label, value }: { label: string; value: string }) { return <div><dt className="text-[10px] font-bold uppercase tracking-[.08em] text-muted">{label}</dt><dd className="mt-1 text-sm font-bold">{value}</dd></div>; }
function Empty({ kind, detail = false }: { kind: "support" | "maintenance"; detail?: boolean }) { const Icon = kind === "support" ? Headphones : Wrench; return <div className="grid min-h-64 place-items-center p-8 text-center"><div><Icon className="mx-auto size-8 text-forest-600" /><p className="mt-3 font-bold">{detail ? "Select a record to inspect" : `No ${kind} records found`}</p><p className="mt-1 text-sm text-muted">{detail ? "The full operational history will open here." : "Adjust the filters or check back later."}</p></div></div>; }
function Pager({ pagination }: { pagination: Pagination }) { const pathname = usePathname(); const search = useSearchParams(); if (pagination.totalPages <= 1) return null; const href = (page: number) => { const next = new URLSearchParams(search); next.set("page", String(page)); next.delete("item"); return `${pathname}?${next}`; }; return <nav aria-label="Pagination" className="flex items-center justify-between gap-3 border-t border-[#d6ddd5] p-3"><Link aria-disabled={pagination.page <= 1} className={`stitch-button-secondary ${pagination.page <= 1 ? "pointer-events-none opacity-50" : ""}`} href={href(Math.max(1, pagination.page - 1))}>Previous</Link><span className="text-xs font-bold text-muted">{pagination.page} / {pagination.totalPages}</span><Link aria-disabled={pagination.page >= pagination.totalPages} className={`stitch-button-secondary ${pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}`} href={href(Math.min(pagination.totalPages, pagination.page + 1))}>Next</Link></nav>; }
