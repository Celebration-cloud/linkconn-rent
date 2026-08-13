import type {
  AccountStatus,
  AppRole,
  VerificationDocumentKind,
  VerificationFindingStatus,
  VerificationSubmissionStatus,
  VerificationSubmissionType,
  VerificationLevel,
} from "@prisma/client";

export const VERIFICATION_FINDINGS = {
  identity_match: "Identity matches the account",
  document_validity: "Evidence is valid and readable",
  profile_consistency: "Account facts are internally consistent",
  ownership_evidence: "Ownership evidence supports the claim",
  property_match: "Evidence matches the linked property",
} as const;

export type VerificationFindingKey = keyof typeof VERIFICATION_FINDINGS;

const REQUIRED_FINDINGS: Record<VerificationSubmissionType, readonly VerificationFindingKey[]> = {
  Identity: ["identity_match", "document_validity", "profile_consistency"],
  PropertyOwnership: ["ownership_evidence", "property_match", "document_validity"],
};

export function requiredVerificationFindingKeys(type: VerificationSubmissionType) {
  return REQUIRED_FINDINGS[type];
}

export function maskSensitiveValue(value: string | null | undefined) {
  if (!value) return null;
  if (value.length <= 4) return "*".repeat(value.length);
  return `${"*".repeat(value.length - 4)}${value.slice(-4)}`;
}

export type DateValue = Date | string;

type Person = { id: string; firstName: string; lastName: string };

export type VerificationReviewSource = {
  id: string;
  type: VerificationSubmissionType;
  status: VerificationSubmissionStatus;
  reviewRound: number;
  correctionInstructions: string | null;
  submittedAt: DateValue | null;
  reviewedAt: DateValue | null;
  createdAt: DateValue;
  updatedAt: DateValue;
  owner: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
    role: AppRole;
    accountStatus: AccountStatus;
    verificationLevel: VerificationLevel;
    emailVerified: boolean;
    onboardingComplete: boolean;
    tenantProfile: {
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
    } | null;
    landlordProfile: {
      businessName: string | null;
      propertyCount: number;
      propertyTypesOffered: string[];
      ninStatus: string;
      ninNumber: string | null;
      bankName: string | null;
      accountNumber: string | null;
      accountName: string | null;
    } | null;
  };
  property: { id: string; title: string } | null;
  assignedTo: Person | null;
  reviewedBy: Person | null;
  documents: Array<{
    id: string;
    kind: VerificationDocumentKind;
    fileName: string | null;
    storageKey: string | null;
    mimeType: string | null;
    size: number | null;
    revision: number;
    supersededAt: DateValue | null;
    deletedAt: DateValue | null;
    createdAt: DateValue;
  }>;
  findings: Array<{
    id: string;
    reviewRound: number;
    key: string;
    label: string;
    status: VerificationFindingStatus;
    note: string | null;
    createdAt: DateValue;
    reviewer: Person;
  }>;
  linked: {
    properties: number;
    applications: number;
    payments: number;
    maintenance: number;
  };
  auditHistory: Array<{
    id: string;
    action: string;
    reason: string;
    createdAt: DateValue;
    actor: Person;
  }>;
};

export interface VerificationReviewSummaryDto {
  id: string;
  type: VerificationSubmissionType;
  status: VerificationSubmissionStatus;
  reviewRound: number;
  owner: Pick<VerificationReviewSource["owner"], "id" | "firstName" | "lastName" | "email" | "role">;
  property: VerificationReviewSource["property"];
  assignedTo: Person | null;
  evidence: { total: number; active: number; superseded: number; unavailable: number };
  submittedAt: DateValue | null;
  updatedAt: DateValue;
}

export interface VerificationReviewDetailDto extends VerificationReviewSummaryDto {
  correctionInstructions: string | null;
  reviewedAt: DateValue | null;
  owner: VerificationReviewSummaryDto["owner"] & {
    phone: string | null;
    accountStatus: AccountStatus;
    verificationLevel: VerificationLevel;
    emailVerified: boolean;
    onboardingComplete: boolean;
    tenantProfile: Omit<NonNullable<VerificationReviewSource["owner"]["tenantProfile"]>, "ninNumber"> | null;
    landlordProfile: Omit<NonNullable<VerificationReviewSource["owner"]["landlordProfile"]>, "ninNumber" | "accountNumber"> | null;
    sensitive: {
      nin: { available: boolean; masked: string | null };
      payoutAccount: { available: boolean; masked: string | null };
    };
  };
  privateEvidenceAvailable: boolean;
  documents: Array<{
    id: string;
    kind: VerificationDocumentKind;
    fileName: string | null;
    mimeType: string | null;
    size: number | null;
    revision: number;
    supersededAt: DateValue | null;
    deletedAt: DateValue | null;
    createdAt: DateValue;
    accessHref: string;
  }>;
  findings: VerificationReviewSource["findings"];
  linked: VerificationReviewSource["linked"];
  reviewedBy: Person | null;
  auditHistory: VerificationReviewSource["auditHistory"];
}

