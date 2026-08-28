"use client";

import { ErrorState } from "@/components/ui/surface-primitives";

export default function HelpError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-[70dvh] place-items-center bg-sand-50 p-6">
      <ErrorState title="Support could not load" description="The help topics or contact form are unavailable. Try the request again before creating a support record." retry={reset} />
    </main>
  );
}
