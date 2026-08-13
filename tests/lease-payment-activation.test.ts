import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = { payment: { findUnique: vi.fn(), update: vi.fn() }, lease: { updateMany: vi.fn() }, leaseActivity: { create: vi.fn() } };
  return { tx, transaction: vi.fn() };
});
vi.mock("@/lib/db/client", () => ({ prisma: { $transaction: mocks.transaction } }));

import { TenantOperationsRepository } from "@/repositories/tenant-operations.repository";

const payment = { id: "payment-1", reference: "ref-1", status: "Processing", leaseScheduleItem: { sequence: 1, lease: { id: "lease-1", status: "AwaitingPayment", currentVersionNumber: 2, versions: [{ id: "version-2", version: 2, contentHash: "hash-2", acceptances: [{ party: "Tenant", leaseVersionId: "version-2", agreementHash: "hash-2" }, { party: "Landlord", leaseVersionId: "version-2", agreementHash: "hash-2" }] }], scheduleItems: [{ sequence: 1, paymentId: "payment-1", payment: { status: "Processing" } }] } } };

describe("Paystack lease activation", () => {
  beforeEach(() => { vi.clearAllMocks(); mocks.transaction.mockImplementation(async (cb: (tx: typeof mocks.tx) => Promise<unknown>) => cb(mocks.tx)); mocks.tx.payment.findUnique.mockResolvedValue(payment); mocks.tx.payment.update.mockResolvedValue({ ...payment, status: "Paid" }); mocks.tx.lease.updateMany.mockResolvedValue({ count: 1 }); });

  it("activates only after verified first schedule payment and current-version dual acceptance", async () => {
    await TenantOperationsRepository.completePayment("payment-1", "ref-1", true);
    expect(mocks.tx.lease.updateMany).toHaveBeenCalledWith({ where: { id: "lease-1", status: "AwaitingPayment", currentVersionNumber: 2 }, data: { status: "Active", activatedAt: expect.any(Date) } });
    expect(mocks.tx.leaseActivity.create).toHaveBeenCalledWith({ data: expect.objectContaining({ leaseId: "lease-1", action: "lease.activated", fromStatus: "AwaitingPayment", toStatus: "Active", idempotencyKey: "lease:lease-1:activated:payment:payment-1" }) });
  });

  it("never activates on provider failure", async () => {
    await TenantOperationsRepository.completePayment("payment-1", "ref-1", false, "Paystack mismatch");
    expect(mocks.tx.lease.updateMany).not.toHaveBeenCalled();
  });
});
