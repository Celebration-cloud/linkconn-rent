import { describe, expect, it } from "vitest";
import {
  canTenantTransitionApplication,
  canTransitionApplication,
} from "@/lib/application-lifecycle";
import {
  canonicalizeLeaseTerms,
  hashLeaseTerms,
} from "@/lib/lease-agreement";
import {
  canActivateLease,
  canTransitionLease,
} from "@/lib/lease-lifecycle";
import { canTransitionVerificationSubmission } from "@/lib/verification-lifecycle";
import { canTransitionViewing } from "@/lib/viewing-lifecycle";

describe("application lifecycle", () => {
  it.each([
    ["Pending", "Shortlisted"],
    ["Pending", "Accepted"],
    ["Pending", "Declined"],
    ["Shortlisted", "Accepted"],
    ["Shortlisted", "Declined"],
  ] as const)("allows the landlord transition %s -> %s", (from, to) => {
    expect(canTransitionApplication(from, to)).toBe(true);
  });

  it.each([
    ["Pending", "Withdrawn"],
    ["Shortlisted", "Pending"],
    ["Accepted", "Declined"],
    ["Declined", "Accepted"],
    ["Withdrawn", "Pending"],
  ] as const)("rejects the landlord transition %s -> %s", (from, to) => {
    expect(canTransitionApplication(from, to)).toBe(false);
  });

  it("allows only the owning tenant to withdraw a pending or shortlisted application", () => {
    expect(
      canTenantTransitionApplication({
        actorId: "tenant-1",
        tenantId: "tenant-1",
        from: "Pending",
        to: "Withdrawn",
      }),
    ).toBe(true);
    expect(
      canTenantTransitionApplication({
        actorId: "tenant-1",
        tenantId: "tenant-1",
        from: "Shortlisted",
        to: "Withdrawn",
      }),
    ).toBe(true);
  });

  it("rejects withdrawal by another profile or from a terminal status", () => {
    expect(
      canTenantTransitionApplication({
        actorId: "tenant-2",
        tenantId: "tenant-1",
        from: "Pending",
        to: "Withdrawn",
      }),
    ).toBe(false);
    expect(
      canTenantTransitionApplication({
        actorId: "tenant-1",
        tenantId: "tenant-1",
        from: "Accepted",
        to: "Withdrawn",
      }),
    ).toBe(false);
    expect(
      canTenantTransitionApplication({
        actorId: "tenant-1",
        tenantId: "tenant-1",
        from: "Pending",
        to: "Shortlisted",
      }),
    ).toBe(false);
  });
});

describe("viewing lifecycle", () => {
  it.each([
    ["Requested", "Confirmed"],
    ["Requested", "Rescheduled"],
    ["Requested", "Cancelled"],
    ["Rescheduled", "Confirmed"],
    ["Rescheduled", "Rescheduled"],
    ["Rescheduled", "Cancelled"],
    ["Confirmed", "Rescheduled"],
    ["Confirmed", "Completed"],
    ["Confirmed", "Cancelled"],
  ] as const)("allows %s -> %s", (from, to) => {
    expect(canTransitionViewing(from, to)).toBe(true);
  });

  it.each([
    ["Requested", "Completed"],
    ["Confirmed", "Confirmed"],
    ["Completed", "Requested"],
    ["Completed", "Cancelled"],
    ["Cancelled", "Requested"],
  ] as const)("rejects %s -> %s", (from, to) => {
    expect(canTransitionViewing(from, to)).toBe(false);
  });
});

describe("verification lifecycle", () => {
  it.each([
    ["Draft", "Pending"],
    ["Pending", "Approved"],
    ["Pending", "Rejected"],
    ["Pending", "NeedsChanges"],
    ["NeedsChanges", "Pending"],
  ] as const)("allows %s -> %s", (from, to) => {
    expect(canTransitionVerificationSubmission(from, to)).toBe(true);
  });

  it.each([
    ["Draft", "Approved"],
    ["NeedsChanges", "Approved"],
    ["Approved", "Pending"],
    ["Rejected", "Pending"],
  ] as const)("rejects %s -> %s", (from, to) => {
    expect(canTransitionVerificationSubmission(from, to)).toBe(false);
  });
});

