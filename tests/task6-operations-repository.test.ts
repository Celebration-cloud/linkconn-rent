import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    lease: { findFirst: vi.fn() },
    maintenanceRequest: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    maintenanceActivity: { create: vi.fn() },
    supportTicket: { create: vi.fn(), findFirst: vi.fn(), update: vi.fn() },
    supportTicketActivity: { create: vi.fn() },
    notification: { create: vi.fn() },
  };
  return {
    tx,
    transaction: vi.fn(),
    leaseFindFirst: vi.fn(),
    maintenanceFindMany: vi.fn(),
    supportFindMany: vi.fn(),
    supportFindFirst: vi.fn(),
  };
});

vi.mock("@/lib/db/client", () => ({ prisma: {
  $transaction: mocks.transaction,
  lease: { findFirst: mocks.leaseFindFirst },
  maintenanceRequest: { findMany: mocks.maintenanceFindMany },
  supportTicket: { findMany: mocks.supportFindMany, findFirst: mocks.supportFindFirst },
} }));

import { TenantOperationsRepository } from "@/repositories/tenant-operations.repository";
import { SupportRepository } from "@/repositories/support.repository";

const tenant = { id: "tenant-1", role: "Tenant" as const };
const createRequest = { propertyId: "11111111-1111-4111-8111-111111111111", title: "Leaking kitchen tap", description: "Water is collecting below the kitchen sink.", priority: "High" as const };

describe("Task 6 maintenance persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transaction.mockImplementation((callback: (client: typeof mocks.tx) => unknown) => callback(mocks.tx));
    mocks.tx.lease.findFirst.mockImplementation((...args) => mocks.leaseFindFirst(...args));
    mocks.tx.maintenanceRequest.create.mockResolvedValue({ id: "request-1", requesterId: tenant.id, propertyId: createRequest.propertyId, leaseId: "lease-1", status: "Pending" });
  });

  it("binds every new tenant request to the matching active lease", async () => {
    mocks.leaseFindFirst.mockResolvedValue({ id: "lease-1", landlordId: "landlord-1" });
    await TenantOperationsRepository.createMaintenance(tenant.id, createRequest);
    expect(mocks.transaction).toHaveBeenCalledWith(expect.any(Function), { isolationLevel: "Serializable" });
    expect(mocks.tx.maintenanceRequest.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ requesterId: tenant.id, propertyId: createRequest.propertyId, leaseId: "lease-1" }) }));
  });

  it("does not treat an accepted application as eligibility for a new request", async () => {
    mocks.leaseFindFirst.mockResolvedValue(null);
    await expect(TenantOperationsRepository.createMaintenance(tenant.id, createRequest)).rejects.toThrow("ACTIVE_LEASE_REQUIRED");
    expect(mocks.tx.maintenanceRequest.create).not.toHaveBeenCalled();
  });

  it("keeps legacy records readable and labels their eligibility source", async () => {
    mocks.maintenanceFindMany.mockResolvedValue([
      { id: "active-request", leaseId: "lease-1", title: "Tap", description: null, priority: "Low", status: "Pending", createdAt: new Date(), updatedAt: new Date(), closedAt: null, property: { id: "property-1", title: "Yaba Court", location: "Yaba", owner: { id: "landlord-1", firstName: "Ada", lastName: "Owner" } }, requester: { id: "tenant-1", firstName: "Teni", lastName: "Tenant", email: "teni@example.com" }, lease: { id: "lease-1", status: "Active" }, activities: [] },
      { id: "legacy-request", leaseId: null, title: "Door", description: null, priority: "Medium", status: "Closed", createdAt: new Date(), updatedAt: new Date(), closedAt: new Date(), property: { id: "property-1", title: "Yaba Court", location: "Yaba", owner: { id: "landlord-1", firstName: "Ada", lastName: "Owner" }, applications: [{ tenantId: "tenant-1" }] }, requester: { id: "tenant-1", firstName: "Teni", lastName: "Tenant", email: "teni@example.com" }, lease: null, activities: [] },
    ]);
    const rows = await TenantOperationsRepository.listMaintenance(tenant);
    expect(rows.map((row) => row.eligibilitySource)).toEqual(["Active lease", "Legacy accepted-application record"]);
  });
});

describe("Task 6 authenticated support persistence", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transaction.mockImplementation((callback: (client: typeof mocks.tx) => unknown) => callback(mocks.tx));
    mocks.tx.supportTicket.create.mockResolvedValue({ id: "ticket-1", reference: "LCR-260813-ABC123", status: "Open", createdAt: new Date() });
  });

  it("uses authoritative profile identity and records the initial activity", async () => {
    await SupportRepository.create({ id: "tenant-1", firstName: "Teni", lastName: "Tenant", email: "owner@example.com" }, { name: "Imposter", email: "other@example.com", category: "Maintenance", subject: "Repair follow-up", message: "I need an update about the repair request." });
    expect(mocks.tx.supportTicket.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ profileId: "tenant-1", name: "Teni Tenant", email: "owner@example.com" }) }));
    expect(mocks.tx.supportTicketActivity.create).toHaveBeenCalledWith({ data: expect.objectContaining({ ticketId: "ticket-1", actorId: "tenant-1", toStatus: "Open" }) });
  });

  it("returns no detail for a ticket owned by another profile", async () => {
    mocks.supportFindFirst.mockResolvedValue(null);
    await expect(SupportRepository.detailForProfile("tenant-1", "ticket-2")).resolves.toBeNull();
    expect(mocks.supportFindFirst).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "ticket-2", profileId: "tenant-1" } }));
  });
});
