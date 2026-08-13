"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  FileSignature,
  Gauge,
  Heart,
  KeyRound,
  LogOut,
  Menu,
  MessageSquare,
  ShieldCheck,
  UserRound,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AccountStatus, AppRole } from "@prisma/client";
import type { NotificationCenterData } from "@/features/notifications/contracts";
import { NotificationCenter } from "@/features/notifications/components/notification-center";
import { Logo } from "@/components/shared/icons";
import { useAuth } from "@/providers/auth-provider";
import {
  getDashboardRouteMeta,
  getWorkspaceNavigation,
  isDashboardRouteActive,
  type DashboardIconName,
  type DashboardNavigationGroup,
} from "@/features/dashboard/dashboard-shell-config";

const COLLAPSE_STORAGE_KEY = "linkconn.dashboard.navigation-collapsed";

const ICONS: Record<DashboardIconName, LucideIcon> = {
  account: UserRound,
  applicants: Users,
  applications: ClipboardList,
  calendar: CalendarDays,
  leases: FileSignature,
  maintenance: Wrench,
  messages: MessageSquare,
  overview: Gauge,
  payments: CircleDollarSign,
  properties: Building2,
  saved: Heart,
  security: KeyRound,
  verification: ShieldCheck,
  viewings: CalendarDays,
};

export type DashboardShellViewer = {
  firstName: string;
  lastName: string;
  email: string;
  role: AppRole;
  accountStatus: AccountStatus;
};

