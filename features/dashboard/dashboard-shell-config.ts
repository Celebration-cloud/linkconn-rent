import type { AppRole } from "@prisma/client";

export type DashboardIconName =
  | "account"
  | "applicants"
  | "applications"
  | "calendar"
  | "leases"
  | "maintenance"
  | "messages"
  | "overview"
  | "payments"
  | "properties"
  | "saved"
  | "security"
  | "verification"
  | "viewings";

export type DashboardNavigationItem = {
  label: string;
  href: string;
  icon: DashboardIconName;
  roles: readonly AppRole[];
};

export type DashboardNavigationGroup = {
  label: string;
  items: DashboardNavigationItem[];
};

export type DashboardBreadcrumb = { label: string; href?: string };

export type DashboardRouteMeta = {
  title: string;
  breadcrumbs: DashboardBreadcrumb[];
};

export type DashboardSearchParams = Record<
  string,
  string | string[] | undefined
>;

const WORKSPACE_ROLES = ["Tenant", "Landlord", "PropertyManager"] as const;
const OWNER_ROLES = ["Landlord", "PropertyManager"] as const;
const TENANT_ROLES = ["Tenant"] as const;

const NAVIGATION: readonly DashboardNavigationGroup[] = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", href: "/dashboard", icon: "overview", roles: WORKSPACE_ROLES },
      { label: "Applications", href: "/dashboard/applications", icon: "applications", roles: TENANT_ROLES },
      { label: "Saved homes", href: "/dashboard/saved", icon: "saved", roles: TENANT_ROLES },
      { label: "Viewings", href: "/dashboard/viewings", icon: "viewings", roles: TENANT_ROLES },
      { label: "Properties", href: "/dashboard/properties", icon: "properties", roles: OWNER_ROLES },
      { label: "Applicants", href: "/dashboard/applicants", icon: "applicants", roles: OWNER_ROLES },
      { label: "Calendar", href: "/dashboard/calendar", icon: "calendar", roles: OWNER_ROLES },
      { label: "Leases", href: "/dashboard/leases", icon: "leases", roles: WORKSPACE_ROLES },
      { label: "Payments", href: "/dashboard/payments", icon: "payments", roles: WORKSPACE_ROLES },
      { label: "Maintenance", href: "/dashboard/maintenance", icon: "maintenance", roles: WORKSPACE_ROLES },
      { label: "Messages", href: "/messages", icon: "messages", roles: WORKSPACE_ROLES },
      { label: "Verification", href: "/verification", icon: "verification", roles: WORKSPACE_ROLES },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Account", href: "/dashboard/account", icon: "account", roles: WORKSPACE_ROLES },
      { label: "Security", href: "/dashboard/security", icon: "security", roles: WORKSPACE_ROLES },
    ],
  },
];

const ROUTE_META: Record<string, Omit<DashboardRouteMeta, "breadcrumbs">> = {
  "/dashboard": { title: "Overview" },
  "/dashboard/applications": { title: "Applications" },
  "/dashboard/saved": { title: "Saved homes" },
  "/dashboard/viewings": { title: "Viewings" },
  "/dashboard/properties": { title: "Properties" },
  "/dashboard/applicants": { title: "Applicants" },
  "/dashboard/calendar": { title: "Calendar" },
  "/dashboard/leases": { title: "Leases" },
  "/dashboard/payments": { title: "Payments" },
  "/dashboard/maintenance": { title: "Maintenance" },
  "/messages": { title: "Messages" },
  "/verification": { title: "Verification" },
  "/dashboard/account": { title: "Account" },
  "/dashboard/security": { title: "Security" },
};

const LEGACY_TAB_DESTINATIONS: Record<string, string> = {
  account: "/dashboard/account",
  applicants: "/dashboard/applicants",
  applications: "/dashboard/applications",
  calendar: "/dashboard/calendar",
  leases: "/dashboard/leases",
  maintenance: "/dashboard/maintenance",
  messages: "/messages",
  payments: "/dashboard/payments",
  profile: "/dashboard/account",
  properties: "/dashboard/properties",
  saved: "/dashboard/saved",
  security: "/dashboard/security",
  verification: "/verification",
  viewings: "/dashboard/viewings",
};

export function getWorkspaceNavigation(role: AppRole): DashboardNavigationGroup[] {
  return NAVIGATION.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(role)),
  })).filter((group) => group.items.length > 0);
}

export function isDashboardRouteActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getDashboardRoleRedirect(
  role: AppRole,
  pathname: string,
): "/dashboard" | null {
  const matchedItem = NAVIGATION.flatMap((group) => group.items)
    .filter((item) => isDashboardRouteActive(pathname, item.href))
    .sort((left, right) => right.href.length - left.href.length)[0];

  if (!matchedItem || matchedItem.roles.includes(role)) return null;
  return "/dashboard";
}

export function getDashboardRouteMeta(pathname: string): DashboardRouteMeta {
  const matchedPath = Object.keys(ROUTE_META)
    .filter((path) => isDashboardRouteActive(pathname, path))
    .sort((left, right) => right.length - left.length)[0];
  const title = (matchedPath && ROUTE_META[matchedPath]?.title) || "Workspace";

  return {
    title,
    breadcrumbs:
      matchedPath === "/dashboard"
        ? [{ label: "Overview" }]
        : [{ label: "Overview", href: "/dashboard" }, { label: title }],
  };
}

export function getLegacyDashboardRedirect(
  searchParams: DashboardSearchParams,
): string | null {
  if (!("tab" in searchParams)) return null;

  const rawTab = searchParams.tab;
  const tab = (Array.isArray(rawTab) ? rawTab[0] : rawTab)?.trim().toLowerCase();
  const destination =
    (tab && LEGACY_TAB_DESTINATIONS[tab]) || "/dashboard";
  const nextParams = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (key === "tab" || !/^[a-zA-Z0-9._~-]+$/.test(key)) continue;
    const values = Array.isArray(value) ? value : [value];
    for (const item of values) {
      if (typeof item === "string") nextParams.append(key, item);
    }
  }

  const query = nextParams.toString();
  return query ? `${destination}?${query}` : destination;
}
