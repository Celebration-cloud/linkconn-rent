import Link from "next/link";
import { connection } from "next/server";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Building2,
  CheckCircle2,
  Eye,
  ShieldCheck,
  Users,
} from "lucide-react";
import { AdministrationRepository } from "@/repositories/administration.repository";

export default async function AdminOverviewPage() {
  await connection();
  const overview = await AdministrationRepository.getOverview();
  const metrics = [
    ["Users", overview.users, Users],
    ["Listings", overview.listings, Building2],
    ["Pending verification", overview.pendingVerifications, ShieldCheck],
    ["Flagged listings", overview.flaggedListings, AlertTriangle],
    ["Payment issues", overview.paymentIssues, Banknote],
    ["Open disputes", overview.openDisputes, AlertTriangle],
    ["Completed viewings", overview.completedViewings, Eye],
    ["Successful tenancies", overview.successfulTenancies, CheckCircle2],
  ] as const;

  return (
    <div className="p-4 pb-24 sm:p-7 md:pb-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-forest-950 p-7 text-white sm:p-10">
          <p className="text-xs font-bold tracking-[0.14em] text-lime">
            Trust operations
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.05em]">
            What needs human attention.
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-forest-100">
            Verification, moderation, payments and disputes remain connected
            to their evidence and audit history.
          </p>
        </div>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map(([label, value, Icon]) => (
            <article
              key={label}
              className="rounded-2xl border border-line bg-white p-5"
            >
              <Icon className="size-5 text-forest-700" />
              <p className="mt-7 text-xs font-bold text-muted">{label}</p>
              <p className="mt-1 text-3xl font-extrabold tabular-nums text-ink">
                {value}
              </p>
            </article>
          ))}
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              "/admin/verifications",
              "Review verification",
              "Inspect submitted evidence and record a manual decision.",
            ],
            [
              "/admin/disputes",
              "Open fraud and disputes",
              "Review parties, messages, payment records and evidence.",
            ],
            [
              "/admin/moderation",
              "Moderate users and listings",
              "Act on reports with a reason and a complete audit event.",
            ],
            [
              "/admin/users",
              "Manage users",
              "Inspect roles, onboarding, verification, and account state.",
            ],
            [
              "/admin/properties",
              "Review properties",
              "Search every listing and inspect its moderation history.",
            ],
            [
              "/admin/payments",
              "Inspect payments",
              "Review provider-controlled payment and failure records.",
            ],
            [
              "/admin/audit",
              "Open audit log",
              "Trace administrator decisions and before/after state.",
            ],
          ].map(([href, title, copy]) => (
            <Link
              key={href}
              href={href}
              className="group rounded-2xl bg-sand-200 p-6 transition hover:-translate-y-1 hover:bg-forest-100"
            >
              <h2 className="text-xl font-extrabold text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
              <span className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-forest-700">
                Open workspace{" "}
                <ArrowRight className="size-4 transition group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </section>

        <section className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-[.14em] text-forest-700">Neon activity</p><h2 className="mt-1 text-xl font-extrabold">Recent administrator actions</h2></div>
            <Link href="/admin/audit" className="text-sm font-bold text-forest-700">View all</Link>
          </div>
          <div className="mt-5 divide-y divide-line">
            {overview.recentActivity.length ? overview.recentActivity.map((event) => (
              <article key={event.id} className="flex flex-col gap-2 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0"><p className="break-words text-sm font-bold text-ink">{event.action}</p><p className="mt-1 break-words text-xs text-muted">{event.actor.firstName} {event.actor.lastName} · {event.targetType} · {event.reason}</p></div>
                <time className="shrink-0 text-xs text-muted">{event.createdAt.toLocaleString()}</time>
              </article>
            )) : <p className="py-8 text-center text-sm text-muted">No administrator activity has been recorded yet.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}
