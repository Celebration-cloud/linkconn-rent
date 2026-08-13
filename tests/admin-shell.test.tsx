import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ usePathname: () => "/admin/properties" }));
vi.mock("@/providers/auth-provider", () => ({ useAuth: () => ({ logout: vi.fn(), isLoggingOut: false }) }));
vi.mock("@/components/shared/icons", () => ({ Logo: ({ variant }: { variant: string }) => <span data-logo={variant}>LinkConn Rent</span> }));

import { AdminShell } from "@/components/stitch/admin-shell";

describe("responsive administrator shell", () => {
  it("renders the administrator identity and every operational destination", () => {
    const html = renderToStaticMarkup(
      <AdminShell counts={{ verifications: 2, disputes: 1, moderation: 4, support: 3, maintenance: 5 }} viewer={{ id: "admin-1", firstName: "Ada", lastName: "Nwosu", email: "ada@linkconn.rent", role: "SuperAdmin", accountStatus: "Active" }}>
        <p>Admin content</p>
      </AdminShell>,
    );

    expect(html).toContain("Ada Nwosu");
    expect(html).toContain("ada@linkconn.rent");
    expect(html).toContain("/admin/users");
    expect(html).toContain("/admin/properties");
    expect(html).toContain("/admin/payments");
    expect(html).toContain("/admin/audit");
    expect(html).toContain("/admin/support");
    expect(html).toContain("/admin/maintenance");
    expect(html).toContain("/admin/account");
    expect(html).toContain("Open administrator navigation");
    expect(html).toContain("Collapse administrator navigation");
    expect(html).toContain("overflow-y-auto");
    expect(html).not.toContain("/dashboard/properties");
  });

  it("does not expose invitation management to an ordinary Admin", () => {
    const html = renderToStaticMarkup(
      <AdminShell viewer={{ id: "admin-2", firstName: "Ife", lastName: "Okoro", email: "ife@linkconn.rent", role: "Admin", accountStatus: "Active" }}>
        <p>Admin content</p>
      </AdminShell>,
    );
    expect(html).not.toContain("/admin/invitations");
  });
});
