"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Award,
  BadgeAlert,
  BadgeCheck,
  Briefcase,
  Building,
  Building2,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  CreditCard,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileCheck,
  FileCheck2,
  FileQuestion,
  FileSearch,
  FileText,
  FileX,
  GraduationCap,
  History,
  Home,
  IdCard,
  Info,
  Key,
  Landmark,
  Layers,
  Lock,
  MapPin,
  Maximize2,
  Minimize2,
  Phone,
  RefreshCw,
  RotateCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  UserCheck,
  Users,
  Wallet,
  Wrench,
  X,
  ZoomIn,
  ZoomOut,
  type LucideIcon,
} from "lucide-react";
import type {
  VerificationReviewDetailDto,
  VerificationReviewSummaryDto,
} from "@/features/verifications/review-contracts";
import {
  requiredVerificationFindingKeys,
  VERIFICATION_FINDINGS,
} from "@/features/verifications/review-contracts";
import type { VerificationDocumentKind } from "@prisma/client";
import { toastError, toastSuccess } from "@/stores/toast-store";
import { formatNaira } from "@/utils/map-property";

// ─────────────────────────────────────────────────────────────
// Document Categorization & Intelligence System
// ─────────────────────────────────────────────────────────────

export type DocumentCategory =
  | "Identity"
  | "Property Title"
  | "Income & Employment"
  | "Address Proof"
  | "Business & Corporate"
  | "Guarantor & Surety"
  | "Settlement & Banking"
  | "General Evidence";

export interface DocumentKindMeta {
  category: DocumentCategory;
  title: string;
  shortLabel: string;
  description: string;
  icon: LucideIcon;
  badgeTone: "indigo" | "emerald" | "amber" | "blue" | "purple" | "rose" | "teal";
  checks: string[];
}

export const DOCUMENT_KIND_REGISTRY: Record<VerificationDocumentKind, DocumentKindMeta> = {
  GovernmentId: {
    category: "Identity",
    title: "National Identity Card / Passport / Driver's License",
    shortLabel: "Government Photo ID",
    description: "NIN Slip, International Passport, Voter Card (INEC), or Driver's License.",
    icon: IdCard,
    badgeTone: "indigo",
    checks: [
      "Full legal name matches LinkConn account profile",
      "Document is currently valid and unexpired",
      "NIN or ID reference number is crisp and legible",
      "Photo is clear without digital tampering or glare",
    ],
  },
  Selfie: {
    category: "Identity",
    title: "Live Biometric / Liveness Photograph",
    shortLabel: "Biometric Liveness",
    description: "Real-time camera selfie to cross-reference against Government Photo ID.",
    icon: Camera,
    badgeTone: "indigo",
    checks: [
      "Facial features match the Government Photo ID",
      "Natural lighting without reflections, sunglasses, or masks",
      "No screenshot of a physical photograph",
    ],
  },
  ProofOfAddress: {
    category: "Address Proof",
    title: "Proof of Address (Utility Bill / Bank Statement)",
    shortLabel: "Utility / Address Proof",
    description: "Recent Electricity (EKEDC, IKEDC, AEDC, etc.), Water, Waste bill or Bank Statement.",
    icon: MapPin,
    badgeTone: "amber",
    checks: [
      "Issued within the last 3 months",
      "Physical address clearly displayed matching neighborhood",
      "Applicant name or valid tenancy relation listed",
    ],
  },
  EmploymentEvidence: {
    category: "Income & Employment",
    title: "Letter of Employment / Official Work ID Badge",
    shortLabel: "Employment Offer / Work ID",
    description: "Official employment contract, confirmation letter, or corporate ID badge.",
    icon: Briefcase,
    badgeTone: "emerald",
    checks: [
      "Official corporate letterhead and contact info",
      "Matches declared job title and income range",
      "Signature of HR / Managing Director present",
    ],
  },
  SelfEmploymentEvidence: {
    category: "Income & Employment",
    title: "CAC Business Registration / Tax Clearance Certificate",
    shortLabel: "Business Proof / CAC",
    description: "Certificate of Business Name or Limited Liability registration, TIN clearance.",
    icon: Building,
    badgeTone: "emerald",
    checks: [
      "Valid CAC BN / RC number verifiable on corporate registry",
      "Applicant listed as Proprietor, Director, or Shareholder",
      "Tax Identification Number (TIN) is legible",
    ],
  },
  StudentEvidence: {
    category: "Income & Employment",
    title: "Student Identity Card / Admission Letter",
    shortLabel: "Student ID / Admission",
    description: "Valid tertiary institution ID card or formal admission letter.",
    icon: GraduationCap,
    badgeTone: "blue",
    checks: [
      "Accredited Nigerian or foreign tertiary institution",
      "Valid matriculation number and active academic session",
    ],
  },
  RetirementEvidence: {
    category: "Income & Employment",
    title: "Pension Statement / Formal Retirement Letter",
    shortLabel: "Pension / Retirement Letter",
    description: "Pension Fund Administrator (PFA) statement or employer retirement notification.",
    icon: Award,
    badgeTone: "teal",
    checks: [
      "Verifiable Pension Fund Administrator header",
      "Consistent payout schedule confirming solvency",
    ],
  },
  GuarantorEvidence: {
    category: "Guarantor & Surety",
    title: "Guarantor Letter of Undertaking & ID",
    shortLabel: "Guarantor Undertaking & ID",
    description: "Signed letter of financial undertaking with attached guarantor government ID.",
    icon: UserCheck,
    badgeTone: "purple",
    checks: [
      "Guarantor signature clearly matches attached ID",
      "Guarantor employment & residential details verified",
    ],
  },
  PropertyOwnership: {
    category: "Property Title",
    title: "Certificate of Occupancy (C of O) / Deed of Assignment",
    shortLabel: "C of O / Deed of Assignment",
    description: "Governor's Consent, C of O, Registered Deed of Assignment, or Gazette.",
    icon: Home,
    badgeTone: "rose",
    checks: [
      "Property address matches the listed rental property",
      "Grantor and Grantee names correctly identify the landlord",
      "Land registry stamp, folio number, or survey plan verified",
      "Owner is verified as legal titleholder or heir",
    ],
  },
  ManagementAuthority: {
    category: "Property Title",
    title: "Letter of Authority to Manage / Power of Attorney",
    shortLabel: "Power of Attorney / Mandate",
    description: "Legal Power of Attorney or management contract from the titleholder.",
    icon: Key,
    badgeTone: "rose",
    checks: [
      "Signed by the verified titleholder",
      "Explicitly empowers agent / manager to lease and collect rent",
      "Mandate duration is currently active",
    ],
  },
  PayoutAccountEvidence: {
    category: "Settlement & Banking",
    title: "Bank Statement Header / Account Confirmation Letter",
    shortLabel: "Bank Settlement Proof",
    description: "Official bank statement header showing NUBAN account name and number.",
    icon: Landmark,
    badgeTone: "blue",
    checks: [
      "Account name exactly matches registered landlord name",
      "10-digit NUBAN and CBN-licensed commercial bank verified",
    ],
  },
  BusinessRegistration: {
    category: "Business & Corporate",
    title: "CAC Certificate of Incorporation (RC / BN Status)",
    shortLabel: "CAC Incorporation Certificate",
    description: "Corporate Affairs Commission (CAC) Status Report or Incorporation Certificate.",
    icon: Building2,
    badgeTone: "emerald",
    checks: [
      "Verify RC / BN registration number on CAC portal",
      "Check registered office address in Nigeria",
      "Confirm authorized directors and signatories",
    ],
  },
};

