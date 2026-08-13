import type {
  AccountStatus,
  AppRole,
  VerificationDocumentKind,
  VerificationFindingStatus,
  VerificationLevel,
  VerificationSubmissionStatus,
  VerificationSubmissionType,
} from "@prisma/client";
import {
  getOnboardingDocumentRequirements,
  type DocumentRequirement,
} from "@/features/onboarding/document-requirements";
import { maskSensitiveValue, type DateValue } from "@/features/verifications/review-contracts";

type OwnerProfileSource = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  location: string | null;
  role: AppRole;
  accountStatus: AccountStatus;
  verificationLevel: VerificationLevel;
  emailVerified: boolean;
  onboardingComplete: boolean;
  tenantProfile: null | {
    employmentType: string;
    employerName: string | null;
    jobTitle: string | null;
    incomeRange: string;
    preferredLocations: string[];
    preferredTypes: string[];
    budgetMin: number | null;
    budgetMax: number | null;
    moveInDate: DateValue | null;
    ninStatus: string;
    ninNumber: string | null;
  };
  landlordProfile: null | {
    businessName: string | null;
    propertyCount: number;
    propertyTypesOffered: string[];
    ninStatus: string;
    ninNumber: string | null;
    bankName: string | null;
    accountNumber: string | null;
    accountName: string | null;
  };
};

type OwnerDocumentSource = {
  id: string;
  kind: VerificationDocumentKind;
  fileName: string | null;
  storageKey: string | null;
  mimeType: string | null;
  size: number | null;
  uploadIntentId: string | null;
  deleteAfter: DateValue | null;
  deletionError: string | null;
  deletedAt: DateValue | null;
  revision: number;
  supersededAt: DateValue | null;
  createdAt: DateValue;
};

export type OwnerVerificationSource = {
  profile: OwnerProfileSource;
  storageConfigured: boolean;
  submission: null | {
    id: string;
    type: VerificationSubmissionType;
    status: VerificationSubmissionStatus;
    documentType: string | null;
    reviewRound: number;
    decisionReason: string | null;
    correctionInstructions: string | null;
    submittedAt: DateValue | null;
    reviewedAt: DateValue | null;
    createdAt: DateValue;
    updatedAt: DateValue;
    documents: OwnerDocumentSource[];
    findings: Array<{
      reviewRound: number;
      key: string;
      label: string;
      status: VerificationFindingStatus;
      note: string | null;
      createdAt: DateValue;
      reviewerId?: string;
    }>;
    timeline: Array<{
      kind: "decision" | "resubmission";
      reviewRound: number;
      status: VerificationSubmissionStatus;
      reason: string;
      correctionInstructions: string | null;
      createdAt: DateValue;
    }>;
  };
};

export type OwnerVerificationWorkspaceDto = ReturnType<typeof toOwnerVerificationWorkspaceDto>;

function requirementsFor(profile: OwnerProfileSource): DocumentRequirement[] {
  return profile.role === "Tenant"
    ? getOnboardingDocumentRequirements({ role: "Tenant", employmentType: profile.tenantProfile?.employmentType })
    : getOnboardingDocumentRequirements({ role: "Landlord" });
}

export function toOwnerVerificationWorkspaceDto(source: OwnerVerificationSource) {
  const requirements = requirementsFor(source.profile);
  const activeDocuments = source.submission?.documents.filter(
    (document) => Boolean(document.storageKey && !document.uploadIntentId && !document.deletedAt && !document.supersededAt),
  ) ?? [];
  const nin = source.profile.tenantProfile?.ninNumber ?? source.profile.landlordProfile?.ninNumber ?? null;
  const payout = source.profile.landlordProfile?.accountNumber ?? null;
  const requirementDtos = requirements.map((requirement) => ({
    ...requirement,
    satisfied: activeDocuments.some((document) => requirement.acceptedKinds.includes(document.kind)),
  }));
  const { tenantProfile, landlordProfile } = source.profile;

  return {
    profile: {
      id: source.profile.id,
      email: source.profile.email,
      firstName: source.profile.firstName,
      lastName: source.profile.lastName,
      phone: source.profile.phone,
      location: source.profile.location,
      role: source.profile.role,
      accountStatus: source.profile.accountStatus,
      verificationLevel: source.profile.verificationLevel,
      emailVerified: source.profile.emailVerified,
      onboardingComplete: source.profile.onboardingComplete,
      tenantProfile: tenantProfile ? {
        employmentType: tenantProfile.employmentType,
        employerName: tenantProfile.employerName,
        jobTitle: tenantProfile.jobTitle,
        incomeRange: tenantProfile.incomeRange,
        preferredLocations: tenantProfile.preferredLocations,
        preferredTypes: tenantProfile.preferredTypes,
        budgetMin: tenantProfile.budgetMin,
        budgetMax: tenantProfile.budgetMax,
        moveInDate: tenantProfile.moveInDate,
        ninStatus: tenantProfile.ninStatus,
      } : null,
      landlordProfile: landlordProfile ? {
        businessName: landlordProfile.businessName,
        propertyCount: landlordProfile.propertyCount,
        propertyTypesOffered: landlordProfile.propertyTypesOffered,
        ninStatus: landlordProfile.ninStatus,
        bankName: landlordProfile.bankName,
        accountName: landlordProfile.accountName,
      } : null,
      sensitive: {
        nin: { available: Boolean(nin), masked: maskSensitiveValue(nin) },
        payoutAccount: { available: Boolean(payout), masked: maskSensitiveValue(payout) },
      },
    },
    storage: { configured: source.storageConfigured, blocked: !source.storageConfigured },
    requirements: requirementDtos,
    canResubmit: source.submission?.status === "NeedsChanges" && requirementDtos.every((item) => item.satisfied),
    current: source.submission ? {
      id: source.submission.id,
      type: source.submission.type,
      status: source.submission.status,
      documentType: source.submission.documentType,
      reviewRound: source.submission.reviewRound,
      decisionReason: source.submission.decisionReason,
      correctionInstructions: source.submission.correctionInstructions,
      submittedAt: source.submission.submittedAt,
      reviewedAt: source.submission.reviewedAt,
      createdAt: source.submission.createdAt,
      updatedAt: source.submission.updatedAt,
      documents: source.submission.documents.map((document) => ({
        id: document.id,
        kind: document.kind,
        fileName: document.fileName,
        mimeType: document.mimeType,
        size: document.size,
        revision: document.revision,
        uploaded: Boolean(document.storageKey && !document.uploadIntentId && !document.deletedAt),
        supersededAt: document.supersededAt,
        deletedAt: document.deletedAt,
        createdAt: document.createdAt,
      })),
      findings: source.submission.findings.map((finding) => ({
        reviewRound: finding.reviewRound,
        key: finding.key,
        label: finding.label,
        status: finding.status,
        note: finding.note,
        createdAt: finding.createdAt,
      })),
      timeline: source.submission.timeline,
    } : null,
  };
}
