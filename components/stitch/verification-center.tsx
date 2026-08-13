"use client";

import { useCallback, useEffect, useState, type ReactNode } from "react";
import { upload } from "@vercel/blob/client";
import type { VerificationDocumentKind } from "@prisma/client";
import { AlertTriangle, CheckCircle2, Clock3, FileCheck2, History, Loader2, LockKeyhole, RefreshCw, ShieldCheck, UploadCloud, UserRound } from "lucide-react";
import type { OwnerVerificationWorkspaceDto } from "@/features/verifications/owner-contracts";
import { DOCUMENT_MIME_TYPES, MAX_DOCUMENT_BYTES } from "@/features/onboarding/schemas/document-upload";
import { Input } from "@/components/ui/form-controls";
import { toastError, toastSuccess } from "@/stores/toast-store";

type Props = { initialData?: OwnerVerificationWorkspaceDto };

function dateLabel(value: Date | string | null) {
  return value ? new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not yet";
}

function valueLabel(value: string | number | null | undefined) {
  return value === null || value === undefined || value === "" ? "Not provided" : String(value);
}

function moneyLabel(value: number | null) {
  return value === null ? "Not provided" : new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return <div><dt className="text-muted">{label}</dt><dd className="break-words text-ink">{value}</dd></div>;
}