export function getDocumentMeta(kind: VerificationDocumentKind): DocumentKindMeta {
  return (
    DOCUMENT_KIND_REGISTRY[kind] || {
      category: "General Evidence",
      title: "Supporting Document File",
      shortLabel: kind,
      description: "Supporting documentation uploaded by applicant.",
      icon: FileText,
      badgeTone: "blue",
      checks: ["Verify authenticity and relevance to application"],
    }
  );
}

// ─────────────────────────────────────────────────────────────
// Formatters & Presets
// ─────────────────────────────────────────────────────────────

interface PageData {
  items: VerificationReviewSummaryDto[];
  pagination: { page: number; pageSize: number; totalItems: number; totalPages: number };
}

function formatDate(value: Date | string | null | undefined) {
  if (!value) return "Not recorded";
  return new Date(value).toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatRelativeTime(value: Date | string | null | undefined) {
  if (!value) return "Unknown";
  const date = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const PRESET_CORRECTIONS = [
  { label: "Blurry / Unreadable", note: "The uploaded document is blurry or unreadable. Please provide a clear, high-resolution photo or scan." },
  { label: "Expired ID", note: "The submitted document has expired. Please upload a currently valid government-issued ID." },
  { label: "Name Mismatch", note: "The name on the document does not match your LinkConn account profile name. Please upload matching identification." },
  { label: "Back Side Missing", note: "Both front and back sides of the card are required for verification. Please upload both pages." },
  { label: "Utility Bill Too Old", note: "Proof of address must be dated within the last 3 months. Please upload a recent utility bill or bank statement." },
  { label: "Deed Address Mismatch", note: "The address on the title deed does not match the listed property unit. Please attach the correct deed of assignment." },
];

// ─────────────────────────────────────────────────────────────
// Main Component: 2-Tier Layout
// Tier 1: Submission Queue (Left) + Applicant Dossier & Decision Matrix (Right)
// Tier 2: Dedicated Full-Width Document Evidence & Inspection Hub (Bottom)
// ─────────────────────────────────────────────────────────────

export function AdminVerificationWorkspace({
  data,
  detail,
  query,
  canRevealSensitive,
}: {
  data: PageData;
  detail: VerificationReviewDetailDto | null;
  query: { status?: string; query?: string; item?: string };
  canRevealSensitive: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [searchTerm, setSearchTerm] = useState(query.query ?? "");
  const [reason, setReason] = useState("");
  const [instructions, setInstructions] = useState("");
  const [decision, setDecision] = useState<"approve" | "reject" | "request_changes">("approve");
  const [revealed, setRevealed] = useState<{ nin: string | null; payoutAccount: string | null } | null>(null);

  // Document inspection states
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [highContrast, setHighContrast] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeDossierTab, setActiveDossierTab] = useState<"kyc" | "profile" | "activity" | "history">("kyc");
  const [completedDocChecks, setCompletedDocChecks] = useState<Record<string, boolean>>({});

  const requiredKeys = detail ? requiredVerificationFindingKeys(detail.type) : [];
  const [findings, setFindings] = useState<Record<string, "Approved" | "NeedsChanges">>(() =>
    Object.fromEntries(requiredKeys.map((key) => [key, "Approved"]))
  );

  const activeDoc = useMemo(() => {
    if (!detail || !detail.documents.length) return null;
    return detail.documents[selectedDocIndex] || detail.documents[0];
  }, [detail, selectedDocIndex]);

  const activeDocMeta = useMemo(() => {
    if (!activeDoc) return null;
    return getDocumentMeta(activeDoc.kind);
  }, [activeDoc]);

  // Status counts
  const counts = useMemo(() => {
    return {
      pending: data.items.filter((i) => i.status === "Pending").length,
      needsChanges: data.items.filter((i) => i.status === "NeedsChanges").length,
      approved: data.items.filter((i) => i.status === "Approved").length,
      rejected: data.items.filter((i) => i.status === "Rejected").length,
    };
  }, [data.items]);

  function itemHref(id: string) {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.query) params.set("query", query.query);
    params.set("item", id);
    return `/admin/verifications?${params.toString()}`;
  }

  function filterStatusHref(status?: string) {
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (query.query) params.set("query", query.query);
    return `/admin/verifications?${params.toString()}`;
  }

  async function revealSensitive() {
    if (!detail) return;
    const response = await fetch(`/api/admin/verifications/${detail.id}/sensitive`, { cache: "no-store" });
    const result = (await response.json()) as {
      success: boolean;
      data?: { nin: string | null; payoutAccount: string | null };
      message: string;
    };
    if (!response.ok || !result.success || !result.data) {
      return toastError("Reveal unavailable", result.message);
    }
    setRevealed(result.data);
    toastSuccess("Sensitive values revealed", "This access was recorded in the compliance audit ledger.");
  }

  async function submitDecision() {
    if (!detail) return;
    if (decision === "request_changes" && !instructions.trim() && !reason.trim()) {
      return toastError("Missing instructions", "Please provide specific correction instructions for the user.");
    }
    if (decision === "reject" && !reason.trim()) {
      return toastError("Missing reason", "Please provide a rejection reason for the audit ledger.");
    }

    const response = await fetch(`/api/admin/verifications/${detail.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: decision,
        reason: reason || "Reviewed and verified by compliance specialist",
        ...(decision === "request_changes" ? { correctionInstructions: instructions || reason } : {}),
        findings: requiredKeys.map((key) => ({
          key,
          status: findings[key] ?? "Approved",
          ...(findings[key] === "NeedsChanges" ? { note: instructions || reason } : {}),
        })),
      }),
    });
    const result = (await response.json()) as { success: boolean; message: string };
    if (!response.ok || !result.success) {
      return toastError("Decision not saved", result.message);
    }
    toastSuccess("Verification updated", result.message);
    startTransition(() => router.refresh());
  }

  function applyPreset(preset: (typeof PRESET_CORRECTIONS)[0]) {
    setDecision("request_changes");
    setInstructions((prev) => (prev ? `${prev}\n• ${preset.note}` : `• ${preset.note}`));
    setReason((prev) => (prev ? `${prev}, ${preset.label}` : preset.label));
  }

  const toggleCheck = (checkText: string) => {
    setCompletedDocChecks((prev) => ({
      ...prev,
      [checkText]: !prev[checkText],
    }));
  };

  return (
    <div className="admin-canvas min-w-0 space-y-6">
      {/* ─────────────────────────────────────────────────────────────
          1. Header & Operational Metrics Telemetry
      ───────────────────────────────────────────────────────────── */}
      <header className="admin-page-heading">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-forest-100 px-3 py-0.5 text-xs font-black text-forest-900">
              <ShieldCheck className="size-3.5 text-forest-700" />
              Trust & Compliance Studio
            </span>
            <span className="text-xs font-semibold text-muted">Document Categorization & Title Audit</span>
          </div>
          <h1 className="mt-1">Verification Queue</h1>
          <p>
            Review applicant identities and title credentials. The top tier handles queue routing and decision ledger actions, while the dedicated hub below provides document categorization and high-resolution evidence inspection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 bg-white border border-[#d6ddd5] px-4 py-2.5 shadow-xs">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-muted">Total Submissions</p>
              <p className="text-xl font-black text-forest-950 tabular-nums">{data.pagination.totalItems}</p>
            </div>
            <div className="h-8 w-px bg-line" />
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700">Urgent Pending</p>
              <p className="text-xl font-black text-amber-800 tabular-nums">{counts.pending}</p>
            </div>
            <div className="h-8 w-px bg-line" />
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-700">Approved</p>
              <p className="text-xl font-black text-emerald-800 tabular-nums">{counts.approved}</p>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────
          2. Filter Bar with Segmented Pills & Search
      ───────────────────────────────────────────────────────────── */}
      <div className="border border-[#d6ddd5] bg-white p-3 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { label: "All Items", value: undefined, count: data.pagination.totalItems },
              { label: "Pending Review", value: "Pending", count: counts.pending, tone: "amber" },
              { label: "Needs Changes", value: "NeedsChanges", count: counts.needsChanges, tone: "amber" },
              { label: "Approved", value: "Approved", count: counts.approved, tone: "green" },
              { label: "Rejected", value: "Rejected", count: counts.rejected, tone: "red" },
            ].map(({ label, value, count, tone }) => {
              const active = query.status === value || (!query.status && value === undefined);
              return (
                <Link
                  key={label}
                  href={filterStatusHref(value)}
                  className={`inline-flex items-center gap-2 px-3 py-1.5 text-xs font-bold transition ${
                    active
                      ? "bg-forest-950 text-white shadow-xs"
                      : "bg-[#f4f6f3] text-muted hover:bg-[#e9eee7] hover:text-ink"
                  }`}
                >
                  <span>{label}</span>
                  {count !== undefined && count > 0 && (
                    <span
                      className={`min-w-5 rounded px-1.5 py-0.2 text-center text-[10px] font-black tabular-nums ${
                        active
                          ? "bg-lime text-forest-950"
                          : tone === "amber"
                          ? "bg-amber-100 text-amber-900"
                          : tone === "green"
                          ? "bg-emerald-100 text-emerald-900"
                          : "bg-sand-200 text-ink"
                      }`}
                    >
                      {count}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Search Box */}
          <form method="get" className="flex items-center gap-2">
            {query.status && <input type="hidden" name="status" value={query.status} />}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted pointer-events-none" />
              <input
                type="text"
                name="query"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search applicant name, email..."
                className="w-full bg-[#f8faf7] border border-[#d6ddd5] pl-9 pr-8 py-1.5 text-xs font-medium text-ink placeholder:text-muted focus:bg-white focus:border-forest-700 focus:outline-none"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchTerm("");
                    router.push(filterStatusHref(query.status));
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <button type="submit" className="stitch-button py-1.5 text-xs">
              Filter
            </button>
          </form>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TIER 1: 2-Column Row: Submission Queue (Left) & Applicant Dossier + Decision Console (Right)
      ───────────────────────────────────────────────────────────── */}
      <div className="grid min-w-0 border border-[#d6ddd5] bg-[#eaeee9] gap-px lg:grid-cols-[22rem_minmax(0,1fr)] shadow-sm">
        
        {/* ========================================================= */}
        {/* Tier 1 - Column 1: Submission Queue */}
        {/* ========================================================= */}
        <section className="flex flex-col bg-white min-w-0" aria-label="Verification submission queue">
          <div className="border-b border-[#eaeee9] bg-[#f8faf7] px-4 py-3 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted">Submission Queue</h2>
              <p className="text-[11px] text-muted">Showing {data.items.length} records</p>
            </div>
            <span className="text-[11px] font-bold text-forest-800 tabular-nums">
              Page {data.pagination.page} of {data.pagination.totalPages}
            </span>
          </div>

          <div className="divide-y divide-[#eaeee9] overflow-y-auto max-h-[38rem]">
            {data.items.length ? (
              data.items.map((item) => {
                const isSelected = detail?.id === item.id;
                const isLandlord = item.owner.role === "Landlord" || item.owner.role === "PropertyManager";
                return (
                  <Link
                    key={item.id}
                    href={itemHref(item.id)}
                    aria-current={isSelected ? "true" : undefined}
                    className={`group block p-4 transition-all ${
                      isSelected
                        ? "bg-forest-950 text-white shadow-md ring-1 ring-forest-900"
                        : "hover:bg-[#f6f9f5] bg-white text-ink"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className={`size-9 shrink-0 grid place-items-center text-xs font-black uppercase ${
                            isSelected
                              ? "bg-lime text-forest-950"
                              : isLandlord
                              ? "bg-forest-100 text-forest-900"
                              : "bg-sand-200 text-ink"
                          }`}
                        >
                          {item.owner.firstName[0]}
                          {item.owner.lastName[0]}
                        </div>
                        <div className="min-w-0">
                          <strong className={`block truncate text-sm font-extrabold ${isSelected ? "text-white" : "text-forest-950"}`}>
                            {item.owner.firstName} {item.owner.lastName}
                          </strong>
                          <span className={`block truncate text-xs ${isSelected ? "text-forest-300" : "text-muted"}`}>
                            {item.owner.email}
                          </span>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <span className="inline-flex items-center gap-1 rounded bg-lime/20 border border-lime/30 px-2 py-0.5 text-[10px] font-black text-lime">
                            Active
                          </span>
                        ) : item.status === "Approved" ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                            <CheckCircle2 className="size-3 text-emerald-600" /> Approved
                          </span>
                        ) : item.status === "NeedsChanges" ? (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                            <AlertTriangle className="size-3 text-amber-600" /> Changes
                          </span>
                        ) : item.status === "Rejected" ? (
                          <span className="inline-flex items-center gap-1 rounded bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-bold text-red-800">
                            <FileX className="size-3 text-red-600" /> Rejected
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-forest-50 border border-forest-200 px-2 py-0.5 text-[10px] font-bold text-forest-900">
                            <Clock className="size-3 text-forest-600" /> Pending
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Metadata & Tag Badges */}
                    <div className="mt-3 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 text-[10px] font-bold ${
                          isSelected
                            ? "bg-white/15 text-sand-100"
                            : item.type === "PropertyOwnership"
                            ? "bg-rose-50 text-rose-900 border border-rose-200"
                            : "bg-indigo-50 text-indigo-900 border border-indigo-200"
                        }`}>
                          {item.type === "PropertyOwnership" ? "Title Deed" : "National ID"}
                        </span>
                        <span className={`text-[10px] font-semibold ${isSelected ? "text-forest-300" : "text-muted"}`}>
                          Round {item.reviewRound}
                        </span>
                      </div>

                      <span className={`flex items-center gap-1 text-[10px] tabular-nums ${isSelected ? "text-forest-300" : "text-muted"}`}>
                        <Clock className="size-3" />
                        {formatRelativeTime(item.submittedAt)}
                      </span>
                    </div>

                    {item.property && (
                      <div className={`mt-2 flex items-center gap-1.5 text-xs truncate ${
                        isSelected ? "text-forest-200" : "text-forest-800 font-semibold"
                      }`}>
                        <Building2 className="size-3.5 shrink-0" />
                        <span className="truncate">{item.property.title}</span>
                      </div>
                    )}
                  </Link>
                );
              })
            ) : (
              <div className="p-10 text-center">
                <FileSearch className="mx-auto size-8 text-muted" />
                <p className="mt-3 text-sm font-extrabold text-ink">No submissions in queue</p>
                <p className="mt-1 text-xs text-muted">Clear the search or status filter to see all submissions.</p>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================= */}
        {/* Tier 1 - Column 2: Applicant Dossier & Decision Matrix */}
        {/* ========================================================= */}
        <aside className="flex flex-col bg-white min-w-0" aria-label="Applicant dossier and decision matrix">
          <div className="border-b border-[#eaeee9] bg-[#f8faf7] px-4 py-3 flex items-center justify-between">
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-muted">Applicant Dossier & Decision Matrix</h2>
              <p className="text-[11px] text-muted">KYC credentials & compliance decision</p>
            </div>
            {detail && (
              <span className="text-xs font-extrabold">
                {detail.status === "Approved" ? (
                  <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 border border-emerald-200">Approved</span>
                ) : detail.status === "NeedsChanges" ? (
                  <span className="text-amber-800 bg-amber-50 px-2 py-0.5 border border-amber-200">Needs Changes</span>
                ) : detail.status === "Rejected" ? (
                  <span className="text-red-800 bg-red-50 px-2 py-0.5 border border-red-200">Rejected</span>
                ) : (
                  <span className="text-forest-900 bg-forest-50 px-2 py-0.5 border border-forest-200">In Review</span>
                )}
              </span>
            )}
          </div>

          {!detail ? (
            <div className="p-12 text-center my-auto">
              <User className="mx-auto size-10 text-muted" />
              <p className="mt-3 text-sm font-bold text-ink">No applicant selected</p>
              <p className="text-xs text-muted mt-1">Select an applicant from the queue on the left to inspect their dossier.</p>
            </div>
          ) : (
            <div className="p-5 space-y-5 overflow-y-auto max-h-[38rem]">
              
              {/* Applicant Header Banner & Sensitive Vault */}
              <div className="grid sm:grid-cols-2 gap-4">
                {/* Applicant Summary */}
                <div className="border border-[#d6ddd5] bg-[#f8faf7] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1 bg-forest-100 px-2 py-0.5 text-[11px] font-black text-forest-900">
                      <UserCheck className="size-3 text-forest-700" />
                      {detail.owner.role}
                    </span>
                    <span className="text-[11px] font-bold text-muted">
                      Tier: <strong className="text-forest-950">{detail.owner.verificationLevel}</strong>
                    </span>
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-forest-950">
                      {detail.owner.firstName} {detail.owner.lastName}
                    </h3>
                    <p className="text-xs text-muted">{detail.owner.email}</p>
                    {detail.owner.phone && <p className="text-xs font-mono text-muted">{detail.owner.phone}</p>}
                  </div>
                </div>

                {/* Sensitive Credentials Vault */}
                <div className="border border-[#d6ddd5] bg-white p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-forest-950 flex items-center gap-1.5">
                      <Lock className="size-3 text-forest-700" />
                      Sensitive Credentials
                    </h4>
                    <span className="text-[10px] text-muted">NDPR Vault</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between items-center py-1 border-b border-[#eaeee9]">
                      <span className="text-muted">NIN Number:</span>
                      <strong className="font-mono text-xs text-ink">
                        {revealed?.nin ??
                          detail.owner.sensitive.nin.masked ??
                          (detail.owner.sensitive.nin.available ? "Restricted" : "Not supplied")}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-[#eaeee9]">
                      <span className="text-muted">Settlement Account:</span>
                      <strong className="font-mono text-xs text-ink">
                        {revealed?.payoutAccount ??
                          detail.owner.sensitive.payoutAccount.masked ??
                          (detail.owner.sensitive.payoutAccount.available ? "Restricted" : "Not supplied")}
                      </strong>
                    </div>
                  </div>

                  {canRevealSensitive &&
                  (detail.owner.sensitive.nin.available || detail.owner.sensitive.payoutAccount.available) &&
                  !revealed ? (
                    <button
                      type="button"
                      onClick={() => void revealSensitive()}
                      className="w-full bg-[#edf1eb] hover:bg-forest-900 hover:text-white text-forest-900 border border-[#d6ddd5] py-1.5 text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Eye className="size-3.5" /> Reveal Full Values (Audited)
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Outstanding Correction Note */}
              {detail.correctionInstructions && (
                <div className="border border-amber-300 bg-amber-50 p-3.5 text-xs text-amber-950">
                  <strong className="flex items-center gap-1.5 font-extrabold text-amber-900">
                    <AlertTriangle className="size-3.5 text-amber-700" />
                    Active Correction Instructions:
                  </strong>
                  <p className="mt-1 leading-relaxed">{detail.correctionInstructions}</p>
                </div>
              )}

              {/* Dossier Tabs & Platform History */}
              <div className="border border-[#d6ddd5] bg-white">
                <div className="flex border-b border-[#d6ddd5] bg-[#f8faf7] text-xs font-bold">
                  {[
                    { id: "kyc" as const, label: "Identity & Account" },
                    { id: "profile" as const, label: "Role Details" },
                    { id: "activity" as const, label: "Platform Activity" },
                    { id: "history" as const, label: "Audit Findings" },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setActiveDossierTab(tab.id)}
                      className={`flex-1 py-2 text-center transition ${
                        activeDossierTab === tab.id
                          ? "bg-white text-forest-950 border-b-2 border-forest-900 font-extrabold"
                          : "text-muted hover:text-ink"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="p-3.5 text-xs">
                  {/* Tab 1: KYC Facts */}
                  {activeDossierTab === "kyc" && (
                    <dl className="divide-y divide-[#eaeee9]">
                      <div className="py-2 flex justify-between">
                        <dt className="text-muted font-semibold">Account Status</dt>
                        <dd className="font-bold text-ink">{detail.owner.accountStatus}</dd>
                      </div>
                      <div className="py-2 flex justify-between">
                        <dt className="text-muted font-semibold">Email Verified</dt>
                        <dd className="font-bold text-emerald-800">
                          {detail.owner.emailVerified ? "Yes (Confirmed)" : "Pending"}
                        </dd>
                      </div>
                      <div className="py-2 flex justify-between">
                        <dt className="text-muted font-semibold">Submission Date</dt>
                        <dd className="font-medium text-ink">{formatDate(detail.submittedAt)}</dd>
                      </div>
                      <div className="py-2 flex justify-between">
                        <dt className="text-muted font-semibold">Assigned Operator</dt>
                        <dd className="font-bold text-forest-950">
                          {detail.assignedTo ? `${detail.assignedTo.firstName} ${detail.assignedTo.lastName}` : "Operations Pool"}
                        </dd>
                      </div>
                    </dl>
                  )}

                  {/* Tab 2: Role Profile */}
                  {activeDossierTab === "profile" && (
                    <div>
                      {detail.owner.tenantProfile ? (
                        <dl className="divide-y divide-[#eaeee9]">
                          <div className="py-2 flex justify-between">
                            <dt className="text-muted">Employment</dt>
                            <dd className="font-bold text-ink">{detail.owner.tenantProfile.employmentType}</dd>
                          </div>
                          <div className="py-2 flex justify-between">
                            <dt className="text-muted">Employer</dt>
                            <dd className="font-bold text-ink">{detail.owner.tenantProfile.employerName ?? "Self / Unstated"}</dd>
                          </div>
                          <div className="py-2 flex justify-between">
                            <dt className="text-muted">Income Range</dt>
                            <dd className="font-bold text-forest-900">{detail.owner.tenantProfile.incomeRange}</dd>
                          </div>
                        </dl>
                      ) : detail.owner.landlordProfile ? (
                        <dl className="divide-y divide-[#eaeee9]">
                          <div className="py-2 flex justify-between">
                            <dt className="text-muted">Business Name</dt>
                            <dd className="font-bold text-ink">{detail.owner.landlordProfile.businessName ?? "Individual Landlord"}</dd>
                          </div>
                          <div className="py-2 flex justify-between">
                            <dt className="text-muted">Portfolio Count</dt>
                            <dd className="font-bold text-forest-900">{detail.owner.landlordProfile.propertyCount} properties</dd>
                          </div>
                          <div className="py-2 flex justify-between">
                            <dt className="text-muted">Bank Name</dt>
                            <dd className="font-bold text-ink">{detail.owner.landlordProfile.bankName ?? "Not configured"}</dd>
                          </div>
                        </dl>
                      ) : (
                        <p className="text-muted text-center py-3">No specific role profile attached.</p>
                      )}
                    </div>
                  )}

                  {/* Tab 3: Platform Linked Records */}
                  {activeDossierTab === "activity" && (
                    <div className="grid grid-cols-4 gap-2">
                      <div className="border border-[#eaeee9] bg-[#f8faf7] p-2 text-center">
                        <p className="text-[10px] uppercase font-bold text-muted">Properties</p>
                        <p className="text-lg font-black text-forest-950 tabular-nums">{detail.linked.properties}</p>
                      </div>
                      <div className="border border-[#eaeee9] bg-[#f8faf7] p-2 text-center">
                        <p className="text-[10px] uppercase font-bold text-muted">Applications</p>
                        <p className="text-lg font-black text-forest-950 tabular-nums">{detail.linked.applications}</p>
                      </div>
                      <div className="border border-[#eaeee9] bg-[#f8faf7] p-2 text-center">
                        <p className="text-[10px] uppercase font-bold text-muted">Payments</p>
                        <p className="text-lg font-black text-forest-950 tabular-nums">{detail.linked.payments}</p>
                      </div>
                      <div className="border border-[#eaeee9] bg-[#f8faf7] p-2 text-center">
                        <p className="text-[10px] uppercase font-bold text-muted">Maintenance</p>
                        <p className="text-lg font-black text-forest-950 tabular-nums">{detail.linked.maintenance}</p>
                      </div>
                    </div>
                  )}

                  {/* Tab 4: Prior Findings Log */}
                  {activeDossierTab === "history" && (
                    <div className="space-y-2">
                      {detail.findings.length > 0 ? (
                        detail.findings.map((f) => (
                          <div key={f.id} className="border border-[#eaeee9] bg-[#f8faf7] p-2.5">
                            <div className="flex justify-between font-bold">
                              <span className="text-forest-950">{f.label}</span>
                              <span className={f.status === "Approved" ? "text-emerald-800" : "text-amber-800"}>
                                {f.status}
                              </span>
                            </div>
                            {f.note && <p className="mt-1 text-muted text-[11px]">{f.note}</p>}
                          </div>
                        ))
                      ) : (
                        <p className="text-muted text-center py-3">No prior round findings recorded.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* ─────────────────────────────────────────────────────
                  Decision Action Console
              ───────────────────────────────────────────────────── */}
              {detail.status === "Pending" ? (
                <div className="border border-[#d6ddd5] bg-white p-4 space-y-4 shadow-sm">
                  <div className="border-b border-[#eaeee9] pb-2">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-forest-950">
                      Overall Compliance Findings & Decision
                    </h3>
                    <p className="text-[11px] text-muted">Review criteria against evidence inspected below</p>
                  </div>

                  {/* Findings Checklist */}
                  <div className="grid sm:grid-cols-2 gap-2">
                    {requiredKeys.map((key) => {
                      const isSatisfied = (findings[key] ?? "Approved") === "Approved";
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-2 border border-[#eaeee9] p-2 bg-[#f8faf7]"
                        >
                          <span className="text-xs font-bold text-ink truncate">
                            {VERIFICATION_FINDINGS[key]}
                          </span>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                setFindings((prev) => ({ ...prev, [key]: "Approved" }))
                              }
                              className={`px-2 py-1 text-[10px] font-black transition ${
                                isSatisfied
                                  ? "bg-emerald-700 text-white shadow-xs"
                                  : "bg-[#e5eae3] text-muted hover:text-ink"
                              }`}
                            >
                              Satisfied
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                setFindings((prev) => ({ ...prev, [key]: "NeedsChanges" }))
                              }
                              className={`px-2 py-1 text-[10px] font-black transition ${
                                !isSatisfied
                                  ? "bg-amber-700 text-white shadow-xs"
                                  : "bg-[#e5eae3] text-muted hover:text-ink"
                              }`}
                            >
                              Flag
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Macro Presets */}
                  <div>
                    <label className="block text-[11px] font-bold text-muted mb-1.5 uppercase tracking-wider">
                      Quick Feedback Macros:
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_CORRECTIONS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => applyPreset(preset)}
                          className="border border-[#d6ddd5] bg-[#f8faf7] hover:bg-forest-900 hover:text-white px-2 py-1 text-[10px] font-semibold text-ink transition"
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Selector */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-ink uppercase tracking-wider">
                      Action Decision:
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setDecision("approve")}
                        className={`py-2 text-xs font-extrabold transition border ${
                          decision === "approve"
                            ? "bg-emerald-700 text-white border-emerald-800 shadow-xs"
                            : "bg-[#f8faf7] text-muted border-[#d6ddd5] hover:text-ink"
                        }`}
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecision("request_changes")}
                        className={`py-2 text-xs font-extrabold transition border ${
                          decision === "request_changes"
                            ? "bg-amber-600 text-white border-amber-700 shadow-xs"
                            : "bg-[#f8faf7] text-muted border-[#d6ddd5] hover:text-ink"
                        }`}
                      >
                        Needs Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setDecision("reject")}
                        className={`py-2 text-xs font-extrabold transition border ${
                          decision === "reject"
                            ? "bg-red-700 text-white border-red-800 shadow-xs"
                            : "bg-[#f8faf7] text-muted border-[#d6ddd5] hover:text-ink"
                        }`}
                      >
                        Reject
                      </button>
                    </div>
                  </div>

                  {/* Audit Ledger Reason */}
                  <div>
                    <label className="block text-xs font-bold text-ink mb-1">
                      Audit Ledger Reason:
                    </label>
                    <textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={2}
                      className="w-full border border-[#d6ddd5] bg-[#f8faf7] p-2 text-xs text-ink placeholder:text-muted focus:bg-white focus:border-forest-700 focus:outline-none"
                      placeholder="e.g. Verified against land registry records and biometric match"
                    />
                  </div>

                  {/* Correction Instructions */}
                  {decision === "request_changes" && (
                    <div>
                      <label className="block text-xs font-bold text-amber-900 mb-1">
                        Instructions to Applicant (Shown in User Dashboard):
                      </label>
                      <textarea
                        value={instructions}
                        onChange={(e) => setInstructions(e.target.value)}
                        rows={3}
                        className="w-full border border-amber-300 bg-amber-50/60 p-2 text-xs text-amber-950 placeholder:text-amber-700/60 focus:bg-white focus:border-amber-600 focus:outline-none"
                        placeholder="Explain specifically which document needs re-uploading and why..."
                      />
                    </div>
                  )}

                  {/* Commit Action Button */}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => void submitDecision()}
                    className={`w-full py-3 text-xs font-black uppercase tracking-wider text-white transition flex items-center justify-center gap-2 shadow-sm ${
                      decision === "approve"
                        ? "bg-forest-900 hover:bg-forest-800"
                        : decision === "request_changes"
                        ? "bg-amber-700 hover:bg-amber-800"
                        : "bg-red-700 hover:bg-red-800"
                    }`}
                  >
                    {pending ? (
                      <RefreshCw className="size-4 animate-spin" />
                    ) : decision === "approve" ? (
                      <Check className="size-4" />
                    ) : decision === "reject" ? (
                      <FileX className="size-4" />
                    ) : (
                      <AlertTriangle className="size-4" />
                    )}
                    {decision === "approve"
                      ? "Commit Approval to Audit Ledger"
                      : decision === "request_changes"
                      ? "Send Correction Instructions"
                      : "Record Verification Rejection"}
                  </button>
                </div>
              ) : (
                <div className="border border-[#d6ddd5] bg-[#f8faf7] p-4 text-center">
                  <p className="text-xs font-extrabold text-forest-950">Review Complete</p>
                  <p className="mt-1 text-[11px] text-muted">
                    This submission status is <strong className="text-ink">{detail.status}</strong>. Subsequent updates will occur if the owner submits a new revision.
                  </p>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          TIER 2: DEDICATED FULL-WIDTH DOCUMENT EVIDENCE & INSPECTION HUB
          (Positioned clearly below the Queue & Dossier row!)
      ───────────────────────────────────────────────────────────── */}
      <section
        className="border border-[#d6ddd5] bg-white shadow-sm"
        aria-label="Dedicated document evidence inspection hub"
      >
        {/* Section Header */}
        <div className="border-b border-[#d6ddd5] bg-[#f8faf7] px-5 py-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-7 grid place-items-center bg-forest-900 text-lime font-black text-xs">
                <FileText className="size-4" />
              </span>
              <h2 className="text-base font-extrabold text-forest-950">
                Submitted Documents & High-Definition Inspection Hub
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-muted">
              Full-width document examination studio with categorized files, inspection checklists, and forensic image filters.
            </p>
          </div>

          {detail && (
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-muted">
                Total Files: <strong className="text-forest-950">{detail.documents.length}</strong>
              </span>
              <span className="text-xs font-bold text-muted">
                Active Evidence: <strong className="text-emerald-800">{detail.evidence.active}</strong>
              </span>
            </div>
          )}
        </div>

        {!detail ? (
          <div className="p-16 text-center">
            <FileSearch className="mx-auto size-12 text-muted" />
            <h3 className="mt-4 text-base font-extrabold text-ink">No Verification Case Active</h3>
            <p className="mt-1 text-xs text-muted max-w-md mx-auto">
              Select any applicant from the Submission Queue in the section above to view all their submitted documents, categorizations, and high-resolution inspection tools here.
            </p>
          </div>
        ) : detail.documents.length === 0 ? (
          <div className="p-16 text-center">
            <ShieldAlert className="mx-auto size-12 text-amber-600" />
            <h3 className="mt-4 text-base font-extrabold text-ink">No Retained Document Evidence</h3>
            <p className="mt-1 text-xs text-muted max-w-md mx-auto">
              Files for this verification submission have exceeded the NDPR retention period or were verified via direct database lookup.
            </p>
          </div>
        ) : (
          <div className="p-5 space-y-5">
            {/* 1. Categorized Document Card Grid */}
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted mb-3 flex items-center gap-1.5">
                <Layers className="size-3.5 text-forest-700" />
                Submitted Document Gallery ({detail.documents.length} Files) — Click to Inspect:
              </h3>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {detail.documents.map((doc, idx) => {
                  const docMeta = getDocumentMeta(doc.kind);
                  const isSelected = selectedDocIndex === idx;
                  const DocIcon = docMeta.icon;
                  return (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => {
                        setSelectedDocIndex(idx);
                        setZoomLevel(100);
                        setRotation(0);
                      }}
                      className={`p-3.5 text-left border transition relative flex flex-col justify-between gap-3 ${
                        isSelected
                          ? "bg-forest-950 text-white border-forest-950 shadow-md ring-2 ring-forest-700"
                          : "bg-[#f8faf7] hover:bg-white border-[#d6ddd5] text-ink"
                      }`}
                    >
                      <div>
                        {/* Category & Revision Tag */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-black ${
                              isSelected
                                ? "bg-lime text-forest-950"
                                : docMeta.category === "Property Title"
                                ? "bg-rose-100 text-rose-900 border border-rose-200"
                                : docMeta.category === "Identity"
                                ? "bg-indigo-100 text-indigo-900 border border-indigo-200"
                                : docMeta.category === "Income & Employment"
                                ? "bg-emerald-100 text-emerald-900 border border-emerald-200"
                                : "bg-blue-100 text-blue-900 border border-blue-200"
                            }`}
                          >
                            <DocIcon className="size-3" />
                            {docMeta.category}
                          </span>

                          <span className={`text-[10px] font-bold ${isSelected ? "text-forest-300" : "text-muted"}`}>
                            Rev {doc.revision}
                          </span>
                        </div>

                        {/* Document Name */}
                        <strong className={`block text-xs font-extrabold leading-snug line-clamp-2 ${isSelected ? "text-white" : "text-forest-950"}`}>
                          {docMeta.title}
                        </strong>
                        <p className={`mt-1 text-[11px] truncate ${isSelected ? "text-forest-300" : "text-muted"}`}>
                          {doc.fileName ?? doc.kind}
                        </p>
                      </div>

                      {/* Bottom File Metadata */}
                      <div className={`flex items-center justify-between border-t pt-2 text-[10px] font-medium ${
                        isSelected ? "border-white/15 text-forest-300" : "border-[#eaeee9] text-muted"
                      }`}>
                        <span>{formatBytes(doc.size)}</span>
                        {doc.supersededAt ? (
                          <span className="text-amber-600 font-bold">Superceded</span>
                        ) : (
                          <span className="text-emerald-700 font-bold">Active</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Active Document Inspection Workbench */}
            {activeDoc && activeDocMeta && (
              <div
                className={`border border-[#d6ddd5] bg-[#f3f5f1] overflow-hidden ${
                  isFullscreen
                    ? "fixed inset-3 z-[100] bg-[#111c16] text-white shadow-2xl border border-white/20"
                    : ""
                }`}
              >
                {/* Document Information & Inspection Tools Toolbar */}
                <div className="border-b border-[#d6ddd5] bg-white p-4 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black ${
                          activeDocMeta.category === "Property Title"
                            ? "bg-rose-100 text-rose-900 border border-rose-300"
                            : activeDocMeta.category === "Identity"
                            ? "bg-indigo-100 text-indigo-900 border border-indigo-300"
                            : activeDocMeta.category === "Income & Employment"
                            ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                            : "bg-blue-100 text-blue-900 border border-blue-300"
                        }`}
                      >
                        <activeDocMeta.icon className="size-3.5" />
                        {activeDocMeta.category}
                      </span>
                      <h4 className="text-base font-extrabold text-forest-950">
                        {activeDocMeta.title}
                      </h4>
                    </div>
                    <p className="mt-1 text-xs text-muted">
                      {activeDocMeta.description} · File: <strong className="text-ink">{activeDoc.fileName ?? activeDoc.kind}</strong> ({activeDoc.mimeType}, {formatBytes(activeDoc.size)}, Rev {activeDoc.revision})
                    </p>
                  </div>

                  {/* Viewer Controls */}
                  <div className="flex items-center gap-2">
                    <a
                      href={activeDoc.accessHref}
                      target="_blank"
                      rel="noreferrer"
                      className="stitch-button-secondary text-xs py-1.5 inline-flex items-center gap-1"
                    >
                      <ExternalLink className="size-3.5" /> Raw File
                    </a>

                    <div className="flex items-center gap-1 bg-[#edf1eb] p-1 border border-[#d6ddd5]">
                      <button
                        type="button"
                        title="Zoom Out"
                        onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                        className="p-1 hover:bg-white text-muted hover:text-ink transition"
                      >
                        <ZoomOut className="size-4" />
                      </button>
                      <span className="text-xs font-bold px-1.5 tabular-nums text-forest-950">{zoomLevel}%</span>
                      <button
                        type="button"
                        title="Zoom In"
                        onClick={() => setZoomLevel((z) => Math.min(250, z + 25))}
                        className="p-1 hover:bg-white text-muted hover:text-ink transition"
                      >
                        <ZoomIn className="size-4" />
                      </button>
                      <div className="h-4 w-px bg-line mx-0.5" />
                      <button
                        type="button"
                        title="Rotate 90°"
                        onClick={() => setRotation((r) => (r + 90) % 360)}
                        className="p-1 hover:bg-white text-muted hover:text-ink transition"
                      >
                        <RotateCw className="size-4" />
                      </button>
                      <button
                        type="button"
                        title="Enhance Contrast"
                        onClick={() => setHighContrast((c) => !c)}
                        className={`p-1 transition ${
                          highContrast ? "bg-forest-900 text-lime font-bold" : "text-muted hover:text-ink hover:bg-white"
                        }`}
                      >
                        <Sparkles className="size-4" />
                      </button>
                      <div className="h-4 w-px bg-line mx-0.5" />
                      <button
                        type="button"
                        title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Inspection"}
                        onClick={() => setIsFullscreen((f) => !f)}
                        className="p-1 hover:bg-white text-muted hover:text-ink transition"
                      >
                        {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Specific Mandatory Criteria Checklist for Active Document */}
                <div className="bg-[#f8faf7] border-b border-[#d6ddd5] px-5 py-3 text-xs">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-forest-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                      <CheckCircle2 className="size-3.5 text-forest-700" />
                      Specific Verification Inspection Checklist for {activeDocMeta.shortLabel}:
                    </span>
                    <span className="text-[11px] text-muted">Click each criterion once verified</span>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {activeDocMeta.checks.map((checkText) => {
                      const isChecked = Boolean(completedDocChecks[checkText]);
                      return (
                        <button
                          key={checkText}
                          type="button"
                          onClick={() => toggleCheck(checkText)}
                          className={`flex items-start gap-2 p-2 text-left text-xs border transition ${
                            isChecked
                              ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold"
                              : "bg-white border-[#d6ddd5] text-muted hover:text-ink hover:border-forest-400"
                          }`}
                        >
                          <span
                            className={`size-4 mt-0.5 shrink-0 grid place-items-center rounded-xs text-[10px] font-black ${
                              isChecked ? "bg-emerald-700 text-white" : "border border-muted"
                            }`}
                          >
                            {isChecked ? "✓" : ""}
                          </span>
                          <span className="leading-tight">{checkText}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Canvas Render Area */}
                <div className="p-4">
                  {activeDoc.deletedAt ? (
                    <div className="grid min-h-[30rem] place-items-center border border-dashed border-line bg-white p-6 text-center">
                      <p className="text-sm font-bold text-muted">Evidence file was purged per NDPR 30-day retention policies.</p>
                    </div>
                  ) : activeDoc.mimeType?.startsWith("image/") ? (
                    <div className="relative overflow-auto border border-[#d6ddd5] bg-[#1a251e] p-6 flex items-center justify-center min-h-[38rem]">
                      <div
                        style={{
                          transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                          transition: "transform 0.15s ease",
                          filter: highContrast ? "contrast(200%) brightness(95%) saturate(120%)" : "none",
                        }}
                        className="origin-center shadow-2xl"
                      >
                        <img
                          src={activeDoc.accessHref}
                          alt={`Private ${activeDoc.kind} evidence`}
                          className="max-h-[46rem] w-auto max-w-full object-contain"
                        />
                      </div>
                    </div>
                  ) : (
                    <iframe
                      title={`Private ${activeDoc.kind} evidence`}
                      src={`${activeDoc.accessHref}#toolbar=1&navpanes=0`}
                      className="h-[46rem] w-full border border-[#d6ddd5] bg-white"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
