"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, CloudUpload, FileText, ShieldAlert } from "lucide-react";
import { toastError, toastSuccess } from "@/stores/toast-store";

const documentTypes = ["NIN Slip", "Driver's License", "International Passport"] as const;

export function IdentityUpload() {
  const [documentType, setDocumentType] = useState<(typeof documentTypes)[number]>("NIN Slip");
  const [saving, setSaving] = useState(false);
  async function saveDraft() {
    setSaving(true);
    const response = await fetch("/api/verifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "Identity", documentType, documents: [], submit: false }),
    });
    const result = (await response.json()) as { success: boolean; message: string };
    setSaving(false);
    result.success ? toastSuccess("Draft saved", "Your document choice is saved securely.") : toastError("Draft not saved", result.message);
  }
  return (
    <main id="main-content" className="min-h-[100dvh] bg-sand-50">
      <header className="flex h-16 items-center border-b border-line px-4">
        <Link href="/verification" className="grid h-11 w-11 place-items-center rounded-full hover:bg-sand-200" aria-label="Back to verification"><ArrowLeft className="h-5 w-5" /></Link>
        <span className="mx-auto pr-11 text-lg font-extrabold text-forest-900">LinkConn Rent</span>
      </header>
      <div className="mx-auto max-w-lg px-4 py-6 pb-28">
        <ol className="flex items-center gap-2" aria-label="Verification progress">
          {[1, 2, 3, 4, 5].map((step) => <li key={step} className={`grid h-8 w-8 place-items-center rounded-full border text-xs font-bold ${step === 1 ? "border-forest-700 bg-forest-700 text-white" : step === 2 ? "border-forest-700 text-forest-800" : "border-line text-muted"}`}>{step === 1 ? <Check className="h-4 w-4" /> : step}</li>)}
        </ol>
        <p className="mt-7 text-[10px] font-bold uppercase tracking-[.16em] text-forest-700">Step 2 of 5</p>
        <h1 className="mt-2 text-2xl font-extrabold tracking-tight text-ink">Verify your identity</h1>
        <p className="mt-3 text-sm leading-6 text-muted">Select a government-issued ID. Your metadata draft can be saved now; physical uploads stay unavailable until document storage is configured.</p>
        <fieldset className="mt-7 space-y-2"><legend className="mb-3 text-xs font-bold uppercase tracking-wider text-ink">Select document type</legend>{documentTypes.map((type) => <button key={type} type="button" onClick={() => setDocumentType(type)} className={`flex min-h-12 w-full items-center gap-3 rounded-lg border px-4 text-left text-sm font-bold ${type === documentType ? "border-forest-700 bg-forest-50 text-forest-900" : "border-line bg-white text-muted"}`}><FileText className="h-4 w-4" /><span className="flex-1">{type}</span><span className={`h-4 w-4 rounded-full border-4 ${type === documentType ? "border-forest-700" : "border-line"}`} /></button>)}</fieldset>
        <section className="mt-7 rounded-xl border border-dashed border-forest-300 bg-white p-8 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-forest-100 text-forest-700"><CloudUpload className="h-5 w-5" /></span><p className="mt-4 text-sm font-bold text-ink">Document upload unavailable</p><p className="mt-2 text-xs leading-5 text-muted">JPEG, PNG and PDF uploads will activate when a storage adapter is configured.</p></section>
        <div className="mt-5 flex gap-3 rounded-lg bg-amber-50 p-4 text-amber-900"><ShieldAlert className="h-5 w-5 shrink-0" /><p className="text-xs leading-5">No fake progress is shown and final verification submission remains disabled.</p></div>
      </div>
      <div className="fixed inset-x-0 bottom-0 border-t border-line bg-white p-4"><div className="mx-auto flex max-w-lg gap-3"><button disabled={saving} onClick={() => void saveDraft()} className="stitch-button-secondary flex-1">Save metadata draft</button><button disabled className="stitch-button flex-1 opacity-45">Submit verification</button></div></div>
    </main>
  );
}