describe("lease lifecycle", () => {
  it.each([
    ["Draft", "AwaitingAcceptance"],
    ["Draft", "Cancelled"],
    ["AwaitingAcceptance", "ChangesRequested"],
    ["AwaitingAcceptance", "AwaitingPayment"],
    ["AwaitingAcceptance", "Cancelled"],
    ["ChangesRequested", "AwaitingAcceptance"],
    ["ChangesRequested", "Cancelled"],
    ["AwaitingPayment", "Active"],
    ["AwaitingPayment", "Cancelled"],
    ["Active", "Completed"],
    ["Active", "Terminated"],
  ] as const)("allows %s -> %s", (from, to) => {
    expect(canTransitionLease(from, to)).toBe(true);
  });

  it.each([
    ["Draft", "Active"],
    ["AwaitingAcceptance", "Active"],
    ["Active", "Cancelled"],
    ["Completed", "Active"],
    ["Cancelled", "Draft"],
    ["Terminated", "Active"],
  ] as const)("rejects %s -> %s", (from, to) => {
    expect(canTransitionLease(from, to)).toBe(false);
  });
});

describe("canonical lease agreements", () => {
  it("sorts nested object keys and omits undefined object values", () => {
    expect(
      canonicalizeLeaseTerms({
        b: 2,
        omitted: undefined,
        nested: { z: true, a: "first", omitted: undefined },
        a: 1,
      }),
    ).toBe('{"a":1,"b":2,"nested":{"a":"first","z":true}}');
  });

  it("produces the same SHA-256 hex for objects with different key order", () => {
    expect(hashLeaseTerms({ b: 2, a: 1 })).toBe(
      "43258cff783fe7036d8a43033f830adfc60ec037382473548ac742b888292777",
    );
    expect(hashLeaseTerms({ b: 2, a: 1 })).toBe(
      hashLeaseTerms({ a: 1, b: 2 }),
    );
  });

  it("uses deterministic ordinal ordering instead of host locale ordering", () => {
    expect(canonicalizeLeaseTerms({ a: 2, A: 1 })).toBe('{"A":1,"a":2}');
  });

  it("preserves array order so reordered terms hash differently", () => {
    expect(hashLeaseTerms({ occupants: ["Ada", "Bola"] })).not.toBe(
      hashLeaseTerms({ occupants: ["Bola", "Ada"] }),
    );
  });
});

describe("lease activation", () => {
  const readyFacts = {
    currentVersionId: "version-2",
    currentAgreementHash: "hash-version-2",
    acceptances: [
      {
        leaseVersionId: "version-2",
        agreementHash: "hash-version-2",
        party: "Tenant" as const,
      },
      {
        leaseVersionId: "version-2",
        agreementHash: "hash-version-2",
        party: "Landlord" as const,
      },
    ],
    paymentSchedule: [
      {
        sequence: 2,
        paymentId: "payment-2",
        paymentStatus: "Due" as const,
      },
      {
        sequence: 1,
        paymentId: "payment-1",
        paymentStatus: "Paid" as const,
      },
    ],
  };

  it("activates only when both parties accepted the current version and the first linked payment is paid", () => {
    expect(canActivateLease(readyFacts)).toBe(true);
  });

  it("does not count acceptance of a stale agreement version", () => {
    expect(
      canActivateLease({
        ...readyFacts,
        acceptances: [
          {
            leaseVersionId: "version-1",
            agreementHash: "hash-version-1",
            party: "Tenant",
          },
          {
            leaseVersionId: "version-2",
            agreementHash: "hash-version-2",
            party: "Landlord",
          },
        ],
      }),
    ).toBe(false);
  });

  it("does not count acceptance evidence for a different agreement hash", () => {
    expect(
      canActivateLease({
        ...readyFacts,
        acceptances: [
          {
            leaseVersionId: "version-2",
            agreementHash: "hash-version-1",
            party: "Tenant",
          },
          {
            leaseVersionId: "version-2",
            agreementHash: "hash-version-2",
            party: "Landlord",
          },
        ],
      }),
    ).toBe(false);
  });

  it("requires the first linked payment, by schedule sequence, to be paid", () => {
    expect(
      canActivateLease({
        ...readyFacts,
        paymentSchedule: [
          { sequence: 2, paymentId: "payment-2", paymentStatus: "Paid" },
          { sequence: 1, paymentId: "payment-1", paymentStatus: "Due" },
        ],
      }),
    ).toBe(false);
  });

  it("rejects activation when the first scheduled payment is unlinked even if a later payment is paid", () => {
    expect(
      canActivateLease({
        ...readyFacts,
        paymentSchedule: [
          { sequence: 2, paymentId: "payment-2", paymentStatus: "Paid" },
          { sequence: 1, paymentId: null, paymentStatus: null },
        ],
      }),
    ).toBe(false);
  });

  it("rejects activation when no payment is linked", () => {
    expect(
      canActivateLease({
        ...readyFacts,
        paymentSchedule: [
          { sequence: 1, paymentId: null, paymentStatus: null },
        ],
      }),
    ).toBe(false);
  });
});
