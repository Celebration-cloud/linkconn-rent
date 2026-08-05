"use client";

import { TriangleAlert } from "lucide-react";

export default function AccountReviewError({
  reset,
}: {
  reset: () => void;
}) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-sand-50 p-4">
      <div className="max-w-sm rounded-2xl border border-line bg-white p-7 text-center">
        <TriangleAlert className="mx-auto size-8 text-amber-700" />
        <h1 className="mt-4 text-xl font-extrabold text-ink">
          Review status unavailable
        </h1>
        <p className="mt-2 text-sm leading-6 text-muted">
          We could not load your account review status.
        </p>
        <button type="button" onClick={reset} className="stitch-button mt-5">
          Try again
        </button>
      </div>
    </main>
  );
}
