import { describe, expect, it } from "vitest";
import { toOwnerVerificationWorkspaceDto } from "@/features/verifications/owner-contracts";

const source = {
  profile: {
    id: "owner-1",
    email: "ada@example.com",
    firstName: "Ada",
    lastName: "Okafor",
    phone: "+2348012345678",
    location: "Yaba, Lagos",
    role: "Landlord" as const,
    accountStatus: "Active" as const,
    verificationLevel: "Unverified" as const,
    emailVerified: true,
    onboardingComplete: true,
    tenantProfile: null,
    landlordProfile: {
      businessName: "Ada Homes",
      propertyCount: 3,
      propertyTypesOffered: ["Flat", "Duplex"],
      ninStatus: "Pending",
      ninNumber: "12345678901",
      bankName: "Access Bank",
      accountNumber: "0123456789",
      accountName: "Ada Okafor",
    },
  },
  storageConfigured: false,
  submission: {
    id: "submission-1",
    type: "Identity" as const,
    status: "NeedsChanges" as const,
    documentType: "Role-based identity documents",
    reviewRound: 2,
    decisionReason: "The payout evidence is unreadable.",
    correctionInstructions: "Replace the bank statement. Keep every page visible.\nDo not crop the account name.",
    submittedAt: new Date("2026-08-12T08:00:00.000Z"),
    reviewedAt: new Date("2026-08-12T09:00:00.000Z"),
    createdAt: new Date("2026-08-11T08:00:00.000Z"),
    updatedAt: new Date("2026-08-12T09:00:00.000Z"),
    documents: [
      {
        id: "document-1",
        kind: "GovernmentId" as const,
        fileName: "id.pdf",
        storageKey: "private-verifications/secret.pdf",
        mimeType: "application/pdf",
        size: 1200,
        uploadIntentId: null,
        deleteAfter: null,
        deletionError: null,
        deletedAt: null,
        revision: 1,
        supersededAt: null,
        createdAt: new Date("2026-08-11T08:00:00.000Z"),
      },
    ],
    findings: [{
      reviewRound: 2,
      key: "document_validity",
      label: "Evidence is valid and readable",
      status: "NeedsChanges" as const,
      note: "The scan is blurred.",
      createdAt: new Date("2026-08-12T09:00:00.000Z"),
      reviewerId: "admin-secret",
    }],
    timeline: [{
      kind: "decision" as const,
      reviewRound: 1,
      status: "NeedsChanges" as const,
      reason: "The first upload was incomplete.",
      correctionInstructions: "Upload every page exactly as issued.",
      createdAt: new Date("2026-08-10T09:00:00.000Z"),
    }],
  },
};

describe("owner verification DTO", () => {
  it("returns complete owner context while redacting persistence-only values", () => {
    const dto = toOwnerVerificationWorkspaceDto(source);
    const serialized = JSON.stringify(dto);

    expect(dto.profile.landlordProfile).toEqual(expect.objectContaining({
      businessName: "Ada Homes",
      bankName: "Access Bank",
      accountName: "Ada Okafor",
    }));
    expect(dto.profile.sensitive).toEqual({
      nin: { available: true, masked: "*******8901" },
      payoutAccount: { available: true, masked: "******6789" },
    });
    expect(dto.current?.correctionInstructions).toBe(
      "Replace the bank statement. Keep every page visible.\nDo not crop the account name.",
    );
    expect(dto.current?.timeline[0]?.correctionInstructions).toBe("Upload every page exactly as issued.");
    expect(serialized).not.toContain("12345678901");
    expect(serialized).not.toContain("0123456789");
    expect(serialized).not.toContain("private-verifications");
    expect(serialized).not.toContain("admin-secret");
    expect(serialized).not.toContain("deleteAfter");
    expect(serialized).not.toContain("deletionError");
    expect(serialized).not.toContain("uploadIntentId");
  });

  it("uses the role requirements and reports blocked storage without requiring CAC", () => {
    const dto = toOwnerVerificationWorkspaceDto(source);

    expect(dto.storage).toEqual({ configured: false, blocked: true });
    expect(dto.requirements).toHaveLength(5);
    expect(dto.requirements.flatMap((item) => item.acceptedKinds)).not.toContain("BusinessRegistration");
    expect(dto.requirements.find((item) => item.id === "government-id")?.satisfied).toBe(true);
    expect(dto.canResubmit).toBe(false);
  });

  it("keeps prior-round findings in the owner history without reviewer identifiers", () => {
    const dto = toOwnerVerificationWorkspaceDto({
      ...source,
      submission: source.submission && {
        ...source.submission,
        status: "Pending",
        reviewRound: 3,
      },
    });

    expect(dto.current?.findings).toContainEqual(expect.objectContaining({
      reviewRound: 2,
      label: "Evidence is valid and readable",
      status: "NeedsChanges",
      note: "The scan is blurred.",
    }));
    expect(JSON.stringify(dto.current?.findings)).not.toContain("admin-secret");
  });
});
