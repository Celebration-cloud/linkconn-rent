"use client";
import { ErrorState } from "@/components/ui/surface-primitives";
export default function HowItWorksError({ reset }: { reset: () => void }) { return <main className="grid min-h-[70dvh] place-items-center bg-sand-50 p-6"><ErrorState title="The rental journey could not load" description="The workflow guide is temporarily unavailable. Try again to review the tenant and landlord steps." retry={reset} /></main>; }
