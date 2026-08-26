import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, Inbox, RotateCcw } from "lucide-react";
import { cn } from "@/utils/cn";

export function SurfaceIntro({
  title,
  description,
  aside,
  inverse = false,
}: {
  title: string;
  description: string;
  aside?: React.ReactNode;
  inverse?: boolean;
}) {
  return (
    <header className={cn("surface-intro", inverse && "surface-intro-inverse")}>
      <div className="min-w-0">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {aside ? <div className="surface-intro-aside">{aside}</div> : null}
    </header>
  );
}

export function StatusBadge({ value, className }: { value: string; className?: string }) {
  const tone = /critical|high|failed|overdue|removed|rejected|suspended|restricted/i.test(value)
    ? "status-badge-error"
    : /resolved|completed|approved|active|paid|verified|accepted/i.test(value)
      ? "status-badge-success"
      : /pending|open|waiting|processing|review|investigating/i.test(value)
        ? "status-badge-warning"
        : "status-badge-neutral";

  return (
    <span className={cn("status-badge", tone, className)}>
      <span aria-hidden="true" />
      {value.replace(/([a-z])([A-Z])/g, "$1 $2")}
    </span>
  );
}

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  icon: Icon = Inbox,
  compact = false,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
  icon?: LucideIcon;
  compact?: boolean;
}) {
  return (
    <section className={cn("empty-state", compact && "empty-state-compact")}>
      <Icon aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="stitch-button mt-5">
          {actionLabel}
          <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </section>
  );
}

export function ErrorState({
  title,
  description,
  retry,
}: {
  title: string;
  description: string;
  retry?: () => void;
}) {
  return (
    <section className="empty-state border-error/20 bg-error-soft/30">
      <RotateCcw className="text-error" aria-hidden="true" />
      <h2>{title}</h2>
      <p>{description}</p>
      {retry ? (
        <button type="button" onClick={retry} className="stitch-button mt-5">
          <RotateCcw className="size-4" aria-hidden="true" />
          Try again
        </button>
      ) : null}
    </section>
  );
}

export function RouteSkeleton({ mode = "public" }: { mode?: "public" | "admin" | "auth" }) {
  return (
    <main className={cn("min-h-[75dvh] bg-sand-50 px-4 pb-20 pt-24", mode === "admin" && "bg-[#f3f5f1] pt-8", mode === "auth" && "bg-sand-100 pt-10")} aria-label="Loading page" aria-busy="true">
      <div className={cn("mx-auto w-full max-w-6xl", mode === "admin" && "max-w-[100rem]")}>
        <div className="h-3 w-28 animate-pulse bg-forest-100 motion-reduce:animate-none" />
        <div className="mt-5 h-12 max-w-2xl animate-pulse bg-sand-300 motion-reduce:animate-none" />
        <div className="mt-4 h-5 max-w-xl animate-pulse bg-sand-200 motion-reduce:animate-none" />
        <div className="mt-10 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-44 animate-pulse bg-white p-5 motion-reduce:animate-none"><div className="h-5 w-2/3 bg-sand-200" /><div className="mt-5 h-3 w-full bg-sand-100" /><div className="mt-2 h-3 w-4/5 bg-sand-100" /></div>)}
        </div>
      </div>
    </main>
  );
}
