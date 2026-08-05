"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, ShieldCheck, TriangleAlert } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthFlowStore } from "@/stores/auth-flow-store";
import { toastError, toastSuccess } from "@/stores/toast-store";
import { Logo } from "@/components/shared/icons";

export default function BillingCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const clearFlow = useAuthFlowStore((state) => state.clearFlow);
  const message = "Verifying your payment...";
  const [error, setError] = useState("");

  useEffect(() => {
    const reference = searchParams.get("reference");
    if (!reference) {
      setError("Missing payment reference.");
      toastError("Payment verification failed", "Missing payment reference.");
      return;
    }

    let active = true;
    const verify = async () => {
      const res = await fetch(`/api/billing/paystack/verify?reference=${encodeURIComponent(reference)}`);
      const data = await res.json() as { success: boolean; message?: string };

      if (!active) return;

      if (!data.success) {
        setError(data.message || "Payment verification failed.");
        toastError("Payment verification failed", data.message || "Payment could not be verified.");
        return;
      }

      clearFlow();
      toastSuccess("Payment verified", "Your profile is now awaiting review.");
      router.replace("/account-review");
      router.refresh();
    };

    void verify();
    return () => {
      active = false;
    };
  }, [clearFlow, router, searchParams]);

  return (
    <section className="min-h-[100dvh] bg-[radial-gradient(circle_at_top_left,_rgba(184,227,110,0.18),_transparent_34%),linear-gradient(180deg,#fdf9f0_0%,#f1eee5_100%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-3xl items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-[2rem] border border-white/80 bg-white/95 p-6 text-center shadow-[0_24px_80px_rgba(18,55,42,0.12)]"
        >
          <Link href="/" className="mx-auto mb-6 inline-flex items-center" aria-label="LinkConn Rent home"><Logo variant="lockup" priority className="h-14 w-auto" sizes="118px" /></Link>
          {error ? (
            <div className="space-y-4">
              <TriangleAlert className="mx-auto h-12 w-12 text-red-500" />
              <div>
                <h1 className="text-2xl font-black tracking-tight text-navy-950">Payment not completed</h1>
                <p className="mt-2 text-sm leading-7 text-navy-600">{error}</p>
              </div>
              <button
                type="button"
                onClick={() => router.replace("/pricing")}
                className="rounded-2xl bg-navy-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-navy-800"
              >
                Back to pricing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <Loader2 className="mx-auto h-12 w-12 animate-spin text-brandgreen-500" />
              <div>
                <h1 className="text-2xl font-black tracking-tight text-navy-950">Completing checkout</h1>
                <p className="mt-2 text-sm leading-7 text-navy-600">{message}</p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-full bg-brandgreen-50 px-4 py-2 text-xs font-bold text-brandgreen-700">
                <ShieldCheck className="h-4 w-4" />
                Secure Paystack verification
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