export function DashboardShell({
  children,
  viewer,
  notificationCount = 0,
  initialNotifications,
}: {
  children: ReactNode;
  viewer: DashboardShellViewer;
  notificationCount?: number;
  initialNotifications?: NotificationCenterData;
}) {
  const pathname = usePathname();
  const { logout, isLoggingOut } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [collapseReady, setCollapseReady] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(initialNotifications?.unreadCount ?? notificationCount);
  const mobileTriggerRef = useRef<HTMLButtonElement>(null);
  const mobilePanelRef = useRef<HTMLElement>(null);
  const notificationTriggerRef = useRef<HTMLButtonElement>(null);
  const notificationPanelRef = useRef<HTMLDivElement>(null);
  const accountTriggerRef = useRef<HTMLButtonElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);
  const navigation = useMemo(
    () => getWorkspaceNavigation(viewer.role),
    [viewer.role],
  );
  const routeMeta = getDashboardRouteMeta(pathname);
  const isOwner = viewer.role === "Landlord" || viewer.role === "PropertyManager";
  const activityDestination = isOwner
    ? { href: "/dashboard/applicants", label: "Queues", icon: Users }
    : { href: "/dashboard/applications", label: "Activity", icon: ClipboardList };
  const initials = `${viewer.firstName[0] || ""}${viewer.lastName[0] || ""}`.toUpperCase() || "LC";

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setCollapsed(localStorage.getItem(COLLAPSE_STORAGE_KEY) === "true");
      setCollapseReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!notificationsOpen) return;
    notificationPanelRef.current?.querySelector<HTMLElement>("button")?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setNotificationsOpen(false);
      window.requestAnimationFrame(() => notificationTriggerRef.current?.focus());
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [notificationsOpen]);

  useEffect(() => {
    if (!accountOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      setAccountOpen(false);
      window.requestAnimationFrame(() => accountTriggerRef.current?.focus());
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [accountOpen]);

  useEffect(() => {
    if (collapseReady) {
      localStorage.setItem(COLLAPSE_STORAGE_KEY, String(collapsed));
    }
  }, [collapseReady, collapsed]);

  const closeMobileNavigation = useCallback(() => {
    setMobileOpen(false);
    window.requestAnimationFrame(() => mobileTriggerRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!mobileOpen) return;
    const panel = mobilePanelRef.current;
    panel?.querySelector<HTMLElement>("a, button")?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMobileNavigation();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const focusable = Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeMobileNavigation, mobileOpen]);

  useEffect(() => {
    const closeAccount = (event: MouseEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    };
    document.addEventListener("mousedown", closeAccount);
    return () => document.removeEventListener("mousedown", closeAccount);
  }, []);

  return (
    <div
      className={`min-h-[100dvh] bg-sand-50 text-ink lg:grid ${
        collapsed
          ? "lg:grid-cols-[5.25rem_minmax(0,1fr)]"
          : "lg:grid-cols-[16.5rem_minmax(0,1fr)]"
      }`}
    >
      <aside
        className="sticky top-0 hidden h-[100dvh] min-w-0 flex-col overflow-visible border-r border-line bg-forest-950 text-white transition-[width] duration-200 motion-reduce:transition-none lg:flex"
        aria-label="Workspace navigation"
      >
        <Link
          href="/"
          className={`flex min-h-20 items-center border-b border-white/10 ${collapsed ? "justify-center px-3" : "px-5"}`}
          aria-label="LinkConn Rent home"
        >
          <Logo
            variant={collapsed ? "mark" : "lockup"}
            priority
            className={collapsed ? "size-9" : "h-12 w-auto"}
            sizes={collapsed ? "36px" : "112px"}
          />
        </Link>

        <DashboardNavigation
          groups={navigation}
          pathname={pathname}
          collapsed={collapsed}
          className="flex-1 overflow-y-auto px-3 py-5"
        />

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={() => void logout()}
            disabled={isLoggingOut}
            className={`flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-bold text-forest-100 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-wait disabled:opacity-60 ${collapsed ? "justify-center" : ""}`}
            aria-label={isLoggingOut ? "Logging out" : "Log out"}
          >
            <LogOut className="size-4 shrink-0" aria-hidden="true" />
            {!collapsed ? <span>{isLoggingOut ? "Logging out…" : "Log out"}</span> : null}
          </button>
        </div>
      </aside>

      <div className="min-w-0 lg:col-start-2">
        <header className="sticky top-0 z-30 border-b border-line bg-sand-50/95 backdrop-blur-sm">
          <div className="flex min-h-16 items-center gap-3 px-4 sm:px-6 lg:min-h-[4.75rem] lg:px-8">
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="hidden size-11 shrink-0 place-items-center rounded-lg border border-line bg-white text-forest-900 transition-colors hover:bg-sand-200 lg:grid"
              aria-label={collapsed ? "Expand workspace navigation" : "Collapse workspace navigation"}
              aria-pressed={collapsed}
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>

            <Link href="/" className="grid size-11 shrink-0 place-items-center lg:hidden" aria-label="LinkConn Rent home">
              <Logo variant="mark" priority className="size-9" sizes="36px" />
            </Link>

            <div className="min-w-0 flex-1">
              <nav aria-label="Breadcrumb" className="hidden sm:block">
                <ol className="flex items-center gap-2 text-xs font-semibold text-muted">
                  {routeMeta.breadcrumbs.map((crumb, index) => (
                    <li key={`${crumb.label}-${index}`} className="flex min-w-0 items-center gap-2">
                      {index > 0 ? <span aria-hidden="true">/</span> : null}
                      {crumb.href ? (
                        <Link href={crumb.href} className="hover:text-forest-800">{crumb.label}</Link>
                      ) : (
                        <span className="truncate" aria-current="page">{crumb.label}</span>
                      )}
                    </li>
                  ))}
                </ol>
              </nav>
              <h1 className="truncate text-lg font-extrabold tracking-[-0.02em] text-ink sm:mt-1 sm:text-xl">
                {routeMeta.title}
              </h1>
            </div>

            <div className="relative">
              <button ref={notificationTriggerRef} type="button" onClick={() => { setNotificationsOpen((value) => !value); setAccountOpen(false); }} className="relative grid size-11 shrink-0 place-items-center rounded-lg border border-line bg-white text-forest-900 transition-colors hover:bg-sand-200" aria-label={unreadNotifications > 0 ? `Notifications, ${unreadNotifications} unread` : "Notifications"} aria-haspopup="dialog" aria-expanded={notificationsOpen}>
                <Bell className="size-4" aria-hidden="true" />
                {unreadNotifications > 0 ? <span data-testid="notification-count" className="absolute -right-1 -top-1 grid min-h-5 min-w-5 place-items-center rounded-full bg-forest-700 px-1 text-[10px] font-extrabold text-white">{unreadNotifications > 99 ? "99+" : unreadNotifications}</span> : null}
              </button>
              {notificationsOpen ? <div ref={notificationPanelRef} role="dialog" aria-label="Notifications" className="absolute right-0 top-[calc(100%+0.5rem)] w-[min(24rem,calc(100vw-2rem))] border border-line bg-white p-4 shadow-[0_14px_36px_rgba(8,35,26,0.16)]">
                <button type="button" onClick={() => { setNotificationsOpen(false); window.requestAnimationFrame(() => notificationTriggerRef.current?.focus()); }} className="absolute right-2 top-2 z-10 grid size-11 place-items-center rounded-lg hover:bg-sand-100" aria-label="Close notifications"><X className="size-4" /></button>
                <NotificationCenter initial={initialNotifications ?? { items: [], unreadCount: notificationCount }} onCountChange={setUnreadNotifications} />
              </div> : null}
            </div>

            <div ref={accountRef} className="relative">
              <button
                ref={accountTriggerRef}
                type="button"
                onClick={() => setAccountOpen((value) => !value)}
                className="flex min-h-11 items-center gap-2 rounded-lg border border-line bg-white px-2 text-left transition-colors hover:bg-sand-200 sm:pr-3"
                aria-label="Open account menu"
                aria-haspopup="menu"
                aria-expanded={accountOpen}
              >
                <span className="grid size-8 shrink-0 place-items-center rounded-md bg-forest-800 text-xs font-extrabold text-white">{initials}</span>
                <span className="hidden min-w-0 sm:block">
                  <span className="block max-w-28 truncate text-xs font-extrabold text-ink">{viewer.firstName} {viewer.lastName}</span>
                  <span className="block text-[10px] text-muted">{formatRole(viewer.role)}</span>
                </span>
                <ChevronDown className="hidden size-3.5 text-muted sm:block" aria-hidden="true" />
              </button>

              {accountOpen ? <div
                role="menu"
                aria-label="Account controls"
                className="absolute right-0 top-[calc(100%+0.5rem)] w-72 border border-line bg-white p-2 shadow-[0_14px_36px_rgba(8,35,26,0.16)]"
              >
                <div className="border-b border-line px-3 py-3">
                  <p className="truncate text-sm font-extrabold text-ink">{viewer.firstName} {viewer.lastName}</p>
                  <p className="mt-1 truncate text-xs text-muted">{viewer.email}</p>
                  <p className="mt-2 text-[11px] font-bold text-forest-800">{formatRole(viewer.role)} · {viewer.accountStatus}</p>
                </div>
                <AccountMenuLink href="/dashboard/account" icon={UserRound}>Account</AccountMenuLink>
                <AccountMenuLink href="/dashboard/security" icon={KeyRound}>Security</AccountMenuLink>
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => void logout()}
                  disabled={isLoggingOut}
                  className="flex min-h-11 w-full items-center gap-3 px-3 text-sm font-bold text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                >
                  <LogOut className="size-4" /> {isLoggingOut ? "Logging out…" : "Log out"}
                </button>
              </div> : null}
            </div>
          </div>
        </header>

        <main id="main-content" className="min-w-0 px-4 pb-24 pt-5 sm:px-6 lg:px-8 lg:pb-8 lg:pt-7">
          {children}
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-line bg-white px-2 pb-[max(env(safe-area-inset-bottom),0.35rem)] pt-1.5 lg:hidden" aria-label="Mobile workspace utilities">
        <MobileUtilityLink href="/dashboard" active={pathname === "/dashboard"} icon={Gauge}>Overview</MobileUtilityLink>
        <MobileUtilityLink href={activityDestination.href} active={isDashboardRouteActive(pathname, activityDestination.href)} icon={activityDestination.icon}>{activityDestination.label}</MobileUtilityLink>
        <button
          ref={mobileTriggerRef}
          type="button"
          onClick={() => setMobileOpen(true)}
          className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-bold ${mobileOpen ? "text-forest-800" : "text-muted"}`}
          aria-label="Open workspace navigation"
          aria-controls="mobile-workspace-navigation"
          aria-expanded={mobileOpen}
        >
          <Menu className="size-5" aria-hidden="true" />
          Menu
        </button>
      </nav>

      {mobileOpen ? <><div className="fixed inset-0 z-50 bg-forest-950/45 lg:hidden" aria-hidden="true" onMouseDown={closeMobileNavigation} />
      <aside
        ref={mobilePanelRef}
        id="mobile-workspace-navigation"
        role="dialog"
        aria-modal="true"
        aria-label="Workspace navigation menu"
        className="fixed inset-y-0 right-0 z-[60] flex w-[min(92vw,24rem)] flex-col bg-sand-50 shadow-[-12px_0_36px_rgba(8,35,26,0.2)] lg:hidden"
      >
        <div className="flex min-h-20 items-center gap-3 border-b border-line px-4">
          <span className="grid size-10 place-items-center rounded-lg bg-forest-800 text-sm font-extrabold text-white">{initials}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-ink">{viewer.firstName} {viewer.lastName}</p>
            <p className="truncate text-xs text-muted">{formatRole(viewer.role)} · {viewer.accountStatus}</p>
          </div>
          <button type="button" onClick={closeMobileNavigation} className="grid size-11 place-items-center rounded-lg hover:bg-sand-200" aria-label="Close workspace navigation">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <DashboardNavigation groups={navigation} pathname={pathname} className="flex-1 overflow-y-auto px-4 py-5" onNavigate={closeMobileNavigation} />
        <div className="border-t border-line p-4">
          <button type="button" onClick={() => void logout()} disabled={isLoggingOut} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-bold text-red-700 hover:bg-red-50 disabled:cursor-wait disabled:opacity-60">
            <LogOut className="size-4" /> {isLoggingOut ? "Logging out…" : "Log out"}
          </button>
        </div>
      </aside></> : null}
    </div>
  );
}

function DashboardNavigation({
  groups,
  pathname,
  collapsed = false,
  className,
  onNavigate,
}: {
  groups: DashboardNavigationGroup[];
  pathname: string;
  collapsed?: boolean;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <nav className={className} aria-label={onNavigate ? "All workspace destinations" : undefined}>
      {groups.map((group, groupIndex) => (
        <div key={group.label} className={groupIndex > 0 ? "mt-6" : ""}>
          {!collapsed ? <p className="px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-forest-300">{group.label}</p> : null}
          <div className={collapsed ? "space-y-1" : "mt-2 space-y-1"}>
            {group.items.map((item) => {
              const Icon = ICONS[item.icon];
              const active = isDashboardRouteActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  aria-label={collapsed ? item.label : undefined}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-bold transition-colors ${
                    active
                      ? collapsed || !onNavigate
                        ? "bg-lime text-forest-950"
                        : "bg-forest-100 text-forest-950"
                      : collapsed || !onNavigate
                        ? "text-forest-100 hover:bg-white/10 hover:text-white"
                        : "text-muted hover:bg-sand-200 hover:text-forest-900"
                  } ${collapsed ? "justify-center" : ""}`}
                >
                  <Icon className="size-4 shrink-0" aria-hidden="true" />
                  {!collapsed ? <span>{item.label}</span> : (
                    <span role="tooltip" className="pointer-events-none absolute left-[calc(100%+0.65rem)] z-50 whitespace-nowrap bg-forest-950 px-2.5 py-1.5 text-xs font-bold text-white opacity-0 shadow-[0_8px_24px_rgba(8,35,26,0.2)] transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none">
                      {item.label}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function MobileUtilityLink({ href, active, icon: Icon, children }: { href: string; active: boolean; icon: LucideIcon; children: ReactNode }) {
  return (
    <Link href={href} aria-current={active ? "page" : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-[10px] font-bold ${active ? "text-forest-800" : "text-muted"}`}>
      <Icon className="size-5" aria-hidden="true" />
      {children}
    </Link>
  );
}

function AccountMenuLink({ href, icon: Icon, children }: { href: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <Link role="menuitem" href={href} className="flex min-h-11 items-center gap-3 px-3 text-sm font-bold text-ink hover:bg-sand-100">
      <Icon className="size-4 text-forest-800" aria-hidden="true" /> {children}
    </Link>
  );
}

function formatRole(role: AppRole) {
  return role === "PropertyManager" ? "Property Manager" : role.replace(/([a-z])([A-Z])/g, "$1 $2");
}
