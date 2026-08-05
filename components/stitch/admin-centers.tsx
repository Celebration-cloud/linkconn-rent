"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { AlertTriangle, Check, Clock3, Search, ShieldCheck, X } from "lucide-react";
import { Input } from "@/components/ui/form-controls";
import { toastError, toastSuccess } from "@/stores/toast-store";
import { useAuth } from "@/providers/auth-provider";

interface ApiEnvelope<T> { success: boolean; data?: T; message: string }
interface VerificationItem {
  id: string; type: string; status: string; createdAt: string;
  owner: { firstName: string; lastName: string; email: string; role: string };
  property?: { title: string } | null;
}
interface DisputeItem {
  id: string; reference: string; title: string; description: string; status: string; priority: string; category: string; createdAt: string;
  reporter: { firstName: string; lastName: string; email: string };
  payment?: { amount: number; reference?: string | null } | null;
  notes: Array<{ id: string; body: string; createdAt: string; author: { firstName: string; lastName: string } }>;
}
interface ModerationData {
  users: Array<{ id: string; firstName: string; lastName: string; email: string; role: string; accountStatus: string }>;
  listings: Array<{ id: string; title: string; location: string; price: number; status: string; moderationStatus: string; moderationReason?: string | null; owner: { firstName: string; lastName: string; email: string } }>;
  audits: Array<{ id: string; action: string; reason: string; createdAt: string; actor: { firstName: string; lastName: string } }>;
}

function useAdminData<T>(path: string) {
  const [data, setData] = useState<T>();
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch(path, { cache: "no-store" });
    const result = (await response.json()) as ApiEnvelope<T>;
    if (result.success && result.data) setData(result.data);
    else toastError("Unable to load", result.message);
    setLoading(false);
  }, [path]);
  useEffect(() => { void load(); }, [load]);
  return { data, loading, load };
}

async function mutate(path: string, body: object) {
  const response = await fetch(path, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return (await response.json()) as ApiEnvelope<unknown>;
}

function CenterHeader({ title, description, count }: { title: string; description: string; count: number }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div><h1 className="text-2xl font-extrabold tracking-tight text-ink">{title}</h1><p className="mt-1 text-sm text-muted">{description}</p></div>
      <article className="min-w-52 rounded-xl bg-forest-800 p-4 text-white">
        <p className="text-[10px] font-bold uppercase tracking-wider text-lime-300">Open workload</p>
        <p className="mt-1 text-3xl font-extrabold tabular-nums">{count}</p>
      </article>
    </div>
  );
}

function SearchField({ value, setValue }: { value: string; setValue: Dispatch<SetStateAction<string>> }) {
  return <label className="block"><span className="sr-only">Search queue</span><Input value={value} onChange={(event) => setValue(event.target.value)} placeholder="Search by name, email, case or listing..." leadingIcon={Search} /></label>;
}

