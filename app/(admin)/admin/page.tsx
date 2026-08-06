import Link from "next/link";
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

        <section className="mt-6 grid gap-4 lg:grid-cols-3">
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
      </div>
    </div>
  );
}
