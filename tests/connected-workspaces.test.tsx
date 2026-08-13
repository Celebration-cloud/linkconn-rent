import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import { ApplicationWorkspace } from "@/features/applications/components/application-workspace";
import { ViewingWorkspace } from "@/features/viewings/components/viewing-workspace";
import { NotificationCenter } from "@/features/notifications/components/notification-center";

describe("connected rental workspaces", () => {
  it("renders an addressable application record with timeline and legal action", () => {
    const html = renderToStaticMarkup(<ApplicationWorkspace role="Tenant" items={[{
      id: "application-1", status: "Pending", property: { id: "property-1", title: "Yaba Court", location: "Yaba, Lagos" }, participant: { name: "Ada Landlord", verificationLevel: "FullyVerified" }, createdAt: "2026-08-13T09:00:00.000Z", updatedAt: "2026-08-13T09:00:00.000Z",
    }]} detail={{
      id: "application-1", status: "Pending", message: "I would like a long tenancy.", property: { id: "property-1", title: "Yaba Court", location: "Yaba, Lagos", city: "Lagos", price: 2500000, period: "year" }, tenant: { id: "tenant-1", name: "Teni Tenant", verificationLevel: "FullyVerified" }, landlord: { id: "landlord-1", name: "Ada Landlord", verificationLevel: "Trusted" }, conversation: null, leaseId: null, createdAt: "2026-08-13T09:00:00.000Z", updatedAt: "2026-08-13T09:00:00.000Z", actions: ["withdraw"], timeline: [{ id: "activity-1", fromStatus: null, toStatus: "Pending", note: null, actorName: "Teni Tenant", createdAt: "2026-08-13T09:00:00.000Z" }],
    }} />);
    expect(html).toContain("Yaba Court");
    expect(html).toContain("Application history");
    expect(html).toContain("Withdraw application");
    expect(html).toContain('/dashboard/applications/application-1');
  });

  it("renders honest empty viewing state", () => {
    const html = renderToStaticMarkup(<ViewingWorkspace role="Tenant" items={[]} detail={null} />);
    expect(html).toContain("No viewings scheduled");
    expect(html).not.toContain("Viewing 1");
  });

  it("renders notification deep links and unread actions", () => {
    const html = renderToStaticMarkup(<NotificationCenter initial={{ unreadCount: 1, items: [{ id: "notification-1", kind: "Application", title: "Application shortlisted", body: "The owner shortlisted your application.", href: "/dashboard/applications/application-1", readAt: null, createdAt: "2026-08-13T09:00:00.000Z" }] }} onCountChange={() => undefined} />);
    expect(html).toContain("Application shortlisted");
    expect(html).toContain('/dashboard/applications/application-1');
    expect(html).toContain("Mark all read");
  });
});