function QueueSkeleton() {
  return <div className="space-y-3">{Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-20 animate-pulse rounded-xl bg-sand-200" />)}</div>;
}

function EmptyQueue({ label }: { label: string }) {
  return <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-line bg-white p-8 text-center"><div><ShieldCheck className="mx-auto h-8 w-8 text-forest-600" /><p className="mt-3 text-sm font-bold text-ink">{label}</p><p className="mt-1 text-xs text-muted">Adjust the filters or check back later.</p></div></div>;
}

export function VerificationQueue() {
  const { user } = useAuth();
  const { data = [], loading, load } = useAdminData<VerificationItem[]>("/api/admin/verifications");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<VerificationItem>();
  const filtered = useMemo(() => data.filter((item) => `${item.owner.firstName} ${item.owner.lastName} ${item.owner.email}`.toLowerCase().includes(query.toLowerCase())), [data, query]);
  async function decide(action: "approve" | "reject") {
    if (!selected) return;
    const reason = window.prompt(`Reason for ${action === "approve" ? "approval" : "rejection"} (minimum 8 characters):`);
    if (!reason) return;
    const result = await mutate(`/api/admin/verifications/${selected.id}`, { action, reason });
    result.success ? toastSuccess("Verification updated", result.message) : toastError("Action failed", result.message);
    if (result.success) { setSelected(undefined); await load(); }
  }
  async function assignToMe() {
    if (!selected || !user?.id) return;
    const result = await mutate(`/api/admin/verifications/${selected.id}`, { action: "assign", assigneeId: user.id });
    result.success ? toastSuccess("Review assigned", result.message) : toastError("Assignment failed", result.message);
    if (result.success) await load();
  }
  return (
    <AdminCanvas>
      <CenterHeader title="Verification Queue" description="Review and process tenant and landlord verification submissions." count={data.filter((item) => item.status === "Pending").length} />
      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_18rem]">
        <section className="rounded-xl border border-line bg-white p-4"><SearchField value={query} setValue={setQuery} /><div className="mt-4">{loading ? <QueueSkeleton /> : filtered.length ? <div className="divide-y divide-line">{filtered.map((item) => <button key={item.id} onClick={() => setSelected(item)} className="flex min-h-20 w-full items-center gap-3 py-3 text-left"><span className="grid h-10 w-10 place-items-center rounded-full bg-sand-200 text-xs font-extrabold">{item.owner.firstName[0]}{item.owner.lastName[0]}</span><span className="min-w-0 flex-1"><strong className="block truncate text-sm text-ink">{item.owner.firstName} {item.owner.lastName}</strong><span className="block truncate text-xs text-muted">{item.type} · {item.property?.title || item.owner.role}</span></span><span className="text-xs font-bold text-forest-700">{item.status}</span></button>)}</div> : <EmptyQueue label="No verification submissions found" />}</div></section>
        <aside className="space-y-4"><MetricCard icon={Clock3} label="Average review time" value="24h 15m" /><MetricCard icon={AlertTriangle} label="SLA target" value="Under 48h" /></aside>
      </div>
      {selected && <ReviewDialog title={`${selected.owner.firstName} ${selected.owner.lastName}`} onClose={() => setSelected(undefined)}><p className="text-sm text-muted">{selected.owner.email}</p><dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-muted">Submission</dt><dd className="font-bold">{selected.type}</dd></div><div><dt className="text-muted">Status</dt><dd className="font-bold">{selected.status}</dd></div></dl><button onClick={() => void assignToMe()} className="stitch-button-secondary mt-5 w-full">Assign to me</button><div className="mt-3 grid grid-cols-2 gap-3"><button onClick={() => void decide("reject")} className="stitch-button-secondary text-red-700"><X className="h-4 w-4" /> Reject</button><button onClick={() => void decide("approve")} className="stitch-button"><Check className="h-4 w-4" /> Approve</button></div></ReviewDialog>}
    </AdminCanvas>
  );
}

export function DisputeCenter() {
  const { user } = useAuth();
  const { data = [], loading, load } = useAdminData<DisputeItem[]>("/api/admin/disputes");
  const [selected, setSelected] = useState<DisputeItem>();
  const [query, setQuery] = useState("");
  const filtered = data.filter((item) => `${item.reference} ${item.title}`.toLowerCase().includes(query.toLowerCase()));
  async function action(actionName: "investigate" | "resolve" | "dismiss" | "note") {
    if (!selected) return;
    const text = window.prompt(actionName === "note" ? "Investigation note:" : `Reason to ${actionName}:`);
    if (!text) return;
    const body = actionName === "note" ? { action: "note", body: text, internal: true } : { action: actionName, reason: text };
    const result = await mutate(`/api/admin/disputes/${selected.id}`, body);
    result.success ? toastSuccess("Case updated", result.message) : toastError("Action failed", result.message);
    if (result.success) { setSelected(undefined); await load(); }
  }
  async function assignToMe() {
    if (!selected || !user?.id) return;
    const result = await mutate(`/api/admin/disputes/${selected.id}`, { action: "assign", assigneeId: user.id });
    result.success ? toastSuccess("Case assigned", result.message) : toastError("Assignment failed", result.message);
    if (result.success) await load();
  }
  return (
    <AdminCanvas>
      <CenterHeader title="Fraud & Dispute Center" description="Manage reported listings and resolve protected-payment cases." count={data.filter((item) => !["Resolved", "Dismissed"].includes(item.status)).length} />
      <div className="mt-6 grid gap-5 lg:grid-cols-[19rem_1fr]">
        <section className="rounded-xl border border-line bg-white p-4"><SearchField value={query} setValue={setQuery} /><div className="mt-4 space-y-2">{loading ? <QueueSkeleton /> : filtered.length ? filtered.map((item) => <button key={item.id} onClick={() => setSelected(item)} className={`w-full rounded-lg border p-3 text-left ${selected?.id === item.id ? "border-forest-500 bg-forest-50" : "border-line bg-sand-50"}`}><span className="flex items-center justify-between text-[10px] font-bold"><span>Case #{item.reference}</span><span className={item.priority === "Critical" || item.priority === "High" ? "text-red-700" : "text-muted"}>{item.priority}</span></span><strong className="mt-2 block text-sm text-ink">{item.title}</strong><span className="mt-1 block text-xs text-muted">{item.reporter.firstName} {item.reporter.lastName}</span></button>) : <EmptyQueue label="No disputes found" />}</div></section>
        <section className="rounded-xl border border-line bg-white p-5">{selected ? <><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold text-forest-700">Case #{selected.reference}</p><h2 className="mt-1 text-xl font-extrabold">{selected.title}</h2></div><span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">{selected.status}</span></div><p className="mt-5 text-sm leading-6 text-muted">{selected.description}</p>{selected.payment && <div className="mt-5 rounded-lg bg-sand-100 p-4"><p className="text-xs text-muted">Payment in dispute</p><p className="mt-1 text-xl font-extrabold">₦{selected.payment.amount.toLocaleString()}</p></div>}<div className="mt-6 flex flex-wrap gap-2"><button onClick={() => void assignToMe()} className="stitch-button-secondary">Assign to me</button><button onClick={() => void action("investigate")} className="stitch-button-secondary">Investigate</button><button onClick={() => void action("note")} className="stitch-button-secondary">Add note</button><button onClick={() => void action("dismiss")} className="stitch-button-secondary">Dismiss</button><button onClick={() => void action("resolve")} className="stitch-button">Resolve</button></div></> : <EmptyQueue label="Select a case to investigate" />}</section>
      </div>
    </AdminCanvas>
  );
}

export function ModerationCenter() {
  const { data, loading, load } = useAdminData<ModerationData>("/api/admin/moderation");
  const [query, setQuery] = useState("");
  const listings = (data?.listings || []).filter((item) => `${item.title} ${item.owner.email}`.toLowerCase().includes(query.toLowerCase()));
  async function listingAction(id: string, status: "Approved" | "Flagged" | "Removed") {
    const reason = window.prompt(`Reason for ${status.toLowerCase()} decision:`);
    if (!reason) return;
    const result = await mutate(`/api/admin/moderation/listings/${id}`, { status, reason });
    result.success ? toastSuccess("Listing updated", result.message) : toastError("Action failed", result.message);
    if (result.success) await load();
  }
  async function userAction(id: string, status: "Active" | "Restricted" | "Suspended") {
    const reason = window.prompt(`Reason for setting account to ${status.toLowerCase()}:`);
    if (!reason) return;
    const result = await mutate(`/api/admin/moderation/users/${id}`, { status, reason });
    result.success ? toastSuccess("Account updated", result.message) : toastError("Action failed", result.message);
    if (result.success) await load();
  }
  return (
    <AdminCanvas>
      <CenterHeader title="Platform Moderation" description="Review flagged activity, listings, and account trust signals." count={(data?.users.length || 0) + (data?.listings.length || 0)} />
      <div className="mt-6 grid gap-5 xl:grid-cols-[1fr_18rem]"><section><SearchField value={query} setValue={setQuery} /><h2 className="mb-3 mt-6 text-lg font-extrabold">Flagged content</h2>{loading ? <QueueSkeleton /> : listings.length ? <div className="space-y-3">{listings.map((item) => <article key={item.id} className="rounded-xl border-l-2 border-red-500 bg-white p-4 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-extrabold text-ink">{item.title}</h3><p className="mt-1 text-xs text-muted">{item.location} · {item.owner.firstName} {item.owner.lastName}</p></div><span className="h-fit rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700">{item.moderationStatus}</span></div><div className="mt-4 flex flex-wrap gap-2"><button onClick={() => void listingAction(item.id, "Approved")} className="stitch-button-secondary">Approve</button><button onClick={() => void listingAction(item.id, "Flagged")} className="stitch-button-secondary">Flag</button><button onClick={() => void listingAction(item.id, "Removed")} className="stitch-button bg-red-700 hover:bg-red-800">Remove listing</button></div></article>)}</div> : <EmptyQueue label="No listings require review" />}<h2 className="mb-3 mt-8 text-lg font-extrabold">Restricted accounts</h2><div className="space-y-3">{data?.users.map((item) => <article key={item.id} className="rounded-xl border border-line bg-white p-4"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-extrabold">{item.firstName} {item.lastName}</h3><p className="text-xs text-muted">{item.email} · {item.role}</p></div><span className="text-xs font-bold text-red-700">{item.accountStatus}</span></div><div className="mt-3 flex flex-wrap gap-2"><button onClick={() => void userAction(item.id, "Active")} className="stitch-button-secondary">Restore</button><button onClick={() => void userAction(item.id, "Restricted")} className="stitch-button-secondary">Restrict</button><button onClick={() => void userAction(item.id, "Suspended")} className="stitch-button bg-red-700 hover:bg-red-800">Suspend</button></div></article>)}</div></section><aside className="rounded-xl border border-line bg-white p-4"><h2 className="text-sm font-extrabold">Recent audit log</h2><div className="mt-4 space-y-4">{data?.audits.map((audit) => <article key={audit.id} className="border-l border-forest-300 pl-3"><p className="text-xs font-bold text-ink">{audit.action}</p><p className="mt-1 text-[11px] leading-4 text-muted">{audit.reason}</p></article>)}</div></aside></div>
    </AdminCanvas>
  );
}

function AdminCanvas({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-7xl p-4 pb-24 sm:p-6 md:pb-8 lg:p-8">{children}</div>;
}
function MetricCard({ icon: Icon, label, value }: { icon: typeof Clock3; label: string; value: string }) {
  return <article className="rounded-xl border border-line bg-white p-4"><Icon className="h-4 w-4 text-forest-700" /><p className="mt-4 text-xs text-muted">{label}</p><p className="mt-1 text-xl font-extrabold">{value}</p></article>;
}
function ReviewDialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="fixed inset-0 z-50 grid place-items-end bg-forest-950/40 p-0 sm:place-items-center sm:p-4" role="presentation" onMouseDown={onClose}><section role="dialog" aria-modal="true" aria-labelledby="review-title" onMouseDown={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl"><div className="flex items-center justify-between"><h2 id="review-title" className="text-xl font-extrabold">{title}</h2><button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-full bg-sand-200" aria-label="Close review"><X className="h-5 w-5" /></button></div>{children}</section></div>;
}