function evidenceSummary(documents: Array<{ deletedAt: DateValue | null; supersededAt: DateValue | null }>) {
  return documents.reduce(
    (summary, document) => {
      summary.total += 1;
      if (document.deletedAt) summary.unavailable += 1;
      else if (document.supersededAt) summary.superseded += 1;
      else summary.active += 1;
      return summary;
    },
    { total: 0, active: 0, superseded: 0, unavailable: 0 },
  );
}

export function toVerificationReviewSummaryDto(
  source: Pick<VerificationReviewSource, "id" | "type" | "status" | "reviewRound" | "property" | "assignedTo" | "submittedAt" | "updatedAt"> & {
    owner: Pick<VerificationReviewSource["owner"], "id" | "firstName" | "lastName" | "email" | "role">;
    documents: Array<Pick<VerificationReviewSource["documents"][number], "deletedAt" | "supersededAt">>;
  },
): VerificationReviewSummaryDto {
  return {
    id: source.id,
    type: source.type,
    status: source.status,
    reviewRound: source.reviewRound,
    owner: {
      id: source.owner.id,
      firstName: source.owner.firstName,
      lastName: source.owner.lastName,
      email: source.owner.email,
      role: source.owner.role,
    },
    property: source.property,
    assignedTo: source.assignedTo,
    evidence: evidenceSummary(source.documents),
    submittedAt: source.submittedAt,
    updatedAt: source.updatedAt,
  };
}

export function toVerificationReviewDetailDto(
  source: VerificationReviewSource,
  options: { canViewPrivateEvidence: boolean },
): VerificationReviewDetailDto {
  const ninNumber = source.owner.tenantProfile?.ninNumber ?? source.owner.landlordProfile?.ninNumber ?? null;
  const accountNumber = source.owner.landlordProfile?.accountNumber ?? null;
  const { tenantProfile, landlordProfile } = source.owner;
  return {
    ...toVerificationReviewSummaryDto(source),
    correctionInstructions: source.correctionInstructions,
    reviewedAt: source.reviewedAt,
    owner: {
      id: source.owner.id,
      firstName: source.owner.firstName,
      lastName: source.owner.lastName,
      email: source.owner.email,
      role: source.owner.role,
      phone: source.owner.phone,
      accountStatus: source.owner.accountStatus,
      verificationLevel: source.owner.verificationLevel,
      emailVerified: source.owner.emailVerified,
      onboardingComplete: source.owner.onboardingComplete,
      tenantProfile: tenantProfile
        ? {
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
          }
        : null,
      landlordProfile: landlordProfile
        ? {
            businessName: landlordProfile.businessName,
            propertyCount: landlordProfile.propertyCount,
            propertyTypesOffered: landlordProfile.propertyTypesOffered,
            ninStatus: landlordProfile.ninStatus,
            bankName: landlordProfile.bankName,
            accountName: landlordProfile.accountName,
          }
        : null,
      sensitive: {
        nin: {
          available: Boolean(ninNumber),
          masked: options.canViewPrivateEvidence ? maskSensitiveValue(ninNumber) : null,
        },
        payoutAccount: {
          available: Boolean(accountNumber),
          masked: options.canViewPrivateEvidence ? maskSensitiveValue(accountNumber) : null,
        },
      },
    },
    privateEvidenceAvailable: options.canViewPrivateEvidence && source.documents.some((document) => Boolean(document.storageKey && !document.deletedAt)),
    documents: options.canViewPrivateEvidence
      ? source.documents.map((document) => ({
          id: document.id,
          kind: document.kind,
          fileName: document.fileName,
          mimeType: document.mimeType,
          size: document.size,
          revision: document.revision,
          supersededAt: document.supersededAt,
          deletedAt: document.deletedAt,
          createdAt: document.createdAt,
          accessHref: `/api/admin/verifications/${source.id}/documents/${document.id}`,
        }))
      : [],
    findings: source.findings.map((finding) => ({
      id: finding.id,
      reviewRound: finding.reviewRound,
      key: finding.key,
      label: finding.label,
      status: finding.status,
      note: finding.note,
      createdAt: finding.createdAt,
      reviewer: {
        id: finding.reviewer.id,
        firstName: finding.reviewer.firstName,
        lastName: finding.reviewer.lastName,
      },
    })),
    linked: source.linked,
    reviewedBy: source.reviewedBy,
    auditHistory: source.auditHistory,
  };
}
