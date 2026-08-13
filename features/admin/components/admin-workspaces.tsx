"use client";

import { useEffect, useId, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, ShieldCheck, X } from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import { formatNaira } from "@/utils/map-property";
import { toastError, toastSuccess } from "@/stores/toast-store";

type Pagination = { page: number; pageSize: number; totalItems: number; totalPages: number };
type PageData<T> = { items: T[]; pagination: Pagination };
type UserItem = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  accountStatus: string;
  verificationLevel: string;
  emailVerified: boolean;
  onboardingComplete: boolean;
  createdAt: Date;
  _count: { properties: number; applications: number; payments: number };
};
type PropertyItem = {
  id: string;
  title: string;
  location: string;
  city: string;
  type: string;
  price: number;
  status: string;
  moderationStatus: string;
  moderationReason?: string | null;
  verified: boolean;
  updatedAt: Date;
  reviewedAt?: Date | null;
  owner: { firstName: string; lastName: string; email: string };
  reviewedBy?: { firstName: string; lastName: string } | null;
};
type PaymentItem = {
  id: string;
  amount: number;
  status: string;
  reference?: string | null;
  failureReason?: string | null;
  dueDate: Date;
  paidAt?: Date | null;
  updatedAt: Date;
  tenant: { firstName: string; lastName: string; email: string };
  property: { id: string; title: string; location: string };
  _count: { disputes: number };
};
type AuditItem = {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  previousState: unknown;
  resultingState: unknown;
  createdAt: Date;
  actor: { firstName: string; lastName: string; email: string; role: string };
};

function WorkspaceHeader({ title, description, count }: { title: string; description: string; count: number }) {
  return (
    <header className="admin-page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="admin-record-count">
        <span>Total records</span>
        <strong>{count}</strong>
      </div>
    </header>
  );
}

