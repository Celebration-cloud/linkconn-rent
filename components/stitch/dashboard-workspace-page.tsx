"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileSignature,
  Home,
  Plus,
} from "lucide-react";
import type { DashboardSnapshot } from "@/domain/types/operating-system";
import { Logo } from "@/components/shared/icons";
import {
  ApplicationsTab,
  PaymentsTab,
  SavedTab,
} from "@/features/dashboard/dashboard-tabs";

const EMPTY: DashboardSnapshot = {
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

export function DashboardWorkspacePage({
  mode,
}: {
  mode:
    | "saved"
    | "applications"
    | "payments"
    | "viewings"
    | "calendar"
    | "leases";
}) {
  const [snapshot, setSnapshot] = useState(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    void fetch("/api/dashboard", { cache: "no-store" })
      .then((response) => response.json())
      .then((result: { success: boolean; data?: DashboardSnapshot }) => {
        if (active && result.success && result.data) setSnapshot(result.data);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const title = {
    saved: "Saved homes",
    applications: "Applications",
    payments: "Rent and payments",
    viewings: "Your viewings",
    calendar: "Viewing calendar",
    leases: "Leases and agreements",
  }[mode];

  return (
    <main id="main-content" className="min-h-[100dvh] bg-sand-50 pb-24">
      <header className="border-b border-line bg-forest-950 text-white">
        <div className="stitch-container py-8">
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-xs font-bold text-forest-200 hover:text-white"
            >
              <ArrowLeft className="size-4" /> Dashboard
            </Link>
            <Link href="/" className="rounded-lg bg-sand-50 px-2 py-1" aria-label="LinkConn Rent home"><Logo variant="lockup" priority className="h-10 w-auto" sizes="86px" /></Link>
          </div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-[-0.05em]">
            {title}
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-6 text-forest-100">
            Every important action stays connected to the property,
            conversation, documents, and activity history.
          </p>
        </div>
      </header>

      <div className="stitch-container py-8">
        {mode === "saved" ? <SavedTab /> : null}
        {mode === "applications" ? <ApplicationsTab /> : null}
        {mode === "payments" ? <PaymentsTab /> : null}
        {mode === "viewings" || mode === "calendar" ? (
          <ViewingWorkspace
            snapshot={snapshot}
            loading={loading}
            calendar={mode === "calendar"}
          />
        ) : null}
        {mode === "leases" ? <LeaseWorkspace /> : null}
      </div>
    </main>
  );
}

function ViewingWorkspace({
  snapshot,
  loading,
  calendar,
}: {
  snapshot: DashboardSnapshot;
  loading: boolean;
  calendar: boolean;
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl bg-sand-200"
          />
        ))}
      </div>
    );
  }

  if (!snapshot.viewings.length) {
    return (
      <EmptyWorkspace
        icon={CalendarDays}
        title={
          calendar
            ? "No viewing slots need your attention"
            : "You have no upcoming viewings"
        }
        copy={
          calendar
            ? "New viewing requests and confirmed appointments will appear here."
            : "Find a verified home and choose an available time from its viewing calendar."
        }
        href={calendar ? "/dashboard/properties" : "/properties"}
        action={calendar ? "Manage listings" : "Find a home"}
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {snapshot.viewings.map((viewing) => (
        <article
          key={viewing.id}
          className="rounded-2xl border border-line bg-white p-5"
        >
          <div className="flex items-start justify-between gap-4">
            <span className="grid size-11 place-items-center rounded-xl bg-forest-100 text-forest-800">
              <CalendarDays className="size-5" />
            </span>
            <span className="rounded-md bg-sand-200 px-2 py-1 text-xs font-bold text-forest-800">
              {viewing.status}
            </span>
          </div>
          <h2 className="mt-5 text-lg font-extrabold text-ink">
            {viewing.propertyTitle}
          </h2>
          <p className="mt-1 text-sm text-muted">
            With {viewing.participantName}
          </p>
          <div className="mt-5 flex items-center gap-2 border-t border-line pt-4 text-sm font-bold text-forest-800">
            <Clock3 className="size-4" />
            {new Intl.DateTimeFormat("en-NG", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(viewing.scheduledAt))}
          </div>
        </article>
      ))}
    </div>
  );
}

function LeaseWorkspace() {
  return (
    <EmptyWorkspace
      icon={FileSignature}
      title="No active lease yet"
      copy="When an application is accepted, the versioned agreement, signature activity, payment schedule, and receipts will appear here."
      href="/dashboard/applications"
      action="Review applications"
    />
  );
}

function EmptyWorkspace({
  icon: Icon,
  title,
  copy,
  href,
  action,
}: {
  icon: typeof Home;
  title: string;
  copy: string;
  href: string;
  action: string;
}) {
  return (
    <section className="grid min-h-96 place-items-center rounded-3xl border border-dashed border-line bg-white p-8 text-center">
      <div className="max-w-md">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-forest-100 text-forest-800">
          <Icon className="size-6" />
        </span>
        <h2 className="mt-5 text-2xl font-extrabold text-ink">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
        <Link href={href} className="stitch-button mt-6">
          {action}
          {href.includes("properties") ? (
            <Plus className="size-4" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
        </Link>
      </div>
    </section>
  );
}
