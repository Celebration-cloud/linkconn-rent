import Link from "next/link";
import type { AppRole, LeaseStatus, PaymentStatus } from "@prisma/client";
import {
  Building2,
  CheckCircle2,
  CreditCard,
  FileDown,
  FileSignature,
  FileText,
  MapPin,
  MessageSquare,
  ShieldCheck,
  User,
  Wrench,
} from "lucide-react";
import { LeaseActions } from "@/features/leases/components/lease-actions";
import type { LeaseTerms } from "@/features/leases/contracts";

type DateValue = string | Date;

type LeaseListItem = {
  id: string;
  status: LeaseStatus;
  currentVersionNumber: number;
  property: { id: string; title: string; location: string };
};

type LeaseDetail = LeaseListItem & {
  tenant: { id: string; name: string };
  landlord: { id: string; name: string };
  activatedAt: DateValue | null;
  completedAt: DateValue | null;
  terminatedAt: DateValue | null;
  createdAt: DateValue;
  updatedAt: DateValue;
  versions: Array<{
    id: string;
    version: number;
    terms: LeaseTerms;
    contentHash: string;
    renderedAgreement: string;
    sentAt: DateValue | null;
    createdAt: DateValue;
    acceptances: Array<{
      party: "Tenant" | "Landlord";
      legalName: string;
      consentVersion: string;
      agreementHash: string;
      acceptedAt: DateValue;
    }>;
  }>;
  scheduleItems: Array<{
    id: string;
    sequence: number;
    label: string;
    amount: number;
    dueDate: DateValue;
    payment: null | {
      id: string;
      status: PaymentStatus;
      paidAt: DateValue | null;
      reference: string | null;
    };
  }>;
  activities: Array<{
    id: string;
    action: string;
    note: string | null;
    createdAt: DateValue;
    actorName: string;
  }>;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(value);

const date = (value: DateValue) =>
  new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(value));

