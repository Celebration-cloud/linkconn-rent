"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { AppRole, LeaseStatus } from "@prisma/client";
import type { LeaseEditableTerms, LeaseTerms } from "@/features/leases/contracts";
import { toastError, toastSuccess } from "@/stores/toast-store";
import { Checkbox, Input, Textarea } from "@/components/ui/form-controls";

type Acceptance = { party: "Tenant" | "Landlord"; agreementHash: string };

export function LeaseActions({ leaseId, status, version, hash, terms, acceptances, viewer }: { leaseId: string; status: LeaseStatus; version: number; hash: string; terms: LeaseTerms | null; acceptances: Acceptance[]; viewer: { id: string; role: AppRole } }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [legalName, setLegalName] = useState("");
  const [consented, setConsented] = useState(false);
  const editable = terms ? (({ participants: _participants, property: _property, ...value }) => value)(terms) : null;
  const [termsJson, setTermsJson] = useState(() => JSON.stringify(editable, null, 2));
  const owner = viewer.role === "Landlord" || viewer.role === "PropertyManager";
  const party = viewer.role === "Tenant" ? "Tenant" : viewer.role === "Landlord" ? "Landlord" : null;
  const canAccept = status === "AwaitingAcceptance" && party !== null && !acceptances.some((item) => item.party === party && item.agreementHash === hash);

  async function request(path: string, body: object, action: string) {
    setBusy(action);
    try {
      const response = await fetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json() as { success: boolean; message: string };
      if (!result.success) return toastError("Lease not updated", result.message);
      toastSuccess("Lease updated", result.message);
      router.refresh();
    } finally { setBusy(null); }
  }

  async function mutate(action: "send" | "request_changes" | "cancel" | "terminate" | "complete" | "edit_terms") {
    let body: object = { action, expectedVersion: version, expectedStatus: status };
    if (action === "edit_terms") {
      try { body = { ...body, terms: JSON.parse(termsJson) as LeaseEditableTerms }; }
      catch { toastError("Terms are not valid", "Correct the agreement JSON before saving."); return; }
    } else if (action !== "send") body = { ...body, reason: reason.trim() };
    setBusy(action);
    try {
      const response = await fetch(`/api/leases/${leaseId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json() as { success: boolean; message: string };
      if (!result.success) return toastError("Lease not updated", result.message);
      toastSuccess("Lease updated", result.message); router.refresh();
    } finally { setBusy(null); }
  }

  if (!["Draft", "ChangesRequested", "AwaitingAcceptance", "AwaitingPayment", "Active"].includes(status)) return null;
  return <aside className="border border-line bg-sand-50 p-4"><h2 className="text-sm font-extrabold text-ink">Next actions</h2>
    {canAccept ? <form className="mt-3 space-y-3" onSubmit={(event) => { event.preventDefault(); void request(`/api/leases/${leaseId}/accept`, { legalName: legalName.trim(), consentVersion: "lease-consent-v1", expectedVersion: version, expectedHash: hash }, "accept"); }}><label className="block text-xs font-bold text-ink">Legal name<Input className="mt-1 w-full" value={legalName} onChange={(event) => setLegalName(event.target.value)} minLength={2} required /></label><label className="flex items-start gap-2 text-xs text-muted"><Checkbox checked={consented} onChange={(event) => setConsented(event.target.checked)} required />I consent to this exact agreement version and understand this is an audited in-product acceptance.</label><button disabled={busy !== null || !consented} className="stitch-button w-full">Accept agreement</button></form> : null}
    {owner && (status === "Draft" || status === "ChangesRequested") && editable ? <details className="mt-3 border-t border-line pt-3"><summary className="cursor-pointer text-sm font-bold text-forest-800">Revise terms</summary><label className="mt-3 block text-xs font-bold text-ink">Agreement terms<Textarea className="mt-1 min-h-48 w-full font-mono text-xs" value={termsJson} onChange={(event) => setTermsJson(event.target.value)} /></label><p className="mt-2 text-xs text-muted">Participant, property and payment schedule identity are protected by the server. The payment schedule cannot change after version 1.</p><button type="button" disabled={busy !== null} onClick={() => void mutate("edit_terms")} className="stitch-button mt-3 w-full">Save revised version</button></details> : null}
    {owner && status === "Draft" && version > 0 ? <button type="button" disabled={busy !== null} onClick={() => void mutate("send")} className="stitch-button mt-3 w-full">Send agreement</button> : null}
    {viewer.role === "Tenant" && status === "AwaitingAcceptance" ? <ReasonAction label="Request changes" reason={reason} setReason={setReason} disabled={busy !== null} onClick={() => void mutate("request_changes")} /> : null}
    {owner && ["Draft", "AwaitingAcceptance", "AwaitingPayment"].includes(status) ? <ReasonAction label="Cancel lease" reason={reason} setReason={setReason} disabled={busy !== null} onClick={() => void mutate("cancel")} /> : null}
    {owner && status === "Active" ? <><ReasonAction label="Complete lease" reason={reason} setReason={setReason} disabled={busy !== null} onClick={() => void mutate("complete")} /><ReasonAction label="Terminate lease" reason={reason} setReason={setReason} disabled={busy !== null} onClick={() => void mutate("terminate")} /></> : null}
  </aside>;
}

function ReasonAction({ label, reason, setReason, disabled, onClick }: { label: string; reason: string; setReason: (value: string) => void; disabled: boolean; onClick: () => void }) { return <div className="mt-3 border-t border-line pt-3"><label className="block text-xs font-bold text-ink">Reason<Textarea className="mt-1 min-h-20 w-full" value={reason} onChange={(event) => setReason(event.target.value)} minLength={10} maxLength={2000} /></label><button type="button" disabled={disabled || reason.trim().length < 10} onClick={onClick} className="stitch-button-secondary mt-2 w-full">{label}</button></div>; }
