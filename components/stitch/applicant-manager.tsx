"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, Filter, MessageSquare, Search, X } from "lucide-react";
import { Input, Select } from "@/components/ui/form-controls";
import { toastError, toastSuccess } from "@/stores/toast-store";

type Applicant = {
  id: string;
  status: "Pending" | "Shortlisted" | "Accepted" | "Declined";
  score: number;
  message?: string | null;
  createdAt: string;
  tenant: {
    firstName: string;
    lastName: string;
    email?: string;
    verificationLevel: string;
  };
  property: { id: string; title: string; location: string };
};

export function ApplicantManager() {
  const [items, setItems] = useState<Applicant[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("All");
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const response = await fetch("/api/applications", { cache: "no-store" });
    const result = (await response.json()) as {
      success: boolean;
      data?: Applicant[];
      message?: string;
    };
    if (result.success && result.data) setItems(result.data);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const name = `${item.tenant.firstName} ${item.tenant.lastName}`;
        return (
          (status === "All" || item.status === status) &&
          `${name} ${item.property.title}`
            .toLowerCase()
            .includes(query.toLowerCase())
        );
      }),
    [items, query, status],
  );

  async function decide(
    id: string,
    next: "Shortlisted" | "Accepted" | "Declined",
  ) {
    setBusy(id);
    const response = await fetch(`/api/applications/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: next }),
    });
    const result = (await response.json()) as {
      success: boolean;
      message: string;
    };
    setBusy(null);
    if (!result.success) {
      toastError("Could not update applicant", result.message);
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.id === id ? { ...item, status: next } : item,
      ),
    );
    toastSuccess("Applicant updated", `Status changed to ${next.toLowerCase()}.`);
  }

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-5 flex items-center justify-between gap-4"><p className="max-w-2xl text-sm leading-6 text-muted">Review applicants against their property context and verification status.</p><span className="shrink-0 rounded-full bg-forest-100 px-3 py-1 text-xs font-bold text-forest-800">{items.length} total</span></div>
        <section className="rounded-xl border border-line bg-white p-4">
          <div className="grid gap-3 md:grid-cols-[1fr_13rem]">
            <label>
              <span className="sr-only">Search applicants</span>
              <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by applicant or property" leadingIcon={Search} />
            </label>
            <label>
              <span className="sr-only">Filter applicant status</span>
              <Select className="text-sm font-bold" value={status} onChange={(event) => setStatus(event.target.value)} leadingIcon={Filter}>
                {["All", "Pending", "Shortlisted", "Accepted", "Declined"].map((item) => <option key={item}>{item}</option>)}
              </Select>
            </label>
          </div>
        </section>

        <div className="mt-5 space-y-4">
          {filtered.length ? filtered.map((item) => {
            const name = `${item.tenant.firstName} ${item.tenant.lastName}`.trim();
            const final = item.status === "Accepted" || item.status === "Declined";
            return (
              <article key={item.id} className="rounded-xl border border-line bg-white p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
                  <div className="flex min-w-0 flex-1 items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-forest-800 text-sm font-extrabold text-white">{item.tenant.firstName[0]}{item.tenant.lastName[0]}</span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-extrabold text-ink">{name || "Applicant"}</h2>
                        <span className="rounded-md bg-forest-50 px-2 py-1 text-[10px] font-bold text-forest-800">{item.tenant.verificationLevel}</span>
                        <span className="rounded-md bg-sand-200 px-2 py-1 text-[10px] font-bold text-muted">{item.status}</span>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-forest-700">{item.property.title}</p>
                      <p className="mt-1 text-xs text-muted">{item.property.location} · Applied {new Date(item.createdAt).toLocaleDateString("en-NG")}</p>
                      {item.message && <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-muted">{item.message}</p>}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/messages" className="stitch-button-secondary"><MessageSquare className="h-4 w-4" /> Message</Link>
                    {!final && item.status === "Pending" && <button disabled={busy === item.id} onClick={() => decide(item.id, "Shortlisted")} className="stitch-button-secondary">Shortlist</button>}
                    {!final && <button disabled={busy === item.id} onClick={() => decide(item.id, "Accepted")} className="stitch-button"><Check className="h-4 w-4" /> Accept</button>}
                    {!final && <button disabled={busy === item.id} onClick={() => decide(item.id, "Declined")} className="grid h-11 w-11 place-items-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50" aria-label={`Decline ${name}`}><X className="h-4 w-4" /></button>}
                  </div>
                </div>
              </article>
            );
          }) : (
            <div className="rounded-xl border border-dashed border-line bg-white p-14 text-center">
              <h2 className="font-extrabold text-ink">No applicants found</h2>
              <p className="mt-2 text-sm text-muted">New applications will appear here without demo substitutions.</p>
            </div>
          )}
        </div>
    </div>
  );
}