function LeaseStatusBadge({ status }: { status: LeaseStatus }) {
  const styles: Record<string, string> = {
    Draft: "bg-sand-200 text-ink",
    Sent: "bg-forest-50 text-forest-800 ring-1 ring-forest-600/20",
    PendingAcceptance: "bg-amber-50 text-amber-800 ring-1 ring-amber-600/20",
    Accepted: "bg-forest-100 text-forest-800 ring-1 ring-forest-600/20",
    AwaitingPayment: "bg-amber-100 text-amber-900 ring-1 ring-amber-600/20",
    Active: "bg-forest-100 text-forest-950 font-black ring-1 ring-forest-600/30",
    Completed: "bg-sand-200 text-muted",
    Terminated: "bg-red-50 text-red-800",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-extrabold ${
        styles[status] ?? "bg-sand-200 text-ink"
      }`}
    >
      {status.replace(/([a-z])([A-Z])/g, "$1 $2")}
    </span>
  );
}

export function LeaseWorkspace({
  leases,
  selected,
  viewer,
}: {
  leases: LeaseListItem[];
  selected: LeaseDetail | null;
  viewer: { id: string; role: AppRole };
}) {
  if (!leases.length) {
    return (
      <section className="rounded-3xl border border-dashed border-line bg-white p-12 text-center max-w-2xl mx-auto my-8">
        <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-forest-100 text-forest-800 shadow-inner">
          <FileSignature className="size-8" />
        </div>
        <h2 className="mt-4 text-xl font-extrabold text-ink">No tenancy agreement yet</h2>
        <p className="mt-2 text-xs text-muted max-w-md mx-auto">
          {viewer.role === "Tenant"
            ? "When a landlord accepts your application and prepares a lease agreement, it will appear here for you to review and sign."
            : "An accepted application will create the first agreement record here."}
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link
            href={viewer.role === "Tenant" ? "/dashboard/applications" : "/dashboard/applicants"}
            className="stitch-button text-xs font-bold"
          >
            {viewer.role === "Tenant" ? "View applications" : "Review applicants"}
          </Link>
        </div>
      </section>
    );
  }

  const currentVersion =
    selected?.versions.find((item) => item.version === selected.currentVersionNumber) ??
    selected?.versions[0];

  const initialTerms: LeaseTerms | null =
    selected &&
    !currentVersion &&
    (viewer.role === "Landlord" || viewer.role === "PropertyManager")
      ? {
          startDate: "",
          endDate: "",
          rentMinor: 0,
          currency: "NGN",
          billingPeriod: "year",
          fees: [],
          schedule: [{ sequence: 1, label: "First rent", amountMinor: 0, dueDate: "" }],
          noticeDays: 30,
          renewalTerms: "Renewal requires written agreement by both parties.",
          utilities: [],
          rules: [],
          specialTerms: "",
          participants: { tenant: selected.tenant, landlord: selected.landlord },
          property: selected.property,
        }
      : null;

  return (
    <div className="grid gap-6 xl:grid-cols-[20rem_minmax(0,1fr)]">
      {/* Tenancy Sidebar List */}
      <aside className="rounded-2xl border border-line bg-white shadow-xs overflow-hidden h-fit">
        <div className="border-b border-line px-4 py-3.5 bg-sand-50/70">
          <h2 className="text-sm font-extrabold text-ink">Tenancies</h2>
          <p className="text-xs text-muted">{leases.length} active or drafted agreement(s)</p>
        </div>

        <div className="divide-y divide-line max-h-[42rem] overflow-y-auto">
          {leases.map((lease) => {
            const isSelected = selected?.id === lease.id;
            return (
              <Link
                key={lease.id}
                href={`/dashboard/leases?item=${lease.id}`}
                className={`block p-4 transition-colors ${
                  isSelected
                    ? "bg-forest-50 border-l-4 border-forest-600"
                    : "hover:bg-sand-50 border-l-4 border-transparent"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <strong className="text-sm font-bold text-ink truncate">
                    {lease.property.title}
                  </strong>
                  <LeaseStatusBadge status={lease.status} />
                </div>
                <p className="mt-1 text-xs text-muted truncate">{lease.property.location}</p>
                <span className="mt-2 block text-[11px] font-semibold text-forest-800">
                  Version {lease.currentVersionNumber}
                </span>
              </Link>
            );
          })}
        </div>
      </aside>

      {/* Main Lease Detail View */}
      {selected ? (
        <main className="min-w-0 space-y-6">
          {/* Header Card */}
          <header className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-ink sm:text-2xl">
                    {selected.property.title}
                  </h1>
                  <LeaseStatusBadge status={selected.status} />
                </div>
                <p className="flex items-center gap-1 text-xs text-muted">
                  <MapPin className="size-3 text-muted" /> {selected.property.location} · {selected.status}
                </p>
              </div>

              {currentVersion ? (
                <Link
                  href={`/api/leases/${selected.id}/document?version=${selected.currentVersionNumber}`}
                  target="_blank"
                  className="stitch-button-secondary text-xs shrink-0"
                >
                  <FileDown className="size-4" /> Printable agreement
                </Link>
              ) : null}
            </div>

            {/* Participants Summary Ribbon */}
            <div className="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 text-xs">
              <div className="rounded-xl border border-line bg-sand-50 p-3">
                <span className="text-muted font-medium">Tenant</span>
                <p className="mt-0.5 font-bold text-ink flex items-center gap-1">
                  <User className="size-3.5 text-forest-700" /> {selected.tenant.name}
                </p>
              </div>
              <div className="rounded-xl border border-line bg-sand-50 p-3">
                <span className="text-muted font-medium">Landlord</span>
                <p className="mt-0.5 font-bold text-ink flex items-center gap-1">
                  <Building2 className="size-3.5 text-forest-700" /> {selected.landlord.name}
                </p>
              </div>
            </div>
          </header>

          {/* Lifecycle Action Buttons (Sign, Request Changes, Send, Pay, Terminate) */}
          {currentVersion || initialTerms ? (
            <LeaseActions
              leaseId={selected.id}
              status={selected.status}
              version={selected.currentVersionNumber}
              hash={currentVersion?.contentHash ?? ""}
              terms={currentVersion?.terms ?? initialTerms}
              acceptances={currentVersion?.acceptances ?? []}
              viewer={viewer}
            />
          ) : null}

          {/* Agreement & Dual Signature Status */}
          <section className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="text-base font-extrabold text-ink">Agreement and acceptance</h2>
                <p className="text-xs text-muted">
                  Version {selected.currentVersionNumber}. Acceptance is audited in-product and is not a certified e-signature.
                </p>
              </div>
              <ShieldCheck className="size-5 text-forest-700" />
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(["Tenant", "Landlord"] as const).map((party) => {
                const accepted = currentVersion?.acceptances.find(
                  (item) =>
                    item.party === party && item.agreementHash === currentVersion.contentHash
                );
                return (
                  <div
                    key={party}
                    className={`rounded-xl border p-4 text-xs transition-colors ${
                      accepted ? "border-forest-200 bg-forest-50/50" : "border-line bg-sand-50"
                    }`}
                  >
                    <div className="flex items-center justify-between font-bold">
                      <strong className="flex items-center gap-1.5 text-sm text-ink">
                        <CheckCircle2
                          className={`size-4 ${accepted ? "text-forest-700" : "text-muted"}`}
                        />
                        {party} {accepted ? "accepted" : "pending"}
                      </strong>
                    </div>
                    <p className="mt-2 text-muted">
                      {accepted
                        ? `${accepted.legalName} · ${date(accepted.acceptedAt)}`
                        : "Waiting for legal consent"}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Payment Schedule & Paystack Link */}
          <section className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="text-base font-extrabold text-ink">Payment schedule</h2>
                <p className="text-xs text-muted">Scheduled installments and escrow settlement records</p>
              </div>
              <CreditCard className="size-5 text-forest-700" />
            </div>

            <div className="mt-4 divide-y divide-line">
              {selected.scheduleItems.map((item) => (
                <div
                  key={item.id}
                  className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <strong className="text-sm font-bold text-ink">{item.label}</strong>
                    <p className="text-xs text-muted">
                      Due {date(item.dueDate)} · {item.payment?.status ?? "Due"}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <p className="text-base font-black text-ink">{money(item.amount)}</p>

                    {viewer.role === "Tenant" &&
                    selected.status === "AwaitingPayment" &&
                    item.sequence === 1 &&
                    item.payment &&
                    item.payment.status !== "Paid" ? (
                      <Link
                        href={`/dashboard/payments/${item.payment.id}`}
                        className="stitch-button text-xs py-1.5 px-3 font-extrabold"
                      >
                        Pay first due item
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Quick Context Links */}
          <nav className="grid gap-3 sm:grid-cols-2">
            <Link
              href="/dashboard/maintenance"
              className="stitch-button-secondary"
            >
              <Wrench className="size-4" /> Maintenance
            </Link>
            <Link
              href="/messages"
              className="stitch-button-secondary"
            >
              <MessageSquare className="size-4" /> Messages
            </Link>
          </nav>
        </main>
      ) : (
        <section className="grid min-h-80 place-items-center rounded-2xl border border-line bg-white p-8 text-center text-sm text-muted shadow-xs">
          Select a tenancy to inspect its agreement.
        </section>
      )}
    </div>
  );
}
