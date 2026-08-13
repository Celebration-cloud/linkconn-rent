"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";

export default function AdminError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <main className="admin-canvas"><section className="grid min-h-[28rem] place-items-center border border-red-200 bg-white p-6 text-center"><div className="max-w-md"><span className="mx-auto grid size-12 place-items-center bg-red-50 text-red-700"><AlertTriangle className="size-6" /></span><h1 className="mt-5 text-2xl font-extrabold tracking-[-0.025em]">This workspace could not be loaded</h1><p className="mt-2 text-sm leading-6 text-muted">The administrator data request failed. Retry once; if it continues, use the audit reference when contacting support.</p>{error.digest && <p className="mt-3 text-xs font-bold text-red-800">Reference: {error.digest}</p>}<button onClick={reset} className="stitch-button mt-6"><RotateCcw className="size-4" />Retry workspace</button></div></section></main>;
}
