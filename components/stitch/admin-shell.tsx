"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { AccountStatus, AppRole } from "@prisma/client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AlertTriangle,
  Banknote,
  Building2,
  ChevronDown,
  ClipboardList,
  Gauge,
  Headphones,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  UserCog,
  UserPlus,
  Users,
  Wrench,
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

export type AdminNavigationCounts = {
  verifications: number;
  disputes: number;
  moderation: number;
  support: number;
  maintenance: number;
};

type NavItem = {
  href: string;
  label: string;
  shortLabel: string;
  icon: typeof Gauge;
  countKey?: keyof AdminNavigationCounts;
  superAdminOnly?: boolean;
};

const groups: Array<{ label: string; items: NavItem[] }> = [
  { label: "Command", items: [{ href: "/admin", label: "Operations overview", shortLabel: "Overview", icon: Gauge }] },
  {
    label: "Trust & safety",
    items: [
      { href: "/admin/verifications", label: "Verification queue", shortLabel: "Verification", icon: ShieldCheck, countKey: "verifications" },
      { href: "/admin/disputes", label: "Dispute cases", shortLabel: "Disputes", icon: AlertTriangle, countKey: "disputes" },
      { href: "/admin/moderation", label: "Moderation desk", shortLabel: "Moderation", icon: Users, countKey: "moderation" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/admin/users", label: "People directory", shortLabel: "Users", icon: UserCog },
      { href: "/admin/properties", label: "Property inventory", shortLabel: "Properties", icon: Building2 },
      { href: "/admin/payments", label: "Payment ledger", shortLabel: "Payments", icon: Banknote },
      { href: "/admin/support", label: "Support queue", shortLabel: "Support", icon: Headphones, countKey: "support" },
      { href: "/admin/maintenance", label: "Maintenance oversight", shortLabel: "Maintenance", icon: Wrench, countKey: "maintenance" },
    ],
  },
  {
    label: "Governance",
    items: [
      { href: "/admin/audit", label: "Decision ledger", shortLabel: "Audit", icon: ClipboardList },
      { href: "/admin/invitations", label: "Administrator access", shortLabel: "Invitations", icon: UserPlus, superAdminOnly: true },
    ],
  },
];

function activePath(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

function currentWorkspace(pathname: string) {
  return groups.flatMap((group) => group.items).find((item) => activePath(pathname, item.href))?.label ?? "Administration";
}

export function AdminShell({ children, viewer, counts = { verifications: 0, disputes: 0, moderation: 0, support: 0, maintenance: 0 } }: { children: ReactNode; viewer: AdminViewer; counts?: AdminNavigationCounts }) {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const mobileCloseRef = useRef<HTMLButtonElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const initials = `${viewer.firstName[0] ?? ""}${viewer.lastName[0] ?? ""}`.toUpperCase() || "AD";
  const visibleGroups = useMemo(() => groups.map((group) => ({ ...group, items: group.items.filter((item) => !item.superAdminOnly || viewer.role === "SuperAdmin") })), [viewer.role]);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem("linkconn-admin-rail") === "collapsed");
  }, []);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => { setMobileOpen(false); setProfileOpen(false); });
    return () => window.cancelAnimationFrame(frame);
  }, [pathname]);
  useEffect(() => {
    if (!mobileOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    mobileCloseRef.current?.focus();
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", onKey); previous?.focus(); };
  }, [mobileOpen]);
  useEffect(() => {
    if (!profileOpen) return;
    const close = (event: PointerEvent) => { if (!profileRef.current?.contains(event.target as Node)) setProfileOpen(false); };
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") setProfileOpen(false); };
    window.addEventListener("pointerdown", close);
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("pointerdown", close); window.removeEventListener("keydown", onKey); };
  }, [profileOpen]);

  const toggleRail = () => {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem("linkconn-admin-rail", next ? "collapsed" : "expanded");
      return next;
    });
  };
  const navigation = <Navigation groups={visibleGroups} pathname={pathname} counts={counts} collapsed={collapsed} />;

  return (
    <main id="main-content" style={{ "--admin-rail": collapsed ? "4.75rem" : "16rem" } as React.CSSProperties} className="min-h-dvh min-w-0 bg-[#f3f5f1] text-ink md:grid md:grid-cols-[var(--admin-rail)_minmax(0,1fr)] md:transition-[grid-template-columns] md:duration-300 md:ease-out">
      <aside className="sticky top-0 hidden h-dvh overflow-hidden bg-forest-950 text-white md:flex md:flex-col">
        <div className={`flex h-18 shrink-0 items-center border-b border-white/10 ${collapsed ? "justify-center px-2" : "justify-between px-4"}`}>
          <Brand collapsed={collapsed} />
          {!collapsed && <button onClick={toggleRail} className="grid size-11 place-items-center text-forest-100 hover:bg-white/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime" aria-label="Collapse administrator navigation"><PanelLeftClose className="size-5" /></button>}
        </div>
        {collapsed && <button onClick={toggleRail} className="mx-auto mt-3 grid size-11 shrink-0 place-items-center text-forest-100 hover:bg-white/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime" aria-label="Expand administrator navigation"><PanelLeftOpen className="size-5" /></button>}
        <nav aria-label="Administrator workspaces" className="admin-scrollbar flex-1 overflow-y-auto overflow-x-hidden px-2 py-4">{navigation}</nav>
        <RailIdentity viewer={viewer} initials={initials} collapsed={collapsed} />
        <button disabled={isLoggingOut} onClick={() => void logout()} title={collapsed ? "Log out" : undefined} className={`m-2 flex min-h-11 items-center text-sm font-bold text-red-200 hover:bg-red-950/50 disabled:opacity-60 ${collapsed ? "justify-center" : "gap-3 px-3"}`}><LogOut className="size-4 shrink-0" /><span className={collapsed ? "sr-only" : ""}>{isLoggingOut ? "Logging out…" : "Log out"}</span></button>
      </aside>

      <section className="min-w-0 overflow-x-clip">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-[#dce2db] bg-[#f8faf7]/96 px-3 backdrop-blur-sm sm:px-5">
          <button onClick={() => setMobileOpen(true)} className="grid size-11 place-items-center border border-[#cfd8cf] bg-white md:hidden" aria-label="Open administrator navigation" aria-expanded={mobileOpen}><Menu className="size-5" /></button>
          <div className="min-w-0">
            <p className="truncate text-sm font-extrabold tracking-[-0.01em]">{currentWorkspace(pathname)}</p>
            <p className="hidden text-[11px] text-muted sm:block">Admin / {currentWorkspace(pathname)}</p>
          </div>
          {counts.verifications > 0 && <Link href="/admin/verifications?status=Pending" className="ml-auto hidden min-h-10 items-center gap-2 border border-amber-200 bg-amber-50 px-3 text-xs font-extrabold text-amber-900 lg:inline-flex"><span className="size-2 bg-amber-500" />{counts.verifications} urgent review{counts.verifications === 1 ? "" : "s"}</Link>}
          <div ref={profileRef} className={`${counts.verifications > 0 ? "" : "ml-auto"} relative`}>
            <button onClick={() => setProfileOpen((value) => !value)} className="flex min-h-11 max-w-64 items-center gap-2 border border-[#cfd8cf] bg-white px-2 text-left" aria-expanded={profileOpen} aria-haspopup="menu">
              <span className="grid size-8 shrink-0 place-items-center bg-forest-800 text-xs font-extrabold text-white">{initials}</span>
              <span className="hidden min-w-0 sm:block"><strong className="block truncate text-xs">{viewer.firstName || "Administrator"} {viewer.lastName}</strong><span className="block truncate text-[10px] text-muted">{viewer.role}</span></span>
              <ChevronDown className="hidden size-4 text-muted sm:block" />
            </button>
            {profileOpen && <div role="menu" className="absolute right-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-1.5rem))] border border-[#cfd8cf] bg-white p-2 shadow-[0_18px_40px_rgba(18,55,42,.16)]"><RailIdentity viewer={viewer} initials={initials} /><Link role="menuitem" href="/admin/account" className="mt-2 flex min-h-11 items-center px-3 text-sm font-bold hover:bg-sand-100">Profile and security</Link><button role="menuitem" disabled={isLoggingOut} onClick={() => void logout()} className="flex min-h-11 w-full items-center gap-2 px-3 text-sm font-bold text-red-700 hover:bg-red-50"><LogOut className="size-4" />Log out</button></div>}
          </div>
        </header>
        {children}
      </section>

      <nav aria-label="Administrator quick navigation" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-[#dce2db] bg-white pb-[max(env(safe-area-inset-bottom),.25rem)] md:hidden">
        <Link href="/admin" className={`flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-bold ${pathname === "/admin" ? "text-forest-800" : "text-muted"}`}><Gauge className="size-5" />Overview</Link>
        <button onClick={() => setMobileOpen(true)} className="relative flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-bold text-muted"><ShieldCheck className="size-5" />Queues{counts.verifications + counts.disputes + counts.moderation > 0 && <span className="absolute right-[30%] top-2 min-w-5 bg-forest-800 px-1 text-[9px] text-white">{counts.verifications + counts.disputes + counts.moderation}</span>}</button>
        <button onClick={() => setMobileOpen(true)} className="flex min-h-16 flex-col items-center justify-center gap-1 text-[10px] font-bold text-muted"><Menu className="size-5" />Menu</button>
      </nav>

      {mobileOpen && <div className="fixed inset-0 z-[60] md:hidden"><button className="absolute inset-0 bg-forest-950/55" onClick={() => setMobileOpen(false)} aria-label="Close navigation backdrop" /><aside role="dialog" aria-modal="true" aria-label="Administrator navigation" className="relative flex h-dvh w-[min(23rem,92vw)] flex-col bg-forest-950 text-white shadow-[18px_0_50px_rgba(0,0,0,.28)]"><div className="flex h-18 items-center justify-between border-b border-white/10 px-4"><Brand /><button ref={mobileCloseRef} onClick={() => setMobileOpen(false)} className="grid size-11 place-items-center hover:bg-white/10" aria-label="Close administrator navigation"><X className="size-5" /></button></div><nav className="admin-scrollbar flex-1 overflow-y-auto p-3">{navigation}</nav><div className="border-t border-white/10 p-3"><RailIdentity viewer={viewer} initials={initials} /><Link href="/admin/account" className="mt-2 flex min-h-11 items-center px-3 text-sm font-bold text-forest-50 hover:bg-white/8">Profile and security</Link><button disabled={isLoggingOut} onClick={() => void logout()} className="flex min-h-11 w-full items-center gap-2 px-3 text-sm font-bold text-red-200"><LogOut className="size-4" />Log out</button></div></aside></div>}
    </main>
  );
}

function Navigation({ groups, pathname, counts, collapsed }: { groups: Array<{ label: string; items: NavItem[] }>; pathname: string; counts: AdminNavigationCounts; collapsed: boolean }) {
  return <div className="space-y-5">{groups.map((group) => <div key={group.label}><p className={`mb-2 px-2 text-[9px] font-extrabold uppercase tracking-[.12em] text-forest-300 ${collapsed ? "sr-only" : ""}`}>{group.label}</p><div className="space-y-1">{group.items.map((item) => { const active = activePath(pathname, item.href); const count = item.countKey ? counts[item.countKey] : 0; const Icon = item.icon; return <Link key={item.href} href={item.href} title={collapsed ? item.label : undefined} aria-current={active ? "page" : undefined} className={`group relative flex min-h-11 items-center text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-lime ${collapsed ? "justify-center px-2" : "gap-3 px-3"} ${active ? "bg-white text-forest-950" : "text-forest-100 hover:bg-white/8 hover:text-white"}`}><Icon className="size-4 shrink-0" /><span className={collapsed ? "sr-only" : "truncate"}>{item.label}</span>{!collapsed && count > 0 && <span className={`ml-auto min-w-6 px-1.5 py-0.5 text-center text-[10px] tabular-nums ${active ? "bg-forest-100 text-forest-900" : "bg-lime text-forest-950"}`}>{count > 99 ? "99+" : count}</span>}{collapsed && count > 0 && <span className="absolute right-1 top-1 size-2 bg-lime" />}{active && <span className="absolute inset-y-2 left-0 w-px bg-forest-800" />}</Link>; })}</div></div>)}</div>;
}

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return <Link href="/admin" className="flex min-h-11 items-center" aria-label="LinkConn Rent administrator overview"><Logo variant={collapsed ? "mark" : "lockup"} priority className={collapsed ? "size-9 brightness-0 invert" : "h-10 w-auto brightness-0 invert"} sizes={collapsed ? "36px" : "118px"} /></Link>;
}

function RailIdentity({ viewer, initials, collapsed = false }: { viewer: AdminViewer; initials: string; collapsed?: boolean }) {
  return <Link href="/admin/account" title={collapsed ? `${viewer.firstName} ${viewer.lastName}` : undefined} className={`m-2 flex min-w-0 items-center border border-white/10 bg-white/[.05] text-white hover:bg-white/10 ${collapsed ? "justify-center p-2" : "gap-3 p-3"}`}><span className="grid size-9 shrink-0 place-items-center bg-lime text-xs font-extrabold text-forest-950">{initials}</span><span className={collapsed ? "sr-only" : "min-w-0"}><strong className="block truncate text-xs">{viewer.firstName || "Administrator"} {viewer.lastName}</strong><span className="block truncate text-[10px] text-forest-300">{viewer.email}</span><span className="block truncate text-[10px] text-forest-200">{viewer.role} · {viewer.accountStatus}</span></span></Link>;
}
