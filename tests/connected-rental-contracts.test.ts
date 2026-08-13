import { describe, expect, it } from "vitest";
import {
  applicationMutationSchema,
  getApplicationActions,
} from "@/features/applications/contracts";
import {
  getViewingActions,
  viewingMutationSchema,
} from "@/features/viewings/contracts";
import { notificationMutationSchema } from "@/features/notifications/contracts";

describe("connected application contracts", () => {
  it("exposes only role-valid legal actions", () => {
    expect(getApplicationActions("Tenant", "Pending")).toEqual(["withdraw"]);
    expect(getApplicationActions("Tenant", "Accepted")).toEqual([]);
    expect(getApplicationActions("Landlord", "Pending")).toEqual([
      "shortlist",
      "accept",
      "decline",
    ]);
    expect(getApplicationActions("PropertyManager", "Shortlisted")).toEqual([
      "accept",
      "decline",
    ]);
  });

  it("requires conflict protection and a reason for declining", () => {
    expect(() => applicationMutationSchema.parse({ action: "decline", expectedStatus: "Pending", idempotencyKey: "decision-1" })).toThrow(/reason/i);
    expect(applicationMutationSchema.parse({ action: "withdraw", expectedStatus: "Shortlisted", idempotencyKey: "withdraw-1" })).toEqual({
      action: "withdraw",
      expectedStatus: "Shortlisted",
      idempotencyKey: "withdraw-1",
    });
  });
});

describe("connected viewing contracts", () => {
  it("keeps reschedule acceptance tenant-only and completion owner-only", () => {
    expect(getViewingActions("Tenant", "Rescheduled")).toEqual(["accept_reschedule", "cancel"]);
    expect(getViewingActions("Landlord", "Confirmed")).toEqual(["reschedule", "complete", "cancel"]);
    expect(getViewingActions("Tenant", "Confirmed")).toEqual(["cancel"]);
  });

  it("requires a future schedule for rescheduling and a reason for cancellation", () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();
    expect(viewingMutationSchema.parse({ action: "reschedule", expectedStatus: "Confirmed", scheduledAt: future, idempotencyKey: "viewing-1" })).toMatchObject({ scheduledAt: expect.any(Date) });
    expect(() => viewingMutationSchema.parse({ action: "cancel", expectedStatus: "Confirmed", idempotencyKey: "viewing-2" })).toThrow(/reason/i);
  });
});

describe("durable notification contracts", () => {
  it("supports mark-one and mark-all without accepting arbitrary owners", () => {
    expect(notificationMutationSchema.parse({ action: "mark_read", notificationId: "11111111-1111-4111-8111-111111111111" })).toEqual({ action: "mark_read", notificationId: "11111111-1111-4111-8111-111111111111" });
    expect(notificationMutationSchema.parse({ action: "mark_all_read" })).toEqual({ action: "mark_all_read" });
    expect(() => notificationMutationSchema.parse({ action: "mark_read", profileId: "someone-else" })).toThrow();
  });
});
