import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const tx = { viewing: { findUnique: vi.fn(), findFirst: vi.fn(), updateMany: vi.fn(), create: vi.fn() }, viewingActivity: { findUnique: vi.fn(), create: vi.fn() }, property: { findFirst: vi.fn() }, notification: { create: vi.fn(), createMany: vi.fn() } };
  return { tx, transaction: vi.fn() };
});
vi.mock("@/lib/db/client", () => ({ prisma: { $transaction: mocks.transaction } }));

import { ViewingRepository } from "@/repositories/viewing.repository";

const viewing = { id: "viewing-1", tenantId: "tenant-1", landlordId: "landlord-1", status: "Rescheduled", scheduledAt: new Date("2026-09-01T10:00:00Z"), property: { title: "Yaba Court" } };

describe("viewing workflow repository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.transaction.mockImplementation(async (callback: (tx: typeof mocks.tx) => Promise<unknown>) => callback(mocks.tx));
    mocks.tx.viewing.findUnique.mockResolvedValue(viewing);
    mocks.tx.viewing.updateMany.mockResolvedValue({ count: 1 });
    mocks.tx.viewingActivity.findUnique.mockResolvedValue(null);
    mocks.tx.viewingActivity.create.mockResolvedValue({ id: "activity-1" });
    mocks.tx.notification.createMany.mockResolvedValue({ count: 1 });
  });

  it("creates with a deterministic unique active slot key", async () => {
    mocks.tx.viewingActivity.findUnique.mockResolvedValueOnce(null);
    mocks.tx.property.findFirst.mockResolvedValueOnce({ ownerId: "landlord-1", title: "Yaba Court" });
    mocks.tx.viewing.findFirst.mockResolvedValueOnce(null);
    mocks.tx.viewing.create.mockResolvedValueOnce({ id: "viewing-new", tenantId: "tenant-1", propertyId: "property-1", landlordId: "landlord-1", status: "Requested", scheduledAt: new Date("2026-09-01T10:00:00Z"), note: null, property: { id: "property-1", title: "Yaba Court", location: "Yaba" } });
    await ViewingRepository.create("tenant-1", "property-1", new Date("2026-09-01T10:00:00Z"), undefined, "create-viewing-1");
    expect(mocks.tx.viewing.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ activeSlotKey: "tenant-1:property-1" }) }));
  });

  it("clears the active slot on terminal transitions", async () => {
    mocks.tx.viewing.findUnique.mockResolvedValueOnce({ ...viewing, status: "Confirmed" });
    await ViewingRepository.transition({ id: "landlord-1", role: "Landlord" }, "viewing-1", { action: "complete", expectedStatus: "Confirmed", idempotencyKey: "complete-viewing-1" });
    expect(mocks.tx.viewing.updateMany).toHaveBeenCalledWith(expect.objectContaining({ data: { status: "Completed", activeSlotKey: null } }));
  });

  it("does not replay a creation key owned by another tenant or resource", async () => {
    mocks.tx.viewingActivity.findUnique.mockResolvedValueOnce({ viewing: { id: "foreign", tenantId: "tenant-2", propertyId: "property-2", scheduledAt: new Date("2026-09-02T10:00:00Z") } });
    await expect(ViewingRepository.create("tenant-1", "property-1", new Date("2026-09-01T10:00:00Z"), undefined, "shared-viewing-key"))
      .rejects.toThrow("IDEMPOTENCY_CONFLICT");
  });

  it("lets the tenant accept an owner reschedule with immutable activity and owner notification", async () => {
    await ViewingRepository.transition({ id: "tenant-1", role: "Tenant" }, "viewing-1", { action: "accept_reschedule", expectedStatus: "Rescheduled", idempotencyKey: "accept-viewing-1" });
    expect(mocks.tx.viewing.updateMany).toHaveBeenCalledWith(expect.objectContaining({ where: { id: "viewing-1", status: "Rescheduled" }, data: { status: "Confirmed" } }));
    expect(mocks.tx.viewingActivity.create).toHaveBeenCalledWith({ data: expect.objectContaining({ fromStatus: "Rescheduled", toStatus: "Confirmed", actorId: "tenant-1" }) });
    expect(mocks.tx.notification.createMany).toHaveBeenCalledWith({ data: [expect.objectContaining({ profileId: "landlord-1", href: "/dashboard/calendar/viewing-1" })], skipDuplicates: true });
  });

  it("prevents tenants from completing viewings", async () => {
    mocks.tx.viewing.findUnique.mockResolvedValueOnce({ ...viewing, status: "Confirmed" });
    await expect(ViewingRepository.transition({ id: "tenant-1", role: "Tenant" }, "viewing-1", { action: "complete", expectedStatus: "Confirmed", idempotencyKey: "complete-viewing-1" })).rejects.toThrow("FORBIDDEN");
  });
});
