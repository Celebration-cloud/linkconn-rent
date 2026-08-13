"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  BadgeAlert,
  BadgeCheck,
  Building2,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Clock,
  ExternalLink,
  Eye,
  FileCheck2,
  FileSignature,
  FileText,
  Gauge,
  Heart,
  Home,
  Layers,
  MapPin,
  MessageSquare,
  Phone,
  Plus,
  Receipt,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  UserCheck,
  Users,
  Wallet,
  Wrench,
} from "lucide-react";
import type { DashboardSnapshot } from "@/domain/types/operating-system";
import { formatNaira } from "@/utils/map-property";
import { useAuth } from "@/providers/auth-provider";
import { toastSuccess } from "@/stores/toast-store";

function MetricCard({
  label,
  value,
  icon: Icon,
  trend,
  tone = "default",
  href,
}: {
  label: string;
  value: string;
  icon: typeof Home;
  trend?: string;
  tone?: "default" | "accent" | "warning" | "success";
  href?: string;
}) {
  const toneClasses = {
    default: "border-line bg-white text-ink hover:border-forest-400",
    accent: "border-forest-300 bg-forest-50/60 text-forest-950 hover:border-forest-500",
    warning: "border-amber-200 bg-amber-50/50 text-amber-950 hover:border-amber-400",
    success: "border-forest-200 bg-forest-50/50 text-forest-950 hover:border-forest-400",
  };

  const Content = (
    <div className={`rounded-2xl border p-5 transition-all shadow-xs ${toneClasses[tone]}`}>
      <div className="flex items-center justify-between">
        <span className="grid size-10 place-items-center rounded-xl bg-white text-forest-700 shadow-xs border border-line">
          <Icon className="size-5" />
        </span>
        {trend && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-forest-700 bg-forest-100/80 px-2 py-0.5 rounded-full">
            <TrendingUp className="size-3" /> {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 text-2xl font-black tabular-nums tracking-tight text-ink">{value}</p>
    </div>
  );

  return href ? (
    <Link href={href} className="block transition-transform hover:-translate-y-0.5">
      {Content}
    </Link>
  ) : (
    Content
  );
}

export function TenantOverview({ snapshot }: { snapshot: DashboardSnapshot }) {
  const { user } = useAuth();
  const router = useRouter();
  const isVerified = user?.verificationLevel === "Fully Verified" || user?.verificationLevel === "Trusted";

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Welcome Hero Banner */}
      <header className="rounded-3xl border border-line bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 p-6 md:p-8 text-white shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-forest-700/70 px-3 py-1 text-xs font-bold text-forest-100 backdrop-blur-xs">
              <Sparkles className="size-3.5 text-lime" />
              <span>Tenant Control Center</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Welcome back, {user?.firstName ?? "there"}
            </h1>
            <p className="text-sm text-forest-200 max-w-xl">
              Manage your active lease, track pending rental applications, schedule viewing visits, and dispatch maintenance with verified escrow protection.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/maintenance"
              className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-xs font-bold text-white backdrop-blur-xs border border-white/20 hover:bg-white/20 transition-colors"
            >
              <Wrench className="size-4" /> Request repair
            </Link>
            <Link
              href="/#discover"
              className="inline-flex items-center gap-2 rounded-xl bg-lime px-4 py-2.5 text-xs font-extrabold text-forest-950 shadow-sm hover:bg-lime/90 transition-all active:scale-[0.98]"
            >
              <Home className="size-4" /> Explore listings
            </Link>
          </div>
        </div>
      </header>

      {/* KYC / Verification Status Reminder Banner */}
      {!isVerified && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-amber-950 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <ShieldAlert className="size-5" />
            </div>
            <div>
              <strong className="text-sm font-extrabold">Complete your tenant verification</strong>
              <p className="text-xs text-amber-900/80">
                Verified tenants get approved 3x faster by verified landlords and can sign leases online.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/verification"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-800 px-4 py-2 text-xs font-extrabold text-white hover:bg-amber-900 transition-colors shrink-0"
          >
            Verify profile <ArrowRight className="size-3.5" />
          </Link>
        </div>
      )}

      {/* 4 Tenant Key Metrics */}
      <section aria-label="Key tenant metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Saved homes"
          value={String(snapshot.savedHomes)}
          icon={Heart}
          href="/dashboard/saved"
        />
        <MetricCard
          label="Active applications"
          value={String(snapshot.pendingApplications)}
          icon={ClipboardList}
          tone="accent"
          href="/dashboard/applications"
        />
        <MetricCard
          label="Next payment due"
          value={snapshot.nextPayment ? formatNaira(snapshot.nextPayment.amount) : "₦0 due"}
          icon={CircleDollarSign}
          tone={snapshot.nextPayment ? "warning" : "default"}
          href="/dashboard/payments"
        />
        <MetricCard
          label="Open maintenance"
          value={String(snapshot.openMaintenance)}
          icon={Wrench}
          href="/dashboard/maintenance"
        />
      </section>

      {/* Main Tenant Workspaces Split */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
        {/* Left Column: Active Tenancy & Application Pipeline */}
        <div className="space-y-6">
          {/* Active Tenancy Card */}
          <section className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2.5">
                <span className="grid size-9 place-items-center rounded-xl bg-forest-100 text-forest-800">
                  <FileSignature className="size-5" />
                </span>
                <div>
                  <h2 className="text-base font-extrabold text-ink">My Tenancy & Lease</h2>
                  <p className="text-xs text-muted">Active agreement terms and payment schedules</p>
                </div>
              </div>
              <Link
                href="/dashboard/leases"
                className="text-xs font-bold text-forest-700 hover:text-forest-900 inline-flex items-center gap-1"
              >
                View agreement <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            {snapshot.nextPayment ? (
              <div className="mt-5 space-y-4">
                <div className="rounded-xl border border-forest-200 bg-forest-50/70 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-forest-800">
                      Upcoming installment
                    </span>
                    <p className="mt-1 text-2xl font-black text-forest-950">
                      {formatNaira(snapshot.nextPayment.amount)}
                    </p>
                    <p className="mt-0.5 text-xs text-forest-700">
                      Due by {new Date(snapshot.nextPayment.dueDate).toLocaleDateString("en-NG", { dateStyle: "medium" })}
                    </p>
                  </div>
                  <Link
                    href="/dashboard/payments"
                    className="stitch-button justify-center text-xs font-extrabold shrink-0"
                  >
                    <CircleDollarSign className="size-4" /> Pay rent now
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl border border-line bg-sand-50 p-3">
                    <span className="text-muted font-medium">Protection</span>
                    <p className="mt-1 font-bold text-ink flex items-center gap-1">
                      <ShieldCheck className="size-3.5 text-forest-700" /> Escrow secured
                    </p>
                  </div>
                  <div className="rounded-xl border border-line bg-sand-50 p-3">
                    <span className="text-muted font-medium">Receipt status</span>
                    <p className="mt-1 font-bold text-ink">Automated e-receipt</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-5 rounded-xl border border-dashed border-line bg-sand-50/50 p-6 text-center">
                <Home className="mx-auto size-7 text-muted" />
                <p className="mt-2 text-sm font-bold text-ink">No active tenancy agreement yet</p>
                <p className="mt-1 text-xs text-muted">
                  Once your rental application is approved and you sign your lease, your tenancy terms and rent countdown will appear here.
                </p>
                <Link href="/#discover" className="stitch-button-secondary mt-4 inline-flex text-xs">
                  Browse available homes
                </Link>
              </div>
            )}
          </section>

          {/* Application Pipeline */}
          <section className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="text-base font-extrabold text-ink">Recent applications</h2>
                <p className="text-xs text-muted">Live progress of your submitted rental requests</p>
              </div>
              <Link
                href="/dashboard/applications"
                className="text-xs font-bold text-forest-700 hover:text-forest-900 inline-flex items-center gap-1"
              >
                View all ({snapshot.applications.length}) <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-line">
              {snapshot.applications.length ? (
                snapshot.applications.slice(0, 3).map((app) => (
                  <div key={app.id} className="py-4 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <strong className="block truncate text-sm font-bold text-ink">
                        {app.propertyTitle}
                      </strong>
                      <span className="text-xs text-muted">Submitted to landlord for review</span>
                    </div>
                    <span className="rounded-full bg-forest-50 px-2.5 py-1 text-xs font-extrabold text-forest-800 shrink-0">
                      {app.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted">
                  <ClipboardList className="mx-auto size-6 text-muted mb-2" />
                  You have no active rental applications.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Viewings & Fast Maintenance Dispatch */}
        <div className="space-y-6">
          {/* Upcoming Viewings */}
          <section className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-forest-700" />
                <h2 className="text-sm font-extrabold text-ink">Upcoming viewings</h2>
              </div>
              <Link href="/dashboard/viewings" className="text-xs font-bold text-forest-700 hover:underline">
                All visits
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {snapshot.viewings.length ? (
                snapshot.viewings.slice(0, 3).map((v) => (
                  <div key={v.id} className="rounded-xl border border-line bg-sand-50 p-3.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-forest-900">
                      <span>
                        {new Date(v.scheduledAt).toLocaleString("en-NG", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="rounded-full bg-sand-200 px-2 py-0.5 text-[10px] text-ink font-bold">
                        {v.status}
                      </span>
                    </div>
                    <p className="mt-1 font-semibold text-ink truncate">{v.propertyTitle}</p>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-muted">
                  <Calendar className="mx-auto size-6 text-muted mb-2" />
                  No upcoming property visits scheduled.
                </div>
              )}
            </div>
          </section>

          {/* Maintenance Quick Status */}
          <section className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <Wrench className="size-4 text-forest-700" />
                <h2 className="text-sm font-extrabold text-ink">Maintenance issues</h2>
              </div>
              <Link href="/dashboard/maintenance" className="text-xs font-bold text-forest-700 hover:underline">
                New issue
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {snapshot.maintenance.length ? (
                snapshot.maintenance.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-3.5 text-xs ${
                      item.priority === "High"
                        ? "border-red-200 bg-red-50/50"
                        : "border-line bg-sand-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-ink truncate">{item.title}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.priority === "High" ? "bg-red-100 text-red-800" : "bg-sand-200 text-ink"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-muted truncate">{item.propertyTitle}</p>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-muted">
                  <CheckCircle2 className="mx-auto size-6 text-forest-700/60 mb-2" />
                  No open repairs or maintenance tickets.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export function LandlordOverview({ snapshot }: { snapshot: DashboardSnapshot }) {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Landlord Header Banner */}
      <header className="rounded-3xl border border-line bg-gradient-to-r from-forest-900 via-forest-800 to-forest-950 p-6 md:p-8 text-white shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-forest-700/70 px-3 py-1 text-xs font-bold text-forest-100 backdrop-blur-xs">
              <Building2 className="size-3.5 text-lime" />
              <span>Property Manager & Landlord Hub</span>
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Portfolio Overview, {user?.firstName ?? "Owner"}
            </h1>
            <p className="text-sm text-forest-200 max-w-xl">
              Track your property occupancy, evaluate verified tenant applications, monitor rent collection payouts, and oversee maintenance dispatch.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/dashboard/properties/new"
              className="inline-flex items-center gap-2 rounded-xl bg-lime px-4 py-2.5 text-xs font-extrabold text-forest-950 shadow-sm hover:bg-lime/90 transition-all active:scale-[0.98]"
            >
              <Plus className="size-4" /> Add new property
            </Link>
          </div>
        </div>
      </header>

      {/* 4 Landlord Key Metrics */}
      <section aria-label="Portfolio metrics" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Portfolio value"
          value={formatNaira(snapshot.portfolioValue)}
          icon={Building2}
          tone="accent"
          href="/dashboard/properties"
        />
        <MetricCard
          label="Occupancy rate"
          value={`${Math.round(snapshot.occupancyRate)}%`}
          icon={Gauge}
          trend={snapshot.occupancyRate > 70 ? "+12% vs last quarter" : undefined}
          href="/dashboard/properties"
        />
        <MetricCard
          label="Active listings"
          value={String(snapshot.activeListings)}
          icon={Home}
          href="/dashboard/properties"
        />
        <MetricCard
          label="Pending applicants"
          value={String(snapshot.pendingApplications)}
          icon={Users}
          tone={snapshot.pendingApplications > 0 ? "warning" : "default"}
          href="/dashboard/applicants"
        />
      </section>

      {/* Main Landlord Workspaces Split */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        {/* Left Column: Pending Applicants & Urgent Maintenance */}
        <div className="space-y-6">
          {/* Applicants Vetting Queue */}
          <section className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="text-base font-extrabold text-ink">Applicant Vetting Queue</h2>
                <p className="text-xs text-muted">Review verified tenant credentials and draft leases</p>
              </div>
              <Link
                href="/dashboard/applicants"
                className="text-xs font-bold text-forest-700 hover:text-forest-900 inline-flex items-center gap-1"
              >
                View all ({snapshot.applications.length}) <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <div className="mt-4 divide-y divide-line">
              {snapshot.applications.length ? (
                snapshot.applications.slice(0, 4).map((app) => (
                  <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="grid size-10 place-items-center rounded-full bg-forest-100 font-extrabold text-forest-800 text-xs shrink-0">
                        {app.tenantName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <strong className="block text-sm font-bold text-ink truncate">
                          {app.tenantName}
                        </strong>
                        <span className="block text-xs text-muted truncate">{app.propertyTitle}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="rounded-full bg-sand-200 px-2.5 py-1 text-xs font-bold text-ink">
                        {app.status}
                      </span>
                      <Link
                        href="/dashboard/applicants"
                        className="stitch-button-secondary text-xs py-1 px-3"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-muted">
                  <Users className="mx-auto size-6 text-muted mb-2" />
                  No pending tenant applications requiring review.
                </div>
              )}
            </div>
          </section>

          {/* Maintenance Oversight */}
          <section className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div>
                <h2 className="text-base font-extrabold text-ink">Maintenance & Repairs</h2>
                <p className="text-xs text-muted">Incoming repair reports from your tenants</p>
              </div>
              <Link
                href="/dashboard/maintenance"
                className="text-xs font-bold text-forest-700 hover:text-forest-900 inline-flex items-center gap-1"
              >
                Manage repairs <ArrowUpRight className="size-3.5" />
              </Link>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {snapshot.maintenance.length ? (
                snapshot.maintenance.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-xl border p-4 text-xs ${
                      item.priority === "High" ? "border-red-200 bg-red-50/50" : "border-line bg-sand-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-ink truncate">{item.title}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          item.priority === "High" ? "bg-red-100 text-red-800" : "bg-sand-200 text-ink"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-muted truncate">{item.propertyTitle}</p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 py-6 text-center text-xs text-muted">
                  <CheckCircle2 className="mx-auto size-6 text-forest-700/60 mb-2" />
                  All properties in good standing. No open repair tickets.
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Right Column: Viewing Calendar & Shortcuts */}
        <div className="space-y-6">
          {/* Scheduled Property Viewings */}
          <section className="rounded-2xl border border-line bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-line pb-4">
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-forest-700" />
                <h2 className="text-sm font-extrabold text-ink">Upcoming visits</h2>
              </div>
              <Link href="/dashboard/calendar" className="text-xs font-bold text-forest-700 hover:underline">
                Calendar
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {snapshot.viewings.length ? (
                snapshot.viewings.slice(0, 4).map((v) => (
                  <div key={v.id} className="rounded-xl border border-line bg-sand-50 p-3.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-forest-900">
                      <span>
                        {new Date(v.scheduledAt).toLocaleString("en-NG", {
                          weekday: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="rounded bg-sand-200 px-1.5 py-0.5 text-[10px] text-ink">
                        {v.status}
                      </span>
                    </div>
                    <p className="mt-1 font-semibold text-ink truncate">{v.propertyTitle}</p>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-muted">
                  <Calendar className="mx-auto size-6 text-muted mb-2" />
                  No property viewings scheduled this week.
                </div>
              )}
            </div>
          </section>

          {/* Quick Operations Links */}
          <section className="rounded-2xl border border-line bg-white p-6 shadow-xs space-y-3">
            <h2 className="text-sm font-extrabold text-ink">Management shortcuts</h2>
            <div className="space-y-2">
              <Link
                href="/dashboard/properties"
                className="flex items-center justify-between rounded-xl border border-line bg-sand-50 p-3 text-xs font-bold text-ink hover:bg-white hover:border-forest-400 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Building2 className="size-4 text-forest-700" /> Manage property portfolio
                </span>
                <ChevronRight className="size-4 text-muted" />
              </Link>
              <Link
                href="/dashboard/leases"
                className="flex items-center justify-between rounded-xl border border-line bg-sand-50 p-3 text-xs font-bold text-ink hover:bg-white hover:border-forest-400 transition-all"
              >
                <span className="flex items-center gap-2">
                  <FileSignature className="size-4 text-forest-700" /> Digital leases & agreements
                </span>
                <ChevronRight className="size-4 text-muted" />
              </Link>
              <Link
                href="/dashboard/payments"
                className="flex items-center justify-between rounded-xl border border-line bg-sand-50 p-3 text-xs font-bold text-ink hover:bg-white hover:border-forest-400 transition-all"
              >
                <span className="flex items-center gap-2">
                  <Wallet className="size-4 text-forest-700" /> Payout ledger & banking
                </span>
                <ChevronRight className="size-4 text-muted" />
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function AccountPage({
  initialSnapshot,
  landlord,
}: {
  initialSnapshot: DashboardSnapshot;
  landlord: boolean;
}) {
  return landlord ? (
    <LandlordOverview snapshot={initialSnapshot} />
  ) : (
    <TenantOverview snapshot={initialSnapshot} />
  );
}
