"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  BadgeCheck,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  EyeOff,
  FileCheck,
  FileQuestion,
  FileText,
  FileX,
  History,
  Info,
  Layers,
  LoaderCircle,
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
} from "lucide-react";
import type {
  VerificationReviewDetailDto,
  VerificationReviewSummaryDto,
} from "@/features/verifications/review-contracts";
import {
  requiredVerificationFindingKeys,
  VERIFICATION_FINDINGS,
} from "@/features/verifications/review-contracts";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import { toastError, toastSuccess } from "@/stores/toast-store";
import { formatNaira } from "@/utils/map-property";

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

function formatBytes(bytes: number | null | undefined) {
  if (!bytes) return "Unknown size";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StatusBadge({ value }: { value: string }) {
  const normalized = value.toLowerCase();
  if (normalized === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-forest-50 px-2.5 py-0.5 text-xs font-bold text-forest-800 ring-1 ring-inset ring-forest-600/20">
        <CheckCircle2 className="size-3" /> Approved
      </span>
    );
  }
  if (normalized === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-700 ring-1 ring-inset ring-red-600/20">
        <FileX className="size-3" /> Rejected
      </span>
    );
  }
  if (normalized === "needschanges") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-bold text-amber-800 ring-1 ring-inset ring-amber-600/20">
        <AlertTriangle className="size-3" /> Needs Changes
      </span>
    );
  }
  if (normalized === "pending") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-sand-200 px-2.5 py-0.5 text-xs font-bold text-ink ring-1 ring-inset ring-line">
        <RefreshCw className="size-3" /> Pending Review
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-sand-200 px-2.5 py-0.5 text-xs font-semibold text-ink">
      {value}
    </span>
  );
}

