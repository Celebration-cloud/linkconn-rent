"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, Search, ShieldCheck, X } from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import { toastError, toastSuccess } from "@/stores/toast-store";
import { useAuth } from "@/providers/auth-provider";

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  message: string;
}
interface Pagination {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}
interface PageData<T> {
  items: T[];
  pagination: Pagination;
}
interface VerificationItem {
  id: string;
  type: string;
  status: string;
  createdAt: Date;
  owner: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    role: string;
    emailVerified: boolean;
    tenantProfile: {
      employmentType: string;
      employerName: string | null;
      jobTitle: string | null;
      incomeRange: string;
      preferredLocations: string[];
      preferredTypes: string[];
      budgetMin: number | null;
      budgetMax: number | null;
      moveInDate: Date | null;
      ninStatus: string;
      ninNumber: string | null;
    } | null;
    landlordProfile: {
      businessName: string | null;
      propertyCount: number;
      propertyTypesOffered: string[];
      ninStatus: string;
      ninNumber: string | null;
      bankName: string | null;
      accountNumber: string | null;
      accountName: string | null;
    } | null;
  };
  property?: { title: string } | null;
  assignedTo?: { firstName: string; lastName: string } | null;
  documents: Array<{
    id: string;
    kind: string;
    fileName: string | null;
    mimeType?: string | null;
    size?: number | null;
    deletedAt?: Date | null;
  }>;
}
interface DisputeItem {
  id: string;
  reference: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  createdAt: Date;
  reporter: { firstName: string; lastName: string; email: string };
  property?: { id: string; title: string } | null;
  assignedTo?: { firstName: string; lastName: string } | null;
  payment?: { amount: number; reference?: string | null } | null;
  notes: Array<{ id: string; body: string; createdAt: Date; author: { firstName: string; lastName: string } }>;
}
interface ModerationData {
  users: Array<{ id: string; firstName: string; lastName: string; email: string; role: string; accountStatus: string }>;
  listings: Array<{
    id: string;
    title: string;
    location: string;
    price: number;
    status: string;
    moderationStatus: string;
    moderationReason?: string | null;
    owner: { firstName: string; lastName: string; email: string };
  }>;
  audits: Array<{
    id: string;
    action: string;
    reason: string;
    createdAt: Date;
    actor: { firstName: string; lastName: string };
  }>;
}

async function mutate(path: string, body: object) {
  try {
    const response = await fetch(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const result = (await response.json()) as ApiEnvelope<unknown>;
    return { ...result, ok: response.ok };
  } catch {
    return { success: false, ok: false, message: "The request could not reach the server. Try again." };
  }
}

function reportMutation(result: ApiEnvelope<unknown>, successTitle: string, errorTitle: string) {
  if (result.success) toastSuccess(successTitle, result.message);
  else toastError(errorTitle, result.message);
}

function useDialogFocus(onClose: () => void) {
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      previous?.focus();
    };
  }, [onClose]);
  return dialogRef;
}

function CenterHeader({ title, description, count }: { title: string; description: string; count: number }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">{description}</p>
      </div>
      <article className="w-full rounded-xl bg-forest-800 p-4 text-white sm:w-auto sm:min-w-52">
        <p className="text-[10px] font-bold uppercase tracking-wider text-lime-300">Total results</p>
        <p className="mt-1 text-3xl font-extrabold tabular-nums">{count}</p>
      </article>
    </div>
  );
}

function QueueFilters({
  statuses,
  placeholder = "Search by name, email, case or listing...",
}: {
  statuses?: string[];
  placeholder?: string;
}) {
  const searchParams = useSearchParams();
  return (
    <form className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto]" method="get">
      <label>
        <span className="sr-only">Search queue</span>
        <Input
          name="query"
          defaultValue={searchParams.get("query") ?? ""}
          placeholder={placeholder}
          leadingIcon={Search}
        />
      </label>
      {statuses ? (
        <label>
          <span className="sr-only">Status</span>
          <Select name="status" defaultValue={searchParams.get("status") ?? ""}>
            <option value="">All statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </Select>
        </label>
      ) : (
        <span />
      )}
      <button className="stitch-button">Apply filters</button>
    </form>
  );
}

