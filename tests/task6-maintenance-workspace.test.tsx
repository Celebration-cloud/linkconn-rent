import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { vi } from "vitest";
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }) }));
import { MaintenanceCenter } from "@/components/stitch/maintenance-center";

const request = { id: "request-1", leaseId: "lease-1", eligibilitySource: "Active lease", title: "Leaking kitchen tap", description: "Water is collecting below the sink.", status: "Pending", priority: "High", createdAt: "2026-08-13", updatedAt: "2026-08-13", closedAt: null, property: { id: "property-1", title: "Yaba Court", location: "Yaba", owner: { id: "landlord-1", firstName: "Ada", lastName: "Owner" } }, requester: { id: "tenant-1", firstName: "Teni", lastName: "Tenant", email: "teni@example.com" }, lease: { id: "lease-1", status: "Active" }, activities: [] };

describe("Task 6 maintenance workspace", () => {
  it("renders a real tenant creation form and addressable request link", () => {
    const html = renderToStaticMarkup(React.createElement(MaintenanceCenter as React.ComponentType<Record<string, unknown>>, { items: [request], eligibleProperties: [{ id: "property-1", title: "Yaba Court" }], viewer: { id: "tenant-1", role: "Tenant" }, selected: null }));
    expect(html).toContain("Create maintenance request");
    expect(html).toContain('name="propertyId"');
    expect(html).toContain('/dashboard/maintenance/request-1');
    expect(html).toContain("Active lease");
  });

  it("shows a selected request's immutable history instead of a nested dialog", () => {
    const selected = { ...request, activities: [{ id: "activity-1", fromStatus: null, toStatus: "Pending", note: "Request created", createdAt: "2026-08-13", actor: { id: "tenant-1", firstName: "Teni", lastName: "Tenant" } }] };
    const html = renderToStaticMarkup(React.createElement(MaintenanceCenter as React.ComponentType<Record<string, unknown>>, { items: [request], eligibleProperties: [], viewer: { id: "landlord-1", role: "Landlord" }, selected }));
    expect(html).toContain("Request history");
    expect(html).toContain("Request created");
    expect(html).toContain("Update request");
  });
});
