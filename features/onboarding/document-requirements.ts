import type { VerificationDocumentKind } from "@prisma/client";

export type DocumentRequirement = {
  id: string;
  label: string;
  description: string;
  acceptedKinds: readonly VerificationDocumentKind[];
};

const SHARED_REQUIREMENTS: readonly DocumentRequirement[] = [
  {
    id: "government-id",
    label: "Government-issued ID",
    description: "National ID, passport, voter card, or driving licence.",
    acceptedKinds: ["GovernmentId"],
  },
  {
    id: "selfie",
    label: "Current selfie",
    description: "A clear, recent photo of your face.",
    acceptedKinds: ["Selfie"],
  },
  {
    id: "proof-of-address",
    label: "Recent proof of address",
    description: "A utility bill or bank statement issued within three months.",
    acceptedKinds: ["ProofOfAddress"],
  },
];

const TENANT_EVIDENCE: Record<string, DocumentRequirement> = {
  Employed: {
    id: "employment-evidence",
    label: "Employment evidence",
    description: "Upload an employment letter or recent payslip.",
    acceptedKinds: ["EmploymentEvidence"],
  },
  SelfEmployed: {
    id: "self-employment-evidence",
    label: "Business or income evidence",
    description: "Upload a tax record, contract, invoice, or income evidence.",
    acceptedKinds: ["SelfEmploymentEvidence"],
  },
  Freelancer: {
    id: "freelance-evidence",
    label: "Contract or income evidence",
    description: "Upload a current contract, invoice, or income evidence.",
    acceptedKinds: ["SelfEmploymentEvidence"],
  },
  Student: {
    id: "student-evidence",
    label: "Student evidence",
    description: "Upload a student ID or admission letter.",
    acceptedKinds: ["StudentEvidence"],
  },
  Retired: {
    id: "retirement-evidence",
    label: "Pension evidence",
    description: "Upload a pension statement or retirement-income evidence.",
    acceptedKinds: ["RetirementEvidence"],
  },
  Unemployed: {
    id: "support-evidence",
    label: "Financial support evidence",
    description: "Upload guarantor or other financial-support evidence.",
    acceptedKinds: ["GuarantorEvidence"],
  },
};

const LANDLORD_CORE_REQUIREMENTS: readonly DocumentRequirement[] = [
  {
    id: "ownership-authority",
    label: "Ownership or management authority",
    description: "Upload proof of ownership or written authority to manage property.",
    acceptedKinds: ["PropertyOwnership", "ManagementAuthority"],
  },
  {
    id: "payout-evidence",
    label: "Payout account confirmation",
    description: "Upload a bank statement or account confirmation showing the payout account.",
    acceptedKinds: ["PayoutAccountEvidence"],
  },
];

function kindsFromRequirements(requirements: readonly DocumentRequirement[]) {
  return requirements.flatMap((requirement) => requirement.acceptedKinds);
}

const TENANT_ALLOWED_KINDS = new Set<VerificationDocumentKind>([
  ...kindsFromRequirements(SHARED_REQUIREMENTS),
  ...kindsFromRequirements(Object.values(TENANT_EVIDENCE)),
]);

const LANDLORD_ALLOWED_KINDS = new Set<VerificationDocumentKind>([
  ...kindsFromRequirements(SHARED_REQUIREMENTS),
  ...kindsFromRequirements(LANDLORD_CORE_REQUIREMENTS),
]);

export function getOnboardingDocumentRequirements(input:
  | { role: "Tenant"; employmentType?: string }
  | { role: "Landlord" },
): DocumentRequirement[] {
  if (input.role === "Tenant") {
    return [
      ...SHARED_REQUIREMENTS,
      TENANT_EVIDENCE[input.employmentType ?? "Employed"] ?? TENANT_EVIDENCE.Employed,
    ];
  }

  return [
    ...SHARED_REQUIREMENTS,
    ...LANDLORD_CORE_REQUIREMENTS,
  ];
}

export function getMissingDocumentRequirements(
  requirements: readonly DocumentRequirement[],
  uploadedKinds: readonly VerificationDocumentKind[],
): DocumentRequirement[] {
  const uploaded = new Set(uploadedKinds);
  return requirements.filter((requirement) =>
    requirement.acceptedKinds.every((kind) => !uploaded.has(kind)),
  );
}

export function isDocumentKindAllowedForRole(
  role: "Tenant" | "Landlord",
  kind: VerificationDocumentKind,
): boolean {
  return role === "Tenant"
    ? TENANT_ALLOWED_KINDS.has(kind)
    : LANDLORD_ALLOWED_KINDS.has(kind);
}