export function VerificationCenter({ initialData }: Props) {
  const [data, setData] = useState<OwnerVerificationWorkspaceDto | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData);
  const [busyKind, setBusyKind] = useState<VerificationDocumentKind | null>(null);
  const [resubmitting, setResubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/verifications", { cache: "no-store" });
    const result = await response.json() as { success: boolean; message: string; data?: OwnerVerificationWorkspaceDto };
    if (!result.success || !result.data) throw new Error(result.message);
    setData(result.data);
  }, []);

  useEffect(() => {
    if (initialData) return;
    void load().catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to load verification." )).finally(() => setLoading(false));
  }, [initialData, load]);

  async function uploadCorrection(kind: VerificationDocumentKind, file: File) {
    setError(null);
    if (!DOCUMENT_MIME_TYPES.includes(file.type as (typeof DOCUMENT_MIME_TYPES)[number])) return setError("Choose a JPEG, PNG, or PDF file.");
    if (file.size <= 0 || file.size > MAX_DOCUMENT_BYTES) return setError("Each document must be no larger than 8 MB.");
    setBusyKind(kind);
    try {
      const preparedResponse = await fetch("/api/verifications/documents", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, fileName: file.name, mimeType: file.type, size: file.size }) });
      const prepared = await preparedResponse.json() as { success: boolean; message: string; data?: { document: { id: string }; pathname: string; uploadIntentId: string; clientPayload: string } };
      if (!prepared.success || !prepared.data) throw new Error(prepared.message);
      const blob = await upload(prepared.data.pathname, file, { access: "private", handleUploadUrl: "/api/verifications/uploads", clientPayload: prepared.data.clientPayload });
      const completedResponse = await fetch(`/api/verifications/documents/${prepared.data.document.id}/complete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uploadIntentId: prepared.data.uploadIntentId, pathname: blob.pathname }) });
      const completed = await completedResponse.json() as { success: boolean; message: string };
      if (!completed.success) throw new Error(completed.message);
      await load();
      toastSuccess("Evidence replaced", "The new revision is ready for resubmission.");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Upload failed. Please retry.";
      setError(message);
      toastError("Evidence not replaced", message);
    } finally { setBusyKind(null); }
  }

  async function resubmit() {
    if (!data?.current) return;
    setResubmitting(true); setError(null);
    try {
      const response = await fetch("/api/verifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "resubmit", submissionId: data.current.id, reviewRound: data.current.reviewRound }) });
      const result = await response.json() as { success: boolean; message: string };
      if (!result.success) throw new Error(result.message);
      await load();
      toastSuccess("Verification resubmitted", "Your corrected evidence is back in the review queue.");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to resubmit verification.";
      setError(message); toastError("Verification not resubmitted", message);
    } finally { setResubmitting(false); }
  }

  if (loading) return <div className="grid min-h-72 place-items-center text-sm text-muted"><span className="flex items-center gap-2"><Loader2 className="size-5 animate-spin" aria-hidden />Loading verification record…</span></div>;
  if (!data) return <div className="border border-error/30 bg-error-muted p-5 text-sm text-error" role="alert">{error ?? "Verification record unavailable."}</div>;
  const current = data.current;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="border-b border-line pb-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><h1 className="text-2xl font-extrabold tracking-[-0.025em] text-ink">Verification record</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-muted">Review what is on file, replace requested evidence, and keep every review round in one accountable record.</p></div>
          {current && <span className="inline-flex min-h-11 items-center gap-2 border border-line bg-white px-3 text-sm font-bold text-forest-800"><ShieldCheck className="size-4" aria-hidden />{current.status} · Round {current.reviewRound}</span>}
        </div>
      </header>

      {data.storage.blocked && <div className="flex gap-3 border border-warning/40 bg-warning-muted p-4 text-sm text-ink" role="alert"><LockKeyhole className="mt-0.5 size-5 shrink-0" aria-hidden /><div><strong>Secure private storage is unavailable.</strong><p className="mt-1 text-muted">Existing evidence remains listed, but replacements are blocked until secure storage is restored.</p></div></div>}
      {error && <div className="border border-error/30 bg-error-muted p-4 text-sm text-error" role="alert">{error}</div>}

      {!current ? <section className="border border-line bg-white p-8 text-center"><ShieldCheck className="mx-auto size-7 text-forest-700" /><h2 className="mt-3 font-extrabold text-ink">No verification submission yet</h2><p className="mt-2 text-sm text-muted">Complete onboarding to create your secure verification record.</p></section> : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(20rem,.75fr)]">
          <div className="space-y-6">
            {current.status === "NeedsChanges" && <section className="border border-warning/40 bg-white p-5"><div className="flex items-center gap-2 text-warning"><AlertTriangle className="size-5" /><h2 className="font-extrabold">Changes requested</h2></div><p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-ink">{current.correctionInstructions}</p>{current.decisionReason && <p className="mt-3 border-t border-line pt-3 text-sm text-muted"><strong className="text-ink">Review reason:</strong> {current.decisionReason}</p>}</section>}

            <section className="border border-line bg-white p-5"><h2 className="font-extrabold text-ink">{current.type === "Identity" ? "Identity verification" : "Property ownership verification"}</h2><dl className="mt-4 grid gap-4 text-sm sm:grid-cols-3"><Fact label="Submission type" value={current.documentType ?? (current.type === "Identity" ? "Identity" : "Property ownership")} /><Fact label="Submitted" value={dateLabel(current.submittedAt)} /><Fact label="Reviewed" value={dateLabel(current.reviewedAt)} /></dl></section>

            <section className="border border-line bg-white"><div className="border-b border-line p-5"><h2 className="font-extrabold text-ink">Required evidence</h2><p className="mt-1 text-sm text-muted">Requirements follow your {data.profile.role.toLowerCase()} profile. Business registration is requested only when specifically applicable.</p></div><div className="divide-y divide-line">{data.requirements.map((requirement) => { const document = current.documents.find((item) => item.uploaded && !item.supersededAt && requirement.acceptedKinds.includes(item.kind)); const kind = document?.kind ?? requirement.acceptedKinds[0]; return <article key={requirement.id} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="min-w-0"><div className="flex items-center gap-2">{requirement.satisfied ? <CheckCircle2 className="size-4 text-success" /> : <Clock3 className="size-4 text-warning" />}<h3 className="font-bold text-ink">{requirement.label}</h3></div><p className="mt-1 text-sm text-muted">{requirement.description}</p>{document && <p className="mt-2 flex items-center gap-2 break-all text-xs font-semibold text-forest-700"><FileCheck2 className="size-4 shrink-0" />{document.fileName ?? document.kind} · Revision {document.revision}</p>}</div><label className="inline-flex min-h-11 shrink-0 cursor-pointer items-center justify-center gap-2 border border-forest-700 px-4 text-sm font-bold text-forest-800 hover:bg-forest-50 aria-disabled:pointer-events-none aria-disabled:opacity-45" aria-disabled={!data.storage.configured || busyKind !== null}>{busyKind === kind ? <Loader2 className="size-4 animate-spin" /> : <UploadCloud className="size-4" />}{document ? "Replace" : "Upload"}<Input className="sr-only" type="file" accept="image/jpeg,image/png,application/pdf" disabled={!data.storage.configured || busyKind !== null} onChange={(event) => { const file = event.target.files?.[0]; if (file) void uploadCorrection(kind, file); event.currentTarget.value = ""; }} /></label></article>; })}</div></section>

            <section className="border border-line bg-white"><div className="border-b border-line p-5"><h2 className="font-extrabold text-ink">Current findings</h2></div><div className="divide-y divide-line">{current.findings.filter((finding) => finding.reviewRound === current.reviewRound).length ? current.findings.filter((finding) => finding.reviewRound === current.reviewRound).map((finding) => <article key={`${finding.reviewRound}-${finding.key}`} className="p-5"><div className="flex flex-wrap items-center justify-between gap-2"><strong className="text-sm text-ink">{finding.label}</strong><span className="text-xs font-bold text-forest-700">{finding.status}</span></div><p className="mt-2 text-sm text-muted">{finding.note ?? "No reviewer note provided."}</p></article>) : <p className="p-5 text-sm text-muted">No findings have been recorded for this round.</p>}</div></section>

            <section className="border border-line bg-white"><div className="border-b border-line p-5"><h2 className="font-extrabold text-ink">Evidence revisions</h2><p className="mt-1 text-sm text-muted">Earlier evidence remains listed so the review history is complete.</p></div><div className="divide-y divide-line">{current.documents.length ? current.documents.map((document) => <article key={document.id} className="flex flex-wrap items-start justify-between gap-3 p-5"><div><strong className="break-all text-sm text-ink">{document.fileName ?? document.kind}</strong><p className="mt-1 text-xs text-muted">{document.kind} · Revision {document.revision} · Added {dateLabel(document.createdAt)}</p></div><span className="text-xs font-bold text-forest-700">{document.deletedAt ? `Unavailable since ${dateLabel(document.deletedAt)}` : document.supersededAt ? `Superseded ${dateLabel(document.supersededAt)}` : document.uploaded ? "Current" : "Upload incomplete"}</span></article>) : <p className="p-5 text-sm text-muted">No document revisions are on file.</p>}</div></section>

            <section className="border border-line bg-white"><div className="border-b border-line p-5"><div className="flex items-center gap-2"><History className="size-5 text-forest-700" /><h2 className="font-extrabold text-ink">Review timeline</h2></div></div><div className="divide-y divide-line">{current.findings.filter((finding) => finding.reviewRound < current.reviewRound).map((finding) => <article key={`finding-${finding.reviewRound}-${finding.key}`} className="p-5"><div className="flex flex-wrap justify-between gap-2"><strong className="text-sm text-ink">Round {finding.reviewRound} finding · {finding.label}</strong><span className="text-xs font-bold text-forest-700">{finding.status}</span></div><p className="mt-2 text-sm text-muted">{finding.note ?? "No reviewer note provided."}</p><time className="mt-2 block text-xs text-muted">{dateLabel(finding.createdAt)}</time></article>)}{current.timeline.map((item, index) => <article key={`${item.reviewRound}-${item.kind}-${index}`} className="p-5"><div className="flex flex-wrap justify-between gap-2"><strong className="text-sm text-ink">{item.kind === "resubmission" ? "Corrections resubmitted" : item.status} · Round {item.reviewRound}</strong><time className="text-xs text-muted">{dateLabel(item.createdAt)}</time></div><p className="mt-2 text-sm text-muted">{item.reason}</p>{item.correctionInstructions && <p className="mt-2 whitespace-pre-wrap text-sm text-ink">{item.correctionInstructions}</p>}</article>)}{current.timeline.length === 0 && current.findings.every((finding) => finding.reviewRound >= current.reviewRound) && <p className="p-5 text-sm text-muted">No earlier review rounds.</p>}</div></section>
          </div>

          <aside className="space-y-6">
            <section className="border border-line bg-white p-5"><div className="flex items-center gap-2"><UserRound className="size-5 text-forest-700" /><h2 className="font-extrabold text-ink">Account facts</h2></div><dl className="mt-4 grid gap-3 text-sm"><Fact label="Name" value={`${data.profile.firstName} ${data.profile.lastName}`} /><Fact label="Email" value={data.profile.email} /><Fact label="Phone" value={valueLabel(data.profile.phone)} /><Fact label="Location" value={valueLabel(data.profile.location)} /><Fact label="Account status" value={data.profile.accountStatus} /><Fact label="Verification level" value={data.profile.verificationLevel} /><Fact label="Email verified" value={data.profile.emailVerified ? "Yes" : "No"} /><Fact label="Onboarding complete" value={data.profile.onboardingComplete ? "Yes" : "No"} /><Fact label="NIN" value={data.profile.sensitive.nin.masked ?? "Not provided"} />{data.profile.landlordProfile && <><Fact label="Business" value={valueLabel(data.profile.landlordProfile.businessName)} /><Fact label="Declared portfolio" value={`${data.profile.landlordProfile.propertyCount} ${data.profile.landlordProfile.propertyCount === 1 ? "property" : "properties"}`} /><Fact label="Property types" value={data.profile.landlordProfile.propertyTypesOffered.length ? data.profile.landlordProfile.propertyTypesOffered.join(", ") : "Not provided"} /><Fact label="NIN status" value={data.profile.landlordProfile.ninStatus} /><Fact label="Bank" value={valueLabel(data.profile.landlordProfile.bankName)} /><Fact label="Payout account" value={data.profile.sensitive.payoutAccount.masked ?? "Not provided"} /><Fact label="Account name" value={valueLabel(data.profile.landlordProfile.accountName)} /></>}{data.profile.tenantProfile && <><Fact label="Employment" value={data.profile.tenantProfile.employmentType} /><Fact label="Employer" value={valueLabel(data.profile.tenantProfile.employerName)} /><Fact label="Job title" value={valueLabel(data.profile.tenantProfile.jobTitle)} /><Fact label="Income range" value={data.profile.tenantProfile.incomeRange} /><Fact label="Preferred locations" value={data.profile.tenantProfile.preferredLocations.length ? data.profile.tenantProfile.preferredLocations.join(", ") : "Not provided"} /><Fact label="Preferred property types" value={data.profile.tenantProfile.preferredTypes.length ? data.profile.tenantProfile.preferredTypes.join(", ") : "Not provided"} /><Fact label="Minimum budget" value={moneyLabel(data.profile.tenantProfile.budgetMin)} /><Fact label="Maximum budget" value={moneyLabel(data.profile.tenantProfile.budgetMax)} /><Fact label="Move-in date" value={data.profile.tenantProfile.moveInDate ? dateLabel(data.profile.tenantProfile.moveInDate) : "Not provided"} /><Fact label="NIN status" value={data.profile.tenantProfile.ninStatus} /></>}</dl></section>
            <section className="border border-line bg-white p-5"><h2 className="font-extrabold text-ink">Next action</h2><p className="mt-2 text-sm leading-6 text-muted">{current.status === "NeedsChanges" ? "Replace any requested evidence, confirm every requirement is present, then return this round to the review queue." : "Your record is read-only while the current round is under review."}</p><button type="button" onClick={() => void resubmit()} disabled={!data.canResubmit || resubmitting} className="stitch-button mt-4 w-full disabled:cursor-not-allowed disabled:opacity-45">{resubmitting ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}Resubmit for review</button>{!data.canResubmit && current.status === "NeedsChanges" && <p className="mt-2 text-xs text-warning">Upload every required document before resubmitting.</p>}</section>
          </aside>
        </div>
      )}
    </div>
  );
}
