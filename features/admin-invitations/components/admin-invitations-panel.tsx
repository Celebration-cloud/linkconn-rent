"use client";

import { useState, type FormEvent } from "react";
import { Check, Copy, RefreshCw, Send, Trash2, UserPlus } from "lucide-react";
import { Input } from "@/components/ui/form-controls";
import type { AdminInvitationDto } from "@/features/admin-invitations/types";
import { toastError, toastSuccess } from "@/stores/toast-store";

type ApiResult<T> = { success: boolean; data: T; message: string };

export function AdminInvitationsPanel({ initialInvitations }: { initialInvitations: AdminInvitationDto[] }) {
  const [invitations, setInvitations] = useState(initialInvitations);
  const [email, setEmail] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [lastLink, setLastLink] = useState("");

  const copyLink = async (value: string) => {
    await navigator.clipboard.writeText(value);
    toastSuccess("Invitation copied", "Share it through a trusted private channel.");
  };

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setCreating(true);
    const response = await fetch("/api/admin/invitations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await response.json() as ApiResult<{ invitation: AdminInvitationDto; invitationUrl: string } | null>;
    setCreating(false);
    if (!response.ok || !result.success || !result.data) {
      toastError("Invitation failed", result.message || "Unable to create invitation");
      return;
    }
    setInvitations((current) => [result.data!.invitation, ...current.map((item) =>
      item.email === result.data!.invitation.email && item.status === "Pending"
        ? { ...item, status: "Revoked" as const }
        : item
    )]);
    setLastLink(result.data.invitationUrl);
    setEmail("");
    await copyLink(result.data.invitationUrl);
  };

  const rotate = async (id: string) => {
    setBusyId(id);
    const response = await fetch(`/api/admin/invitations/${id}/rotate`, { method: "POST" });
    const result = await response.json() as ApiResult<{ invitation: AdminInvitationDto; invitationUrl: string } | null>;
    setBusyId(null);
    if (!response.ok || !result.success || !result.data) {
      toastError("Rotation failed", result.message || "Unable to rotate invitation");
      return;
    }
    setInvitations((current) => [result.data!.invitation, ...current.map((item) =>
      item.email === result.data!.invitation.email && item.status === "Pending"
        ? { ...item, status: "Revoked" as const }
        : item
    )]);
    setLastLink(result.data.invitationUrl);
    await copyLink(result.data.invitationUrl);
  };

  const revoke = async (id: string) => {
    setBusyId(id);
    const response = await fetch(`/api/admin/invitations/${id}`, { method: "DELETE" });
    const result = await response.json() as ApiResult<AdminInvitationDto | null>;
    setBusyId(null);
    if (!response.ok || !result.success || !result.data) {
      toastError("Revocation failed", result.message || "Unable to revoke invitation");
      return;
    }
    setInvitations((current) => current.map((item) => item.id === id ? result.data! : item));
    toastSuccess("Invitation revoked", "The previous link can no longer be accepted.");
  };

  return (
    <div className="space-y-6">
      <form onSubmit={create} className="border border-line bg-white p-5 sm:p-6">
        <div className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center bg-forest-100 text-forest-800">
            <UserPlus className="size-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-extrabold text-ink">Invite an administrator</h2>
            <p className="mt-1 text-sm leading-6 text-muted">The one-time link expires after 72 hours and grants the Admin role only.</p>
          </div>
        </div>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            autoComplete="email"
            placeholder="new.admin@example.com"
            aria-label="Administrator email"
            required
            className="flex-1"
          />
          <button disabled={creating} className="inline-flex min-h-11 items-center justify-center gap-2 bg-forest-700 px-5 text-sm font-bold text-white hover:bg-forest-800 disabled:opacity-60">
            <Send className="size-4" aria-hidden /> {creating ? "Creating…" : "Create and copy link"}
          </button>
        </div>
        {lastLink && (
          <button type="button" onClick={() => void copyLink(lastLink)} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-forest-700 hover:text-forest-900">
            <Copy className="size-4" aria-hidden /> Copy the latest invitation again
          </button>
        )}
      </form>

      <section className="overflow-hidden border border-line bg-white">
        <div className="border-b border-line px-5 py-4">
          <h2 className="font-extrabold text-ink">Invitation history</h2>
          <p className="mt-1 text-xs text-muted">Raw invitation tokens are never stored or shown again.</p>
        </div>
        {invitations.length === 0 ? (
          <p className="px-5 py-10 text-center text-sm text-muted">No administrator invitations yet.</p>
        ) : (
          <div className="divide-y divide-line">
            {invitations.map((invitation) => (
              <article key={invitation.id} className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-bold text-ink">{invitation.email}</p>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide ${
                      invitation.status === "Pending" ? "bg-amber-100 text-amber-800" :
                      invitation.status === "Accepted" ? "bg-forest-100 text-forest-800" : "bg-sand-200 text-muted"
                    }`}>
                      {invitation.status === "Accepted" && <Check className="mr-1 inline size-3" aria-hidden />}
                      {invitation.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    Created {new Date(invitation.createdAt).toLocaleString("en-NG")} · expires {new Date(invitation.expiresAt).toLocaleString("en-NG")}
                  </p>
                </div>
                {invitation.status === "Pending" && (
                  <div className="flex gap-2">
                    <button disabled={busyId === invitation.id} onClick={() => void rotate(invitation.id)} className="inline-flex min-h-11 items-center gap-2 border border-line px-3 text-xs font-bold text-forest-800 hover:bg-forest-50 disabled:opacity-60">
                      <RefreshCw className="size-4" aria-hidden /> Rotate
                    </button>
                    <button disabled={busyId === invitation.id} onClick={() => void revoke(invitation.id)} className="inline-flex min-h-11 items-center gap-2 border border-red-200 px-3 text-xs font-bold text-red-700 hover:bg-red-50 disabled:opacity-60">
                      <Trash2 className="size-4" aria-hidden /> Revoke
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
