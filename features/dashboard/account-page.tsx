"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Bell,
  Building2,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Gauge,
  Home,
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  ApplicationsTab,
  MaintenanceTab,
  PaymentsTab,
  ProfileTab,
  SavedTab,
  SecurityTab,
  VerificationTab,
} from "./dashboard-tabs";
import type { DashboardSnapshot } from "@/domain/types/operating-system";
import { formatNaira } from "@/utils/map-property";
import { Logo } from "@/components/shared/icons";

const EMPTY_SNAPSHOT: DashboardSnapshot = {
  portfolioValue: 0,
  occupancyRate: 0,
  activeListings: 0,
  pendingApplications: 0,
  savedHomes: 0,
  openMaintenance: 0,
  nextPayment: null,
  applications: [],
  viewings: [],
  maintenance: [],
};

function DashboardContent() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";
  const [snapshot, setSnapshot] = useState(EMPTY_SNAPSHOT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.replace(`/login?next=${encodeURIComponent("/dashboard")}`);
      return;
    }
    let cancelled = false;
    void fetch("/api/dashboard")
      .then((response) => response.json())
      .then((result: { success: boolean; data?: DashboardSnapshot }) => {
        if (!cancelled && result.success && result.data) setSnapshot(result.data);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [router, user]);

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", tab);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const isLandlord = user?.role === "Landlord" || user?.role === "Property Manager";
  const nav = useMemo(
    () =>
      isLandlord
        ? [
            { label: "Dashboard", tab: "overview", icon: Gauge },
            { label: "My properties", href: "/dashboard/properties", icon: Building2 },
            { label: "Viewings", tab: "applications", icon: CalendarDays },
            { label: "Applicants", href: "/dashboard/applicants", icon: Users },
            { label: "Messages", href: "/messages", icon: MessageSquare },
            { label: "Verification", href: "/verification", icon: ShieldCheck },
          ]
        : [
            { label: "Dashboard", tab: "overview", icon: Gauge },
            { label: "Applications", tab: "applications", icon: ClipboardList },
            { label: "Saved homes", tab: "saved", icon: Home },
            { label: "Messages", href: "/messages", icon: MessageSquare },
            { label: "Payments", tab: "payments", icon: CircleDollarSign },
            { label: "Maintenance", href: "/dashboard/maintenance", icon: Wrench },
          ],
    [isLandlord],
  );

  if (!user) return null;
  const initials = `${user.firstName[0] || ""}${user.lastName[0] || ""}`.toUpperCase();

  const secondaryContent =
    activeTab === "profile" ? <ProfileTab /> :
    activeTab === "verification" ? <VerificationTab /> :
    activeTab === "saved" ? <SavedTab /> :
    activeTab === "applications" ? <ApplicationsTab /> :
    activeTab === "payments" ? <PaymentsTab /> :
    activeTab === "maintenance" ? <MaintenanceTab /> :
    activeTab === "security" ? <SecurityTab /> : null;

  return (
    <main id="main-content" className="min-h-[100dvh] bg-sand-50 md:grid md:grid-cols-[16rem_1fr]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-line bg-sand-50 p-4 md:flex">
        <Link href="/" className="flex items-center gap-2 px-2 py-2">
          <Logo className="h-9 w-9" />
          <span className="font-extrabold tracking-tight text-forest-900">LinkConn Rent</span>
        </Link>

        <nav className="mt-8 flex-1 space-y-1">
          {nav.map((item) => {
            const Icon = item.icon;
            const active = item.tab ? activeTab === item.tab : pathname === item.href;
            const classes = `flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-bold transition ${
              active ? "bg-forest-100 text-forest-900" : "text-muted hover:bg-sand-200 hover:text-forest-900"
            }`;
            if (item.href) {
              return <Link key={item.label} href={item.href} className={classes}><Icon className="h-4 w-4" />{item.label}</Link>;
            }
            return <button key={item.label} onClick={() => setTab(item.tab || "overview")} className={classes}><Icon className="h-4 w-4" />{item.label}</button>;
          })}
        </nav>

        {isLandlord && (
          <Link href="/dashboard/properties/new" className="stitch-button mb-4 w-full">
            <Plus className="h-4 w-4" /> Add new property
          </Link>
        )}
        <button onClick={() => setTab("profile")} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-muted hover:bg-sand-200">
          <Settings className="h-4 w-4" /> Settings
        </button>
        <button onClick={logout} className="flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold text-red-700 hover:bg-red-50">
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </aside>

      <section className="min-w-0 md:col-start-2">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-sand-50/95 px-4 backdrop-blur sm:px-7">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-ink">{activeTab === "overview" ? "Overview" : activeTab[0].toUpperCase() + activeTab.slice(1)}</h1>
            <p className="hidden text-xs text-muted sm:block">Welcome back, {user.firstName}. Here is what needs your attention.</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative grid h-10 w-10 place-items-center rounded-full bg-sand-200 text-forest-900" aria-label="Notifications">
              <Bell className="h-4 w-4" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>
            <button onClick={() => setTab("profile")} className="grid h-10 w-10 place-items-center rounded-full bg-forest-700 text-xs font-extrabold text-white" aria-label="Open profile">
              {initials}
            </button>
          </div>
        </header>

        <div className="p-4 pb-24 sm:p-7 md:pb-8">
          {activeTab === "overview" ? (
            <DashboardOverview snapshot={snapshot} landlord={isLandlord} loading={loading} />
          ) : (
            <div className="mx-auto max-w-5xl">{secondaryContent}</div>
          )}
        </div>
      </section>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-white px-2 pb-[max(env(safe-area-inset-bottom),0.4rem)] pt-2 md:hidden">
        {nav.slice(0, 4).map((item) => {
          const Icon = item.icon;
          const active = item.tab ? activeTab === item.tab : pathname === item.href;
          const content = <><Icon className="h-5 w-5" /><span className="text-[10px] font-bold">{item.label}</span></>;
          return item.href ? (
            <Link key={item.label} href={item.href} className={`flex min-h-12 flex-col items-center justify-center gap-1 ${active ? "text-forest-700" : "text-muted"}`}>{content}</Link>
          ) : (
            <button key={item.label} onClick={() => setTab(item.tab || "overview")} className={`flex min-h-12 flex-col items-center justify-center gap-1 ${active ? "text-forest-700" : "text-muted"}`}>{content}</button>
          );
        })}
      </nav>
    </main>
  );
}

