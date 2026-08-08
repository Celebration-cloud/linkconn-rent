"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LoaderCircle, ShieldAlert } from "lucide-react";
import { authClient } from "@/lib/neon-auth-client";

type ExchangeState =
  | { status: "loading" }
  | { status: "ready"; email: string; expiresAt: string }
  | { status: "error"; message: string };

export function AdminInvitationAcceptance() {
  const router = useRouter();
  const session = authClient.useSession();
  const [exchange, setExchange] = useState<ExchangeState>({ status: "loading" });
  const [accepting, setAccepting] = useState(false);

  const signOut = async () => {
    await authClient.signOut();
    router.refresh();
  };

  useEffect(() => {
    const hash = new URLSearchParams(window.location.hash.slice(1));
    const token = hash.get("token");
    window.history.replaceState(null, "", window.location.pathname);

    if (!token) {
      const stored = sessionStorage.getItem("linkconn-admin-invite");
      if (stored) {
        try {
          const invitation = JSON.parse(stored) as { email?: string; expiresAt?: string };
          if (invitation.email && invitation.expiresAt && new Date(invitation.expiresAt) > new Date()) {
            queueMicrotask(() => setExchange({ status: "ready", email: invitation.email!, expiresAt: invitation.expiresAt! }));
            return;
          }
        } catch {
          sessionStorage.removeItem("linkconn-admin-invite");
        }
      }
      queueMicrotask(() => setExchange({ status: "error", message: "This invitation link is missing its secure token." }));
      return;
    }

    const controller = new AbortController();
    void fetch("/api/admin-invitations/exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
      signal: controller.signal,
    })
      .then(async (response) => {
        const result = await response.json() as { success: boolean; data?: { email: string; expiresAt: string }; message: string };
        if (!response.ok || !result.success || !result.data) throw new Error(result.message || "Invitation is invalid");
        sessionStorage.setItem("linkconn-admin-invite", JSON.stringify(result.data));
        sessionStorage.setItem("linkconn-admin-invite-email", result.data.email);
        setExchange({ status: "ready", ...result.data });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        setExchange({ status: "error", message: error instanceof Error ? error.message : "Invitation could not be verified" });
      });
    return () => controller.abort();
  }, []);

  const accept = async () => {
    setAccepting(true);
    const response = await fetch("/api/admin-invitations/accept", { method: "POST" });
    const result = await response.json() as { success: boolean; message: string };
    setAccepting(false);
    if (!response.ok || !result.success) {
      setExchange({ status: "error", message: result.message || "Unable to accept invitation" });
      return;
    }
    sessionStorage.removeItem("linkconn-admin-invite-email");
    sessionStorage.removeItem("linkconn-admin-invite");
    router.replace("/admin");
    router.refresh();
  };

  if (exchange.status === "loading" || session.isPending) {
    return <div className="flex items-center justify-center gap-2 rounded-2xl bg-sand-100 px-4 py-8 text-sm text-muted"><LoaderCircle className="size-5 animate-spin" aria-hidden /> Verifying invitation…</div>;
  }

  if (exchange.status === "error") {
    return (
      <div className="space-y-4 text-center">
        <ShieldAlert className="mx-auto size-10 text-red-700" aria-hidden />
        <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{exchange.message}</p>
        <Link href="/login" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line px-5 text-sm font-bold text-forest-800 hover:bg-sand-100">Return to sign in</Link>
      </div>
    );
  }

  const signedInEmail = session.data?.user.email?.toLowerCase();
  const matchingSession = signedInEmail === exchange.email.toLowerCase();

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-forest-100 bg-forest-50 p-5 text-center">
        <CheckCircle2 className="mx-auto size-9 text-forest-700" aria-hidden />
        <p className="mt-3 text-sm text-muted">Invitation for</p>
        <p className="font-extrabold text-ink">{exchange.email}</p>
        <p className="mt-2 text-xs text-muted">Expires {new Date(exchange.expiresAt).toLocaleString("en-NG")}</p>
      </div>

      {session.data ? (
        matchingSession ? (
          <button onClick={() => void accept()} disabled={accepting} className="w-full min-h-11 rounded-xl bg-forest-700 px-5 text-sm font-bold text-white hover:bg-forest-800 disabled:opacity-60">
            {accepting ? "Accepting…" : "Accept administrator invitation"}
          </button>
        ) : (
          <div className="space-y-3">
            <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">You are signed in as {session.data.user.email}. Sign out and use {exchange.email} to continue.</p>
            <button onClick={() => void signOut()} className="w-full min-h-11 rounded-xl border border-line px-5 text-sm font-bold text-forest-800 hover:bg-sand-100">Sign out and continue</button>
          </div>
        )
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          <Link href="/signup?adminInvite=1&next=%2Fadmin-invite" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-forest-700 px-5 text-sm font-bold text-white hover:bg-forest-800">Create invited account</Link>
          <Link href="/login?next=%2Fadmin-invite" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-line px-5 text-sm font-bold text-forest-800 hover:bg-sand-100">Sign in to existing account</Link>
        </div>
      )}
    </div>
  );
}
