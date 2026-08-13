import { describe, expect, it } from "vitest";
import { leaseAcceptSchema, leaseMutationSchema, leaseTermsSchema } from "@/features/leases/contracts";
import { hashLeaseEvidence, renderLeaseAgreement } from "@/features/leases/agreement";

const terms = {
  startDate: "2026-09-01",
  endDate: "2027-08-31",
  rentMinor: 240000000,
  currency: "NGN" as const,
  billingPeriod: "year" as const,
  fees: [{ label: "Caution fee", amountMinor: 20000000 }],
  schedule: [{ sequence: 1, label: "First annual rent", amountMinor: 240000000, dueDate: "2026-09-01" }],
  noticeDays: 30,
  renewalTerms: "Subject to written agreement.",
  utilities: ["Electricity paid by tenant"],
  rules: ["No structural alterations"],
  specialTerms: "Handover after verified payment.",
  participants: { tenant: { id: "tenant-1", name: "Teni Tenant" }, landlord: { id: "landlord-1", name: "Ada Landlord" } },
  property: { id: "property-1", title: "Yaba Court", location: "Yaba, Lagos" },
};

describe("lease contracts", () => {
  it("validates complete money-in-minor-unit snapshots and renders an honest agreement", () => {
    expect(leaseTermsSchema.parse(terms)).toEqual(terms);
    const rendered = renderLeaseAgreement(terms);
    expect(rendered).toContain("Yaba Court");
    expect(rendered).toContain("₦2,400,000");
    expect(rendered).toContain("in-product audited acceptance");
    expect(rendered).toContain("not a certified e-signature");
  });

  it("requires expected version/hash for edits and legal acceptance", () => {
    expect(leaseMutationSchema.parse({ action: "send", expectedVersion: 2, expectedStatus: "Draft" })).toEqual({ action: "send", expectedVersion: 2, expectedStatus: "Draft" });
    expect(() => leaseAcceptSchema.parse({ legalName: "Teni Tenant" })).toThrow();
  });

  it("does not accept participant or property identity from an edit mutation", () => {
    const parsed = leaseMutationSchema.parse({ action: "edit_terms", expectedVersion: 0, expectedStatus: "Draft", terms });
    if (parsed.action !== "edit_terms") throw new Error("Expected edit action");
    expect(parsed.terms).not.toHaveProperty("participants");
    expect(parsed.terms).not.toHaveProperty("property");
  });

  it("hashes consent evidence without retaining raw IP or user agent", () => {
    const evidence = hashLeaseEvidence("203.0.113.10", "Browser Agent", "pepper");
    expect(evidence.ipHash).toMatch(/^[a-f0-9]{64}$/);
    expect(evidence.userAgentHash).toMatch(/^[a-f0-9]{64}$/);
    expect(JSON.stringify(evidence)).not.toContain("203.0.113.10");
    expect(JSON.stringify(evidence)).not.toContain("Browser Agent");
  });
});
