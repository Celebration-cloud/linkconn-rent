import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ profile: vi.fn(), property: vi.fn(), payment: vi.fn(), audit: vi.fn(), audits: vi.fn() }));
vi.mock("@/lib/db/client", () => ({ prisma: { profile: { findUnique: mocks.profile }, property: { findUnique: mocks.property }, payment: { findUnique: mocks.payment }, adminAuditEvent: { findUnique: mocks.audit, findMany: mocks.audits } } }));
vi.mock("next/navigation", () => ({ usePathname: () => "/admin/users", useSearchParams: () => new URLSearchParams(), useRouter: () => ({ refresh: vi.fn() }) }));

import { AdministrationRepository } from "@/repositories/administration.repository";
import { UsersWorkspace } from "@/features/admin/components/admin-workspaces";
import { buildAdminItemHref } from "@/features/admin/admin-item-link";

describe("Task 6b permission-safe Admin detail repositories", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads a redacted linked user dossier without NIN, payout, or private evidence", async () => {
    mocks.profile.mockResolvedValue({ id: "user-1", firstName: "Teni", lastName: "Tenant", email: "teni@example.com", role: "Tenant", accountStatus: "Active", onboardingComplete: true, verificationLevel: "FullyVerified", emailVerified: true, createdAt: new Date(), updatedAt: new Date(), tenantProfile: { employmentType: "Employed", employerName: "Example", jobTitle: "Engineer", incomeRange: "Above500k", preferredLocations: ["Yaba"], preferredTypes: ["Flat"], budgetMin: 100, budgetMax: 200, moveInDate: null, ninStatus: "Verified" }, landlordProfile: null, verificationSubmissions: [], properties: [], applications: [], tenantLeases: [], landlordLeases: [], payments: [], maintenance: [], supportTickets: [] });
    mocks.audits.mockResolvedValue([]);
    const detail = await AdministrationRepository.getUserDetail("user-1", "Admin");
    expect(detail?.email).toBe("teni@example.com");
    expect(JSON.stringify(detail)).not.toMatch(/ninNumber|accountNumber|storageKey|documents/);
    expect(mocks.profile).toHaveBeenCalledWith(expect.objectContaining({ select: expect.objectContaining({ tenantProfile: { select: expect.not.objectContaining({ ninNumber: expect.anything() }) } }) }));
  });

  it("rejects non-reviewer access before reading linked details", async () => {
    await expect(AdministrationRepository.getPropertyDetail("property-1", "Tenant")).rejects.toThrow("FORBIDDEN");
    expect(mocks.property).not.toHaveBeenCalled();
  });

  it("rejects non-reviewer list access before a Prisma read", async () => {
    await expect(AdministrationRepository.listUsers({ page: 1, pageSize: 20, sort: "newest" }, "Tenant")).rejects.toThrow("FORBIDDEN");
    expect(mocks.profile).not.toHaveBeenCalled();
  });

  it("returns provider-controlled payment linkage without mutation controls", async () => {
    mocks.payment.mockResolvedValue({ id: "payment-1", amount: 2000, status: "Paid", reference: "PAY-1", accessCode: "private", initializedAt: new Date(), failureReason: null, dueDate: new Date(), paidAt: new Date(), createdAt: new Date(), updatedAt: new Date(), tenant: { id: "tenant-1", firstName: "Teni", lastName: "Tenant", email: "teni@example.com" }, property: { id: "property-1", title: "Yaba Court", location: "Yaba" }, leaseScheduleItem: null, disputes: [] });
    const detail = await AdministrationRepository.getPaymentDetail("payment-1", "Admin");
    expect(detail?.status).toBe("Paid");
    expect(JSON.stringify(detail)).not.toContain("accessCode");
  });
});

describe("Task 6b addressable Admin workspace", () => {
  it("preserves active filters, sort, and page when selecting a row", () => {
    expect(buildAdminItemHref("/admin/users", new URLSearchParams("query=teni&role=Tenant&sort=oldest&page=3"), "user-1")).toBe("/admin/users?query=teni&role=Tenant&sort=oldest&page=3&item=user-1");
  });
  it("links list rows to item and renders linked detail summaries", () => {
    const item = { id: "user-1", firstName: "Teni", lastName: "Tenant", email: "teni@example.com", role: "Tenant", accountStatus: "Active", verificationLevel: "FullyVerified", emailVerified: true, onboardingComplete: true, createdAt: new Date(), _count: { properties: 1, applications: 2, payments: 3 } };
    const detail = { ...item, updatedAt: new Date(), tenantProfile: null, landlordProfile: null, verificationSubmissions: [], properties: [], applications: [], tenantLeases: [], landlordLeases: [], payments: [], maintenance: [], supportTickets: [], auditEvents: [] };
    const html = renderToStaticMarkup(<UsersWorkspace data={{ items: [item], pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 } }} detail={detail} currentUserId="admin-1" canSanction={false} />);
    expect(html).toContain("/admin/users?item=user-1");
    expect(html).toContain("Linked records");
    expect(html).toContain("Verification history");
    expect(html).not.toMatch(/NIN|payout account|private evidence/i);
  });
});
