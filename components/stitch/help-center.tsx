"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  LifeBuoy,
  Search,
  Send,
} from "lucide-react";
import { Input, Select, Textarea } from "@/components/ui/form-controls";
import { toastError, toastSuccess } from "@/stores/toast-store";

const TOPICS = [
  ["Tenant", "Search, viewings, applications and renter-profile help."],
  ["Landlord", "Listings, applicants, viewing schedules and tenancies."],
  ["Verification", "Identity, property authority and review statuses."],
  ["Payment", "Protected Payment, receipts, refunds and failed payments."],
  ["Viewing", "Approval, check-in, rescheduling and safety."],
  ["Lease", "Agreement versions, signatures and document activity."],
  ["Maintenance", "Evidence, urgency, access and resolution."],
  ["Dispute", "Reports, evidence, payment review and outcomes."],
  ["Security", "Suspicious activity, account access and privacy."],
] as const;

export function HelpCenter() {
  const [query, setQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const filtered = useMemo(
    () =>
      TOPICS.filter(([title, copy]) =>
        `${title} ${copy}`.toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  async function submit(formData: FormData) {
    setSending(true);
    const response = await fetch("/api/support-tickets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(formData)),
    });
    const result = (await response.json()) as {
      success: boolean;
      message: string;
      data?: { reference: string };
    };
    setSending(false);
    if (!result.success) {
      toastError("Request not sent", result.message);
      return;
    }
    setReference(result.data?.reference || null);
    toastSuccess("Support request received", result.message);
  }

  return (
    <main id="main-content" className="bg-sand-50 pb-24 pt-16">
      <section className="bg-forest-950 text-white">
        <div className="stitch-container py-16 sm:py-24">
          <p className="text-xs font-bold tracking-[0.15em] text-lime">
            LinkConn support
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-extrabold tracking-[-0.06em] sm:text-6xl">
            Get a clear answer and keep the reference.
          </h1>
          <label className="mt-9 block max-w-2xl">
            <span className="sr-only">Search help topics</span>
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="min-h-14 border-white/15"
              placeholder="Search payments, viewings, verification…"
              leadingIcon={Search}
            />
          </label>
        </div>
      </section>

      <section className="stitch-container py-16">
        <div className="grid gap-px overflow-hidden rounded-2xl bg-line sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(([title, copy]) => (
            <article key={title} className="min-h-44 bg-white p-6">
              <LifeBuoy className="size-5 text-forest-700" />
              <h2 className="mt-8 text-lg font-extrabold text-ink">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="stitch-container grid gap-8 lg:grid-cols-[0.7fr_1.3fr]">
        <div className="rounded-2xl bg-amber-50 p-6 text-amber-950">
          <AlertTriangle className="size-6" />
          <h2 className="mt-5 text-2xl font-extrabold">
            Emergency or immediate danger?
          </h2>
          <p className="mt-3 text-sm leading-6">
            Contact the appropriate local emergency service first. Do not rely
            only on landlord chat or a support ticket for urgent safety issues.
          </p>
          <p className="mt-5 border-t border-amber-200 pt-5 text-sm font-bold">
            No verified viewing, no property payment.
          </p>
        </div>

        <form
          action={(formData) => void submit(formData)}
          className="rounded-2xl border border-line bg-white p-6 sm:p-8"
        >
          {reference ? (
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-forest-50 p-4 text-forest-900">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0" />
              <div>
                <p className="font-extrabold">Request received</p>
                <p className="mt-1 text-sm">
                  Keep this reference:{" "}
                  <strong className="tabular-nums">{reference}</strong>
                </p>
              </div>
            </div>
          ) : null}
          <h2 className="text-3xl font-extrabold tracking-[-0.04em] text-ink">
            Contact support
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input name="name" required />
            </Field>
            <Field label="Email">
              <Input
                type="email"
                name="email"
                required
              />
            </Field>
            <Field label="Topic">
              <Select
                name="category"
                defaultValue="Tenant"
              >
                {TOPICS.map(([topic]) => (
                  <option key={topic}>{topic}</option>
                ))}
              </Select>
            </Field>
            <Field label="Subject">
              <Input name="subject" required />
            </Field>
            <Field label="What happened?" wide>
              <Textarea
                className="min-h-36"
                name="message"
                minLength={20}
                required
              />
            </Field>
          </div>
          <button disabled={sending} className="stitch-button mt-5">
            <Send className="size-4" />
            {sending ? "Sending…" : "Create support ticket"}
          </button>
        </form>
      </section>
    </main>
  );
}

function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label className={wide ? "sm:col-span-2" : ""}>
      <span className="mb-1.5 block text-xs font-bold text-forest-900">
        {label}
      </span>
      {children}
    </label>
  );
}
