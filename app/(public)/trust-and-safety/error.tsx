"use client";
import { ErrorState } from "@/components/ui/surface-primitives";
export default function TrustError({ reset }: { reset: () => void }) { return <main className="grid min-h-[70dvh] place-items-center bg-sand-50 p-6"><ErrorState title="Safety guidance could not load" description="The verification and payment guidance is temporarily unavailable. Try again before making a rental decision." retry={reset} /></main>; }
