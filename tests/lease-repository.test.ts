import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    lease: { findFirst: vi.fn(), updateMany: vi.fn(), findUnique: vi.fn() },
    leaseVersion: { create: vi.fn(), findFirst: vi.fn() },
    leaseAcceptance: { create: vi.fn(), findMany: vi.fn() },
    leasePaymentScheduleItem: { create: vi.fn(), createMany: vi.fn(), findMany: vi.fn() },
    payment: { create: vi.fn() },
    leaseActivity: { create: vi.fn() }, notification: { create: vi.fn(), createMany: vi.fn() }, adminAuditEvent: { create: vi.fn() },
  };
  return { tx, transaction: vi.fn(), findMany: vi.fn(), findFirst: vi.fn() };
});
vi.mock("@/lib/db/client", () => ({ prisma: { $transaction: mocks.transaction, lease: { findMany: mocks.findMany, findFirst: mocks.findFirst } } }));

import { LeaseRepository } from "@/repositories/lease.repository";
import type { LeaseTerms } from "@/features/leases/contracts";

const lease = { id: "lease-1", tenantId: "tenant-1", landlordId: "landlord-1", status: "Draft", currentVersionNumber: 0, propertyId: "property-1" };
const terms: LeaseTerms = { startDate: "2026-09-01", endDate: "2027-08-31", rentMinor: 240000000, currency: "NGN", billingPeriod: "year", fees: [], schedule: [{ sequence: 1, label: "First rent", amountMinor: 240000000, dueDate: "2026-09-01" }], noticeDays: 30, renewalTerms: "Written renewal", utilities: [], rules: [], specialTerms: "", participants: { tenant: { id: "tenant-1", name: "Teni" }, landlord: { id: "landlord-1", name: "Ada" } }, property: { id: "property-1", title: "Yaba Court", location: "Yaba" } };

describe("lease repository", () => {
  beforeEach(() => {
    vi.clearAllMocks(); mocks.transaction.mockImplementation(async (cb: (tx: typeof mocks.tx) => Promise<unknown>) => cb(mocks.tx));
    mocks.tx.lease.findFirst.mockResolvedValue({ ...lease, tenant: { id: "tenant-1", firstName: "Teni", lastName: "Tenant" }, landlord: { id: "landlord-1", firstName: "Ada", lastName: "Landlord" }, property: { id: "property-1", title: "Yaba Court", location: "Yaba" } }); mocks.tx.lease.updateMany.mockResolvedValue({ count: 1 });
    mocks.tx.payment.create.mockResolvedValue({ id: "payment-1" });
    mocks.tx.leaseVersion.create.mockResolvedValue({ id: "version-1", leaseId: "lease-1", version: 1, contentHash: "hash-1", terms, renderedAgreement: "agreement", createdAt: new Date() });
    mocks.tx.leaseAcceptance.findMany.mockResolvedValue([]); mocks.tx.leasePaymentScheduleItem.findMany.mockResolvedValue([]);
  });

  it("creates a monotonic immutable version and schedule without mutating older versions", async () => {
    await LeaseRepository.revise({ id: "landlord-1", role: "Landlord" }, "lease-1", { expectedVersion: 0, expectedStatus: "Draft", terms });
    expect(mocks.tx.leaseVersion.create).toHaveBeenCalledWith({ data: expect.objectContaining({ leaseId: "lease-1", version: 1, terms: expect.objectContaining({ participants: { tenant: { id: "tenant-1", name: "Teni Tenant" }, landlord: { id: "landlord-1", name: "Ada Landlord" } }, property: { id: "property-1", title: "Yaba Court", location: "Yaba" } }), contentHash: expect.stringMatching(/^[a-f0-9]{64}$/) }) });
    expect(mocks.tx.leasePaymentScheduleItem.create).toHaveBeenCalledWith({ data: expect.objectContaining({ leaseId: "lease-1", sequence: 1, amount: 2400000, paymentId: "payment-1" }) });
    expect(mocks.tx.lease.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ currentVersionNumber: 0, status: "Draft" }), data: { currentVersionNumber: 1, status: "Draft" } }));
  });

  it("rejects stale version edits before durable side effects", async () => {
    mocks.tx.lease.updateMany.mockResolvedValue({ count: 0 });
    await expect(LeaseRepository.revise({ id: "landlord-1", role: "Landlord" }, "lease-1", { expectedVersion: 0, expectedStatus: "Draft", terms })).rejects.toThrow("LEASE_CONFLICT");
    expect(mocks.tx.leaseVersion.create).not.toHaveBeenCalled();
  });

  it("binds acceptance to the current version and advances only after both parties accept", async () => {
    mocks.tx.lease.findFirst.mockResolvedValue({ ...lease, status: "AwaitingAcceptance", currentVersionNumber: 2, versions: [{ id: "version-2", version: 2, contentHash: "hash-2" }] });
    mocks.tx.leaseAcceptance.findMany.mockResolvedValue([{ party: "Tenant", leaseVersionId: "version-2", agreementHash: "hash-2" }, { party: "Landlord", leaseVersionId: "version-2", agreementHash: "hash-2" }]);
    await LeaseRepository.accept({ id: "tenant-1", role: "Tenant" }, "lease-1", { legalName: "Teni Tenant", consentVersion: "lease-consent-v1", expectedVersion: 2, expectedHash: "hash-2", ipHash: "i".repeat(64), userAgentHash: "u".repeat(64) });
    expect(mocks.tx.leaseAcceptance.create).toHaveBeenCalledWith({ data: expect.objectContaining({ leaseVersionId: "version-2", party: "Tenant", agreementHash: "hash-2" }) });
    expect(mocks.tx.lease.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { status: "AwaitingPayment" } }));
  });
});