const PRESET_CORRECTIONS = [
  { label: "Blurry / Unreadable", note: "The uploaded document is blurry or unreadable. Please provide a clear, high-resolution scan or photo." },
  { label: "Expired Document", note: "The document provided has expired. Please submit a currently valid government-issued ID." },
  { label: "Name Mismatch", note: "The name on the document does not match the name on your LinkConn account. Please upload matching identification or update your account details." },
  { label: "Missing Back Page", note: "Both front and back sides of the identity card are required. Please upload both pages." },
  { label: "Incomplete Address Proof", note: "The utility bill or bank statement is older than 3 months or does not clearly show your address." },
  { label: "Ownership Proof Insufficient", note: "The submitted deed or title document does not show verifiable ownership for this property." },
];

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
  const [reason, setReason] = useState("");
  const [instructions, setInstructions] = useState("");
  const [decision, setDecision] = useState<"approve" | "reject" | "request_changes">("request_changes");
  const [revealed, setRevealed] = useState<{ nin: string | null; payoutAccount: string | null } | null>(null);
  
  // Active document viewing state
  const [selectedDocIndex, setSelectedDocIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [highContrast, setHighContrast] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeDossierTab, setActiveDossierTab] = useState<"kyc" | "role" | "platform" | "history">("kyc");

  const requiredKeys = detail ? requiredVerificationFindingKeys(detail.type) : [];
  const [findings, setFindings] = useState<Record<string, "Approved" | "NeedsChanges">>(() =>
    Object.fromEntries(requiredKeys.map((key) => [key, "Approved"]))
  );

  const activeDoc = useMemo(() => {
    if (!detail || !detail.documents.length) return null;
    return detail.documents[selectedDocIndex] || detail.documents[0];
  }, [detail, selectedDocIndex]);

  function itemHref(id: string) {
    const params = new URLSearchParams();
    if (query.status) params.set("status", query.status);
    if (query.query) params.set("query", query.query);
    params.set("item", id);
    return `/admin/verifications?${params}`;
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
    toastSuccess("Sensitive values revealed", "This access was recorded in the audit log.");
  }

  async function submitDecision() {
    if (!detail) return;
    if (decision === "request_changes" && !instructions.trim() && !reason.trim()) {
      return toastError("Missing instructions", "Please provide specific correction instructions for the applicant.");
    }
    if (decision === "reject" && !reason.trim()) {
      return toastError("Missing reason", "Please provide a reason for rejecting this verification.");
    }

    const response = await fetch(`/api/admin/verifications/${detail.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: decision,
        reason: reason || "Reviewed by compliance team",
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

  return (
    <div className="min-w-0 space-y-5">
      {/* Header Banner */}
      <header className="admin-page-heading px-10 py-5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 rounded-md bg-forest-100 px-2.5 py-1 text-xs font-bold text-forest-900">
            <ShieldCheck className="size-3.5 text-forest-700" />
            <span>Compliance & KYC Studio</span>
          </div>
          <h1>Verification queue</h1>
          <p>
            Review evidence, account facts, findings and history in one addressable workspace.
          </p>
        </div>
        <div className="admin-record-count">
          <span>Total cases</span>
          <strong>{data.pagination.totalItems}</strong>
        </div>
      </header>

      {/* Filter Bar */}
      <form
        method="get"
        className="admin-filter-bar grid gap-3 sm:grid-cols-[minmax(0,1fr)_12rem_auto]"
      >
        <div className="relative">
          <Input
            name="query"
            defaultValue={query.query ?? ""}
            placeholder="Search name or email"
          />
        </div>
        <Select name="status" defaultValue={query.status ?? ""}>
          <option value="">All statuses</option>
          {["Pending", "NeedsChanges", "Approved", "Rejected", "Draft"].map((status) => (
            <option key={status} value={status}>
              {status === "NeedsChanges" ? "Needs Changes" : status}
            </option>
          ))}
        </Select>
        {query.item ? <Input type="hidden" name="item" value={query.item} /> : null}
        <button type="submit" className="stitch-button">
          Apply filters
        </button>
      </form>

      {/* 3-Column Main Workspace */}
      <div className="mt-5 grid min-w-0 gap-px bg-line xl:grid-cols-[19rem_minmax(24rem,1fr)_25rem]">
        {/* Column 1: Verification Queue List */}
        <section
          className="min-w-0 bg-white"
          aria-label="Verification queue"
        >
          <div className="border-b border-line px-4 py-3 bg-sand-50/70">
            <h2 className="text-sm font-extrabold text-ink">Verification queue</h2>
            <p className="mt-1 text-xs text-muted">Selection stays in the item query.</p>
          </div>

          <div className="divide-y divide-line overflow-y-auto max-h-[46rem]">
            {data.items.length ? (
              data.items.map((item) => {
                const isSelected = detail?.id === item.id;
                return (
                  <Link
                    key={item.id}
                    href={itemHref(item.id)}
                    aria-current={isSelected ? "true" : undefined}
                    className={`block min-h-24 p-4 transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-forest-600 ${
                      isSelected
                        ? "bg-forest-50 border-l-4 border-forest-600"
                        : "hover:bg-sand-50 border-l-4 border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <strong className="block truncate text-sm font-bold text-ink">
                          {item.owner.firstName} {item.owner.lastName}
                        </strong>
                        <span className="mt-1 block truncate text-xs text-muted">{item.owner.email}</span>
                      </div>
                      <StatusBadge value={item.status} />
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-muted">
                      <span className="flex items-center gap-1 rounded bg-sand-200 px-1.5 py-0.5 text-ink font-semibold">
                        <User className="size-3 text-forest-700" /> {item.owner.role}
                      </span>
                      <span>Round {item.reviewRound}</span>
                      <span>{item.evidence.active} active evidence</span>
                    </div>

                    {item.property ? (
                      <div className="mt-2 flex items-center gap-1 text-xs text-forest-800 font-medium truncate">
                        <Building2 className="size-3 shrink-0" />
                        <span className="truncate">{item.property.title}</span>
                      </div>
                    ) : null}
                  </Link>
                );
              })
            ) : (
              <div className="p-8 text-center">
                <FileQuestion className="mx-auto size-7 text-forest-700" />
                <p className="mt-3 text-sm font-bold text-ink">No cases match these filters</p>
                <p className="mt-1 text-xs text-muted">Clear a filter to return to the full queue.</p>
              </div>
            )}
          </div>
        </section>

        {/* Column 2: Interactive Document Evidence Viewer */}
        <section
          className={`min-w-0 bg-sand-50 ${
            isFullscreen ? "fixed inset-4 z-50 bg-white shadow-2xl rounded-2xl overflow-hidden border border-line" : ""
          }`}
          aria-label="Evidence viewer"
        >
          <div className="border-b border-line bg-white px-4 py-3 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-extrabold text-ink">Evidence viewer</h2>
              <p className="mt-1 text-xs text-muted">Private files open inline and are audited on access.</p>
            </div>

            {/* Document Controls Bar */}
            {detail && activeDoc && !activeDoc.deletedAt && (
              <div className="flex items-center gap-1 bg-sand-100 p-1 rounded-lg border border-line text-ink">
                <button
                  type="button"
                  title="Zoom Out"
                  onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
                  className="rounded p-1 hover:bg-white text-muted hover:text-ink transition-colors"
                >
                  <ZoomOut className="size-4" />
                </button>
                <span className="text-xs font-bold px-1.5">{zoomLevel}%</span>
                <button
                  type="button"
                  title="Zoom In"
                  onClick={() => setZoomLevel((z) => Math.min(250, z + 25))}
                  className="rounded p-1 hover:bg-white text-muted hover:text-ink transition-colors"
                >
                  <ZoomIn className="size-4" />
                </button>
                <button
                  type="button"
                  title="Rotate Clockwise"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                  className="rounded p-1 hover:bg-white text-muted hover:text-ink transition-colors"
                >
                  <RotateCw className="size-4" />
                </button>
                <button
                  type="button"
                  title="Toggle Contrast"
                  onClick={() => setHighContrast((c) => !c)}
                  className={`rounded p-1 transition-colors ${
                    highContrast ? "bg-forest-700 text-white" : "text-muted hover:text-ink hover:bg-white"
                  }`}
                >
                  <Sparkles className="size-4" />
                </button>
                <button
                  type="button"
                  title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                  onClick={() => setIsFullscreen((f) => !f)}
                  className="rounded p-1 hover:bg-white text-muted hover:text-ink transition-colors"
                >
                  {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
                </button>
              </div>
            )}
          </div>

          {/* Document Tabs (If multiple documents or revisions) */}
          {detail && detail.documents.length > 0 && (
            <div className="flex border-b border-line bg-white/60 px-3 py-2 gap-2 overflow-x-auto">
              {detail.documents.map((doc, idx) => {
                const isActive = (selectedDocIndex || 0) === idx;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => {
                      setSelectedDocIndex(idx);
                      setZoomLevel(100);
                      setRotation(0);
                    }}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-colors shrink-0 ${
                      isActive
                        ? "bg-white text-forest-900 border border-forest-300 shadow-xs ring-1 ring-forest-600/10"
                        : "bg-sand-200/70 text-muted hover:bg-white hover:text-ink"
                    }`}
                  >
                    <FileText className={`size-3.5 ${isActive ? "text-forest-700" : "text-muted"}`} />
                    <span className="truncate max-w-[12rem]">{doc.fileName ?? `${doc.kind} (Rev ${doc.revision})`}</span>
                    {doc.supersededAt ? (
                      <span className="rounded bg-amber-100 px-1 py-0.2 text-[10px] text-amber-800">Old</span>
                    ) : (
                      <span className="rounded bg-forest-100 px-1 py-0.2 text-[10px] text-forest-800">Active</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Viewer Content Area */}
          <div className="p-4">
            {!detail ? (
              <div className="grid min-h-[34rem] place-items-center p-8 text-center">
                <div>
                  <FileText className="mx-auto size-8 text-forest-700" />
                  <p className="mt-3 font-extrabold text-ink">Select a case from the queue</p>
                  <p className="mt-1 text-sm text-muted">Evidence and findings will appear here.</p>
                </div>
              </div>
            ) : detail.documents.length === 0 ? (
              <div className="grid min-h-[34rem] place-items-center p-8 text-center">
                <div>
                  <ShieldCheck className="mx-auto size-8 text-forest-700" />
                  <p className="mt-3 font-extrabold text-ink">Private evidence unavailable</p>
                  <p className="mt-1 max-w-sm text-sm text-muted">
                    Your role cannot access private document metadata, or this case has no retained evidence.
                  </p>
                </div>
              </div>
            ) : !activeDoc ? (
              <div className="p-8 text-center text-sm font-bold text-ink">No document selected</div>
            ) : (
              <div>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <strong className="text-sm text-ink">{activeDoc.fileName ?? "Retained evidence"}</strong>
                    <p className="text-xs text-muted">
                      Revision {activeDoc.revision} · {activeDoc.mimeType} · {formatBytes(activeDoc.size)}
                    </p>
                  </div>
                  <a
                    href={activeDoc.accessHref}
                    target="_blank"
                    rel="noreferrer"
                    className="stitch-button-secondary"
                  >
                    <Eye className="size-4" /> Open fallback
                  </a>
                </div>

                {activeDoc.deletedAt ? (
                  <div className="grid min-h-[28rem] place-items-center border border-dashed border-line bg-white p-6 text-center">
                    <p className="text-sm font-bold">This evidence is no longer retained.</p>
                  </div>
                ) : activeDoc.mimeType?.startsWith("image/") ? (
                  <div className="overflow-auto border border-line bg-white rounded-lg p-2 flex items-center justify-center min-h-[34rem]">
                    <div
                      style={{
                        transform: `scale(${zoomLevel / 100}) rotate(${rotation}deg)`,
                        transition: "transform 0.15s ease",
                        filter: highContrast ? "contrast(180%) brightness(90%)" : "none",
                      }}
                      className="origin-center"
                    >
                      <img
                        src={activeDoc.accessHref}
                        alt={`Private ${activeDoc.kind} evidence`}
                        className="max-h-[38rem] w-full object-contain"
                      />
                    </div>
                  </div>
                ) : (
                  <iframe
                    title={`Private ${activeDoc.kind} evidence`}
                    src={`${activeDoc.accessHref}#toolbar=1&navpanes=0`}
                    className="h-[40rem] w-full border border-line bg-white rounded-lg"
                  />
                )}
              </div>
            )}
          </div>
        </section>

        {/* Column 3: Case Dossier & Review Actions */}
        <aside
          className="min-w-0 bg-white"
          aria-label="Case dossier"
        >
          <div className="border-b border-line px-4 py-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-ink">Case dossier</h2>
              <p className="mt-1 text-xs text-muted">Account, linked records and accountable decision.</p>
            </div>
            {detail && <StatusBadge value={detail.status} />}
          </div>

          {!detail ? (
            <div className="p-8 text-center">
              <p className="font-extrabold text-ink">No case selected</p>
              <p className="mt-1 text-sm text-muted">Choose a queue record to inspect its dossier.</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {/* Active Correction Note */}
              {detail.correctionInstructions ? (
                <div className="border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950 rounded-lg">
                  <span className="flex items-center gap-2 font-extrabold">
                    <AlertTriangle className="size-4 text-amber-700" /> Current correction instructions
                  </span>
                  <p className="mt-2 leading-6">{detail.correctionInstructions}</p>
                </div>
              ) : null}

              {/* Dossier Tabs */}
              <div className="flex border-b border-line bg-sand-50 p-1 rounded-lg">
                <button
                  type="button"
                  onClick={() => setActiveDossierTab("kyc")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    activeDossierTab === "kyc" ? "bg-white text-forest-900 shadow-xs" : "text-muted hover:text-ink"
                  }`}
                >
                  Identity
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDossierTab("role")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    activeDossierTab === "role" ? "bg-white text-forest-900 shadow-xs" : "text-muted hover:text-ink"
                  }`}
                >
                  Profile
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDossierTab("platform")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    activeDossierTab === "platform" ? "bg-white text-forest-900 shadow-xs" : "text-muted hover:text-ink"
                  }`}
                >
                  Linked
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDossierTab("history")}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                    activeDossierTab === "history" ? "bg-white text-forest-900 shadow-xs" : "text-muted hover:text-ink"
                  }`}
                >
                  History
                </button>
              </div>

              {/* Tab 1: KYC / Identity facts */}
              {activeDossierTab === "kyc" && (
                <div>
                  <dl className="divide-y divide-line">
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Applicant</dt>
                    <dd className="text-sm font-semibold text-ink">{detail.owner.firstName} {detail.owner.lastName}</dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Contact</dt>
                    <dd className="text-sm font-semibold text-ink text-right">
                      {detail.owner.email}
                      {detail.owner.phone ? <><br />{detail.owner.phone}</> : null}
                    </dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Account</dt>
                    <dd className="text-sm font-semibold text-ink">{detail.owner.role} · {detail.owner.accountStatus}</dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Verification</dt>
                    <dd className="text-sm font-semibold text-ink">{detail.status} · Round {detail.reviewRound}</dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Submitted</dt>
                    <dd className="text-sm font-semibold text-ink">{formatDate(detail.submittedAt)}</dd>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <dt className="text-[11px] font-bold uppercase tracking-[0.08em] text-muted">Assignment</dt>
                    <dd className="text-sm font-semibold text-ink">
                      {detail.assignedTo ? `${detail.assignedTo.firstName} ${detail.assignedTo.lastName}` : "Unassigned"}
                    </dd>
                  </div>
                </dl>
                <div>
                  <h3 className="mt-3 text-xs font-extrabold uppercase tracking-wider text-muted mb-2">Linked activity</h3>
                  <dl className="grid grid-cols-2 gap-2 text-xs">
                    <div className="border border-line rounded-lg p-2 bg-sand-50">
                      <dt className="font-bold text-muted uppercase text-[10px]">Properties</dt>
                      <dd className="mt-0.5 text-sm font-extrabold text-ink">{detail.linked.properties}</dd>
                    </div>
                    <div className="border border-line rounded-lg p-2 bg-sand-50">
                      <dt className="font-bold text-muted uppercase text-[10px]">Applications</dt>
                      <dd className="mt-0.5 text-sm font-extrabold text-ink">{detail.linked.applications}</dd>
                    </div>
                    <div className="border border-line rounded-lg p-2 bg-sand-50">
                      <dt className="font-bold text-muted uppercase text-[10px]">Payments</dt>
                      <dd className="mt-0.5 text-sm font-extrabold text-ink">{detail.linked.payments}</dd>
                    </div>
                    <div className="border border-line rounded-lg p-2 bg-sand-50">
                      <dt className="font-bold text-muted uppercase text-[10px]">Maintenance</dt>
                      <dd className="mt-0.5 text-sm font-extrabold text-ink">{detail.linked.maintenance}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              )}

              {/* Tab 2: Role Details (Tenant or Landlord) */}
              {activeDossierTab === "role" && (
                <div className="space-y-3">
                  {detail.owner.tenantProfile ? (
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted mb-2">Tenant onboarding</h3>
                      <dl className="divide-y divide-line">
                        <div className="py-2 flex justify-between">
                          <dt className="text-xs text-muted">Employment</dt>
                          <dd className="text-xs font-semibold text-ink">
                            {detail.owner.tenantProfile.employmentType} · {detail.owner.tenantProfile.employerName ?? "Not supplied"}
                          </dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-xs text-muted">Role / income</dt>
                          <dd className="text-xs font-semibold text-ink">
                            {detail.owner.tenantProfile.jobTitle ?? "Not supplied"} · {detail.owner.tenantProfile.incomeRange}
                          </dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-xs text-muted">Preferences</dt>
                          <dd className="text-xs font-semibold text-ink text-right">
                            {[...detail.owner.tenantProfile.preferredLocations, ...detail.owner.tenantProfile.preferredTypes].join(", ") || "Any"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ) : null}

                  {detail.owner.landlordProfile ? (
                    <div>
                      <h3 className="text-xs font-extrabold uppercase tracking-wider text-muted mb-2">Landlord profile</h3>
                      <dl className="divide-y divide-line">
                        <div className="py-2 flex justify-between">
                          <dt className="text-xs text-muted">Business name</dt>
                          <dd className="text-xs font-semibold text-ink">
                            {detail.owner.landlordProfile.businessName ?? "Individual Landlord"}
                          </dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-xs text-muted">Properties</dt>
                          <dd className="text-xs font-semibold text-ink">
                            {detail.owner.landlordProfile.propertyCount} units
                          </dd>
                        </div>
                        <div className="py-2 flex justify-between">
                          <dt className="text-xs text-muted">Bank Name</dt>
                          <dd className="text-xs font-semibold text-ink">
                            {detail.owner.landlordProfile.bankName ?? "Not linked"}
                          </dd>
                        </div>
                      </dl>
                    </div>
                  ) : null}
                </div>
              )}

              {/* Tab 3: Linked Activity */}
              {activeDossierTab === "platform" && (
                <div>
                  <h3 className="text-sm font-extrabold text-ink mb-2">Linked activity</h3>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div className="border border-line rounded-lg p-2.5 bg-sand-50">
                      <dt className="text-[11px] font-bold text-muted uppercase">Properties</dt>
                      <dd className="mt-1 text-base font-extrabold text-ink">{detail.linked.properties}</dd>
                    </div>
                    <div className="border border-line rounded-lg p-2.5 bg-sand-50">
                      <dt className="text-[11px] font-bold text-muted uppercase">Applications</dt>
                      <dd className="mt-1 text-base font-extrabold text-ink">{detail.linked.applications}</dd>
                    </div>
                    <div className="border border-line rounded-lg p-2.5 bg-sand-50">
                      <dt className="text-[11px] font-bold text-muted uppercase">Payments</dt>
                      <dd className="mt-1 text-base font-extrabold text-ink">{detail.linked.payments}</dd>
                    </div>
                    <div className="border border-line rounded-lg p-2.5 bg-sand-50">
                      <dt className="text-[11px] font-bold text-muted uppercase">Maintenance</dt>
                      <dd className="mt-1 text-base font-extrabold text-ink">{detail.linked.maintenance}</dd>
                    </div>
                  </dl>
                </div>
              )}

              {/* Tab 4: History / Findings Log */}
              {activeDossierTab === "history" && (
                <div className="space-y-2 text-xs">
                  <h3 className="text-xs font-extrabold uppercase text-muted">Review findings history</h3>
                  {detail.findings.length > 0 ? (
                    detail.findings.map((f) => (
                      <div key={f.id} className="border border-line rounded-lg p-2 bg-sand-50">
                        <div className="flex justify-between font-bold">
                          <span>{f.label}</span>
                          <span className={f.status === "Approved" ? "text-forest-800" : "text-amber-700"}>
                            {f.status}
                          </span>
                        </div>
                        {f.note ? <p className="mt-1 text-muted">{f.note}</p> : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-muted py-2">No prior findings recorded.</p>
                  )}
                </div>
              )}

              {/* Sensitive Values Box */}
              <div className="border-t border-line pt-3">
                <h3 className="text-sm font-extrabold text-ink">Sensitive values</h3>
                <div className="mt-2 border border-line rounded-lg p-3 text-sm bg-sand-50/60 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-xs text-muted">NIN:</span>
                    <strong className="font-mono text-xs">
                      {revealed?.nin ??
                        detail.owner.sensitive.nin.masked ??
                        (detail.owner.sensitive.nin.available ? "Restricted" : "Not supplied")}
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs text-muted">Payout:</span>
                    <strong className="font-mono text-xs">
                      {revealed?.payoutAccount ??
                        detail.owner.sensitive.payoutAccount.masked ??
                        (detail.owner.sensitive.payoutAccount.available ? "Restricted" : "Not supplied")}
                    </strong>
                  </div>
                  {canRevealSensitive &&
                  (detail.owner.sensitive.nin.available || detail.owner.sensitive.payoutAccount.available) ? (
                    <button
                      type="button"
                      onClick={() => void revealSensitive()}
                      className="stitch-button-secondary mt-2 w-full justify-center text-xs"
                    >
                      <Eye className="size-4" /> Reveal with audit
                    </button>
                  ) : null}
                </div>
              </div>

              {/* Decision and Review Findings Controls */}
              {detail.status === "Pending" ? (
                <div className="mt-6 border-t border-line pt-5 space-y-4">
                  <h3 className="text-sm font-extrabold text-ink">Review findings</h3>
                  <div className="space-y-3">
                    {requiredKeys.map((key) => (
                      <label key={key} className="block text-sm font-bold text-ink">
                        {VERIFICATION_FINDINGS[key]}
                        <Select
                          value={findings[key] ?? "Approved"}
                          onChange={(event) =>
                            setFindings((current) => ({
                              ...current,
                              [key]: event.target.value as "Approved" | "NeedsChanges",
                            }))
                          }
                          className="mt-1"
                        >
                          <option value="Approved">Satisfied</option>
                          <option value="NeedsChanges">Needs changes</option>
                        </Select>
                      </label>
                    ))}
                  </div>

                  {/* Preset Buttons for Quick Reason Filling */}
                  <div>
                    <label className="block text-xs font-bold text-muted mb-1">Quick reason presets:</label>
                    <div className="flex flex-wrap gap-1">
                      {PRESET_CORRECTIONS.map((preset) => (
                        <button
                          key={preset.label}
                          type="button"
                          onClick={() => applyPreset(preset)}
                          className="rounded border border-line bg-sand-50 px-2 py-0.5 text-[11px] font-semibold text-ink hover:bg-white transition-colors"
                        >
                          + {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <label className="block text-sm font-bold text-ink">
                    Decision
                    <Select
                      value={decision}
                      onChange={(event) => setDecision(event.target.value as typeof decision)}
                      className="mt-1"
                    >
                      <option value="approve">Approve</option>
                      <option value="request_changes">Request changes</option>
                      <option value="reject">Reject</option>
                    </Select>
                  </label>

                  <label className="block text-sm font-bold text-ink">
                    Reason
                    <Textarea
                      value={reason}
                      onChange={(event) => setReason(event.target.value)}
                      className="mt-1"
                      placeholder="Record the evidence-based reason"
                    />
                  </label>

                  {decision === "request_changes" ? (
                    <label className="block text-sm font-bold text-ink">
                      Correction instructions
                      <Textarea
                        value={instructions}
                        onChange={(event) => setInstructions(event.target.value)}
                        className="mt-1 border-amber-300 bg-amber-50/50"
                        placeholder="Tell the owner exactly what to correct"
                      />
                    </label>
                  ) : null}

                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => void submitDecision()}
                    className="stitch-button mt-4 w-full justify-center"
                  >
                    {pending ? (
                      <LoaderCircle className="size-4 animate-spin" />
                    ) : decision === "approve" ? (
                      <Check className="size-4" />
                    ) : decision === "reject" ? (
                      <X className="size-4" />
                    ) : (
                      <RefreshCw className="size-4" />
                    )}
                    {decision === "request_changes"
                      ? "Request changes"
                      : decision === "approve"
                      ? "Approve verification"
                      : "Reject verification"}
                  </button>
                </div>
              ) : null}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
