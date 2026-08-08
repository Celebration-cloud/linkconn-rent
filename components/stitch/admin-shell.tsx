"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { AccountStatus, AppRole } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Banknote,
  Building2,
  ClipboardList,
  Gauge,
  LogOut,
  Menu,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { Logo } from "@/components/shared/icons";
import { useAuth } from "@/providers/auth-provider";

export type AdminViewer = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: AppRole;
  accountStatus: AccountStatus;
};

const primaryLinks = [
  { href: "/admin", label: "Overview", icon: Gauge },
  { href: "/admin/verifications", label: "Verification", icon: ShieldCheck },
  { href: "/admin/disputes", label: "Disputes", icon: AlertTriangle },
  { href: "/admin/moderation", label: "Moderation", icon: Users },
] as const;
const operationLinks = [
  { href: "/admin/users", label: "Users", icon: UserCog },
  { href: "/admin/properties", label: "Properties", icon: Building2 },
  { href: "/admin/payments", label: "Payments", icon: Banknote },
  { href: "/admin/audit", label: "Audit log", icon: ClipboardList },
] as const;

function activePath(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ children, viewer }: { children: ReactNode; viewer: AdminViewer }) {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const initials = `${viewer.firstName[0] ?? ""}${viewer.lastName[0] ?? ""}`.toUpperCase() || "AD";
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMobileOpen(false);
      setProfileOpen(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    mobileCloseRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [mobileOpen]);
  const nav = (
    <>
      <NavGroup label="Workspaces" links={primaryLinks} pathname={pathname} />
      <NavGroup label="Operations" links={operationLinks} pathname={pathname} />
      {viewer.role === "SuperAdmin" && (
        <NavGroup
          label="Access"
          links={[{ href: "/admin/invitations", label: "Admin invitations", icon: UserPlus }]}
          pathname={pathname}
        />
      )}
    </>
  );
  return (
    <main id="main-content" className="min-h-dvh min-w-0 bg-sand-50 md:grid md:grid-cols-[14rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-dvh overflow-y-auto border-r border-line bg-sand-50 p-4 md:flex md:flex-col">
        <Brand /> <nav className="mt-6 flex-1 space-y-6">{nav}</nav>
        <Identity viewer={viewer} initials={initials} />
        <button
          disabled={isLoggingOut}
          onClick={() => void logout()}
          className="mt-2 flex min-h-11 items-center gap-3 rounded-lg px-3 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          <LogOut className="size-4" /> {isLoggingOut ? "Logging out…" : "Log out"}
        </button>
      </aside>
      <section className="min-w-0 overflow-x-clip">
        <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-line bg-sand-50/95 px-4 backdrop-blur">
          <button
            onClick={() => setMobileOpen(true)}
            className="grid size-11 place-items-center rounded-lg border border-line md:hidden"
            aria-label="Open administrator navigation"
            aria-expanded={mobileOpen}
          >
            <Menu className="size-5" />
          </button>
          <div className="md:hidden">
            <Logo variant="mark" priority className="size-9" sizes="36px" />
          </div>
          <div className="ml-auto relative">
            <button
              onClick={() => setProfileOpen((value) => !value)}
              className="flex min-h-11 max-w-[15rem] items-center gap-3 rounded-xl border border-line bg-white px-2.5 text-left"
              aria-expanded={profileOpen}
              aria-haspopup="menu"
            >
              <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-forest-800 text-xs font-extrabold text-white">
                {initials}
              </span>
              <span className="hidden min-w-0 sm:block">
                <strong className="block truncate text-xs">
                  {viewer.firstName || "Administrator"} {viewer.lastName}
                </strong>
                <span className="block truncate text-[10px] text-muted">{viewer.role}</span>
              </span>
            </button>
            {profileOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] rounded-xl border border-line bg-white p-3 shadow-xl"
              >
                <Identity viewer={viewer} initials={initials} />
                <Link
                  role="menuitem"
                  href="/admin/account"
                  className="mt-3 flex min-h-11 items-center rounded-lg px-3 text-sm font-bold hover:bg-sand-100"
                >
                  Profile and security
                </Link>
                <button
                  role="menuitem"
                  disabled={isLoggingOut}
                  onClick={() => void logout()}
                  className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-bold text-red-700 hover:bg-red-50"
                >
                  <LogOut className="size-4" /> Log out
                </button>
              </div>
            )}
          </div>
        </header>
        {children}
      </section>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-line bg-white pb-[max(env(safe-area-inset-bottom),.35rem)] md:hidden">
        {[...primaryLinks.slice(0, 4), { href: "#more", label: "More", icon: Menu }].map(
          ({ href, label, icon: Icon }) =>
            href === "#more" ? (
              <button
                key={href}
                onClick={() => setMobileOpen(true)}
                className="flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-bold text-muted"
              >
                <Icon className="size-5" />
                {label}
              </button>
            ) : (
              <Link
                key={href}
                href={href}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-bold ${activePath(pathname, href) ? "text-forest-700" : "text-muted"}`}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            )
        )}
      </nav>
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <button
            className="absolute inset-0 bg-forest-950/45"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation backdrop"
          />
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Administrator navigation"
            className="relative h-dvh w-[min(22rem,88vw)] overflow-y-auto bg-sand-50 p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <Brand />
              <button
                ref={mobileCloseRef}
                onClick={() => setMobileOpen(false)}
                className="grid size-11 place-items-center rounded-lg border border-line"
                aria-label="Close administrator navigation"
              >
                <X className="size-5" />
              </button>
            </div>
            <nav className="mt-6 space-y-6">{nav}</nav>
            <div className="mt-8 border-t border-line pt-4">
              <Identity viewer={viewer} initials={initials} />
              <Link
                href="/admin/account"
                className="mt-3 flex min-h-11 items-center rounded-lg px-3 text-sm font-bold hover:bg-sand-100"
              >
                Profile and security
              </Link>
              <button
                disabled={isLoggingOut}
                onClick={() => void logout()}
                className="flex min-h-11 w-full items-center gap-2 rounded-lg px-3 text-sm font-bold text-red-700"
              >
                <LogOut className="size-4" /> Log out
              </button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center px-1 py-2" aria-label="LinkConn Rent home">
      <Logo variant="lockup" priority className="h-11 w-auto" sizes="102px" />
    </Link>
  );
}
function NavGroup({
  label,
  links,
  pathname,
}: {
  label: string;
  links: ReadonlyArray<{ href: string; label: string; icon: typeof Gauge }>;
  pathname: string;
}) {
  return (
    <div>
      <p className="px-3 text-[9px] font-bold uppercase tracking-[.14em] text-muted">{label}</p>
      <div className="mt-2 space-y-1">
        {links.map(({ href, label: itemLabel, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={activePath(pathname, href) ? "page" : undefined}
            className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-xs font-bold ${activePath(pathname, href) ? "bg-forest-100 text-forest-900" : "text-muted hover:bg-sand-200"}`}
          >
            <Icon className="size-4 shrink-0" /> {itemLabel}
          </Link>
        ))}
      </div>
    </div>
  );
}
function Identity({ viewer, initials }: { viewer: AdminViewer; initials: string }) {
  return (
    <Link
      href="/admin/account"
      className="flex min-w-0 items-center gap-3 rounded-xl bg-sand-100 p-3 transition hover:bg-sand-200"
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-forest-800 text-xs font-extrabold text-white">
        {initials}
      </span>
      <span className="min-w-0">
        <strong className="block truncate text-xs" title={`${viewer.firstName} ${viewer.lastName}`}>
          {viewer.firstName || "Administrator"} {viewer.lastName}
        </strong>
        <span className="block truncate text-[10px] text-muted" title={viewer.email}>
          {viewer.email}
        </span>
        <span className="block text-[10px] font-bold text-forest-700">
          {viewer.role} · {viewer.accountStatus}
        </span>
      </span>
    </Link>
  );
}
