import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VerificationCenter } from "@/components/stitch/verification-center";

const data = {
  profile: {
    id: "owner-1", email: "ada@example.com", firstName: "Ada", lastName: "Okafor", phone: "+2348012345678",
    location: "Yaba", role: "Landlord" as const, accountStatus: "Active" as const, verificationLevel: "Unverified" as const,
    emailVerified: true, onboardingComplete: true, tenantProfile: null,
    landlordProfile: { businessName: "Ada Homes", propertyCount: 3, propertyTypesOffered: ["Flat"], ninStatus: "Pending", bankName: "Access Bank", accountName: "Ada Okafor" },
    sensitive: { nin: { available: true, masked: "*******8901" }, payoutAccount: { available: true, masked: "******6789" } },
  },
  storage: { configured: false, blocked: true },
  requirements: [{ id: "government-id", label: "Government-issued ID", description: "A readable ID.", acceptedKinds: ["GovernmentId" as const], satisfied: true }],
  canResubmit: true,
  current: {
    id: "submission-1", type: "Identity" as const, status: "NeedsChanges" as const, documentType: "Role documents", reviewRound: 2,
    decisionReason: "The first scan is blurred.", correctionInstructions: "Upload an uncropped copy.\nKeep all four corners visible.",
    submittedAt: "2026-08-12T08:00:00.000Z", reviewedAt: "2026-08-12T09:00:00.000Z", createdAt: "2026-08-11T08:00:00.000Z", updatedAt: "2026-08-12T09:00:00.000Z",
    documents: [
      { id: "document-2", kind: "GovernmentId" as const, fileName: "id-new.pdf", mimeType: "application/pdf", size: 1200, revision: 2, uploaded: true, supersededAt: null, deletedAt: null, createdAt: "2026-08-12T08:00:00.000Z" },
      { id: "document-1", kind: "GovernmentId" as const, fileName: "id-old.pdf", mimeType: "application/pdf", size: 900, revision: 1, uploaded: true, supersededAt: "2026-08-12T08:00:00.000Z", deletedAt: null, createdAt: "2026-08-10T08:00:00.000Z" },
    ],
    findings: [{ reviewRound: 2, key: "document_validity", label: "Evidence is valid and readable", status: "NeedsChanges" as const, note: "Blurred", createdAt: "2026-08-12T09:00:00.000Z" }],
    timeline: [{ kind: "decision" as const, reviewRound: 1, status: "NeedsChanges" as const, reason: "Earlier review", correctionInstructions: "Upload all pages.", createdAt: "2026-08-10T09:00:00.000Z" }],
  },
};

describe("owner verification workspace", () => {
  it("shows verbatim corrections, coverage, revisions, timeline, owner facts, and blocked storage", () => {
    const html = renderToStaticMarkup(<VerificationCenter initialData={data} />);
    expect(html).toContain("Upload an uncropped copy.");
    expect(html).toContain("Keep all four corners visible.");
    expect(html).toContain("Government-issued ID");
    expect(html).toContain("Revision 2");
    expect(html).toContain("Identity verification");
    expect(html).toContain("Submitted");
    expect(html).toContain("Reviewed");
    expect(html).toContain("Evidence is valid and readable");
    expect(html).toContain("Blurred");
    expect(html).toContain("id-old.pdf");
    expect(html).toContain("Superseded");
    expect(html).toContain("Yaba");
    expect(html).toContain("+2348012345678");
    expect(html).toContain("Access Bank");
    expect(html).toContain("3 properties");
    expect(html).toContain("Upload all pages.");
    expect(html).toContain("Ada Homes");
    expect(html).toContain("private storage is unavailable");
    expect(html).toContain("Resubmit for review");
  });

  it("shows prior-round findings in history after resubmission but not as current findings", () => {
    const postResubmission = {
      ...data,
      current: {
        ...data.current,
        status: "Pending" as const,
        reviewRound: 3,
        correctionInstructions: null,
        decisionReason: null,
        findings: [{
          reviewRound: 2,
          key: "document_validity",
          label: "Prior evidence readability",
          status: "NeedsChanges" as const,
          note: "Round two scan was blurred.",
          createdAt: "2026-08-12T09:00:00.000Z",
        }],
        timeline: [{
          kind: "resubmission" as const,
          reviewRound: 3,
          status: "Pending" as const,
          reason: "Owner resubmitted corrected verification evidence",
          correctionInstructions: "Upload a sharper copy.",
          createdAt: "2026-08-13T09:00:00.000Z",
        }],
      },
    };

    const html = renderToStaticMarkup(<VerificationCenter initialData={postResubmission} />);
    const currentFindings = html.slice(html.indexOf("Current findings"), html.indexOf("Evidence revisions"));
    const timeline = html.slice(html.indexOf("Review timeline"));

    expect(currentFindings).toContain("No findings have been recorded for this round.");
    expect(currentFindings).not.toContain("Prior evidence readability");
    expect(timeline).toContain("Round 2 finding");
    expect(timeline).toContain("Prior evidence readability");
    expect(timeline).toContain("NeedsChanges");
    expect(timeline).toContain("Round two scan was blurred.");
    expect(timeline).toContain("Corrections resubmitted");
  });
});