function Filters({
  options,
  placeholder,
}: {
  options?: { name: string; label: string; values: string[] };
  placeholder: string;
}) {
  const searchParams = useSearchParams();
  return (
    <form method="get" className="admin-filter-bar !mt-0 sm:grid sm:grid-cols-[minmax(0,1fr)_12rem_auto]">
      <label>
        <span className="sr-only">Search</span>
        <Input
          name="query"
          defaultValue={searchParams.get("query") ?? ""}
          leadingIcon={Search}
          placeholder={placeholder}
        />
      </label>
      {options ? (
        <label>
          <span className="sr-only">{options.label}</span>
          <Select name={options.name} defaultValue={searchParams.get(options.name) ?? ""}>
            <option value="">All {options.label.toLowerCase()}</option>
            {options.values.map((value) => (
              <option key={value}>{value}</option>
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

function Pager({ value }: { value: Pagination }) {
  const path = usePathname();
  const search = useSearchParams();
  const href = (page: number) => {
    const params = new URLSearchParams(search);
    params.set("page", String(page));
    return `${path}?${params}`;
  };
  if (value.totalPages <= 1) return null;
  return (
    <nav aria-label="Pagination" className="mt-5 flex flex-wrap items-center justify-between gap-3">
      <Link
        className={`stitch-button-secondary ${value.page === 1 ? "pointer-events-none opacity-50" : ""}`}
        href={href(Math.max(1, value.page - 1))}
      >
        Previous
      </Link>
      <span className="text-xs font-bold text-muted">
        Page {value.page} of {value.totalPages}
      </span>
      <Link
        className={`stitch-button-secondary ${value.page === value.totalPages ? "pointer-events-none opacity-50" : ""}`}
        href={href(Math.min(value.totalPages, value.page + 1))}
      >
        Next
      </Link>
    </nav>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="grid min-h-64 place-items-center p-8 text-center">
      <div>
        <ShieldCheck className="mx-auto size-8 text-forest-600" />
        <p className="mt-3 font-bold">{message}</p>
        <p className="mt-1 text-sm text-muted">Change the filters or check back later.</p>
      </div>
    </div>
  );
}

async function patchRecord(path: string, body: object) {
  try {
    const response = await fetch(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return (await response.json()) as { success: boolean; message: string };
  } catch {
    return { success: false, message: "The request could not reach the server." };
  }
}

function reportMutation(result: { success: boolean; message: string }, successTitle: string) {
  if (result.success) toastSuccess(successTitle, result.message);
  else toastError("Action failed", result.message);
}

export function UsersWorkspace({
  data,
  canSanction,
  currentUserId,
}: {
  data: PageData<UserItem>;
  canSanction: boolean;
  currentUserId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<{ item: UserItem; status: string }>();
  async function submit(reason: string) {
    if (!action) return;
    const result = await patchRecord(`/api/admin/moderation/users/${action.item.id}`, {
      status: action.status,
      reason,
    });
    reportMutation(result, "Account updated");
    if (result.success) {
      setAction(undefined);
      startTransition(() => router.refresh());
    }
  }
  return (
    <Canvas>
      <WorkspaceHeader
        title="Users"
        description="Inspect Neon Auth profile mirrors, roles, verification, onboarding, and account status."
        count={data.pagination.totalItems}
      />
      <section className="admin-ledger p-3">
        <Filters
          placeholder="Search name or email..."
          options={{
            name: "role",
            label: "Roles",
            values: ["Tenant", "Landlord", "PropertyManager", "Moderator", "Admin", "SuperAdmin"],
          }}
        />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[58rem] text-left text-sm">
            <thead className="bg-sand-100 text-xs text-muted">
              <tr>
                {["User", "Role", "Status", "Verification", "Activity", "Actions"].map((label) => (
                  <th key={label} className="px-4 py-3 font-bold">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4">
                    <strong className="block">
                      {item.firstName || "Unnamed"} {item.lastName}
                    </strong>
                    <span className="block max-w-64 truncate text-xs text-muted" title={item.email}>
                      {item.email}
                    </span>
                  </td>
                  <td className="px-4 py-4">{item.role}</td>
                  <td className="px-4 py-4 font-bold">{item.accountStatus}</td>
                  <td className="px-4 py-4">
                    <span className="block">{item.verificationLevel}</span>
                    <span className="text-xs text-muted">
                      {item.emailVerified ? "Email verified" : "Email unverified"} ·{" "}
                      {item.onboardingComplete ? "Onboarded" : "Incomplete"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs">
                    {item._count.properties} properties
                    <br />
                    {item._count.applications} applications
                    <br />
                    {item._count.payments} payments
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {canSanction && item.id !== currentUserId ? (
                        (["Active", "Restricted", "Suspended"] as const).map((status) => (
                          <button
                            key={status}
                            disabled={pending || status === item.accountStatus}
                            onClick={() => setAction({ item, status })}
                            className="rounded-lg border border-line px-3 py-2 text-xs font-bold disabled:opacity-40"
                          >
                            {status}
                          </button>
                        ))
                      ) : (
                        <span className="text-xs text-muted">Read only</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.items.length === 0 && <Empty message="No users found" />}
        </div>
        <Pager value={data.pagination} />
      </section>
      {action && (
        <DecisionDialog
          title={`${action.status} ${action.item.firstName || action.item.email}`}
          pending={pending}
          onClose={() => setAction(undefined)}
          onSubmit={submit}
        />
      )}
    </Canvas>
  );
}

export function PropertiesWorkspace({ data }: { data: PageData<PropertyItem> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [action, setAction] = useState<{ item: PropertyItem; status: string }>();
  async function submit(reason: string) {
    if (!action) return;
    const result = await patchRecord(`/api/admin/moderation/listings/${action.item.id}`, {
      status: action.status,
      reason,
    });
    reportMutation(result, "Listing updated");
    if (result.success) {
      setAction(undefined);
      startTransition(() => router.refresh());
    }
  }
  return (
    <Canvas>
      <WorkspaceHeader
        title="Properties"
        description="Review every listing state and its owner, moderation decision, and public visibility."
        count={data.pagination.totalItems}
      />
      <section className="admin-ledger p-3">
        <Filters
          placeholder="Search listing, city, owner..."
          options={{ name: "status", label: "Statuses", values: ["PendingReview", "Approved", "Flagged", "Removed"] }}
        />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[64rem] text-left text-sm">
            <thead className="bg-sand-100 text-xs text-muted">
              <tr>
                {["Listing", "Owner", "Rent", "Property state", "Moderation", "Actions"].map((label) => (
                  <th key={label} className="px-4 py-3">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4">
                    <Link href={`/properties/${item.id}`} className="font-bold text-forest-700">
                      {item.title}
                    </Link>
                    <span className="block text-xs text-muted">
                      {item.type} · {item.location}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span>
                      {item.owner.firstName} {item.owner.lastName}
                    </span>
                    <span className="block max-w-56 truncate text-xs text-muted" title={item.owner.email}>
                      {item.owner.email}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-bold">{formatNaira(item.price)}</td>
                  <td className="px-4 py-4">{item.status}</td>
                  <td className="px-4 py-4">
                    <strong>{item.moderationStatus}</strong>
                    {item.moderationReason && (
                      <span className="block max-w-64 text-xs text-muted">{item.moderationReason}</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      {(["Approved", "Flagged", "Removed"] as const).map((status) => (
                        <button
                          key={status}
                          disabled={pending || status === item.moderationStatus}
                          onClick={() => setAction({ item, status })}
                          className="rounded-lg border border-line px-3 py-2 text-xs font-bold disabled:opacity-40"
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.items.length === 0 && <Empty message="No properties found" />}
        </div>
        <Pager value={data.pagination} />
      </section>
      {action && (
        <DecisionDialog
          title={`${action.status} ${action.item.title}`}
          pending={pending}
          onClose={() => setAction(undefined)}
          onSubmit={submit}
        />
      )}
    </Canvas>
  );
}

export function PaymentsWorkspace({ data }: { data: PageData<PaymentItem> }) {
  return (
    <Canvas>
      <WorkspaceHeader
        title="Payments"
        description="Inspect protected-payment records and linked disputes. Financial status remains provider-controlled."
        count={data.pagination.totalItems}
      />
      <section className="admin-ledger p-3">
        <Filters
          placeholder="Search reference, tenant or property..."
          options={{ name: "status", label: "Statuses", values: ["Paid", "Due", "Overdue", "Processing", "Failed"] }}
        />
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[58rem] text-left text-sm">
            <thead className="bg-sand-100 text-xs text-muted">
              <tr>
                {["Payment", "Tenant", "Property", "Amount", "Status", "Due / paid", "Disputes"].map((label) => (
                  <th key={label} className="px-4 py-3">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4">
                    <strong className="block">{item.reference ?? "No reference"}</strong>
                    {item.failureReason && (
                      <span className="block max-w-64 text-xs text-red-700">{item.failureReason}</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span>
                      {item.tenant.firstName} {item.tenant.lastName}
                    </span>
                    <span className="block max-w-56 truncate text-xs text-muted" title={item.tenant.email}>
                      {item.tenant.email}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <Link className="font-bold text-forest-700" href={`/properties/${item.property.id}`}>
                      {item.property.title}
                    </Link>
                    <span className="block text-xs text-muted">{item.property.location}</span>
                  </td>
                  <td className="px-4 py-4 font-bold">{formatNaira(item.amount)}</td>
                  <td className="px-4 py-4 font-bold">{item.status}</td>
                  <td className="px-4 py-4 text-xs">
                    Due {new Date(item.dueDate).toLocaleDateString()}
                    {item.paidAt && (
                      <>
                        <br />
                        Paid {new Date(item.paidAt).toLocaleDateString()}
                      </>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {item._count.disputes ? (
                      <Link
                        href={`/admin/disputes?query=${encodeURIComponent(item.reference ?? item.id)}`}
                        className="font-bold text-forest-700"
                      >
                        {item._count.disputes} linked
                      </Link>
                    ) : (
                      "None"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {data.items.length === 0 && <Empty message="No payments found" />}
        </div>
        <Pager value={data.pagination} />
      </section>
    </Canvas>
  );
}

export function AuditWorkspace({ data }: { data: PageData<AuditItem> }) {
  return (
    <Canvas>
      <WorkspaceHeader
        title="Audit log"
        description="Trace administrator actions with actors, targets, reasons, and before/after state."
        count={data.pagination.totalItems}
      />
      <section className="admin-ledger p-3">
        <Filters
          placeholder="Search action, reason, target or actor..."
          options={{
            name: "targetType",
            label: "Targets",
            values: ["Verification", "Dispute", "User", "Property", "Payment", "Maintenance", "AdminInvitation"],
          }}
        />
        <div className="mt-4 space-y-3">
          {data.items.map((item) => (
            <details key={item.id} className="border border-line bg-sand-50 p-4">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <strong className="block text-sm">{item.action}</strong>
                    <span className="text-xs text-muted">
                      {item.actor.firstName} {item.actor.lastName} · {item.actor.role} · {item.targetType}
                    </span>
                  </div>
                  <time className="text-xs text-muted">{new Date(item.createdAt).toLocaleString()}</time>
                </div>
                <p className="mt-2 text-sm text-muted">{item.reason}</p>
              </summary>
              <div className="mt-4 grid gap-3 border-t border-line pt-4 lg:grid-cols-2">
                <State label="Previous state" value={item.previousState} />
                <State label="Resulting state" value={item.resultingState} />
              </div>
              <p className="mt-3 break-all text-[11px] text-muted">Target: {item.targetId}</p>
            </details>
          ))}
          {data.items.length === 0 && <Empty message="No audit events found" />}
        </div>
        <Pager value={data.pagination} />
      </section>
    </Canvas>
  );
}

export function AdminPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const response = await fetch("/api/auth/custom/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const result = (await response.json()) as { success: boolean; message: string };
      if (result.success) toastSuccess("Password changed", result.message);
      else toastError("Password change failed", result.message);
      if (result.success) {
        setCurrentPassword("");
        setNewPassword("");
      }
    } catch {
      toastError("Password change failed", "The request could not reach the server.");
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={(event) => void submit(event)} className="border border-line bg-white p-5">
      <h2 className="text-lg font-extrabold">Change password</h2>
      <p className="mt-1 text-sm text-muted">Other Neon Auth sessions are revoked after a successful change.</p>
      <div className="mt-5 grid gap-4">
        <label className="text-sm font-bold">
          Current password
          <Input
            type="password"
            autoComplete="current-password"
            className="mt-2"
            value={currentPassword}
            onChange={(event) => setCurrentPassword(event.target.value)}
            required
          />
        </label>
        <label className="text-sm font-bold">
          New password
          <Input
            type="password"
            autoComplete="new-password"
            className="mt-2"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            minLength={12}
            required
          />
        </label>
        <button disabled={pending} className="stitch-button w-full sm:w-fit">
          {pending ? "Updating…" : "Update password"}
        </button>
      </div>
    </form>
  );
}

function Canvas({ children }: { children: React.ReactNode }) {
  return <div className="admin-canvas">{children}</div>;
}
function State({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-bold text-muted">{label}</p>
      <pre className="mt-2 max-h-52 overflow-auto whitespace-pre-wrap break-all rounded-lg bg-forest-950 p-3 text-[11px] text-sand-100">
        {value == null ? "None" : JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
function DecisionDialog({
  title,
  onClose,
  onSubmit,
  pending,
}: {
  title: string;
  onClose: () => void;
  onSubmit(reason: string): Promise<void>;
  pending: boolean;
}) {
  const [reason, setReason] = useState("");
  const dialogRef = useRef<HTMLElement>(null);
  const titleId = useId();
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab" || !dialogRef.current) return;
      const focusable = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ));
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previous?.focus();
    };
  }, [onClose]);
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end overflow-y-auto bg-forest-950/40 sm:place-items-center sm:p-4"
      onMouseDown={onClose}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onMouseDown={(event) => event.stopPropagation()}
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-6 outline-none sm:rounded-2xl"
      >
        <div className="flex items-center justify-between gap-3">
          <h2 id={titleId} className="text-xl font-extrabold">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="grid size-11 shrink-0 place-items-center rounded-full bg-sand-200"
            aria-label="Close dialog"
          >
            <X className="size-5" />
          </button>
        </div>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            if (reason.trim().length >= 8) void onSubmit(reason.trim());
          }}
        >
          <label className="mt-5 block text-sm font-bold">
            Audit reason
            <Textarea
              className="mt-2"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              minLength={8}
              maxLength={1000}
              required
            />
          </label>
          <p className="mt-2 text-xs text-muted">At least 8 characters. This action is recorded permanently.</p>
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="stitch-button-secondary">
              Cancel
            </button>
            <button disabled={pending || reason.trim().length < 8} className="stitch-button disabled:opacity-50">
              {pending ? "Saving…" : "Confirm"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
