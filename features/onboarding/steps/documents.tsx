"use client";

import { useEffect, useState } from "react";
import { upload } from "@vercel/blob/client";
import type { VerificationDocumentKind } from "@prisma/client";
import { FileCheck2, Loader2, ShieldCheck, Trash2, UploadCloud } from "lucide-react";
import { useFormContext } from "react-hook-form";
import {
  DOCUMENT_MIME_TYPES,
  MAX_DOCUMENT_BYTES,
  type DocumentReference,
} from "@/features/onboarding/schemas/document-upload";
import {
  getMissingDocumentRequirements,
  getOnboardingDocumentRequirements,
} from "@/features/onboarding/document-requirements";
import type { CompleteOnboardingPayload } from "@/schemas/onboarding";
import { Input, Select } from "@/components/ui/form-controls";

type UploadedDocument = DocumentReference & {
  fileName: string | null;
  mimeType: string | null;
  size: number | null;
  uploaded: boolean;
};

type Props =
  | { role: "Tenant"; employmentType?: string }
  | { role: "Landlord"; employmentType?: never };

export default function DocumentsStep(props: Props) {
  const { setValue } = useFormContext<CompleteOnboardingPayload>();
  const [documents, setDocuments] = useState<UploadedDocument[]>([]);
  const [storageConfigured, setStorageConfigured] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeKind, setActiveKind] = useState<VerificationDocumentKind | null>(null);
  const [chosenKinds, setChosenKinds] = useState<Record<string, VerificationDocumentKind>>({});
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const requirements = getOnboardingDocumentRequirements(
    props.role === "Tenant"
      ? { role: "Tenant", employmentType: props.employmentType }
      : { role: "Landlord" },
  );

  function synchronize(next: UploadedDocument[]) {
    setDocuments(next);
    setValue(
      "documents",
      next.filter((item) => item.uploaded).map(({ id, kind }) => ({ id, kind })),
      { shouldValidate: true },
    );
  }

  async function loadDocuments() {
    const response = await fetch("/api/verifications/documents", { cache: "no-store" });
    const result = await response.json() as {
      success: boolean;
      message: string;
      data?: { storageConfigured: boolean; documents: UploadedDocument[] };
    };
    if (!result.success || !result.data) throw new Error(result.message);
    setStorageConfigured(result.data.storageConfigured);
    synchronize(result.data.documents);
  }

  useEffect(() => {
    let active = true;
    void fetch("/api/verifications/documents", { cache: "no-store" })
      .then(async (response) => response.json() as Promise<{
        success: boolean;
        message: string;
        data?: { storageConfigured: boolean; documents: UploadedDocument[] };
      }>)
      .then((result) => {
        if (!active) return;
        if (!result.success || !result.data) throw new Error(result.message);
        setStorageConfigured(result.data.storageConfigured);
        setDocuments(result.data.documents);
        setValue(
          "documents",
          result.data.documents.filter((item) => item.uploaded).map(({ id, kind }) => ({ id, kind })),
          { shouldValidate: true },
        );
      })
      .catch((cause) => {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load documents.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [setValue]);

  async function uploadFile(kind: VerificationDocumentKind, file: File) {
    setError(null);
    if (!DOCUMENT_MIME_TYPES.includes(file.type as (typeof DOCUMENT_MIME_TYPES)[number])) {
      setError("Choose a JPEG, PNG, or PDF file.");
      return;
    }
    if (file.size <= 0 || file.size > MAX_DOCUMENT_BYTES) {
      setError("Each document must be no larger than 8 MB.");
      return;
    }
    setActiveKind(kind);
    setProgress(0);
    try {
      const preparedResponse = await fetch("/api/verifications/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, fileName: file.name, mimeType: file.type, size: file.size }),
      });
      const prepared = await preparedResponse.json() as {
        success: boolean;
        message: string;
        data?: { document: UploadedDocument; pathname: string; uploadIntentId: string; clientPayload: string };
      };
      if (!prepared.success || !prepared.data) throw new Error(prepared.message);
      const blob = await upload(prepared.data.pathname, file, {
        access: "private",
        handleUploadUrl: "/api/verifications/uploads",
        clientPayload: prepared.data.clientPayload,
        onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
      });
      const completedResponse = await fetch(`/api/verifications/documents/${prepared.data.document.id}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadIntentId: prepared.data.uploadIntentId, pathname: blob.pathname }),
      });
      const completed = await completedResponse.json() as { success: boolean; message: string };
      if (!completed.success) throw new Error(completed.message);
      await loadDocuments();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed. Please retry.");
    } finally {
      setActiveKind(null);
      setProgress(0);
    }
  }

  async function removeDocument(document: UploadedDocument) {
    setError(null);
    setActiveKind(document.kind);
    try {
      const response = await fetch(`/api/verifications/documents/${document.id}`, { method: "DELETE" });
      const result = await response.json() as { success: boolean; message: string };
      if (!result.success) throw new Error(result.message);
      synchronize(documents.filter((item) => item.id !== document.id));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to remove document.");
    } finally {
      setActiveKind(null);
    }
  }

  if (loading) {
    return <div className="flex min-h-64 items-center justify-center text-sm text-muted"><Loader2 className="mr-2 size-5 animate-spin" aria-hidden />Loading secure documents…</div>;
  }

  const completedKinds = documents.filter((item) => item.uploaded).map((item) => item.kind);
  const missing = getMissingDocumentRequirements(requirements, completedKinds);

  return (
    <section aria-labelledby="documents-heading" className="space-y-4">
      <div>
        <div className="flex items-center gap-2 text-forest-800"><ShieldCheck className="size-5" aria-hidden /><h2 id="documents-heading" className="text-xl font-extrabold">Verification documents</h2></div>
        <p className="mt-1 text-sm text-muted">Private files are visible only to authorized administrators and are deleted 60 days after a review decision.</p>
      </div>

      {!storageConfigured && (
        <div className="rounded-xl border border-warning/35 bg-warning-muted p-4 text-sm text-ink" role="alert">
          Secure uploads are temporarily unavailable because private storage is not configured. You can save this draft and return later.
        </div>
      )}

      <div className="space-y-3">
        {requirements.map((requirement) => {
          const document = documents.find((item) => item.uploaded && requirement.acceptedKinds.includes(item.kind));
          const kind = document?.kind ?? chosenKinds[requirement.id] ?? requirement.acceptedKinds[0];
          const busy = activeKind !== null && (activeKind === kind || requirement.acceptedKinds.includes(activeKind));
          return (
            <article key={requirement.id} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <h3 className="font-bold text-ink">{requirement.label}</h3>
                  <p className="mt-1 text-xs leading-5 text-muted">{requirement.description}</p>
                  {document && <p className="mt-2 flex items-center gap-1.5 truncate text-xs font-semibold text-success"><FileCheck2 className="size-4 shrink-0" aria-hidden />{document.fileName}</p>}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {requirement.acceptedKinds.length > 1 && !document && (
                    <Select
                      aria-label={`${requirement.label} type`}
                      value={kind}
                      onChange={(event) => setChosenKinds((current) => ({
                        ...current,
                        [requirement.id]: event.target.value as VerificationDocumentKind,
                      }))}
                      className="min-h-11 w-auto pr-10 text-sm"
                    >
                      <option value="PropertyOwnership">Ownership evidence</option>
                      <option value="ManagementAuthority">Management authority</option>
                    </Select>
                  )}
                  <label className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-bold text-white hover:bg-primary-hover aria-disabled:opacity-50">
                    {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <UploadCloud className="size-4" aria-hidden />}
                    {document ? "Replace" : "Upload"}
                    <Input
                      className="sr-only"
                      type="file"
                      accept="image/jpeg,image/png,application/pdf"
                      disabled={!storageConfigured || activeKind !== null}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void uploadFile(kind, file);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                  {document && (
                    <button type="button" onClick={() => void removeDocument(document)} disabled={activeKind !== null} aria-label={`Remove ${requirement.label}`} className="grid min-h-11 min-w-11 place-items-center rounded-xl border border-error/30 text-error hover:bg-error-muted disabled:opacity-50"><Trash2 className="size-4" aria-hidden /></button>
                  )}
                </div>
              </div>
              {busy && progress > 0 && <div className="mt-3" aria-live="polite"><div className="h-2 overflow-hidden rounded-full bg-surface-muted"><div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${progress}%` }} /></div><p className="mt-1 text-xs text-muted">Uploading {progress}%</p></div>}
            </article>
          );
        })}
      </div>

      {error && <p className="rounded-xl border border-error/30 bg-error-muted p-3 text-sm text-error" role="alert">{error}</p>}
      <p className="text-xs font-semibold text-muted" aria-live="polite">{missing.length === 0 ? "All required documents are ready." : `${missing.length} required document${missing.length === 1 ? "" : "s"} remaining.`}</p>
    </section>
  );
}