function PaginationLinks({ pagination }: { pagination: Pagination }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const hrefFor = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", String(page));
    return `${pathname}?${params}`;
  };
  if (pagination.totalPages <= 1) return null;
  return (
    <nav className="mt-5 flex flex-wrap items-center justify-between gap-3" aria-label="Pagination">
      <Link
        aria-disabled={pagination.page <= 1}
        className={`stitch-button-secondary ${pagination.page <= 1 ? "pointer-events-none opacity-50" : ""}`}
        href={hrefFor(Math.max(1, pagination.page - 1))}
      >
        Previous
      </Link>
      <span className="text-xs font-bold text-muted">
        Page {pagination.page} of {pagination.totalPages}
      </span>
      <Link
        aria-disabled={pagination.page >= pagination.totalPages}
        className={`stitch-button-secondary ${pagination.page >= pagination.totalPages ? "pointer-events-none opacity-50" : ""}`}
        href={hrefFor(Math.min(pagination.totalPages, pagination.page + 1))}
      >
        Next
      </Link>
    </nav>
  );
}

function EmptyQueue({ label }: { label: string }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-line bg-white p-8 text-center">
      <div>
        <ShieldCheck className="mx-auto h-8 w-8 text-forest-600" />
        <p className="mt-3 text-sm font-bold text-ink">{label}</p>
        <p className="mt-1 text-xs text-muted">Adjust the filters or check back later.</p>
      </div>
    </div>
  );
}

