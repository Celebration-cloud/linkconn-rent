import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard/properties/property-1",
}));
vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ logout: vi.fn(), isLoggingOut: false }),
}));
vi.mock("@/components/shared/icons", () => ({
  Logo: ({ variant }: { variant: string }) => (
    <span data-logo={variant}>LinkConn Rent</span>
  ),
}));

import { DashboardShell } from "@/features/dashboard/dashboard-shell";
import { DashboardAccountSummary } from "@/features/dashboard/dashboard-account-summary";
import { DashboardSecurityForm } from "@/features/dashboard/dashboard-security-form";
import {
  getDashboardRouteMeta,
  getDashboardRoleRedirect,
  getLegacyDashboardRedirect,
  getWorkspaceNavigation,
  isDashboardRouteActive,
} from "@/features/dashboard/dashboard-shell-config";

describe("dashboard shell route contract", () => {
  it("shows tenant destinations without landlord queues", () => {
    const hrefs = getWorkspaceNavigation("Tenant")
      .flatMap((group) => group.items)
      .map((item) => item.href);

    expect(hrefs).toEqual([
      "/dashboard",
      "/dashboard/applications",
      "/dashboard/saved",
      "/dashboard/viewings",
      "/dashboard/leases",
      "/dashboard/payments",
      "/dashboard/maintenance",
      "/messages",
      "/verification",
      "/dashboard/account",
      "/dashboard/security",
    ]);
    expect(hrefs).not.toContain("/dashboard/properties");
    expect(hrefs).not.toContain("/dashboard/applicants");
  });

  it.each(["Landlord", "PropertyManager"] as const)(
    "shows %s property operations without tenant-only destinations",
    (role) => {
      const hrefs = getWorkspaceNavigation(role)
        .flatMap((group) => group.items)
        .map((item) => item.href);

      expect(hrefs).toContain("/dashboard/properties");
      expect(hrefs).toContain("/dashboard/applicants");
      expect(hrefs).toContain("/dashboard/calendar");
      expect(hrefs).not.toContain("/dashboard/saved");
      expect(hrefs).not.toContain("/dashboard/applications");
      expect(hrefs).not.toContain("/dashboard/viewings");
    },
  );

  it("matches exact routes without treating every dashboard path as overview", () => {
    expect(isDashboardRouteActive("/dashboard", "/dashboard")).toBe(true);
    expect(
      isDashboardRouteActive("/dashboard/properties/property-1", "/dashboard/properties"),
    ).toBe(true);
    expect(
      isDashboardRouteActive("/dashboard/applications", "/dashboard"),
    ).toBe(false);
  });

  it("server-authorizes tenant and owner routes from the centralized route map", () => {
    expect(getDashboardRoleRedirect("Tenant", "/dashboard/saved")).toBeNull();
    expect(getDashboardRoleRedirect("Landlord", "/dashboard/saved")).toBe(
      "/dashboard",
    );
    expect(
      getDashboardRoleRedirect("Tenant", "/dashboard/properties/new/fees"),
    ).toBe("/dashboard");
    expect(
      getDashboardRoleRedirect("PropertyManager", "/dashboard/properties/new"),
    ).toBeNull();
    expect(getDashboardRoleRedirect("Tenant", "/dashboard/payments")).toBeNull();
    expect(getDashboardRoleRedirect("Landlord", "/messages")).toBeNull();
  });

  it("derives the desktop title and breadcrumb from the canonical URL", () => {
    expect(getDashboardRouteMeta("/dashboard/properties/property-1")).toEqual({
      title: "Properties",
      breadcrumbs: [
        { label: "Overview", href: "/dashboard" },
        { label: "Properties" },
      ],
    });
  });

  it("redirects legacy tabs while preserving unrelated scalar queries", () => {
    expect(
      getLegacyDashboardRedirect({ tab: "saved", source: "email" }),
    ).toBe("/dashboard/saved?source=email");
    expect(
      getLegacyDashboardRedirect({ tab: "messages", conversation: "abc" }),
    ).toBe("/messages?conversation=abc");
  });

  it("removes invalid or overview tabs without creating a redirect loop", () => {
    expect(getLegacyDashboardRedirect({ tab: "overview" })).toBe("/dashboard");
    expect(getLegacyDashboardRedirect({ tab: "unknown", page: "2" })).toBe(
      "/dashboard?page=2",
    );
    expect(getLegacyDashboardRedirect({ page: "2" })).toBeNull();
  });
});

describe("responsive dashboard shell", () => {
  it("renders canonical landlord navigation and closed accessible menu states", () => {
    const html = renderToStaticMarkup(
      <DashboardShell
        viewer={{
          firstName: "Amaka",
          lastName: "Okafor",
          email: "amaka@example.com",
          role: "Landlord",
          accountStatus: "Active",
        }}
        notificationCount={0}
      >
        <p>Workspace content</p>
      </DashboardShell>,
    );

    expect(html).toContain("Amaka Okafor");
    expect(html).not.toContain("amaka@example.com");
    expect(html).toContain("Properties");
    expect(html).toContain("Open workspace navigation");
    expect(html).toContain('aria-expanded="false"');
    expect(html).not.toContain('role="dialog"');
    expect(html).not.toContain('role="menu"');
    expect(html).toContain("Collapse workspace navigation");
    expect(html).toContain("Notifications");
    expect(html).not.toContain("No notifications");
    expect(html).not.toContain("notification-count");
  });

  it("renders an honest notification badge only for a positive supplied count", () => {
    const html = renderToStaticMarkup(
      <DashboardShell
        viewer={{
          firstName: "Tunde",
          lastName: "Adebayo",
          email: "tunde@example.com",
          role: "Tenant",
          accountStatus: "Active",
        }}
        notificationCount={4}
      >
        <p>Workspace content</p>
      </DashboardShell>,
    );

    expect(html).toContain('data-testid="notification-count"');
    expect(html).toContain(">4<");
    expect(html).toContain("Notifications, 4 unread");
  });
});

describe("canonical account and security surfaces", () => {
  it("renders authenticated account facts without an editable fake profile form", () => {
    const html = renderToStaticMarkup(
      <DashboardAccountSummary
        profile={{
          firstName: "Amaka",
          lastName: "Okafor",
          email: "amaka@example.com",
          role: "Landlord",
          accountStatus: "Active",
          onboardingComplete: true,
        }}
      />,
    );

    expect(html).toContain("Amaka Okafor");
    expect(html).toContain("Landlord");
    expect(html).toContain("Active");
    expect(html).not.toContain("Save changes");
  });

  it("keeps the real password mutation and omits simulated device and 2FA controls", () => {
    const html = renderToStaticMarkup(<DashboardSecurityForm />);

    expect(html).toContain("Current password");
    expect(html).toContain("New password");
    expect(html).toContain("Confirm new password");
    expect(html).not.toContain("MacBook Pro");
    expect(html).not.toContain("Two-Factor Authentication");
  });
});
