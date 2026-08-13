import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

import { AdminVerificationWorkspace } from "@/features/verifications/components/admin-verification-workspace";

const summary = {
  id: "submission-1",
  type: "Identity" as const,
  status: "NeedsChanges" as const,
  reviewRound: 2,
  owner: { id: "owner-1", firstName: "Ada", lastName: "Okafor", email: "ada@example.com", role: "Tenant" as const },
  property: null,
  assignedTo: null,
  evidence: { total: 1, active: 1, superseded: 0, unavailable: 0 },
  submittedAt: "2026-08-12T08:00:00.000Z",
  updatedAt: "2026-08-12T10:00:00.000Z",
};

const detail = {
  ...summary,
  status: "Pending" as const,
  correctionInstructions: "Upload a clear uncropped government ID.",
  reviewedAt: "2026-08-12T10:00:00.000Z",
  owner: {
    ...summary.owner,
    phone: "+2348012345678",
    accountStatus: "Active" as const,
    verificationLevel: "Unverified" as const,
    emailVerified: true,
    onboardingComplete: true,
    tenantProfile: {
      employmentType: "Employed",
      employerName: "Northstar",
      jobTitle: "Analyst",
      incomeRange: "From200kTo500k",
      preferredLocations: ["Yaba"],
      preferredTypes: ["Flat"],
      budgetMin: 1_200_000,
      budgetMax: 2_400_000,
      moveInDate: null,
      ninStatus: "Pending",
    },
    landlordProfile: null,
    sensitive: {
      nin: { available: true, masked: "*******8901" },
      payoutAccount: { available: false, masked: null },
    },
  },
  privateEvidenceAvailable: true,
  documents: [{
    id: "document-1",
    kind: "GovernmentId" as const,
    fileName: "identity.pdf",
    mimeType: "application/pdf",
    size: 1024,
    revision: 2,
    supersededAt: null,
    deletedAt: null,
    createdAt: "2026-08-12T08:00:00.000Z",
    accessHref: "/api/admin/verifications/submission-1/documents/document-1",
  }],
  findings: [],
  linked: { properties: 0, applications: 2, payments: 0, maintenance: 0 },
  reviewedBy: null,
  auditHistory: [],
};

describe("admin verification evidence workspace", () => {
  it("renders an addressable queue, inline evidence, dossier, and correction decision controls", () => {
    const html = renderToStaticMarkup(
      <AdminVerificationWorkspace
        data={{ items: [summary], pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 } }}
        detail={detail}
        query={{ status: "NeedsChanges", item: "submission-1" }}
        canRevealSensitive
      />,
    );

    expect(html).toContain("Verification queue");
    expect(html).toContain("Evidence viewer");
    expect(html).toContain("identity.pdf");
    expect(html).toContain("Case dossier");
    expect(html).toContain("Upload a clear uncropped government ID.");
    expect(html).toContain("Applications");
    expect(html).toContain("Request changes");
    expect(html).not.toContain("role=\"dialog\"");
  });

  it("renders deliberate empty selection and no-private-evidence states", () => {
    const html = renderToStaticMarkup(
      <AdminVerificationWorkspace
        data={{ items: [summary], pagination: { page: 1, pageSize: 20, totalItems: 1, totalPages: 1 } }}
        detail={null}
        query={{}}
        canRevealSensitive={false}
      />,
    );

    expect(html).toContain("Select a case from the queue");
    expect(html).toContain("No case selected");
  });
});
