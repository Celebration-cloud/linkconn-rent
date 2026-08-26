"use client";

import { ErrorState } from "@/components/ui/surface-primitives";

export default function CompareError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-[70dvh] place-items-center bg-sand-50 p-6">
      <ErrorState title="Comparison could not load" description="The selected property records could not be prepared. Try again or return to search and rebuild the comparison." retry={reset} />
    </main>
  );
}
