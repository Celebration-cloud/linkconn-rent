"use client";
import { ErrorState } from "@/components/ui/surface-primitives";
export default function PricingError({ reset }: { reset: () => void }) { return <main className="grid min-h-[70dvh] place-items-center bg-sand-50 p-6"><ErrorState title="Plans could not load" description="The current tenant and landlord plan details are unavailable. Try again before selecting a plan." retry={reset} /></main>; }
