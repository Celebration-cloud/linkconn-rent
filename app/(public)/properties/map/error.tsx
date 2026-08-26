"use client";

import { ErrorState } from "@/components/ui/surface-primitives";

export default function MapSearchError({ reset }: { reset: () => void }) {
  return (
    <main className="grid min-h-[100dvh] place-items-center bg-sand-50 p-6">
      <ErrorState title="The map could not load" description="The property list remains the reliable fallback when map tiles or directions are unavailable." retry={reset} />
    </main>
  );
}
