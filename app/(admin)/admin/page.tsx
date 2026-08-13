import Link from "next/link";
import { connection } from "next/server";
import { AlertTriangle, ArrowUpRight, Banknote, Building2, Headphones, ShieldCheck, Users, Wrench } from "lucide-react";
import { AdministrationRepository } from "@/repositories/administration.repository";

export default async function AdminOverviewPage() {
  await connection();
  const overview = await AdministrationRepository.getOverview();
  const urgent = [
    { href: "/admin/verifications?status=Pending", label: "Identity and ownership reviews", count: overview.pendingVerifications, icon: ShieldCheck, tone: "amber" },
    { href: "/admin/moderation", label: "Listings requiring moderation", count: overview.flaggedListings, icon: AlertTriangle, tone: "red" },
    { href: "/admin/disputes?status=Open", label: "Open or investigating disputes", count: overview.openDisputes, icon: AlertTriangle, tone: "red" },
    { href: "/admin/support", label: "Support conversations in progress", count: overview.openSupport, icon: Headphones, tone: "green" },
    { href: "/admin/maintenance", label: "Active maintenance requests", count: overview.activeMaintenance, icon: Wrench, tone: "green" },
    { href: "/admin/payments", label: "Failed or overdue payments", count: overview.paymentIssues, icon: Banknote, tone: "red" },
  ] as const;
  const totals = [
    { label: "People", value: overview.users, href: "/admin/users", icon: Users },
    { label: "Properties", value: overview.listings, href: "/admin/properties", icon: Building2 },
    { label: "Completed viewings", value: overview.completedViewings, href: "/admin/properties", icon: ShieldCheck },
    { label: "Successful tenancies", value: overview.successfulTenancies, href: "/admin/users", icon: Users },
  ];

  return <div className="admin-canvas">
    <header className="admin-page-heading">
      <div><h1>Operations overview</h1><p>A live working surface for the records that need a human decision, not a decorative report.</p></div>
      <Link href="/admin/verifications?status=Pending" className="stitch-button">Start queue review <ArrowUpRight className="size-4" /></Link>
    </header>

    <section aria-label="Platform totals" className="mt-4 grid border border-[#d6ddd5] bg-white sm:grid-cols-2 xl:grid-cols-4">
      {totals.map(({ label, value, href, icon: Icon }, index) => <Link key={label} href={href} className={`group flex min-h-28 items-end justify-between gap-4 p-4 hover:bg-[#f7f9f6] ${index ? "border-t border-[#e1e6e0] sm:border-l sm:border-t-0" : ""} ${index === 2 ? "sm:border-l-0 xl:border-l" : ""}`}><div><p className="text-xs font-bold text-muted">{label}</p><p className="mt-2 text-3xl font-extrabold tabular-nums tracking-[-0.03em]">{value}</p></div><Icon className="size-5 text-forest-700 transition-transform group-hover:-translate-y-1" /></Link>)}
    </section>

    <div className="mt-4 grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,.65fr)]">
      <section className="border border-[#d6ddd5] bg-white">
        <div className="flex items-center justify-between gap-4 border-b border-[#d6ddd5] px-4 py-3"><div><h2 className="text-base font-extrabold">Attention queue</h2><p className="mt-1 text-xs text-muted">Ordered by operational risk and recency.</p></div><span className="text-xs font-bold text-muted">{urgent.reduce((sum, item) => sum + item.count, 0)} open</span></div>
        <div>{urgent.map(({ href, label, count, icon: Icon, tone }) => <Link key={href} href={href} className="group grid min-h-16 grid-cols-[2.5rem_minmax(0,1fr)_auto] items-center gap-3 border-b border-[#e3e8e2] px-4 last:border-b-0 hover:bg-[#f7f9f6]"><span className={`grid size-9 place-items-center ${tone === "red" ? "bg-red-50 text-red-700" : tone === "amber" ? "bg-amber-50 text-amber-800" : "bg-forest-50 text-forest-800"}`}><Icon className="size-4" /></span><strong className="truncate text-sm">{label}</strong><span className="flex items-center gap-3"><b className="min-w-8 text-right text-lg tabular-nums">{count}</b><ArrowUpRight className="size-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span></Link>)}</div>
      </section>

      <section className="border border-[#d6ddd5] bg-forest-950 text-white">
        <div className="border-b border-white/10 px-4 py-3"><h2 className="text-base font-extrabold">Decision ledger</h2><p className="mt-1 text-xs text-forest-200">Latest accountable administrator actions.</p></div>
        <div className="divide-y divide-white/10">{overview.recentActivity.length ? overview.recentActivity.map((event) => <article key={event.id} className="p-4"><div className="flex items-start justify-between gap-3"><strong className="break-words text-xs">{event.action.replaceAll(".", " ")}</strong><time className="shrink-0 text-[10px] text-forest-300">{event.createdAt.toLocaleDateString("en-NG")}</time></div><p className="mt-2 break-words text-xs leading-5 text-forest-200">{event.actor.firstName} {event.actor.lastName} · {event.targetType}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-forest-300">{event.reason}</p></article>) : <p className="p-8 text-center text-sm text-forest-200">No administrator activity has been recorded.</p>}</div>
        <Link href="/admin/audit" className="flex min-h-12 items-center justify-between border-t border-white/10 px-4 text-xs font-bold text-lime">Open the complete ledger <ArrowUpRight className="size-4" /></Link>
      </section>
    </div>
  </div>;
}
