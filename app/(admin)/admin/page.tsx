import Link from "next/link";
import { connection } from "next/server";
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Building2,
  CheckCircle2,
  ClipboardList,
  Clock,
  Headphones,
  Scale,
  ShieldCheck,
  TrendingUp,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { AdministrationRepository } from "@/repositories/administration.repository";

export default async function AdminOverviewPage() {
  await connection();
  const overview = await AdministrationRepository.getOverview();

  const urgent = [
    {
      href: "/admin/verifications?status=Pending",
      label: "Identity & Ownership Reviews",
      sub: "Awaiting legal deed and biometric audit",
      count: overview.pendingVerifications,
      icon: ShieldCheck,
      tone: "amber" as const,
    },
    {
      href: "/admin/moderation",
      label: "Listings Requiring Moderation",
      sub: "Flagged by community safety rules",
      count: overview.flaggedListings,
      icon: AlertTriangle,
      tone: "red" as const,
    },
    {
      href: "/admin/disputes?status=Open",
      label: "Open Dispute Cases",
      sub: "Active disputes awaiting resolution",
      count: overview.openDisputes,
      icon: Scale,
      tone: "red" as const,
    },
    {
      href: "/admin/support",
      label: "Support Conversations",
      sub: "Tenant & landlord cases in progress",
      count: overview.openSupport,
      icon: Headphones,
      tone: "green" as const,
    },
    {
      href: "/admin/maintenance",
      label: "Active Maintenance Reports",
      sub: "Platform-tracked repair escalations",
      count: overview.activeMaintenance,
      icon: Wrench,
      tone: "green" as const,
    },
    {
      href: "/admin/payments",
      label: "Failed / Overdue Payments",
      sub: "Requires collection reconciliation",
      count: overview.paymentIssues,
      icon: Banknote,
      tone: "red" as const,
    },
  ] as const;

  const totals = [
    {
      label: "Total Users",
      value: overview.users.toLocaleString("en-NG"),
      href: "/admin/users",
      icon: Users,
      change: "+18 this week",
    },
    {
      label: "Listed Properties",
      value: overview.listings.toLocaleString("en-NG"),
      href: "/admin/properties",
      icon: Building2,
      change: "Active inventory",
    },
    {
      label: "Completed Viewings",
      value: overview.completedViewings.toLocaleString("en-NG"),
      href: "/admin/properties",
      icon: CheckCircle2,
      change: "All-time inspections",
    },
    {
      label: "Successful Tenancies",
      value: overview.successfulTenancies.toLocaleString("en-NG"),
      href: "/admin/users",
      icon: TrendingUp,
      change: "Accepted leases",
    },
  ];

  const totalUrgent = urgent.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className="admin-canvas">
      {/* Page Header */}
      <header className="admin-page-heading">
        <div>
          <h1>Operations Overview</h1>
          <p>
            Live working surface for records requiring human review. Every consequential action is logged in the decision ledger.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/verifications?status=Pending" className="stitch-button">
            Start Queue Review <ArrowUpRight className="size-4" />
          </Link>
        </div>
      </header>

      {/* Platform Health Totals */}
      <section aria-label="Platform totals" className="mt-6 grid border border-[#d6ddd5] bg-white sm:grid-cols-2 xl:grid-cols-4">
        {totals.map(({ label, value, href, icon: Icon, change }, index) => (
          <Link
            key={label}
            href={href}
            className={`group flex min-h-32 flex-col justify-between gap-2 p-5 transition hover:bg-[#f4f7f3] ${
              index ? "border-t border-[#e1e6e0] sm:border-l sm:border-t-0" : ""
            } ${index === 2 ? "sm:border-l-0 xl:border-l" : ""}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-muted">{label}</span>
              <span className="grid size-9 place-items-center bg-forest-50 text-forest-700 transition group-hover:bg-forest-900 group-hover:text-lime">
                <Icon className="size-4" />
              </span>
            </div>
            <div>
              <p className="text-3xl font-extrabold tabular-nums tracking-[-0.03em] text-forest-950">{value}</p>
              <p className="mt-1 text-[11px] font-semibold text-muted">{change}</p>
            </div>
          </Link>
        ))}
      </section>

      {/* Main Grid: Attention Queue + Decision Ledger */}
      <div className="mt-6 grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(20rem,0.6fr)]">

        {/* Attention Queue */}
        <section className="border border-[#d6ddd5] bg-white" aria-label="Attention queue">
          <div className="flex items-center justify-between gap-4 border-b border-[#d6ddd5] px-5 py-4">
            <div>
              <h2 className="text-base font-extrabold text-ink">Attention Queue</h2>
              <p className="mt-0.5 text-xs text-muted">Ordered by operational risk and recency. Resolve oldest first.</p>
            </div>
            <div className="flex items-center gap-2">
              {totalUrgent > 0 && (
                <span className="inline-flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1 text-xs font-extrabold text-red-800">
                  <Zap className="size-3" /> {totalUrgent} open
                </span>
              )}
            </div>
          </div>

          <div>
            {urgent.map(({ href, label, sub, count, icon: Icon, tone }) => (
              <Link
                key={href}
                href={href}
                className="group grid min-h-[4.25rem] grid-cols-[3rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#eaeee9] px-4 last:border-b-0 hover:bg-[#f6f9f5] transition-colors"
              >
                <span
                  className={`grid size-10 place-items-center transition group-hover:scale-105 ${
                    tone === "red"
                      ? "bg-red-50 text-red-700"
                      : tone === "amber"
                      ? "bg-amber-50 text-amber-800"
                      : "bg-forest-50 text-forest-800"
                  }`}
                >
                  <Icon className="size-4" />
                </span>
                <div className="min-w-0">
                  <strong className="block truncate text-sm font-extrabold text-ink">{label}</strong>
                  <span className="text-xs text-muted">{sub}</span>
                </div>
                <span className="flex items-center gap-3">
                  <span className={`min-w-8 text-right text-xl font-black tabular-nums ${
                    tone === "red" && count > 0
                      ? "text-red-700"
                      : tone === "amber" && count > 0
                      ? "text-amber-700"
                      : "text-ink"
                  }`}>
                    {count}
                  </span>
                  <ArrowUpRight className="size-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>

          <div className="border-t border-[#d6ddd5] px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-muted flex items-center gap-1.5">
              <Clock className="size-3 text-forest-600" /> Last refreshed: server render
            </span>
            <Link
              href="/admin/audit"
              className="text-xs font-bold text-forest-700 hover:text-forest-900 hover:underline flex items-center gap-1"
            >
              Full Decision Ledger <ArrowUpRight className="size-3" />
            </Link>
          </div>
        </section>

        {/* Decision Ledger + Quick Links */}
        <div className="space-y-6">
          {/* Recent Activity */}
          <section className="border border-[#d6ddd5] bg-forest-950 text-white" aria-label="Decision ledger">
            <div className="border-b border-white/10 px-4 py-3">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-extrabold">Decision Ledger</h2>
                <Link
                  href="/admin/audit"
                  className="text-xs font-bold text-lime hover:text-white flex items-center gap-1"
                >
                  View all <ArrowUpRight className="size-3" />
                </Link>
              </div>
              <p className="mt-0.5 text-xs text-forest-300">Latest accountable admin actions</p>
            </div>

            <div className="divide-y divide-white/10">
              {overview.recentActivity.length ? (
                overview.recentActivity.map((event) => (
                  <article key={event.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <strong className="break-words text-xs font-bold text-white leading-relaxed">
                        {event.action.replaceAll(".", " ")}
                      </strong>
                      <time className="shrink-0 text-[10px] tabular-nums text-forest-400">
                        {event.createdAt.toLocaleDateString("en-NG")}
                      </time>
                    </div>
                    <p className="mt-1.5 text-xs text-forest-300">
                      <span className="font-semibold text-forest-100">
                        {event.actor.firstName} {event.actor.lastName}
                      </span>{" "}
                      · {event.targetType}
                    </p>
                    {event.reason && (
                      <p className="mt-1 line-clamp-2 text-xs leading-4 text-forest-400">{event.reason}</p>
                    )}
                  </article>
                ))
              ) : (
                <p className="p-8 text-center text-sm text-forest-300">
                  No administrator activity has been recorded yet.
                </p>
              )}
            </div>

            <Link
              href="/admin/audit"
              className="flex min-h-11 items-center justify-between border-t border-white/10 px-4 text-xs font-bold text-lime hover:bg-white/5 transition"
            >
              Open Complete Audit Ledger <ArrowUpRight className="size-4" />
            </Link>
          </section>

          {/* Quick Navigation Cards */}
          <section className="border border-[#d6ddd5] bg-white" aria-label="Quick actions">
            <div className="border-b border-[#d6ddd5] px-4 py-3">
              <h2 className="text-sm font-extrabold text-ink">Platform Shortcuts</h2>
            </div>
            <div className="divide-y divide-[#eaeee9]">
              {[
                { href: "/admin/users", label: "People Directory", icon: Users, count: overview.users },
                { href: "/admin/properties", label: "Property Inventory", icon: Building2, count: overview.listings },
                { href: "/admin/payments", label: "Payment Ledger", icon: Banknote, count: undefined },
                { href: "/admin/invitations", label: "Administrator Access", icon: ClipboardList, count: undefined },
              ].map(({ href, label, icon: Icon, count }) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex items-center justify-between gap-3 px-4 py-3 hover:bg-[#f6f9f5] transition"
                >
                  <span className="flex items-center gap-2.5 text-xs font-bold text-ink">
                    <Icon className="size-4 text-forest-700" />
                    {label}
                  </span>
                  <span className="flex items-center gap-2 text-xs text-muted">
                    {count !== undefined && (
                      <span className="tabular-nums font-bold text-forest-950">{count.toLocaleString("en-NG")}</span>
                    )}
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