function Metric({
  label,
  value,
  icon: Icon,
  accent = false,
}: {
  label: string;
  value: string;
  icon: typeof Home;
  accent?: boolean;
}) {
  return (
    <article className={`rounded-xl border p-4 ${accent ? "border-forest-200 bg-forest-50" : "border-line bg-sand-100"}`}>
      <div className="flex items-center justify-between">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-white text-forest-700"><Icon className="h-4 w-4" /></span>
        <span className="text-[11px] font-bold text-forest-700">Live</span>
      </div>
      <p className="mt-4 text-xs font-semibold text-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold tabular-nums tracking-tight text-ink">{value}</p>
    </article>
  );
}

function DashboardOverview({ snapshot, landlord, loading }: { snapshot: DashboardSnapshot; landlord: boolean; loading: boolean }) {
  const metrics = landlord
    ? [
        ["Total portfolio value", formatNaira(snapshot.portfolioValue), Building2],
        ["Occupancy rate", `${Math.round(snapshot.occupancyRate)}%`, Gauge],
        ["Active listings", String(snapshot.activeListings), Home],
        ["Pending applications", String(snapshot.pendingApplications), ClipboardList],
      ] as const
    : [
        ["Saved homes", String(snapshot.savedHomes), Home],
        ["Active applications", String(snapshot.pendingApplications), ClipboardList],
        ["Next payment", snapshot.nextPayment ? formatNaira(snapshot.nextPayment.amount) : "No payment due", CircleDollarSign],
        ["Open requests", String(snapshot.openMaintenance), Wrench],
      ] as const;

  return (
    <div className="mx-auto max-w-6xl">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value, icon], index) => (
          <Metric key={label} label={label} value={loading ? "—" : value} icon={icon} accent={index === 1} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-6">
          <section className="rounded-xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-ink">{landlord ? "Recent applications" : "Application progress"}</h2>
              <Link href={landlord ? "/dashboard/applicants" : "/dashboard?tab=applications"} className="text-xs font-bold text-forest-700">View all</Link>
            </div>
            <div className="mt-4 divide-y divide-line">
              {snapshot.applications.length ? snapshot.applications.slice(0, 3).map((application) => (
                <div key={application.id} className="flex items-center gap-3 py-4">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-sand-200 text-xs font-extrabold text-forest-900">
                    {application.tenantName.split(" ").map((part) => part[0]).join("").slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink">{application.tenantName}</p>
                    <p className="truncate text-xs text-muted">{application.propertyTitle}</p>
                  </div>
                  <span className="rounded-md bg-forest-50 px-2 py-1 text-[11px] font-bold text-forest-800">{application.status}</span>
                </div>
              )) : <EmptyRow label={landlord ? "No applications need review." : "You have no active applications."} />}
            </div>
          </section>

          <section className="rounded-xl border border-line bg-white p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-ink">Maintenance overview</h2>
              <Wrench className="h-4 w-4 text-muted" />
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {snapshot.maintenance.length ? snapshot.maintenance.slice(0, 2).map((item) => (
                <article key={item.id} className={`border-l-2 p-4 ${item.priority === "High" ? "border-red-500 bg-red-50" : "border-forest-500 bg-forest-50"}`}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{item.priority}</p>
                  <h3 className="mt-1 text-sm font-extrabold text-ink">{item.title}</h3>
                  <p className="mt-1 text-xs text-muted">{item.propertyTitle}</p>
                </article>
              )) : <EmptyRow label="No open maintenance requests." />}
            </div>
          </section>
        </div>

        <section className="h-fit rounded-xl border border-line bg-white p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-extrabold text-ink">Upcoming viewings</h2>
            <CalendarDays className="h-4 w-4 text-forest-700" />
          </div>
          <div className="mt-4 space-y-4">
            {snapshot.viewings.length ? snapshot.viewings.slice(0, 4).map((viewing) => (
              <article key={viewing.id} className="relative border-l border-forest-300 pl-4">
                <span className="absolute -left-1.5 top-1 h-3 w-3 rounded-full border-2 border-white bg-forest-600" />
                <p className="text-xs font-bold text-forest-800">{new Date(viewing.scheduledAt).toLocaleString("en-NG", { weekday: "short", hour: "numeric", minute: "2-digit" })}</p>
                <p className="mt-1 text-sm font-bold text-ink">{viewing.propertyTitle}</p>
                <p className="mt-1 text-xs text-muted">{viewing.status}</p>
              </article>
            )) : <EmptyRow label="No viewings scheduled." />}
          </div>
        </section>
      </div>
    </div>
  );
}

function EmptyRow({ label }: { label: string }) {
  return <p className="py-8 text-center text-sm text-muted">{label}</p>;
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="min-h-[100dvh] animate-pulse bg-sand-200" />}>
      <DashboardContent />
    </Suspense>
  );
}
