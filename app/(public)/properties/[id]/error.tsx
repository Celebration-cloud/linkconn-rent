"use client";
import Link from "next/link";
import { ErrorState } from "@/components/ui/surface-primitives";
export default function PropertyDetailError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="grid min-h-[70dvh] place-items-center bg-sand-50 p-6"><div className="w-full max-w-2xl"><ErrorState title="This property record could not load" description="The home, fee breakdown, or related records are temporarily unavailable. Retry before making a rental decision." retry={reset} /><Link href="/properties" className="mx-auto mt-4 flex min-h-11 w-fit items-center text-sm font-extrabold text-forest-700 hover:underline">Back to the catalogue</Link></div></main>; }