export function VerificationQueue({
  initialData,
  canViewPrivateDocuments,
}: {
  initialData: PageData<VerificationItem>;
  canViewPrivateDocuments: boolean;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<VerificationItem>();
  const [decision, setDecision] = useState<"approve" | "reject">();
  async function assignToMe() {
    if (!selected || !user?.id) return;
    const result = await mutate(`/api/admin/verifications/${selected.id}`, { action: "assign", assigneeId: user.id });
    reportMutation(result, "Verification updated", "Assignment failed");
    if (result.success) startTransition(() => router.refresh());
  }
  async function submitDecision(reason: string, notes: string) {
    if (!selected || !decision) return;
    const result = await mutate(`/api/admin/verifications/${selected.id}`, {
      action: decision,
      reason,
      notes: notes || undefined,
    });
    reportMutation(result, "Verification updated", "Action failed");
    if (result.success) {
      setDecision(undefined);
      setSelected(undefined);
      startTransition(() => router.refresh());
    }
  }
  return (
    <AdminCanvas>
      <CenterHeader
        title="Verification Queue"
        description="Review identity and ownership evidence stored with each Neon-backed submission."
        count={initialData.pagination.totalItems}
      />
      <section className="mt-6 rounded-xl border border-line bg-white p-4">
        <QueueFilters statuses={["Pending", "Approved", "Rejected", "Draft"]} />
        <div className="mt-4 divide-y divide-line">
          {initialData.items.length ? (
            initialData.items.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelected(item)}
                className="flex min-h-20 w-full items-center gap-3 py-3 text-left"
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-sand-200 text-xs font-extrabold">
                  {item.owner.firstName[0]}
                  {item.owner.lastName[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block truncate text-sm text-ink">
                    {item.owner.firstName} {item.owner.lastName}
                  </strong>
                  <span className="block truncate text-xs text-muted">
                    {item.owner.email} · {item.type} · {item.property?.title || item.owner.role}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-bold text-forest-700">{item.status}</span>
              </button>
            ))
          ) : (
            <EmptyQueue label="No verification submissions found" />
          )}
        </div>
        <PaginationLinks pagination={initialData.pagination} />
      </section>
      {selected && (
        <ReviewDialog
          title={`${selected.owner.firstName} ${selected.owner.lastName}`}
          onClose={() => setSelected(undefined)}
        >
          <p className="break-all text-sm text-muted">{selected.owner.email}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <Fact label="Submission" value={selected.type} />
            <Fact label="Status" value={selected.status} />
            <Fact label="Role" value={formatReviewValue(selected.owner.role)} />
            <Fact label="Phone" value={selected.owner.phone || "Not supplied"} />
            <Fact label="Email verification" value={selected.owner.emailVerified ? "Verified" : "Not verified"} />
            <Fact
              label="Assigned to"
              value={
                selected.assignedTo ? `${selected.assignedTo.firstName} ${selected.assignedTo.lastName}` : "Unassigned"
              }
            />
            <Fact
              label="Evidence"
              value={`${selected.documents.length} document${selected.documents.length === 1 ? "" : "s"}`}
            />
          </dl>
          {selected.owner.tenantProfile && (
            <ReviewFactsSection title="Tenant onboarding details">
              <Fact label="Employment" value={formatReviewValue(selected.owner.tenantProfile.employmentType)} />
              <Fact label="Employer / organisation" value={selected.owner.tenantProfile.employerName || "Not supplied"} />
              <Fact label="Job title" value={selected.owner.tenantProfile.jobTitle || "Not supplied"} />
              <Fact label="Income range" value={formatReviewValue(selected.owner.tenantProfile.incomeRange)} />
              <Fact label="Preferred locations" value={formatReviewList(selected.owner.tenantProfile.preferredLocations)} />
              <Fact label="Preferred property types" value={formatReviewList(selected.owner.tenantProfile.preferredTypes)} />
              <Fact label="Minimum budget" value={formatReviewCurrency(selected.owner.tenantProfile.budgetMin)} />
              <Fact label="Maximum budget" value={formatReviewCurrency(selected.owner.tenantProfile.budgetMax)} />
              <Fact label="Move-in date" value={formatReviewDate(selected.owner.tenantProfile.moveInDate)} />
              <Fact label="NIN status" value={formatReviewValue(selected.owner.tenantProfile.ninStatus)} />
              {canViewPrivateDocuments && <Fact label="NIN" value={selected.owner.tenantProfile.ninNumber || "Not supplied"} />}
            </ReviewFactsSection>
          )}
          {selected.owner.landlordProfile && (
            <ReviewFactsSection title="Landlord onboarding details">
              <Fact label="Business / agency" value={selected.owner.landlordProfile.businessName || "Not supplied"} />
              <Fact label="Properties managed" value={String(selected.owner.landlordProfile.propertyCount)} />
              <Fact label="Property types" value={formatReviewList(selected.owner.landlordProfile.propertyTypesOffered)} />
              <Fact label="NIN status" value={formatReviewValue(selected.owner.landlordProfile.ninStatus)} />
              {canViewPrivateDocuments && <Fact label="NIN" value={selected.owner.landlordProfile.ninNumber || "Not supplied"} />}
              <Fact label="Payout bank" value={selected.owner.landlordProfile.bankName || "Not supplied"} />
              <Fact label="Payout account name" value={selected.owner.landlordProfile.accountName || "Not supplied"} />
              {canViewPrivateDocuments && <Fact label="Payout account number" value={selected.owner.landlordProfile.accountNumber || "Not supplied"} />}
            </ReviewFactsSection>
          )}
          {selected.documents.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-extrabold text-ink">Submitted documents</h3>
              <ul className="mt-2 space-y-2">
              {selected.documents.map((document) => (
                <li key={document.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-sand-100 p-3 text-xs font-semibold">
                  <span className="min-w-0"><span className="block text-ink">{document.kind.replace(/([a-z])([A-Z])/g, "$1 $2")}</span><span className="block truncate text-muted">{document.fileName ?? "File removed after retention period"}</span></span>
                  {canViewPrivateDocuments && !document.deletedAt && (
                    <a href={`/api/admin/verifications/${selected.id}/documents/${document.id}`} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center rounded-lg border border-forest-300 px-3 text-forest-800 hover:bg-white">View securely</a>
                  )}
                </li>
              ))}
              </ul>
            </div>
          )}
          <button disabled={pending} onClick={() => void assignToMe()} className="stitch-button-secondary mt-5 w-full">
            Assign to me
          </button>
          <div className="mt-3 grid grid-cols-2 gap-3">
            <button onClick={() => setDecision("reject")} className="stitch-button-secondary text-red-700">
              <X className="size-4" /> Reject
            </button>
            <button onClick={() => setDecision("approve")} className="stitch-button">
              <Check className="size-4" /> Approve
            </button>
          </div>
        </ReviewDialog>
      )}
      {decision && (
        <ReasonDialog
          title={`${decision === "approve" ? "Approve" : "Reject"} verification`}
          onClose={() => setDecision(undefined)}
          onSubmit={submitDecision}
          pending={pending}
          includeNotes
        />
      )}
    </AdminCanvas>
  );
}

