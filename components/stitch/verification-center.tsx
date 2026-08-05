"use client";

import { useCallback, useEffect, useState, type SyntheticEvent } from "react";
import Link from "next/link";
import { Logo } from "@/components/shared/icons";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  FileClock,
  FileUp,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import { toastError, toastSuccess } from "@/stores/toast-store";

type Submission = {
  id: string;
  type: "Identity" | "PropertyOwnership";
  documentType?: string | null;
  status: string;
  updatedAt: string;
  property?: { title: string } | null;
  documents: Array<{ fileName: string }>;
};

export function VerificationCenter() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [storageConfigured, setStorageConfigured] = useState(false);
  const [type, setType] = useState<"Identity" | "PropertyOwnership">("Identity");
  const [documentType, setDocumentType] = useState("Government-issued ID");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const response = await fetch("/api/verifications", { cache: "no-store" });
    const result = (await response.json()) as {
      success: boolean;
      data?: { submissions: Submission[]; storageConfigured: boolean };
    };
    if (result.success && result.data) {
      setSubmissions(result.data.submissions);
      setStorageConfigured(result.data.storageConfigured);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save(event: SyntheticEvent, submit = false) {
    event.preventDefault();
    setSaving(true);
    const response = await fetch("/api/verifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        documentType,
        note,
        documents: [],
        submit,
      }),
    });
    const result = (await response.json()) as {
      success: boolean;
      message: string;
    };
    setSaving(false);
    if (!result.success) {
      toastError("Verification not submitted", result.message);
      return;
    }
    toastSuccess("Draft saved", "Your metadata is safe and ready for documents.");
    setNote("");
    await load();
  }

  return (
    <main id="main-content" className="min-h-[100dvh] bg-sand-50">
      <header className="border-b border-line bg-white">
        <div className="stitch-container flex min-h-20 items-center gap-4">
          <Link href="/dashboard" className="grid h-11 w-11 place-items-center rounded-full bg-sand-200" aria-label="Back to dashboard"><ArrowLeft className="h-5 w-5" /></Link>
          <div className="flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-forest-700">Trust & safety</p>
            <h1 className="text-xl font-extrabold text-ink">Verification center</h1>
          </div>
          <Link href="/" className="grid size-11 place-items-center rounded-lg hover:bg-sand-100" aria-label="LinkConn Rent home"><Logo variant="mark" priority className="size-9" sizes="36px" /></Link>
        </div>
      </header>

      <div className="stitch-container grid gap-6 py-7 lg:grid-cols-[1fr_22rem]">
        <div>
          <section className="rounded-2xl bg-forest-900 p-6 text-white sm:p-8">
            <ShieldCheck className="h-10 w-10 text-lime-300" />
            <h2 className="mt-5 max-w-xl text-3xl font-extrabold tracking-tight">Build trust with verified records.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">Save identity or property-ownership metadata now. Physical document submission remains intentionally unavailable until encrypted storage is configured.</p>
          </section>

          <form onSubmit={(event) => save(event)} className="mt-6 rounded-xl border border-line bg-white p-5 sm:p-6">
            <h2 className="text-lg font-extrabold text-ink">New verification draft</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-bold text-ink">Verification type
                <Select className="mt-2" value={type} onChange={(event) => setType(event.target.value as typeof type)}>
                  <option value="Identity">Identity</option>
                  <option value="PropertyOwnership">Property ownership</option>
                </Select>
              </label>
              <label className="text-sm font-bold text-ink">Document type
                <Input className="mt-2" value={documentType} onChange={(event) => setDocumentType(event.target.value)} required minLength={2} />
              </label>
            </div>
            <label className="mt-4 block text-sm font-bold text-ink">Reviewer note
              <Textarea className="mt-2" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Add helpful context for the reviewer" />
            </label>
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <div className="flex gap-3"><LockKeyhole className="mt-0.5 h-4 w-4 shrink-0" /><div><strong>Secure uploads are not configured.</strong><p className="mt-1 leading-6 text-amber-800">No file is uploaded and no fake success is shown. Configure a DocumentStorage adapter to enable this step.</p></div></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              <button disabled={saving} type="submit" className="stitch-button-secondary"><FileClock className="h-4 w-4" /> Save metadata draft</button>
              <button disabled={!storageConfigured || saving} type="button" onClick={(event) => void save(event, true)} className="stitch-button disabled:cursor-not-allowed disabled:opacity-45"><FileUp className="h-4 w-4" /> Upload & submit</button>
            </div>
          </form>
        </div>

        <aside className="rounded-xl border border-line bg-white p-5">
          <h2 className="font-extrabold text-ink">Your submissions</h2>
          <div className="mt-4 space-y-3">
            {submissions.length ? submissions.map((item) => (
              <article key={item.id} className="rounded-lg border border-line p-4">
                <div className="flex items-start gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-forest-50 text-forest-800">{item.type === "Identity" ? <CheckCircle2 className="h-4 w-4" /> : <Building2 className="h-4 w-4" />}</span>
                  <div><h3 className="text-sm font-extrabold text-ink">{item.documentType || item.type}</h3><p className="mt-1 text-xs text-muted">{item.status} · {new Date(item.updatedAt).toLocaleDateString("en-NG")}</p></div>
                </div>
              </article>
            )) : <p className="py-8 text-center text-sm text-muted">No verification drafts yet.</p>}
          </div>
        </aside>
      </div>
    </main>
  );
}
