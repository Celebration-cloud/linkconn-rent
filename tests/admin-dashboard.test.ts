import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAccountDestination, isAdminWorkspaceRole } from "@/lib/auth/account-destination";
import { queueFiltersSchema } from "@/schemas/administration";

const mocks = vi.hoisted(() => ({
  getCurrentProfile: vi.fn(), hasRole: vi.fn(),
  listUsers: vi.fn(), listProperties: vi.fn(), listPayments: vi.fn(), listAuditEvents: vi.fn(),
  listSupportTickets: vi.fn(), listMaintenanceRequests: vi.fn(),
}));

vi.mock("@/lib/auth/current-profile", () => ({
  getCurrentProfile: mocks.getCurrentProfile,
  hasRole: mocks.hasRole,
  isAccountOperational: (profile: { accountStatus: string }) => profile.accountStatus !== "Suspended",
}));
vi.mock("@/repositories/administration.repository", () => ({ AdministrationRepository: {
  listUsers: mocks.listUsers, listProperties: mocks.listProperties,
  listPayments: mocks.listPayments, listAuditEvents: mocks.listAuditEvents,
  listSupportTickets: mocks.listSupportTickets, listMaintenanceRequests: mocks.listMaintenanceRequests,
} }));

import { GET as getUsers } from "@/app/api/admin/users/route";
import { GET as getProperties } from "@/app/api/admin/properties/route";
import { GET as getPayments } from "@/app/api/admin/payments/route";
import { GET as getAudit } from "@/app/api/admin/audit/route";
import { GET as getSupport } from "@/app/api/admin/support/route";
import { GET as getMaintenance } from "@/app/api/admin/maintenance/route";

const admin = { id: "admin-1", email: "admin@example.com", firstName: "Ada", lastName: "Admin", role: "Admin", accountStatus: "Active", onboardingComplete: true };
const emptyPage = { items: [], pagination: { page: 1, pageSize: 20, totalItems: 0, totalPages: 1 } };

describe("administrator dashboard contracts", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.getCurrentProfile.mockResolvedValue(admin); mocks.hasRole.mockReturnValue(true); for (const read of [mocks.listUsers, mocks.listProperties, mocks.listPayments, mocks.listAuditEvents, mocks.listSupportTickets, mocks.listMaintenanceRequests]) read.mockResolvedValue(emptyPage); });

  it.each(["Moderator", "Admin", "SuperAdmin"])("routes %s to the admin workspace", (role) => { expect(isAdminWorkspaceRole(role)).toBe(true); expect(getAccountDestination(role, "overview")).toBe("/admin"); expect(getAccountDestination(role, "security")).toBe("/admin/account"); });
  it.each(["Tenant", "Landlord", "PropertyManager"])("keeps %s in the ordinary dashboard", (role) => { expect(getAccountDestination(role, "payments")).toBe("/dashboard?tab=payments"); });

  it("normalizes typed filters and pagination", () => { expect(queueFiltersSchema.parse({ role: "Admin", page: "2", pageSize: "25" })).toMatchObject({ role: "Admin", page: 2, pageSize: 25 }); expect(queueFiltersSchema.safeParse({ role: "Owner" }).success).toBe(false); expect(queueFiltersSchema.safeParse({ pageSize: "500" }).success).toBe(false); });

  it.each([
    ["users", getUsers, mocks.listUsers], ["properties", getProperties, mocks.listProperties],
    ["payments", getPayments, mocks.listPayments], ["audit", getAudit, mocks.listAuditEvents],
    ["support", getSupport, mocks.listSupportTickets], ["maintenance", getMaintenance, mocks.listMaintenanceRequests],
  ] as const)("returns paginated %s records from the protected repository", async (_label, handler, repository) => { const response = await handler(new Request("http://localhost/api/admin/resource?page=1")); expect(response.status).toBe(200); expect((await response.json()).data).toEqual(emptyPage); expect(repository).toHaveBeenCalledOnce(); });

  it.each([getUsers, getProperties, getPayments, getAudit, getSupport, getMaintenance])("rejects guests", async (handler) => { mocks.getCurrentProfile.mockResolvedValue(null); expect((await handler(new Request("http://localhost/api/admin/resource"))).status).toBe(401); });
  it.each([getUsers, getProperties, getPayments, getAudit, getSupport, getMaintenance])("rejects suspended administrators", async (handler) => { mocks.getCurrentProfile.mockResolvedValue({ ...admin, accountStatus: "Suspended" }); expect((await handler(new Request("http://localhost/api/admin/resource"))).status).toBe(403); });
});