export function DisputeCenter({ initialData }: { initialData: PageData<DisputeItem> }) {
  const { user } = useAuth();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [selected, setSelected] = useState<DisputeItem>();
  const [actionName, setActionName] = useState<"investigate" | "resolve" | "dismiss" | "note">();
  async function assignToMe() {
    if (!selected || !user?.id) return;
    const result = await mutate(`/api/admin/disputes/${selected.id}`, { action: "assign", assigneeId: user.id });
    reportMutation(result, "Case updated", "Assignment failed");
    if (result.success) startTransition(() => router.refresh());
  }
  async function submitAction(reason: string) {
    if (!selected || !actionName) return;
    const body =
      actionName === "note" ? { action: "note", body: reason, internal: true } : { action: actionName, reason };
    const result = await mutate(`/api/admin/disputes/${selected.id}`, body);
    reportMutation(result, "Case updated", "Action failed");
    if (result.success) {
      setActionName(undefined);
      startTransition(() => router.refresh());
    }
  }
  return (
    <AdminCanvas>
      <CenterHeader
        title="Fraud & Dispute Center"
        description="Investigate reported listings and protected-payment cases with their linked records."
        count={initialData.pagination.totalItems}
      />
      <div className="mt-6 grid min-w-0 gap-5 lg:grid-cols-[19rem_minmax(0,1fr)]">
        <section className="min-w-0 rounded-xl border border-line bg-white p-4">
          <QueueFilters
            statuses={["Open", "Investigating", "Resolved", "Dismissed"]}
            placeholder="Search case or reference..."
          />
          <div className="mt-4 space-y-2">
            {initialData.items.length ? (
              initialData.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`w-full rounded-lg border p-3 text-left ${selected?.id === item.id ? "border-forest-500 bg-forest-50" : "border-line bg-sand-50"}`}
                >
                  <span className="flex items-center justify-between gap-2 text-[10px] font-bold">
                    <span>Case #{item.reference}</span>
                    <span
                      className={
                        item.priority === "Critical" || item.priority === "High" ? "text-red-700" : "text-muted"
                      }
                    >
                      {item.priority}
                    </span>
                  </span>
                  <strong className="mt-2 block break-words text-sm text-ink">{item.title}</strong>
                  <span className="mt-1 block truncate text-xs text-muted">
                    {item.reporter.firstName} {item.reporter.lastName}
                  </span>
                </button>
              ))
            ) : (
              <EmptyQueue label="No disputes found" />
            )}
            <PaginationLinks pagination={initialData.pagination} />
          </div>
        </section>
        <section className="min-w-0 rounded-xl border border-line bg-white p-5">
          {selected ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs font-bold text-forest-700">Case #{selected.reference}</p>
                  <h2 className="mt-1 break-words text-xl font-extrabold">{selected.title}</h2>
                </div>
                <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                  {selected.status}
                </span>
              </div>
              <p className="mt-5 break-words text-sm leading-6 text-muted">{selected.description}</p>
              {selected.property && (
                <p className="mt-4 text-sm">
                  <span className="text-muted">Property:</span>{" "}
                  <Link className="font-bold text-forest-700" href={`/properties/${selected.property.id}`}>
                    {selected.property.title}
                  </Link>
                </p>
              )}
              {selected.payment && (
                <div className="mt-5 rounded-lg bg-sand-100 p-4">
                  <p className="text-xs text-muted">
                    Payment in dispute · {selected.payment.reference ?? "No reference"}
                  </p>
                  <p className="mt-1 text-xl font-extrabold">₦{selected.payment.amount.toLocaleString()}</p>
                </div>
              )}
              <div className="mt-5 space-y-2">
                {selected.notes.map((note) => (
                  <article key={note.id} className="rounded-lg border border-line p-3">
                    <p className="text-xs font-bold">
                      {note.author.firstName} {note.author.lastName}
                    </p>
                    <p className="mt-1 text-sm text-muted">{note.body}</p>
                  </article>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <button disabled={pending} onClick={() => void assignToMe()} className="stitch-button-secondary">
                  Assign to me
                </button>
                {(["investigate", "note", "dismiss", "resolve"] as const).map((action) => (
                  <button
                    key={action}
                    onClick={() => setActionName(action)}
                    className={action === "resolve" ? "stitch-button" : "stitch-button-secondary"}
                  >
                    {action === "note" ? "Add note" : `${action[0].toUpperCase()}${action.slice(1)}`}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <EmptyQueue label="Select a case to investigate" />
          )}
        </section>
      </div>
      {actionName && (
        <ReasonDialog
          title={
            actionName === "note"
              ? "Add investigation note"
              : `${actionName[0].toUpperCase()}${actionName.slice(1)} case`
          }
          onClose={() => setActionName(undefined)}
          onSubmit={(reason) => submitAction(reason)}
          pending={pending}
        />
      )}
    </AdminCanvas>
  );
}

export function ModerationCenter({ initialData }: { initialData: ModerationData }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [decision, setDecision] = useState<{ kind: "listing" | "user"; id: string; status: string }>();
  async function submit(reason: string) {
    if (!decision) return;
    const path =
      decision.kind === "listing"
        ? `/api/admin/moderation/listings/${decision.id}`
        : `/api/admin/moderation/users/${decision.id}`;
    const result = await mutate(path, { status: decision.status, reason });
    reportMutation(result, "Moderation updated", "Action failed");
    if (result.success) {
      setDecision(undefined);
      startTransition(() => router.refresh());
    }
  }
  return (
    <AdminCanvas>
      <CenterHeader
        title="Platform Moderation"
        description="Review flagged activity, listing decisions, and account trust signals."
        count={initialData.users.length + initialData.listings.length}
      />
      <div className="mt-6 grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="min-w-0">
          <h2 className="mb-3 text-lg font-extrabold">Listings requiring review</h2>
          {initialData.listings.length ? (
            <div className="space-y-3">
              {initialData.listings.map((item) => (
                <article key={item.id} className="rounded-xl border-l-2 border-red-500 bg-white p-4 shadow-sm">
                  <div className="flex flex-wrap justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words font-extrabold text-ink">{item.title}</h3>
                      <p className="mt-1 break-words text-xs text-muted">
                        {item.location} · {item.owner.firstName} {item.owner.lastName} · {item.owner.email}
                      </p>
                    </div>
                    <span className="h-fit rounded-full bg-red-50 px-2 py-1 text-[10px] font-bold text-red-700">
                      {item.moderationStatus}
                    </span>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(["Approved", "Flagged", "Removed"] as const).map((status) => (
                      <button
                        key={status}
                        disabled={pending}
                        onClick={() => setDecision({ kind: "listing", id: item.id, status })}
                        className={
                          status === "Removed" ? "stitch-button bg-red-700 hover:bg-red-800" : "stitch-button-secondary"
                        }
                      >
                        {status === "Removed" ? "Remove listing" : status}
                      </button>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <EmptyQueue label="No listings require review" />
          )}
          <h2 className="mb-3 mt-8 text-lg font-extrabold">Account moderation</h2>
          <div className="space-y-3">
            {initialData.users.map((item) => (
              <article key={item.id} className="rounded-xl border border-line bg-white p-4">
                <div className="flex flex-wrap justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="break-words font-extrabold">
                      {item.firstName} {item.lastName}
                    </h3>
                    <p className="break-all text-xs text-muted">
                      {item.email} · {item.role}
                    </p>
                  </div>
                  <span className="text-xs font-bold text-red-700">{item.accountStatus}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(["Active", "Restricted", "Suspended"] as const).map((status) => (
                    <button
                      key={status}
                      disabled={pending}
                      onClick={() => setDecision({ kind: "user", id: item.id, status })}
                      className={
                        status === "Suspended" ? "stitch-button bg-red-700 hover:bg-red-800" : "stitch-button-secondary"
                      }
                    >
                      {status === "Active" ? "Restore" : status}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
        <aside className="h-fit rounded-xl border border-line bg-white p-4 xl:sticky xl:top-6">
          <h2 className="text-sm font-extrabold">Recent audit log</h2>
          <div className="mt-4 space-y-4">
            {initialData.audits.map((audit) => (
              <article key={audit.id} className="border-l border-forest-300 pl-3">
                <p className="text-xs font-bold text-ink">{audit.action}</p>
                <p className="mt-1 break-words text-[11px] leading-4 text-muted">{audit.reason}</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
      {decision && (
        <ReasonDialog
          title={`${decision.status} ${decision.kind}`}
          onClose={() => setDecision(undefined)}
          onSubmit={(reason) => submit(reason)}
          pending={pending}
        />
      )}
    </AdminCanvas>
  );
}

function AdminCanvas({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-7xl p-4 pb-28 sm:p-6 md:pb-8 lg:p-8">{children}</div>;
}

function formatReviewValue(value: string) {
  return value.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/(\d+)k\b/gi, "$1,000");
}

function formatReviewList(values: string[]) {
  return values.length > 0 ? values.join(", ") : "Not supplied";
}

function formatReviewCurrency(value: number | null) {
  return value === null
    ? "Not supplied"
    : new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

function formatReviewDate(value: Date | null) {
  if (!value) return "Not supplied";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not supplied"
    : new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeZone: "UTC" }).format(date);
}

function ReviewFactsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5 rounded-xl border border-line bg-sand-50 p-4">
      <h3 className="text-sm font-extrabold text-ink">{title}</h3>
      <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2">{children}</dl>
    </section>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted">{label}</dt>
      <dd className="break-words font-bold">{value}</dd>
    </div>
  );
}
function ReviewDialog({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const dialogRef = useDialogFocus(onClose);
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end overflow-y-auto bg-forest-950/40 p-0 sm:place-items-center sm:p-4"
      role="presentation"
      onMouseDown={onClose}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl outline-none sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id="review-title" className="text-xl font-extrabold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-sand-200"
            aria-label="Close review"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </section>
    </div>
  );
}
function ReasonDialog({
  title,
  onClose,
  onSubmit,
  pending,
  includeNotes = false,
}: {
  title: string;
  onClose: () => void;
  onSubmit(reason: string, notes: string): Promise<void>;
  pending: boolean;
  includeNotes?: boolean;
}) {
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  return (
    <ReviewDialog title={title} onClose={onClose}>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          if (reason.trim().length >= 8) void onSubmit(reason.trim(), notes.trim());
        }}
      >
        <label className="mt-5 block text-sm font-bold">
          Reason
          <Textarea
            className="mt-2"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            minLength={8}
            maxLength={1000}
            required
          />
        </label>
        {includeNotes && (
          <label className="mt-4 block text-sm font-bold">
            Internal notes <span className="font-normal text-muted">(optional)</span>
            <Textarea
              className="mt-2"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={2000}
            />
          </label>
        )}
        <p className="mt-2 text-xs text-muted">At least 8 characters. This decision is written to the audit log.</p>
        <div className="mt-5 flex justify-end gap-3">
          <button type="button" className="stitch-button-secondary" onClick={onClose}>
            Cancel
          </button>
          <button disabled={pending || reason.trim().length < 8} className="stitch-button disabled:opacity-50">
            {pending ? "Saving…" : "Confirm"}
          </button>
        </div>
      </form>
    </ReviewDialog>
  );
}
