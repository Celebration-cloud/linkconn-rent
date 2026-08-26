"use client";
import Link from "next/link";
import { ErrorState } from "@/components/ui/surface-primitives";
export default function PropertiesError({ reset }: { error: Error & { digest?: string }; reset: () => void }) { return <main className="grid min-h-[70dvh] place-items-center bg-sand-50 p-6"><div className="w-full max-w-2xl"><ErrorState title="The property catalogue could not load" description="The current search results are unavailable. Retry the catalogue request or return home without changing your account." retry={reset} /><Link href="/" className="mx-auto mt-4 flex min-h-11 w-fit items-center text-sm font-extrabold text-forest-700 hover:underline">Return home</Link></div></main>; }
