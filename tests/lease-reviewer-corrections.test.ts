import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    lease: { findFirst: vi.fn(), updateMany: vi.fn() },
    leaseVersion: { create: vi.fn(), findFirst: vi.fn(), updateMany: vi.fn() },
    leaseAcceptance: { create: vi.fn() },
    leasePaymentScheduleItem: { create: vi.fn() },
    payment: { create: vi.fn() },
    leaseActivity: { create: vi.fn() },
    notification: { createMany: vi.fn(), create: vi.fn() },
  };
  return { tx, transaction: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() };
});
vi.mock("@/lib/db/client", () => ({ prisma: { $transaction: mocks.transaction, lease: { findMany: mocks.findMany, findFirst: mocks.findFirst } } }));
import { LeaseRepository } from "@/repositories/lease.repository";
import type { LeaseEditableTerms } from "@/features/leases/contracts";

const editable: LeaseEditableTerms = { startDate: "2026-09-01", endDate: "2027-08-31", rentMinor: 240000000, currency: "NGN", billingPeriod: "year", fees: [], schedule: [{ sequence: 1, label: "First rent", amountMinor: 240000000, dueDate: "2026-09-01" }], noticeDays: 30, renewalTerms: "Written renewal", utilities: [], rules: [], specialTerms: "" };
const current = { id: "lease-1", tenantId: "tenant-1", landlordId: "landlord-1", propertyId: "property-1", status: "Draft", currentVersionNumber: 0, tenant: { id: "tenant-1", firstName: "Teni", lastName: "Tenant" }, landlord: { id: "landlord-1", firstName: "Ada", lastName: "Landlord" }, property: { id: "property-1", title: "Yaba Court", location: "Yaba" } };

describe("lease reviewer corrections", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.transaction.mockImplementation(async (callback: (client: typeof mocks.tx) => Promise<unknown>, options?: unknown) => { expect(options).toEqual({ isolationLevel: "Serializable" }); return callback(mocks.tx); }); mocks.tx.lease.findFirst.mockResolvedValue(current); mocks.tx.lease.updateMany.mockResolvedValue({ count: 1 }); mocks.tx.leaseVersion.create.mockResolvedValue({ id: "version-1", version: 1, contentHash: "hash", createdAt: new Date() }); mocks.tx.payment.create.mockResolvedValue({ id: "payment-1" }); mocks.tx.leasePaymentScheduleItem.create.mockResolvedValue({ id: "item-1" }); });

  it("builds identities from the authorized lease and creates freshly linked schedule payments", async () => {
    await LeaseRepository.revise({ id: "landlord-1", role: "Landlord" }, "lease-1", { expectedVersion: 0, expectedStatus: "Draft", terms: editable });
    expect(mocks.tx.leaseVersion.create).toHaveBeenCalledWith({ data: expect.objectContaining({ terms: expect.objectContaining({ participants: { tenant: { id: "tenant-1", name: "Teni Tenant" }, landlord: { id: "landlord-1", name: "Ada Landlord" } }, property: { id: "property-1", title: "Yaba Court", location: "Yaba" } }) }) });
    expect(mocks.tx.payment.create).toHaveBeenCalledWith({ data: expect.objectContaining({ propertyId: "property-1", tenantId: "tenant-1", amount: 2400000, status: "Due" }), select: { id: true } });
    expect(mocks.tx.leasePaymentScheduleItem.create).toHaveBeenCalledWith({ data: expect.objectContaining({ leaseId: "lease-1", paymentId: "payment-1", sequence: 1 }) });
  });

  it("rejects a payable schedule change after the first immutable version", async () => {
    mocks.tx.lease.findFirst.mockResolvedValue({ ...current, status: "ChangesRequested", currentVersionNumber: 1 });
    mocks.tx.leaseVersion.findFirst.mockResolvedValue({ terms: { ...editable, schedule: [{ ...editable.schedule[0], amountMinor: 230000000 }] } });
    await expect(LeaseRepository.revise({ id: "landlord-1", role: "Landlord" }, "lease-1", { expectedVersion: 1, expectedStatus: "ChangesRequested", terms: editable })).rejects.toThrow("SCHEDULE_IMMUTABLE");
    expect(mocks.tx.lease.updateMany).not.toHaveBeenCalled();
  });

  it("atomically reconciles dual acceptance and notifies the other participant", async () => {
    mocks.tx.lease.findFirst.mockResolvedValue({ ...current, status: "AwaitingAcceptance", currentVersionNumber: 1, versions: [{ id: "version-1", version: 1, contentHash: "hash-1" }] });
    await LeaseRepository.accept({ id: "tenant-1", role: "Tenant" }, "lease-1", { legalName: "Teni Tenant", consentVersion: "lease-consent-v1", expectedVersion: 1, expectedHash: "hash-1", ipHash: "a".repeat(64), userAgentHash: "b".repeat(64) });
    expect(mocks.tx.lease.updateMany).toHaveBeenCalledWith({ where: expect.objectContaining({ versions: { some: expect.objectContaining({ acceptances: { some: { party: "Tenant", agreementHash: "hash-1" } } }) } }), data: { status: "AwaitingPayment" } });
    expect(mocks.tx.notification.create).toHaveBeenCalledWith({ data: expect.objectContaining({ profileId: "landlord-1", kind: "Lease", idempotencyKey: "lease:lease-1:version:1:accepted:Tenant" }) });
  });
});
