import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = {
    application: { findUnique: vi.fn(), updateMany: vi.fn(), findFirst: vi.fn(), create: vi.fn() },
    applicationActivity: { findUnique: vi.fn(), create: vi.fn() },
    conversation: { findUnique: vi.fn(), upsert: vi.fn(), update: vi.fn() },
    lease: { upsert: vi.fn() },
    notification: { createMany: vi.fn() },
    property: { findFirst: vi.fn() },
  };
  return { tx, transaction: vi.fn() };
});

vi.mock("@/lib/db/client", () => ({ prisma: { $transaction: mocks.transaction } }));

import { ApplicationRepository } from "@/repositories/application.repository";

const application = {
  id: "application-1", tenantId: "tenant-1", propertyId: "property-1", status: "Pending",
  property: { id: "property-1", ownerId: "landlord-1", title: "Yaba Court" },
};

describe("application workflow repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transaction.mockImplementation(async (callback: (tx: typeof mocks.tx) => Promise<unknown>) => callback(mocks.tx));
    mocks.tx.application.findUnique.mockResolvedValue(application);
    mocks.tx.application.updateMany.mockResolvedValue({ count: 1 });
    mocks.tx.applicationActivity.findUnique.mockResolvedValue(null);
    mocks.tx.applicationActivity.create.mockResolvedValue({ id: "activity-1" });
    mocks.tx.conversation.upsert.mockResolvedValue({ id: "conversation-1" });
    mocks.tx.conversation.findUnique.mockResolvedValue(null);
    mocks.tx.conversation.update.mockResolvedValue({ id: "conversation-1" });
    mocks.tx.lease.upsert.mockResolvedValue({ id: "lease-1" });
    mocks.tx.notification.createMany.mockResolvedValue({ count: 1 });
  });

  it("accepts atomically with history, one lease, conversation, and targeted notification", async () => {
    await ApplicationRepository.transition(
      { id: "landlord-1", role: "Landlord" },
      "application-1",
      { action: "accept", expectedStatus: "Pending", idempotencyKey: "accept-application-1" },
    );

    expect(mocks.tx.application.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "application-1", status: "Pending" }, data: { status: "Accepted" } }));
    expect(mocks.tx.applicationActivity.create).toHaveBeenCalledWith({ data: expect.objectContaining({ fromStatus: "Pending", toStatus: "Accepted", actorId: "landlord-1" }) });
    expect(mocks.tx.lease.upsert).toHaveBeenCalledWith(expect.objectContaining({ where: { applicationId: "application-1" }, create: expect.objectContaining({ status: "Draft" }) }));
    expect(mocks.tx.conversation.upsert).toHaveBeenCalledWith(expect.objectContaining({
      where: { tenantId_landlordId_propertyId: { tenantId: "tenant-1", landlordId: "landlord-1", propertyId: "property-1" } },
      update: { applicationId: "application-1", leaseId: "lease-1" },
      create: expect.objectContaining({ applicationId: "application-1", leaseId: "lease-1" }),
    }));
    expect(mocks.tx.notification.createMany).toHaveBeenCalledWith({ data: [expect.objectContaining({ profileId: "tenant-1", href: "/dashboard/applications/application-1" })], skipDuplicates: true });
  });

  it("reuses the application conversation and attaches the accepted lease", async () => {
    mocks.tx.conversation.findUnique.mockResolvedValueOnce({ id: "conversation-existing" });
    await ApplicationRepository.transition(
      { id: "landlord-1", role: "Landlord" },
      "application-1",
      { action: "accept", expectedStatus: "Pending", idempotencyKey: "accept-existing-conversation" },
    );
    expect(mocks.tx.conversation.update).toHaveBeenCalledWith({
      where: { id: "conversation-existing" },
      data: { leaseId: "lease-1" },
      select: { id: true },
    });
    expect(mocks.tx.conversation.upsert).not.toHaveBeenCalled();
  });

  it("does not replay a creation key owned by another tenant or property", async () => {
    mocks.tx.applicationActivity.findUnique.mockResolvedValueOnce({ application: { id: "foreign", tenantId: "tenant-2", propertyId: "property-2" } });
    await expect(ApplicationRepository.create("tenant-1", "property-1", undefined, "shared-create-key"))
      .rejects.toThrow("IDEMPOTENCY_CONFLICT");
  });

  it("rejects a stale decision before writing side effects", async () => {
    mocks.tx.application.updateMany.mockResolvedValueOnce({ count: 0 });
    await expect(ApplicationRepository.transition(
      { id: "landlord-1", role: "Landlord" },
      "application-1",
      { action: "shortlist", expectedStatus: "Pending", idempotencyKey: "shortlist-application-1" },
    )).rejects.toThrow("CONFLICT");
    expect(mocks.tx.applicationActivity.create).not.toHaveBeenCalled();
    expect(mocks.tx.notification.createMany).not.toHaveBeenCalled();
  });

  it("allows only the owning tenant to withdraw", async () => {
    await expect(ApplicationRepository.transition(
      { id: "tenant-2", role: "Tenant" },
      "application-1",
      { action: "withdraw", expectedStatus: "Pending", idempotencyKey: "withdraw-application-1" },
    )).rejects.toThrow("FORBIDDEN");
  });
});
