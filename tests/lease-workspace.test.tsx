import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { LeaseWorkspace } from "@/features/leases/components/lease-workspace";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

const terms = { startDate: "2026-09-01", endDate: "2027-08-31", rentMinor: 240000000, currency: "NGN" as const, billingPeriod: "year" as const, fees: [], schedule: [{ sequence: 1, label: "First rent", amountMinor: 240000000, dueDate: "2026-09-01" }], noticeDays: 30, renewalTerms: "Written renewal", utilities: [], rules: [], specialTerms: "", participants: { tenant: { id: "tenant-1", name: "Teni Tenant" }, landlord: { id: "landlord-1", name: "Ada Landlord" } }, property: { id: "property-1", title: "Yaba Court", location: "Yaba" } };
const lease = { id: "lease-1", status: "AwaitingPayment" as const, currentVersionNumber: 2, activatedAt: null, completedAt: null, terminatedAt: null, createdAt: "2026-08-01", updatedAt: "2026-08-02", property: { id: "property-1", title: "Yaba Court", location: "Yaba" }, tenant: { id: "tenant-1", name: "Teni Tenant" }, landlord: { id: "landlord-1", name: "Ada Landlord" }, versions: [{ id: "version-2", version: 2, terms, contentHash: "hash-2", renderedAgreement: "agreement", sentAt: "2026-08-02", createdAt: "2026-08-02", acceptances: [{ party: "Tenant" as const, legalName: "Teni Tenant", consentVersion: "lease-consent-v1", agreementHash: "hash-2", acceptedAt: "2026-08-02" }, { party: "Landlord" as const, legalName: "Ada Landlord", consentVersion: "lease-consent-v1", agreementHash: "hash-2", acceptedAt: "2026-08-02" }] }], scheduleItems: [{ id: "schedule-1", sequence: 1, label: "First rent", amount: 2400000, dueDate: "2026-09-01", payment: { id: "payment-1", status: "Due" as const, paidAt: null, reference: null } }], activities: [] };

describe("lease workspace", () => {
  it("renders agreement, dual acceptance, schedule, Paystack next action and operational links", () => {
    const html = renderToStaticMarkup(<LeaseWorkspace leases={[lease]} selected={lease} viewer={{ id: "tenant-1", role: "Tenant" }} />);
    expect(html).toContain("Yaba Court"); expect(html).toContain("Version 2"); expect(html).toContain("Tenant accepted"); expect(html).toContain("Landlord accepted"); expect(html).toContain("Pay first due item"); expect(html).toContain("Printable agreement"); expect(html).toContain("Maintenance"); expect(html).toContain("Messages");
    expect(html).not.toContain("Accept agreement");
  });

  it("shows landlord revise/send and lifecycle controls as compact forms", () => {
    const draft = { ...lease, status: "Draft" as const, currentVersionNumber: 1 };
    const html = renderToStaticMarkup(<LeaseWorkspace leases={[draft]} selected={draft} viewer={{ id: "landlord-1", role: "Landlord" }} />);
    expect(html).toContain("Revise terms");
    expect(html).toContain("Send agreement");
    expect(html).toContain("Cancel lease");
    expect(html).not.toContain("Accept agreement");
  });
});
